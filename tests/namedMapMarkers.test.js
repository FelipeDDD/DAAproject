import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readNamedMapMarker } from '../src/maps/namedMapMarkers.js';
import { collisionAreas } from '../src/maps/collision.js';

const map=(file)=>JSON.parse(readFileSync(new URL(`../public/assets/maps/${file}`,import.meta.url),'utf8'));

test('Office computers resolve their named Tiled markers, including the marker placed on Collision',()=>{
  const user=readNamedMapMarker(map('office3.tmj'),'PC-USER');
  const director=readNamedMapMarker(map('office2.tmj'),'PC-DIRECTOR');
  assert.deepEqual({name:user.name,layer:user.layer,x:user.x,y:user.y},
    {name:'PC-User',layer:'Collision',x:716.666666666667,y:478.666666666667});
  assert.deepEqual(collisionAreas([user]),[],'the point marker does not create a collision area');
  assert.deepEqual({name:director.name,layer:director.layer,x:director.x,y:director.y},
    {name:'PC-director',layer:'Notes',x:348.333333333333,y:250});
});

test('named Tiled markers include nested group offsets and reject ambiguous names',()=>{
  const source={layers:[{name:'Group',type:'group',offsetx:12,offsety:7,layers:[{name:'Notes',type:'objectgroup',objects:[
    {id:1,name:'PC',x:20,y:30,width:0,height:0,point:true},
  ]}]}]};
  assert.deepEqual(readNamedMapMarker(source,'pc'),{
    id:'1',name:'PC',layer:'Notes',x:32,y:37,properties:{},point:true,width:0,height:0,
  });
  source.layers[0].layers[0].objects.push({id:2,name:'PC',x:0,y:0});
  assert.throws(()=>readNamedMapMarker(source,'PC'),/Multiple Tiled markers/);
});
