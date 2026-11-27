import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, rmdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import test from 'node:test';
import { combatBalancePlugin } from '../scripts/combat-balance-vite.mjs';
import current from '../src/combat/balance.json' with {type:'json'};
import { BALANCE_ROUTE, normalizeBalance, original, validateBalance } from '../src/combat/balanceSchema.js';
import { CombatBout, POISON } from '../src/vfx/lab/CombatBout.js';
import { CombatSkillRunner } from '../src/vfx/lab/CombatSkillRunner.js';
import { applyCombatBalance } from '../src/vfx/lab/combatBalancePreview.js';
import { SKILLS } from '../src/vfx/lab/combatSkills.js';
import { SLIME_SPECIAL } from '../src/vfx/lab/slimeVariants.js';
import { boxCenter, playerBox } from '../src/vfx/lab/combatGeometry.js';
import { SUMMONS } from '../src/vfx/lab/mushroomBoss.js';
import { AREAS } from '../src/vfx/lab/combatAreas.js';

test('balance schema rejects malformed imports and invalid gameplay limits',()=>{
  assert.equal(validateBalance(original),'');
  assert.equal(validateBalance(current),'');
  const cases=[
    data=>{data.michael.fireball.damage='26';},
    data=>{data.michael.fireball.cooldown=-5;},
    data=>{data.slimes.special.homing.speed=Infinity;},
    data=>{data.slimes.variants.big.damagePercent=105.5;},
    data=>{data.slimes.variants.big.damagePercent=205;},
    data=>{data.slimes.variants.big.damagePercent=126;},
    data=>{data.slimes.variants.big.contactDamage=null;},
    data=>{data.slimes.variants.swift.projectileDamage=10;},
    data=>{data.michael.drain.bands[1].range=35;},
    data=>{data.slimes.special.homing.trackingMs=3000;},
    data=>{data.frog.longLeap.range=50;},
    data=>{data.michael.meteor.cast=0;},
    data=>{data.michael['fire-ring'].burning.ms=999;},
    data=>{data.michael['fire-ring'].castSpeed=1.1;},
    data=>{data.michael['healing-parry'].parry.healFraction=60;},
    data=>{data.michael['healing-parry'].parry.activeMs=0;},
    data=>{data.michael['healing-parry'].parry.recoveryDamageMultiplier=0.8;},
    data=>{data.path='outside.json';},
  ];
  for(const alter of cases){
    const data=structuredClone(original);
    alter(data);
    assert.notEqual(validateBalance(data),'');
  }
});

test('old balance files inherit newly exposed fields and keep edited values',()=>{
  const legacy=structuredClone(original);
  const big=legacy.slimes.variants.big;
  for(const key of ['damagePercent','jumpDamage','projectileDamage','contactDamage'])delete big[key];
  big.damage=29;
  legacy.michael.lash.damage=7;
  delete legacy.michael['fire-ring'];
  delete legacy.michael.tesla;
  delete legacy.michael['healing-parry'];
  assert.equal(validateBalance(legacy),'');
  const next=normalizeBalance(legacy);
  assert.deepEqual(next.slimes.variants.big,{...original.slimes.variants.big,damage:29});
  assert.equal(next.michael.lash.damage,7);
  assert.deepEqual(next.michael['fire-ring'],original.michael['fire-ring']);
  assert.deepEqual(next.michael.tesla,original.michael.tesla);
  assert.deepEqual(next.michael['healing-parry'],original.michael['healing-parry']);
  const lastRing=structuredClone(current);
  delete lastRing.michael['fire-ring'].castSpeed;
  lastRing.michael['fire-ring'].damage=64;
  assert.deepEqual(normalizeBalance(lastRing).michael['fire-ring'],{...current.michael['fire-ring'],damage:64});
  assert.equal(big.damagePercent,undefined);
  delete big.damage;
  assert.notEqual(validateBalance(legacy),'');
});

const slimeDamages=({damage,shot,contactDamage,special})=>[damage,shot?.damage,contactDamage,special?.damage];

function actualBigHits(){
  const player={x:350,y:304,displayHeight:64};
  const aim=boxCenter(playerBox(player));
  return ['jump','projectile','contact','special'].map(kind=>{
    const damage=[];
    const bout=new CombatBout((victim,n)=>{if(victim==='player')damage.push(n);});
    bout.reset('big');
    bout.started=true;
    const [actor]=bout.enemies;
    const point={x:kind==='jump'||kind==='contact'?player.x:player.x+65,y:player.y};
    Object.assign(actor.enemy,point);
    if(kind==='contact')actor.updateContact(player);
    else if(kind==='jump'){
      actor.phase='jump';
      actor.elapsed=actor.spec.jumpMs-1;
      actor.hop={from:point,to:point};
      actor.update(1,player);
    }else{
      const special=kind==='special';
      const windup=special?SLIME_SPECIAL.windupMs:actor.spec.shotWindup;
      actor.attack={kind:special?'spread':actor.spec.shot.kind,to:aim,...(special?{windup,reason:'retreat'}:{})};
      actor.phase='windup';
      actor.elapsed=windup-1;
      actor.update(1,player);
      assert.equal(actor.shots.length,special?3:1);
      for(const shot of actor.shots)actor.updateShot(shot,shot.lifetime,player);
    }
    assert.equal(damage.length,1,kind+' must deal exactly one hit');
    return damage[0];
  });
}

