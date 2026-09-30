import test from 'node:test';
import assert from 'node:assert/strict';
import { pointInsideInteractionArea, readNamedInteractionArea } from '../src/maps/namedInteractionAreas.js';

test('named rectangular interaction areas resolve from any visible Tiled object layer',()=>{
  const source={layers:[
    {name:'Notes',type:'objectgroup',objects:[
      {id:1,name:'PC-USER-INTERACTION',x:100,y:200,width:60,height:30},
    ]},
  ]};
  const area=readNamedInteractionArea(source,'PC-USER-INTERACTION');
  assert.deepEqual({layer:area.layer,x:area.x,y:area.y,width:area.width,height:area.height},
    {layer:'Notes',x:100,y:200,width:60,height:30});
  assert.equal(pointInsideInteractionArea(area,100,200),true);
  assert.equal(pointInsideInteractionArea(area,160,230),true);
  assert.equal(pointInsideInteractionArea(area,161,230),false);
});

test('missing interaction area can fall back, but a named non-rectangle is rejected',()=>{
  const source={layers:[{name:'Notes',type:'objectgroup',objects:[
    {id:1,name:'marker',x:10,y:20,width:0,height:0,point:true},
  ]}]};
  assert.equal(readNamedInteractionArea(source,'PC-INTERACTION'),null);
  assert.throws(()=>readNamedInteractionArea(source,'marker'),/non-empty rectangle/);
});
