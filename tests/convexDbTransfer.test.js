import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { validateLocalConfig,localTarget } from '../scripts/convex-db-transfer.mjs';

const config={deploymentName:'anonymous-example',adminKey:'local-test-key',ports:{cloud:3210}};
const env={CONVEX_DEPLOYMENT:'anonymous:anonymous-example',VITE_CONVEX_URL:'http://127.0.0.1:3210'};

test('transfer pins a recognized anonymous or linked local deployment to loopback',()=>{
  assert.equal(validateLocalConfig(config,env),'http://127.0.0.1:3210');
  assert.equal(validateLocalConfig({...config,deploymentName:'local-example'},
    {...env,CONVEX_DEPLOYMENT:'local:local-example',VITE_CONVEX_URL:'http://localhost:3210'}),'http://127.0.0.1:3210');
});

test('transfer refuses cloud/prod selectors, missing config and identity mismatches',()=>{
  for(const deployment of ['prod:example','dev:example','anonymous:different',''])
    assert.throws(()=>validateLocalConfig(config,{...env,CONVEX_DEPLOYMENT:deployment}),/Refusing/);
  assert.throws(()=>validateLocalConfig({...config,deploymentName:'cloud-example'},env),/Refusing/);
  assert.throws(()=>validateLocalConfig({...config,adminKey:undefined},env),/Refusing/);
  assert.throws(()=>validateLocalConfig({...config,ports:{cloud:0}},env),/port/);
});

test('transfer refuses remote URLs, tunnels, URL overrides and deploy keys',()=>{
  for(const url of ['https://example.convex.cloud','https://example.trycloudflare.com',
    'http://127.0.0.1:3211','http://127.0.0.1:3210/other','http://user:pass@localhost:3210'])
    assert.throws(()=>validateLocalConfig(config,{...env,VITE_CONVEX_URL:url}),/Refusing/);
  assert.throws(()=>validateLocalConfig(config,{...env,CONVEX_SELF_HOSTED_URL:'https://example.com'}),/Refusing/);
  assert.throws(()=>validateLocalConfig(config,{...env,CONVEX_DEPLOY_KEY:'prod-secret'}),/Refusing/);
});

test('transfer verifies the running local instance, refuses redirects and resolves per-machine backup paths',async()=>{
  let response='anonymous-example',redirect=false;
  const server=createServer((req,res)=>{
    assert.equal(req.url,'/instance_name');
    if(redirect){res.writeHead(302,{Location:'https://example.com'});res.end();}
    else res.end(response);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=await mkdtemp(path.join(tmpdir(),'convex-transfer-test-'));
  try{
    const port=server.address().port;
    await mkdir(path.join(root,'.convex/local/default'),{recursive:true});
    await writeFile(path.join(root,'.convex/local/default/config.json'),JSON.stringify({...config,ports:{cloud:port}}));
    await writeFile(path.join(root,'.env.local'),`CONVEX_DEPLOYMENT=anonymous:anonymous-example\nVITE_CONVEX_URL=http://127.0.0.1:${port}\nCONVEX_BACKUP_DIR=shared-snapshots\n`);
    assert.equal((await localTarget(root,{})).backupDir,path.join(root,'shared-snapshots'));
    response='different-deployment';
    await assert.rejects(localTarget(root,{}),/does not match/);
    redirect=true;
    await assert.rejects(localTarget(root,{}),/fetch failed/);
    await assert.rejects(localTarget(root,{CONVEX_DEPLOYMENT:'prod:example'}),/Refusing/);
  }finally{
    await new Promise(resolve=>server.close(resolve));
    await rm(root,{recursive:true,force:true});
  }
});