test('Big Slime uses independent base values and scales each of its four actual hits once',t=>{
  t.after(()=>applyCombatBalance(current));
  const draft=structuredClone(original);
  const big=draft.slimes.variants.big;
  const untouched={poison:POISON.damage,unstable:AREAS.unstable.damage};
  for(const [percent,expected] of [[100,[36,25,10,20]],[125,[45,31,13,25]],[80,[29,20,8,16]],[100,[36,25,10,20]]]){
    big.damagePercent=percent;
    applyCombatBalance(draft);
    assert.deepEqual(actualBigHits(),expected);
    assert.deepEqual([big.jumpDamage,big.projectileDamage,big.contactDamage,big.damage],[36,25,10,20]);
  }
  big.damagePercent=125;
  for(const [field,next,expected] of [
    ['jumpDamage',40,[50,31,13,25]],['projectileDamage',32,[45,40,13,25]],
    ['contactDamage',16,[45,31,20,25]],['damage',28,[45,31,13,35]],
  ]){
    big[field]=next;
    applyCombatBalance(draft);
    assert.deepEqual(actualBigHits(),expected);
    big[field]=original.slimes.variants.big[field];
  }
  assert.deepEqual({poison:POISON.damage,unstable:AREAS.unstable.damage},untouched);
});

test('variants scale independently and Mushroom summons retain explicit damage overrides',t=>{
  t.after(()=>applyCombatBalance(current));
  const draft=structuredClone(original);
  draft.slimes.variants.big.damagePercent=125;
  draft.slimes.variants.slime.damagePercent=200;
  draft.slimes.variants.swift.damagePercent=80;
  applyCombatBalance(draft);
  const bout=new CombatBout();
  bout.reset(['mushroom','big','frost','swift','slime']);
  const [boss,big,frost,swift,slime]=bout.enemies;
  assert.deepEqual(slimeDamages(big.spec),[45,31,13,25]);
  assert.deepEqual(slimeDamages(frost.spec),[24,15,6,16]);
  assert.deepEqual(slimeDamages(swift.spec),[14,undefined,3,10]);
  assert.deepEqual(slimeDamages(slime.spec),[48,32,12,32]);
  const player={x:300,y:385};
  const mini=bout.summonCreature(boss,SUMMONS.mini,player,420);
  const enraged=bout.summonCreature(boss,SUMMONS.final,player,420);
  assert.deepEqual(slimeDamages(mini.spec),[12,undefined,3,undefined]);
  assert.deepEqual(slimeDamages(enraged.spec),[42,31,12,25]);
  assert.equal(enraged.enemy.hp,260);
  assert.equal(big.spec.shot.speed,147);
  assert.equal(big.spec.contactCooldown,1000);
  assert.equal(frost.spec.shot.status,'Slowed');
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
  Object.assign(data.michael['fire-ring'],{radius:156,burning:{damage:12,ms:7500}});
  data.slimes.variants.big.damagePercent=125;
  data.slimes.variants.big.projectileDamage=33;
  const body={revision:state.revision,data};
  assert.equal((await call('PUT',{body})).status,403);
  assert.equal((await call('PUT',{body:{...body,path:'some-other-file.json'},headers})).status,400);
  assert.equal((await call('PUT',{body:{...body,data:{michael:{}}},headers})).status,400);
  assert.equal(await readFile(path,'utf8'),baseline);
  const saved=await call('PUT',{body,headers});
  assert.equal(saved.status,200);
  const persisted=JSON.parse(await readFile(path,'utf8'));
  assert.equal(persisted.michael.cleaver.damage,39);
  assert.equal(persisted.michael['fire-ring'].radius,156);
  assert.deepEqual(persisted.michael['fire-ring'].burning,{damage:12,ms:7500});
  assert.deepEqual(persisted.slimes.variants.big,{...original.slimes.variants.big,damagePercent:125,projectileDamage:33});
  assert.equal(await readFile(path+'.bak','utf8'),baseline);
  assert.equal((await call('PUT',{body,headers})).status,409);
});
