import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { lstat, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { BALANCE_ROUTE, validateBalance } from '../src/combat/balanceSchema.js';

const MAX_BODY_BYTES=32768;
const localAddresses=new Set(['127.0.0.1','::1','::ffff:127.0.0.1']);
const localHost=/^(localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/;
const proxyHeaders=['forwarded','x-forwarded-for','x-forwarded-host','x-forwarded-proto','cf-connecting-ip'];
const hash=source=>createHash('sha256').update(source).digest('hex');

class RequestError extends Error {
  constructor(status,message){super(message);this.status=status;}
}

async function readJson(req){
  if(Number(req.headers['content-length'])>MAX_BODY_BYTES)throw new RequestError(413,'Balance file is too large.');
  const chunks=[];
  let size=0;
  for await(const chunk of req.iterator({destroyOnReturn:false})){
    size+=chunk.length;
    if(size>MAX_BODY_BYTES)throw new RequestError(413,'Balance file is too large.');
    chunks.push(chunk);
  }
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
  catch{throw new RequestError(400,'Invalid JSON.');}
}

async function regularFile(path){
  const stat=await lstat(path);
  if(!stat.isFile())throw new Error('Expected a regular balance file');
}

async function replaceFile(path,source){
  const temporary=path+'.'+randomUUID()+'.tmp';
  try{
    await writeFile(temporary,source,{flag:'wx',flush:true});
    await rename(temporary,path);
  }finally{
    await rm(temporary,{force:true});
  }
}

export function combatBalancePlugin(){
  let balancePath;
  return {
    name:'local-combat-balance',
    apply(config,{command,isPreview}){return command==='serve'&&!isPreview&&config.mode!=='production';},
    configureServer(server){
      const host=server.config.server.host;
      if(server.config.isProduction||server.config.mode==='production'||process.env.VITE_QUICK_TUNNEL==='true'||
        (host!==undefined&&host!==false&&!['localhost','127.0.0.1','::1'].includes(host)))return;
      balancePath=join(server.config.root,'src','combat','balance.json');
      const backupPath=balancePath+'.bak';
      const token=randomBytes(32).toString('hex');
      let saving=false;
      server.middlewares.use(async(req,res,next)=>{
        if(req.url!==BALANCE_ROUTE)return next();
        const send=(status,payload)=>{
          res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
          res.end(JSON.stringify(payload));
        };
        const {host,origin}=req.headers;
        const expectedOrigin=(req.socket.encrypted?'https://':'http://')+host;
        if(!localAddresses.has(req.socket.remoteAddress)||!localHost.test(host??'')||
          proxyHeaders.some(header=>Object.hasOwn(req.headers,header))||(origin&&origin!==expectedOrigin)||
          (req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin'))
          return send(403,{error:'The balance editor requires a direct local connection.'});
        if(req.method!=='GET'&&req.method!=='PUT')return send(405,{error:'Method not allowed.'});
        if(req.method==='PUT'&&(origin!==expectedOrigin||req.headers['x-combat-balance-token']!==token||
          !/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']??'')))
          return send(403,{error:'Open the editor on this local Vite server before saving.'});
        try{
          const root=await realpath(server.config.root);
          if(await realpath(dirname(balancePath))!==join(root,'src','combat'))throw new Error('Unexpected balance directory');
          await regularFile(balancePath);
          if(req.method==='GET'){
            const source=await readFile(balancePath,'utf8'),data=JSON.parse(source),error=validateBalance(data);
            if(error)throw new RequestError(500,'Source balance is invalid. '+error);
            return send(200,{data,revision:hash(source),token});
          }
          const request=await readJson(req);
          if(!request||Object.keys(request).length!==2||!Object.hasOwn(request,'data')||typeof request.revision!=='string')
            throw new RequestError(400,'Expected balance data and a source revision.');
          const error=validateBalance(request.data);
          if(error)throw new RequestError(400,error);
          if(saving)throw new RequestError(409,'Another save is in progress. Try again.');
          saving=true;
          try{
            const source=await readFile(balancePath,'utf8');
            if(hash(source)!==request.revision)throw new RequestError(409,'Source changed. Export your draft, then use Restore Saved before importing and retrying.');
            const updated=JSON.stringify(request.data,null,2)+'\n';
            if(JSON.stringify(JSON.parse(source))!==JSON.stringify(request.data)){
              await replaceFile(backupPath,source);
              await replaceFile(balancePath,updated);
            }
            const persisted=await readFile(balancePath,'utf8');
            send(200,{data:JSON.parse(persisted),revision:hash(persisted),token});
          }finally{saving=false;}
        }catch(error){
          if(!(error instanceof RequestError))server.config.logger.error('[combat balance] '+error.message);
          send(error.status??500,{error:error instanceof RequestError?error.message:'Could not read or write the local balance file. Check the Vite terminal.'});
        }
      });
    },
    handleHotUpdate({file}){
      // An editor save must finish and report success before either scene reloads.
      if(balancePath&&resolve(file)===resolve(balancePath))return [];
    },
  };
}
