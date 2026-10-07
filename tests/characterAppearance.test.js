import assert from 'node:assert/strict';
import test from 'node:test';
import { Presence } from '../src/multiplayer/Presence.js';
import { RemotePlayers } from '../src/multiplayer/RemotePlayers.js';
import { characterById } from '../src/characters.js';
import { applyLocalAppearance,selectPreviewSkin,clearPreviewSkin } from '../src/characterAppearance.js';
import { characterVisual,preloadCharacterTextures,createCharacterAnimations } from '../src/characterVisuals.js';
import { YASSIN_BALD_TEST_VISUAL } from '../src/experimental/yassinBaldSkin.js';
import { claim,update } from '../convex/players.js';
import { equipSkin } from '../convex/bossProgress.js';
import { sessionTokenHash } from '../convex/profileStore.js';
import { BOSS_REWARDS } from '../src/boss/BossRewards.js';
import { WardrobeController } from '../src/WardrobeController.js';

function object(x=0,y=0){return {x,y,anims:{stop(){},play(){}},setOrigin(){return this;},
  setTexture(key){this.texture={key};return this;},setScale(){return this;},setFlipX(){return this;},
  setText(){return this;},setDepth(){return this;},setPosition(x,y){this.x=x;this.y=y;return this;},destroy(){}};}
function scene(presence,mapKey){return {presence,mapKey,player:{
  setCharacter(c,style){this.visual=characterVisual(c,style);}},add:{sprite:object,text:object}};}
const row=(extra={})=>({playerId:'owner',characterBaseId:'michael',characterId:'michael',
  equippedSkin:'remastered',x:20,y:30,direction:'down',lastSeen:1,...extra});

test('local scene transitions create the selected skin immediately and publish the same choice to another client',async()=>{
  const writes=[];
  const presence=new Presence({onUpdate:()=>()=>{},mutation:async(_fn,args)=>writes.push(args)},
    {players:{update:'update',inRoom:'inRoom'}},{playerId:'owner',characterId:'michael',characterBaseId:'michael',
      name:'Owner',sessionId:'session-123456789',equippedSkin:'remastered'});
  try{
    for(const map of ['school','outside','office2']){
      const local=scene(presence,map);applyLocalAppearance(local);
      assert.equal(local.player.visual.sprite,'character-michael-new');
      // An obsolete map snapshot cannot replace the shared selection.
      presence.enter(map,()=>({x:20,y:30,direction:'down',equippedSkin:'classic'}),()=>{});
      await new Promise(resolve=>setImmediate(resolve));
      assert.equal(writes.at(-1).equippedSkin,'remastered');
      const observer=new RemotePlayers(scene(null,map));observer.receive([writes.at(-1)]);
      assert.equal(observer.players.get('owner').visual.sprite,local.player.visual.sprite);
    }
  }finally{presence.leave();}
});

test('remote metadata arriving after sprite creation corrects both base and skin without another movement packet',()=>{
  const remoteScene=scene(null,'pvp-arena-test');
  const remotes=new RemotePlayers(remoteScene,{clock:()=>100});
  remotes.receive([row({characterBaseId:undefined,characterId:undefined,equippedSkin:undefined})],{movement:false});
  const remote=remotes.players.get('owner');assert.equal(remote.visual.sprite,'student');
  remote.sprite.setPosition(700,900);
  remotes.receive([row()],{movement:false});
  assert.equal(remote.visual.sprite,'character-michael-new');
  assert.equal(remote.sprite.x,700);assert.equal(remote.sprite.y,900);
  remotes.receiveMovement('owner',{x:700,y:900,direction:'right',moving:false,sampleSeq:1});
  remotes.receive([row({equippedSkin:'classic'})],{movement:false});
  remotes.update();
  assert.equal(remote.visual.sprite,'character-michael');
});

test('stable preview IDs render the same variant on normal/test pages and are preloaded for remote clients',()=>{
  const yassin=characterById('jassine'),original=yassin.experimentalVisual;
  const identity={playerId:'owner',characterId:'jassine',characterBaseId:'jassine',equippedSkin:'classic'};
  try{
    yassin.experimentalVisual=YASSIN_BALD_TEST_VISUAL;selectPreviewSkin(identity,yassin);
    const owner=scene({identity},'test');applyLocalAppearance(owner);
    yassin.experimentalVisual=original;
    const observer=new RemotePlayers(scene(null,'school'));observer.receive([row({...identity})],{movement:false});
    assert.equal(observer.players.get('owner').visual.sprite,owner.player.visual.sprite);
    assert.equal(owner.player.visual.sprite,YASSIN_BALD_TEST_VISUAL.sprite);
    const loaded=[],anims=new Map();
    const preload={textures:{exists:key=>key===original.sprite},load:{svg(){},image(){},spritesheet:(key)=>loaded.push(key)},
      anims:{exists:key=>anims.has(key),create:animation=>anims.set(animation.key,animation)}};
    preloadCharacterTextures(preload,[yassin],'/',false,true);
    createCharacterAnimations(preload,[yassin],false,true);
    assert.ok(loaded.includes(original.recolorSource));assert.ok(anims.has(`${identity.previewSkin}-walk-down`));
    clearPreviewSkin(identity);observer.receive([row({...identity,previewSkin:null})],{movement:false});
    assert.equal(observer.players.get('owner').visual.sprite,'character-jassine');
  }finally{yassin.experimentalVisual=original;}
});

