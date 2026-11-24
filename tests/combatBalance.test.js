import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, rmdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import test from 'node:test';
import { combatBalancePlugin } from '../scripts/combat-balance-vite.mjs';
import current from '../src/combat/balance.json' with {type:'json'};
import { BALANCE_ROUTE, original, validateBalance } from '../src/combat/balanceSchema.js';
import { CombatBout } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';
import { applyCombatBalance } from '../src/vfx/lab/combatBalancePreview.js';
import { SKILLS } from '../src/vfx/lab/combatSkills.js';
import { SLIME_SPECIAL } from '../src/vfx/lab/slimeVariants.js';

test('balance schema rejects malformed imports and invalid gameplay limits',()=>{
  assert.equal(validateBalance(original),'');
  assert.equal(validateBalance(current),'');
  const cases=[
    data=>{data.michael.fireball.damage='26';},
    data=>{data.michael.fireball.cooldown=-5;},
    data=>{data.slimes.special.homing.speed=Infinity;},
    data=>{data.michael.drain.bands[1].range=35;},
    data=>{data.slimes.special.homing.trackingMs=3000;},
    data=>{data.frog.longLeap.range=50;},
    data=>{data.michael.meteor.cast=0;},
    data=>{data.path='outside.json';},
  ];
  for(const alter of cases){
    const data=structuredClone(original);
    alter(data);
    assert.notEqual(validateBalance(data),'');
  }
});

test('a reset can activate draft timing and damage through the real skill and enemy registry',t=>{
  const savedTurnRate=current.slimes.special.homing.turnRate;
  t.after(()=>applyCombatBalance(current));
  const draft=structuredClone(original);
  Object.assign(draft.michael.cleaver,{damage:31,cooldown:2700,cast:700});
  draft.michael.drain.bands[2].heal=6;
  draft.slimes.special.homing.turnRate=1.3;
  draft.snake.bite.damage=17;
  draft.frog.leap.windupMs=510;
  applyCombatBalance(draft);
  const bout=new CombatBout();
  bout.reset(['slime']);
  bout.started=true;
  const actor=bout.enemies[0];
  const runner=new CombatSkillRunner(bout);
  const player={x:445,y:304,displayHeight:64};
  assert.equal(runner.use(0,['cleaver'],player,()=>({x:500,y:282})),true);
  assert.equal(runner.cooldowns.get('cleaver'),2700);
  runner.update(699,player);
  assert.equal(actor.enemy.hp,100);
  runner.update(1,player);
  assert.equal(actor.enemy.hp,69);
  assert.equal(SKILLS.drain.bands[2].heal,6);
  assert.equal(SLIME_SPECIAL.homing.turnRate,1.3);
  bout.reset(['snake','frog']);
  assert.equal(bout.enemies[0].spec.bite.damage,17);
  assert.equal(bout.enemies[1].spec.leap.windupMs,510);
  assert.equal(current.slimes.special.homing.turnRate,savedTurnRate);
});

test('save route checks local authorization, validates data, backs up the previous source and detects stale revisions',async t=>{
  const root=await mkdtemp(join(tmpdir(),'daa-balance-test-'));
  const path=join(root,'src','combat','balance.json');
  const baseline=JSON.stringify(original,null,2)+'\n';
  await mkdir(join(root,'src','combat'),{recursive:true});
  await writeFile(path,baseline);
  t.after(async()=>{
    await rm(path+'.bak',{force:true});
    await rm(path,{force:true});
    await rmdir(join(root,'src','combat'));
    await rmdir(join(root,'src'));
    await rmdir(root);
  });
  let middleware;
  const plugin=combatBalancePlugin();
  assert.equal(plugin.apply({mode:'production'},{command:'build'}),false);
  assert.equal(plugin.apply({mode:'production'},{command:'serve',isPreview:true}),false);
  const server={config:{root,server:{host:'0.0.0.0'},logger:{error:message=>assert.fail(message)}},
    middlewares:{use(fn){middleware=fn;}}};
  plugin.configureServer(server);
  assert.equal(middleware,undefined);
  server.config.server.host='127.0.0.1';
  plugin.configureServer(server);
  function call(method,{body,headers={},address='127.0.0.1'}={}){
    return new Promise((done,reject)=>{
      const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);
      Object.assign(req,{method,url:BALANCE_ROUTE,socket:{remoteAddress:address},
        headers:{host:'127.0.0.1:5173',...headers}});
      const res={writeHead(code){this.code=code;},end(value){done({status:this.code,...JSON.parse(value)});}};
      Promise.resolve(middleware(req,res,()=>reject(new Error('Route not installed')))).catch(reject);
    });
  }
  assert.equal((await call('GET',{address:'203.0.113.10'})).status,403);
  assert.equal((await call('GET',{headers:{'x-forwarded-for':'203.0.113.10'}})).status,403);
  assert.equal((await call('GET',{headers:{origin:'http://localhost:5173'}})).status,403);
  const state=await call('GET');
  assert.equal(state.status,200);
  const headers={origin:'http://127.0.0.1:5173','content-type':'application/json','x-combat-balance-token':state.token};
  const data=structuredClone(state.data);
  data.michael.cleaver.damage=39;
  const body={revision:state.revision,data};
  assert.equal((await call('PUT',{body})).status,403);
  assert.equal((await call('PUT',{body:{...body,path:'some-other-file.json'},headers})).status,400);
  assert.equal((await call('PUT',{body:{...body,data:{michael:{}}},headers})).status,400);
  assert.equal(await readFile(path,'utf8'),baseline);
  const saved=await call('PUT',{body,headers});
  assert.equal(saved.status,200);
  assert.equal(JSON.parse(await readFile(path,'utf8')).michael.cleaver.damage,39);
  assert.equal(await readFile(path+'.bak','utf8'),baseline);
  assert.equal((await call('PUT',{body,headers})).status,409);
});
