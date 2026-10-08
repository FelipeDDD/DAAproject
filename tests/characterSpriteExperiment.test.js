import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CHARACTERS, characterById, characterMenuOptions } from '../src/characters.js';
import { CharacterMenu } from '../src/CharacterMenu.js';
import { canPreviewCharacterSkin, WardrobeController } from '../src/WardrobeController.js';
import { characterVisual, createCharacterAnimations, footBodyForVisual, localCharacterStyle, preloadCharacterTextures, prepareExperimentalGridTexture, walkFrames } from '../src/characterVisuals.js';

import { registeredPreviewVisuals } from '../src/characterPreviewSkins.js';

const felipe=characterById('felipe');
test('Tier 3 stays locked in normal play until the Lucky Machine item is owned',async()=>{
  const yassin=characterById('jassine');
  assert.equal(canPreviewCharacterSkin(yassin,{},false),false);
  assert.equal(canPreviewCharacterSkin(felipe,{},false),false);
  assert.equal(canPreviewCharacterSkin(felipe,{devAllSkins:true},false),false);
  assert.equal(canPreviewCharacterSkin(felipe,{devAllSkins:true},true),true);
  for(const kind of ['guest','profile']){
    const identity={kind,characterId:'jassine',characterBaseId:'jassine'};
    const applied=[],errors=[];
    const wardrobe=Object.assign(Object.create(WardrobeController.prototype),{
      presence:{identity},scene:{characterItems:{items:[]},applyCharacterSkin:skin=>applied.push(skin)},
      progress:{equippedSkin:'classic'},render:error=>{if(error)errors.push(error);},
    });
    await wardrobe.equip('level3Preview');
    assert.match(errors.pop(),/not been unlocked/);
    assert.equal(identity.visualPreview,undefined);
    wardrobe.scene.characterItems.items=[{itemId:'tier3_skin'}];
    await wardrobe.equip('level3Preview');
    assert.deepEqual(errors,[]);
    assert.equal(identity.visualPreview,'level3Preview');
    assert.deepEqual(applied,['classic']);
  }
});
test('experimental menu preview is opt-in and does not unlock Tier 3 in normal play',()=>{
  assert.equal(characterMenuOptions().length,4);
  const standardOptions=characterMenuOptions({includePreviews:false});
  assert.equal(standardOptions.length,4);
  const options=characterMenuOptions({includePreviews:true});
  assert.equal(options.length,5);
  assert.deepEqual(options.slice(0,4).map(option=>option.c.id),['michael','jassine','sarina','felipe']);
  assert.ok(options.slice(0,4).every(option=>option.previewStyle===null));
  assert.equal(options[4].c,felipe);
  assert.equal(options[4].label,'Felipe — TEST');
  assert.equal(options[4].previewStyle,'level3Preview');
  assert.match(options[4].c.experimentalVisual.recolorMaskAsset,/felipe-level3-hd-material-mask\.png$/);
  assert.equal(options[4].c.experimentalVisual.sprite,'character-felipe-level3-hd-recolor-v2');
  assert.equal(characterById('jassine').experimentalVisual.menuPreview,undefined);
  assert.equal(characterById('jassine').experimentalVisual.wardrobePreview,true);
  assert.equal(canPreviewCharacterSkin(characterById('jassine'),{},false),false);
  assert.match(characterById('jassine').experimentalVisual.asset,/yassin-felipe-walk-v1\.png$/);
  assert.ok(CHARACTERS.every(character=>character.experimentalVisual));
  assert.equal(CHARACTERS.length,4);
});

test('Yassin third skin and Felipe test load with DEV experiments disabled',()=>{
  const loaded=[],animations=new Map();
  const scene={textures:{exists:key=>CHARACTERS.some(c=>key===c.experimentalVisual.sprite)},
    load:{svg(){},spritesheet:(...args)=>loaded.push(args),image:(...args)=>loaded.push(args)},
    anims:{exists:key=>animations.has(key),create:config=>animations.set(config.key,config)}};
  preloadCharacterTextures(scene,CHARACTERS,'/',false);
  createCharacterAnimations(scene,CHARACTERS,false);
  const visual=characterVisual(characterById('jassine'),'level3Preview');
  assert.deepEqual(loaded.find(([key])=>key===visual.recolorSource),[visual.recolorSource,`/${visual.asset}`,{frameWidth:128,frameHeight:144}]);
  for(const direction of ['down','left','right','up']){
    assert.ok(animations.has(`${visual.sprite}-idle-${direction}`));
    assert.equal(animations.get(`${visual.sprite}-walk-${direction}`).frames.length,visual.walkColumns[direction].length);
  }
  for(const id of ['michael','sarina']){
    const other=characterById(id).experimentalVisual;
    assert.ok(!loaded.some(([key])=>key===(other.recolorSource??other.sprite)));
    assert.ok(!animations.has(`${other.sprite}-walk-down`));
  }
});