test('persistent appearance subscription outlives maps, applies changes to the current scene, and cleans up',()=>{
  let callback,closed=0;
  const identity={playerId:'owner',profileId:'profile',characterId:'michael',characterBaseId:'michael',equippedSkin:'classic'};
  const presence=new Presence({onUpdate:(_fn,_args,cb)=>{callback=cb;return()=>closed++;},close(){}},
    {bossProgress:{get:'get'}},identity);presence.profileSessionToken='token';presence.watchAppearance();
  presence.send=async()=>{};
  const old=scene(presence,'school');presence.active={receive(){},appearanceChanged:()=>applyLocalAppearance(old)};
  callback({equippedSkin:'remastered'});assert.equal(old.player.visual.sprite,'character-michael-new');
  presence.leave();const next=scene(presence,'outside');applyLocalAppearance(next);
  assert.equal(next.player.visual.sprite,'character-michael-new');
  presence.active={receive(){},appearanceChanged:()=>applyLocalAppearance(next)};
  callback({equippedSkin:'classic'});assert.equal(next.player.visual.sprite,'character-michael');
  presence.close();assert.equal(closed,1);
});

test('a failed/stale wardrobe read does not reset the selected skin',async()=>{
  const identity={profileId:'profile',characterId:'michael',equippedSkin:'remastered'};let applied=0;
  const wardrobe=Object.assign(Object.create(WardrobeController.prototype),{presence:{identity},
    client:{getProgress:async()=>{throw new Error('offline');}},scene:{applyCharacterSkin(){applied++;}}});
  await wardrobe.restore();assert.equal(applied,0);assert.equal(identity.equippedSkin,'remastered');
});

function memoryContext(){
  const tables={};let nextId=0;
  const get=id=>Object.values(tables).flat().find(row=>row._id===id);
  const db={query(table){const rows=tables[table]??=[];
    return {collect:async()=>rows,withIndex(_index,build){const filters=[];
      const q={eq(key,value){filters.push(row=>row[key]===value);return q;}};build(q);
      const matches=()=>rows.filter(row=>filters.every(filter=>filter(row)));
      return {unique:async()=>matches()[0]??null,collect:async()=>matches(),first:async()=>matches()[0]??null};}};},
    get:async id=>get(id),insert:async(table,value)=>{const id=`${table}-${++nextId}`;(tables[table]??=[]).push({_id:id,...value});return id;},
    patch:async(id,value)=>Object.assign(get(id),value),
    replace:async(id,value)=>{const row=get(id);for(const key of Object.keys(row))if(key!=='_id')delete row[key];Object.assign(row,value);},
    delete:async id=>{for(const rows of Object.values(tables)){const index=rows.findIndex(row=>row._id===id);if(index>=0)rows.splice(index,1);}}};
  return {db,tables};
}
test('claim hydrates persisted skin; equip updates its Presence mirror atomically; stale map publications cannot undo it',async()=>{
  const ctx=memoryContext(),token='profile-token-abcdefghijklmnopqrstuvwxyz-123456';
  const profileId=await ctx.db.insert('profiles',{profileName:'owner',displayName:'Owner',selectedCharacterId:'michael',passwordHash:'set'});
  const tokenHash=await sessionTokenHash(token);
  await ctx.db.insert('profileSessions',{profileId,tokenHash,expiresAt:Date.now()+60_000});
  await ctx.db.insert('bossProgress',{profileId,bossId:'director',wins:1,defeated:true,rewards:[BOSS_REWARDS.REMASTERED_SKIN],equippedSkin:'remastered'});
  const sessionId='skin-session-123456789';
  const joined=await claim._handler(ctx,{tokenHash,characterBaseId:'michael',sessionId});
  assert.equal(joined.equippedSkin,'remastered');
  // Existing sessions from the old build can have an incorrect mirror already.
  ctx.tables.players[0].equippedSkin='classic';
  const args={playerId:joined.playerId,characterId:'michael',sessionId,room:'school',x:20,y:30,direction:'down',equippedSkin:'classic'};
  await update._handler(ctx,args);assert.equal(ctx.tables.players[0].equippedSkin,'remastered');
  await equipSkin._handler(ctx,{token,skin:'classic'});assert.equal(ctx.tables.players[0].equippedSkin,'classic');
  await update._handler(ctx,{...args,room:'outside',equippedSkin:'remastered'});
  assert.equal(ctx.tables.players[0].equippedSkin,'classic');
  await assert.rejects(update._handler(ctx,{...args,previewSkin:YASSIN_BALD_TEST_VISUAL.sprite}),/Invalid preview skin/);
  await assert.rejects(update._handler(ctx,{...args,sessionId:'wrong-session'}),/CHARACTER_SESSION_LOST/);
});
