import { defineConfig,loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import normalConfig from './vite.config.js';
import { PVP_MOVEMENT_CONFIG } from './src/pvp/movementConfig.js';
import { REALTIME_CONFIG } from './src/realtime/config.js';

// A separate env directory prevents the root .env.local from baking localhost
// into the shareable frontend. Only this config is used by build:test/preview:test.
const envDir=fileURLToPath(new URL('./config/pvp-test/',import.meta.url));
const loopback=new Set(['localhost','127.0.0.1','[::1]']);
function publicUrl(value,protocols,label){
  const url=new URL(value);
  if(!protocols.includes(url.protocol)||loopback.has(url.hostname)||url.username||url.password||url.hash)
    throw new Error(`${label} must be a public ${protocols.join('/')} URL without credentials or fragment.`);
  return url.href;
}
function localTarget(value,label){
  const url=new URL(value);
  if(url.protocol!=='http:'||!loopback.has(url.hostname)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)
    throw new Error(`${label} must be an HTTP loopback origin.`);
  return url.origin;
}

export default defineConfig(({mode})=>{
  if(mode!=='test')throw new Error('Use --mode test with vite.test.config.js.');
  const env=loadEnv(mode,envDir,['VITE_','PVP_TEST_']);
  const tunnel=env.VITE_QUICK_TUNNEL??'true';
  if(!['true','false'].includes(tunnel))throw new Error('VITE_QUICK_TUNNEL must be true or false.');
  const convexUrl=tunnel==='true'?'':publicUrl(env.VITE_CONVEX_URL,['https:'],'VITE_CONVEX_URL');
  const realtime=env.VITE_REALTIME_URL||PVP_MOVEMENT_CONFIG.proxyPath;
  const realtimeUrl=realtime===PVP_MOVEMENT_CONFIG.proxyPath?realtime:publicUrl(realtime,['wss:','https:'],'VITE_REALTIME_URL');
  const convexTarget=localTarget(env.PVP_TEST_CONVEX_TARGET||'http://127.0.0.1:3210','PVP_TEST_CONVEX_TARGET');
  const realtimeTarget=localTarget(env.PVP_TEST_REALTIME_TARGET||`http://${REALTIME_CONFIG.host}:${REALTIME_CONFIG.port}`,'PVP_TEST_REALTIME_TARGET');
  const extraHost=env.PVP_TEST_ALLOWED_HOST;
  if(extraHost&&!/^(?=.{1,253}$)[a-zA-Z0-9]+(?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(extraHost))
    throw new Error('PVP_TEST_ALLOWED_HOST must be one exact hostname, without scheme, port or wildcard.');
  const publicNetwork={devTools:false,pvpTestBuild:true,convexSameOrigin:tunnel==='true',convexUrl:convexUrl||null,realtimeUrl};
  return {
    envDir,
    define:{
      // Enable only the playable PvP entrance, without enabling DEV tools.
      'import.meta.env.DEV':'false',
      'import.meta.env.PROD':'true',
      'import.meta.env.VITE_PVP_TEST_BUILD':JSON.stringify('true'),
      'import.meta.env.VITE_QUICK_TUNNEL':JSON.stringify(tunnel),
      'import.meta.env.VITE_CONVEX_URL':JSON.stringify(convexUrl),
      'import.meta.env.VITE_REALTIME_URL':JSON.stringify(realtimeUrl),
    },
    build:{...normalConfig.build,outDir:'builds/test'},
    preview:{
      host:'127.0.0.1',port:4174,strictPort:true,
      allowedHosts:['.trycloudflare.com',...(extraHost?[extraHost]:[])],
      proxy:{
        '^/api(?:/|$)':{target:convexTarget,changeOrigin:true,ws:true},
        [`^${PVP_MOVEMENT_CONFIG.proxyPath}(?:/|$)`]:{target:realtimeTarget,ws:true},
      },
    },
    plugins:[{
      name:'pvp-test-network-info',
      generateBundle(){
        // Public, non-secret metadata of the URLs actually baked into this build.
        this.emitFile({type:'asset',fileName:'test-environment.json',source:JSON.stringify(publicNetwork,null,2)+'\n'});
        console.log(`PvP test: Convex ${publicNetwork.convexSameOrigin?'same origin /api':convexUrl}; realtime ${realtimeUrl}`);
      },
    }],
  };
});