test('preview selection claims the original base and normal reselection clears local override',async()=>{
  const claims=[];
  const menu=Object.assign(Object.create(CharacterMenu.prototype),{
    mode:'guest',guest:{guestId:'guest-sprite-test'},sessionId:'session-sprite-test',
    render(){},hide(){},message:{},onChoose(){},
    presence:{api:{players:{claimGuest:'claim'}},enter(){},client:{mutation:async(fn,args)=>{
      claims.push(args);return {ok:true,playerId:`live-${claims.length}`};
    }}},
  });
  await menu.choose(felipe,'level3Preview');
  assert.deepEqual(claims[0],{guestId:'guest-sprite-test',characterBaseId:'felipe',sessionId:'session-sprite-test'});
  assert.equal(menu.presence.identity.visualPreview,'level3Preview');
  assert.equal(menu.presence.identity.characterName,'Felipe');
  assert.equal(menu.presence.identity.characterBaseId,'felipe');
  await menu.choose(felipe);
  assert.equal(menu.presence.identity.visualPreview,undefined);
  for(const id of ['sarina','michael','jassine']){
    await menu.choose(characterById(id),'level3Preview');
    assert.equal(claims.at(-1).characterBaseId,id);
    assert.equal(menu.presence.identity.characterBaseId,id);
    assert.equal(menu.presence.identity.visualPreview,'level3Preview');
  }
});

test('appearance restore keeps only the selected local Felipe in preview style',()=>{
  const identity={characterBaseId:'felipe',visualPreview:'level3Preview'};
  for(const style of ['old','new'])assert.equal(localCharacterStyle(felipe,style,identity),'level3Preview');
  assert.equal(localCharacterStyle(felipe,'new',{characterBaseId:'felipe'}),'new');
  assert.equal(localCharacterStyle(characterById('michael'),'lungCrusher',identity),'lungCrusher');
  assert.equal(localCharacterStyle(characterById('michael'),'lungCrusher',
    {characterBaseId:'michael',visualPreview:'level3Preview'}),'lungCrusher');
  assert.equal(characterVisual(felipe,'new').sprite,'character-felipe-new');
  const preview=characterVisual(felipe,'level3Preview');
  const normal=characterVisual(felipe,'new');
  const previewBody=footBodyForVisual(preview),normalBody=footBodyForVisual(normal);
  for(const key of ['width','height','offsetX','offsetY']){
    assert.equal(previewBody[key]*preview.scale,normalBody[key]*normal.scale);
  }
  assert.equal(preview.frameWidth*preview.scale,normal.frameWidth*normal.scale);
  assert.equal(preview.frameHeight*preview.scale,normal.frameHeight*normal.scale);
  assert.equal(preview.scale,0.5);
});

test('experimental frames load once only when enabled and use five walk poses at 10 FPS',()=>{
  const loaded=[],animations=new Map();
  const scene={textures:{exists:key=>CHARACTERS.some(c=>key===c.experimentalVisual.sprite)},
    load:{svg(){},spritesheet:(...args)=>loaded.push(args),image:(...args)=>loaded.push(args)},
    anims:{exists:key=>animations.has(key),create:config=>animations.set(config.key,config)}};
  preloadCharacterTextures(scene,CHARACTERS,'/',false);
  assert.ok(loaded.some(([key])=>key===felipe.experimentalVisual.recolorSource));
  assert.deepEqual(loaded.find(([key])=>key===felipe.experimentalVisual.recolorMaskSource),
    [felipe.experimentalVisual.recolorMaskSource,`/${felipe.experimentalVisual.recolorMaskAsset}`]);
  loaded.length=0;
  preloadCharacterTextures(scene,[...CHARACTERS,felipe],'/',true);
  assert.equal(loaded.filter(([key])=>key===felipe.experimentalVisual.recolorSource).length,1);
  for(const id of ['sarina','michael','jassine'])
    assert.equal(loaded.filter(([key])=>key===characterById(id).experimentalVisual.recolorSource).length,1);
  assert.deepEqual(loaded.find(([key])=>key===felipe.experimentalVisual.recolorSource)[2],{frameWidth:128,frameHeight:144});
  createCharacterAnimations(scene,CHARACTERS,true);
  const visual=characterVisual(felipe,'level3Preview');
  for(const [row,direction]of ['down','left','right','up'].entries()){
    assert.deepEqual(walkFrames(direction,visual),[1,2,3,4,5].map(column=>row*6+column));
    const walk=animations.get(`${visual.sprite}-walk-${direction}`);
    assert.equal(walk.frames.length,5);assert.equal(walk.frameRate,visual.frameRate);
    assert.deepEqual(animations.get(`${visual.sprite}-idle-${direction}`).frames,[{key:visual.sprite,frame:row*6}]);
  }
  assert.equal(animations.get('character-felipe-new-walk-down').frames.length,4);
  assert.equal(animations.get('character-felipe-new-walk-down').frameRate,8);
});

