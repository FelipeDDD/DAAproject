import test from 'node:test';
import assert from 'node:assert/strict';
import { TerminalLeaderboardPage } from '../prototype-ui/TerminalLeaderboardPage.js';

function page(futuristic){
  const element=()=>({hidden:false,inert:false,focus(){},setAttribute(){},removeAttribute(){}});
  const controls=[element(),element()];
  const result=Object.assign(Object.create(TerminalLeaderboardPage.prototype),{
    root:{classList:{toggle(){}},querySelectorAll:()=>controls},
    topView:element(),listView:element(),detail:element(),viewTopButton:element(),
    viewListButton:element(),detailBack:element(),escapeLabel:{},
    onViewChange(){},isFuturistic:()=>futuristic,
  });
  return {result,controls};
}

test('futuristic details retain and disable their originating view',()=>{
  for(const origin of ['top','list']){
    const {result,controls}=page(true);
    result.returnView=origin;result.setView('detail',{focus:false});
    assert.equal(result.topView.hidden,origin!=='top');
    assert.equal(result.listView.hidden,origin!=='list');
    assert.equal(result.detail.hidden,false);
    assert.equal(result.topView.inert,true);
    assert.ok(controls.every(control=>control.inert));
    result.setView(origin,{focus:false});
    assert.equal(result.detail.hidden,true);
    assert.ok(controls.every(control=>!control.inert));
  }
});

test('subtle details keep the original replacement view without a background modal',()=>{
  const {result,controls}=page(false);
  result.returnView='list';result.setView('detail',{focus:false});
  assert.equal(result.listView.hidden,true);
  assert.equal(result.topView.hidden,true);
  assert.equal(result.detail.hidden,false);
  assert.ok(controls.every(control=>!control.inert));
  result.setView('list',{focus:false});
  assert.equal(result.viewTopButton.hidden,true);
});
