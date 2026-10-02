import { readFile, mkdir, stat, open, rename, copyFile, mkdtemp, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

export function validateLocalConfig(config,env){
  if(!/^(anonymous-|local-)/.test(config.deploymentName??'')||!config.adminKey)
    throw new Error('Refusing transfer: no recognized local Convex configuration.');
  const deployment=env.CONVEX_DEPLOYMENT??'';
  if(!/^(anonymous|local):/.test(deployment))
    throw new Error('Refusing transfer: CONVEX_DEPLOYMENT must select local/anonymous, never cloud/dev/prod.');
  const selected=deployment.slice(deployment.indexOf(':')+1);
  if(selected!==config.deploymentName&&!(deployment==='local:local'&&config.deploymentName.startsWith('local-')))
    throw new Error('Refusing transfer: environment and local deployment identity disagree.');
  const port=config.ports?.cloud;
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid local backend port.');
  for(const name of ['VITE_CONVEX_URL','CONVEX_SELF_HOSTED_URL']){
    if(!env[name])continue;
    const url=new URL(env[name]);
    if(url.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(url.hostname)
      ||Number(url.port)!==port||url.username||url.password||url.pathname!=='/'||url.search||url.hash)
      throw new Error(`Refusing transfer: ${name} must point directly to this loopback backend.`);
  }
  if(env.CONVEX_DEPLOY_KEY)throw new Error('Refusing transfer: unset CONVEX_DEPLOY_KEY for local database transfer.');
  return `http://127.0.0.1:${port}`;
}

export async function localTarget(root=projectRoot,environment=process.env){
  const config=JSON.parse(await readFile(path.join(root,'.convex/local/default/config.json'),'utf8'));
  const fileEnv=parseEnv(await readFile(path.join(root,'.env.local'),'utf8'));
  const env={...fileEnv,...environment};
  const url=validateLocalConfig(config,env);
  const response=await fetch(`${url}/instance_name`,{redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!response.ok||(await response.text()).trim()!==config.deploymentName)
    throw new Error('Refusing transfer: running backend does not match local configuration. Run npm run convex.');
  return {root,url,config,backupDir:path.resolve(root,env.CONVEX_BACKUP_DIR||'backups/convex')};
}

async function runCli(target,args){
  // Revalidate before each operation. Explicit URL + local key bypass all CLI
  // cloud selection; invoke the installed CLI without npx/network installs or a shell.
  const current=await localTarget(target.root);
  if(current.url!==target.url||current.config.adminKey!==target.config.adminKey)
    throw new Error('Local deployment changed during transfer; aborting.');
  const pkg=JSON.parse(await readFile(path.join(target.root,'node_modules/convex/package.json'),'utf8'));
  const cli=path.resolve(target.root,'node_modules/convex',typeof pkg.bin==='string'?pkg.bin:pkg.bin.convex);
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[cli,...args,'--url',target.url,'--admin-key',target.config.adminKey],{
      cwd:target.root,stdio:'inherit',shell:false,
    });
    child.on('error',reject);
    child.on('exit',code=>code===0?resolve():reject(new Error(`Convex ${args[0]} failed (exit ${code}).`)));
  });
}

async function verifyZip(filename){
  const info=await stat(filename);
  if(!info.isFile()||info.size<22)throw new Error(`Snapshot missing/empty: ${filename}`);
  const file=await open(filename,'r');
  try{
    const header=Buffer.alloc(4);
    await file.read(header,0,4,0);
    if(!['504b0304','504b0506'].includes(header.toString('hex')))
      throw new Error(`Not a ZIP snapshot: ${filename}`);
  }finally{await file.close();}
  return info.size;
}

export async function exportSnapshot(target,filename){
  await runCli(target,['export','--include-file-storage','--path',filename]);
  return verifyZip(filename);
}

export async function pushDatabase(){
  const target=await localTarget();
  await mkdir(target.backupDir,{recursive:true});
  const temporary=path.join(target.backupDir,`convex-upload-${randomUUID()}.zip`);
  const latest=path.join(target.backupDir,'convex-latest.zip');
  console.log(`Exporting LOCAL ${target.config.deploymentName} to ${latest}`);
  try{
    const bytes=await exportSnapshot(target,temporary);
    // Same-directory atomic replacement: a failed export never overwrites latest.
    await rename(temporary,latest);
    console.log(`Snapshot ready: ${latest} (${bytes} bytes).`);
  }finally{await rm(temporary,{force:true});}
}

export async function pullDatabase(){
  const target=await localTarget();
  const latest=path.join(target.backupDir,'convex-latest.zip');
  await verifyZip(latest);
  const staging=await mkdtemp(path.join(tmpdir(),'convex-db-restore-'));
  try{
    // Freeze the input in case the shared latest snapshot changes during restore.
    const input=path.join(staging,'snapshot.zip');
    await copyFile(latest,input,constants.COPYFILE_EXCL);
    console.warn(`WARNING: replacing ALL application data in LOCAL ${target.config.deploymentName} from ${latest}. This is not a merge. Close the game first.`);
    const backupDir=path.join(target.root,'backups/convex');
    await mkdir(backupDir,{recursive:true});
    const before=path.join(backupDir,`convex-before-restore-${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID()}.zip`);
    await exportSnapshot(target,before);
    console.log(`Before-restore safety backup: ${before}`);
    await runCli(target,['import',input,'--replace-all','--yes']);
    console.log(`Restored LOCAL snapshot. Reload the game. Safety backup retained: ${before}`);
  }finally{await rm(staging,{recursive:true,force:true});}
}

export async function runTransfer(operation){
  if(process.argv.length!==2)throw new Error('These commands accept no CLI overrides. Configure CONVEX_BACKUP_DIR instead.');
  await operation();
}