test('generic experimental grid normalizer handles non-divisible source dimensions',()=>{
  const visual={sprite:'test-grid',sourceImage:'test-source',sourceGrid:{columns:6,rows:4},frameWidth:128,frameHeight:144};
  const image={width:1448,height:1086};const draws=[];let registered;
  const canvas={getContext:()=>({set imageSmoothingEnabled(value){assert.equal(value,false);},
    drawImage:(...args)=>draws.push(args)})};
  const textures={exists:()=>false,get:key=>{
    assert.equal(key,visual.sourceImage);return {getSourceImage:()=>image};
  },addSpriteSheet:(...args)=>{registered=args;}};
  prepareExperimentalGridTexture(textures,visual,()=>canvas);
  assert.equal(canvas.width,768);assert.equal(canvas.height,576);
  assert.equal(draws.length,24);
  assert.equal(draws[0][0],image);
  assert.deepEqual(draws[0].slice(5),[0,0,128,144]);
  assert.deepEqual(registered.slice(0,2),[visual.sprite,canvas]);
  assert.deepEqual(registered[2],{frameWidth:128,frameHeight:144});
});

for(const id of ['sarina','michael','jassine'])test(`${id} uses editable material masks with registered HD frames and unchanged world bounds`,()=>{
  const character=characterById(id),visual=characterVisual(character,'level3Preview');
  assert.ok(visual.recolorSource);
  assert.ok(visual.recolorMaskAsset);
  assert.equal(visual.sourceGrid,undefined);
  assert.equal(visual.scale,.5);
  assert.equal(localCharacterStyle(character,'old',{characterBaseId:id,visualPreview:'level3Preview'}),'level3Preview');
  assert.deepEqual(footBodyForVisual(visual),footBodyForVisual(characterVisual(felipe,'level3Preview')));
  const png=readFileSync(new URL(`../public/${visual.asset}`,import.meta.url));
  assert.equal(png.readUInt32BE(16),6*visual.frameWidth);assert.equal(png.readUInt32BE(20),4*visual.frameHeight);
  const report=JSON.parse(readFileSync(new URL(`../public/${visual.asset.replace(/\.png$/,'-registration.json')}`,import.meta.url),'utf8').replace(/^\uFEFF/,''));
  assert.equal(report.frames.length,24);assert.equal(report.baseline,143);
  const animations=[];
  createCharacterAnimations({textures:{exists:()=>true},anims:{exists:()=>false,create:config=>animations.push(config)}},[character],true);
  for(const [row,direction]of ['down','left','right','up'].entries()){
    const walk=animations.find(animation=>animation.key===`${visual.sprite}-walk-${direction}`);
    assert.deepEqual(walk.frames.map(f=>f.frame),visual.walkColumns[direction].map(column=>row*6+column));
    assert.equal(walk.frameRate,visual.frameRate);
  }
});

test('experimental texture dimensions fit all 24 registered frames',()=>{
  const visual=characterVisual(felipe,'level3Preview');
  const png=readFileSync(new URL(`../public/${visual.asset}`,import.meta.url));
  assert.equal(png.readUInt32BE(16),768);assert.equal(png.readUInt32BE(20),576);
  const readReport=suffix=>JSON.parse(readFileSync(new URL(`../public/assets/characters/experimental/felipe-level3${suffix}-registration.json`,import.meta.url),'utf8').replace(/^\uFEFF/,''));
  const report=readReport('-hd'),previous=readReport('');
  assert.equal(report.frames.length,24);assert.equal(report.baseline,143);
  assert.equal(report.frameWidth,visual.frameWidth);assert.equal(report.frameHeight,visual.frameHeight);
  assert.equal(report.sourceSha256,previous.sourceSha256);
  assert.deepEqual(report.frames,previous.frames); // Same approved poses/crops, higher registration resolution.
});


test('every public runtime preview points to an existing spritesheet and material mask',()=>{
  for(const character of CHARACTERS)for(const visual of registeredPreviewVisuals(character)){
    assert.ok(readFileSync(new URL('../public/'+visual.asset,import.meta.url)).length>0);
    if(visual.recolorMaskAsset)assert.ok(readFileSync(new URL('../public/'+visual.recolorMaskAsset,import.meta.url)).length>0);
  }
});
