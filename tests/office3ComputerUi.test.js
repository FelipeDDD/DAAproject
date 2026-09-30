import test from 'node:test';
import assert from 'node:assert/strict';
import { Office3PuzzleController } from '../src/office3/Office3PuzzleController.js';
import { NORMAL_FOLDER, OFFICE3_COMPUTER, PASSWORD_FOLDER, PASSWORD_FILE } from '../src/office3/office3Computer.js';
import { OFFICE3_MONITOR } from '../src/office3/office3Puzzle.js';
import { setDevPuzzleOneAnswerEnabled } from '../src/boss/devPuzzleSettings.js';

function node(){return {children:[],classList:{add(){},remove(){}},append(...n){this.children.push(...n);},
  replaceChildren(...n){this.children=n;},setAttribute(){},addEventListener(){},focus(){}};}
function controller(){
  return Object.assign(Object.create(Office3PuzzleController.prototype),{
    active:true,generation:1,busy:false,panel:node(),root:node(),correctAnswers:[],
    computerMode:'office3',computerConfig:OFFICE3_COMPUTER,
    scene:{registry:{set(){}},input:{keyboard:{enabled:false,resetKeys(){}}},game:{canvas:{focus(){}}}},
  });
}
test('closing an in-flight computer unlock cannot reopen the overlay on late success',async t=>{
  const old=globalThis.document;globalThis.document={createElement:node};t.after(()=>{globalThis.document=old;});
  const c=controller();let resolve,opened=0;
  c.safeRequest=()=>new Promise(done=>{resolve=done;});c.showComputer=()=>opened++;
  const request=c.unlockComputer();assert.equal(c.busy,true);
  c.close();resolve({code:'1234'});await request;
  assert.equal(opened,0);assert.equal(c.active,false);assert.equal(c.scene.input.keyboard.enabled,true);
});
test('computer retry recovers cleanly and shutdown closes only its own dialog generation',async t=>{
  const old=globalThis.document;globalThis.document={createElement:node};t.after(()=>{globalThis.document=old;});
  const c=controller();c.safeRequest=async()=>{throw new Error('offline');};
  await c.unlockComputer();assert.equal(c.busy,false);assert.equal(c.active,true);
  let opened=0;c.safeRequest=async()=>({code:'0123'});c.showComputer=()=>opened++;
  await c.unlockComputer();assert.equal(opened,1);assert.equal(c.safeCode,'0123');
  c.folder=NORMAL_FOLDER;c.commandInput={value:'very_safe_program.exe'};c.commandHistory=[];
  let resolve;c.safeRequest=()=>new Promise(done=>{resolve=done;});
  const pending=c.executeCommand();c.close();c.active=true;c.generation++;
  resolve({blockedUntil:Date.now()+10_000});await pending;
  assert.equal(c.active,true,'late shutdown does not close a new interaction');
});
test('command submission is serialized while shutdown is pending',async t=>{
  const c=controller();c.folder=NORMAL_FOLDER;c.commandHistory=[];c.commandInput={value:'very_safe_program.exe'};
  let count=0,resolve;c.safeRequest=()=>{count++;return new Promise(done=>{resolve=done;});};
  const first=c.executeCommand();await c.executeCommand();assert.equal(count,1);
  resolve({blockedUntil:Date.now()+10_000});await first;
  assert.equal(c.active,false);assert.equal(c.scene.input.keyboard.enabled,true);
});
test('real command-panel rebuilds retain code through navigation and notepad',async t=>{
  const old=globalThis.document;globalThis.document={createElement:node};t.after(()=>{globalThis.document=old;});
  const c=controller();c.safeCode='0123';c.folder='';c.commandHistory=[];
  c.showComputer();assert.equal(c.safeCode,'0123');
  c.commandInput.value=`cd ${PASSWORD_FOLDER}`;await c.executeCommand();
  assert.equal(c.safeCode,'0123');assert.equal(c.folder,PASSWORD_FOLDER);
  c.commandInput.value=PASSWORD_FILE;await c.executeCommand();
  assert.ok(c.panel.children.some(child=>child.textContent?.includes('Safe Code: 0123')));
  c.close();assert.equal(c.safeCode,null);
});

test('original Office3 puzzle computer keeps its original position',()=>{
  const c=controller();c.computerMode='office3';
  c.pcMarker={x:716,y:478};
  c.pcInteractionArea={x:647,y:507,width:121,height:57};
  c.scene.player={body:{center:{x:OFFICE3_MONITOR.x,y:OFFICE3_MONITOR.interactionY}}};
  assert.equal(c.nearMonitor(),true);
  c.scene.player.body.center={x:716,y:530};
  assert.equal(c.nearMonitor(),false,'new marked PC does not replace the puzzle computer');
});

test('new marked PC uses its interaction rectangle',()=>{
  const c=controller();
  c.computerMode='user';
  c.pcMarker={x:10,y:10};c.pcInteractionRadius=5;
  c.pcInteractionArea={x:20,y:30,width:40,height:25,point:false};
  c.scene.player={body:{center:{x:60,y:55}}};
  assert.equal(c.nearMonitor(),true,'rectangle edges are included');
  c.scene.player.body.center={x:61,y:55};
  assert.equal(c.nearMonitor(),false,'outside the rectangle is out of range even if circle radius differs');
});

test('missing interaction rectangle falls back to the existing radius',()=>{
  const c=controller();c.pcMarker={x:10,y:10};c.pcInteractionRadius=5;
  c.computerMode='user';
  c.pcInteractionArea=null;
  c.scene.player={body:{center:{x:13,y:14}}};
  assert.equal(c.nearMonitor(),true);
  c.scene.player.body.center={x:20,y:20};
  assert.equal(c.nearMonitor(),false);
});

test('closing the new PC focuses the game before removing the input and after the event',t=>{
  const previousDocument=globalThis.document,previousFrame=globalThis.requestAnimationFrame;
  let afterEvent,focused=0;
  globalThis.document={getElementById:id=>id==='game'?{focus(){focused++;}}:null};
  globalThis.requestAnimationFrame=callback=>{afterEvent=callback;};
  t.after(()=>{globalThis.document=previousDocument;globalThis.requestAnimationFrame=previousFrame;});
  const c=controller();c.computerMode='user';c.keyboardWasEnabled=true;
  c.panel.replaceChildren=()=>assert.equal(focused,1,'focus leaves the input before DOM removal');
  c.close();
  assert.equal(c.scene.input.keyboard.enabled,true);
  assert.equal(focused,1);
  afterEvent();
  assert.equal(focused,2);
});

test('Escape close consumes repeats and keyup without resetting newly pressed movement',()=>{
  const c=controller();let closed=0,focused=0,resets=0;
  c.close=()=>{closed++;c.active=false;};
  c.restoreGameFocus=()=>focused++;
  c.scene.input.keyboard.resetKeys=()=>resets++;
  const event=type=>({type,key:'Escape',preventDefault(){this.prevented=true;},
    stopImmediatePropagation(){this.stopped=true;}});
  const down=event('keydown');c.handleKey(down);
  const repeat=event('keydown');repeat.repeat=true;c.handleKey(repeat);
  const up=event('keyup');c.handleKey(up);
  for(const e of [down,repeat,up])assert.ok(e.prevented&&e.stopped);
  assert.equal(c.releaseEscape,false);assert.equal(focused,1);assert.equal(resets,0);
  const movement={type:'keydown',key:'w'};c.handleKey(movement);
  assert.equal(movement.prevented,undefined);
  const next=event('keydown');c.handleKey(next);
  assert.equal(next.prevented,undefined,'unrelated future Esc is not swallowed');
});

test('delayed terminal focus does not steal focus from a newly opened dialog',t=>{
  const previousFrame=globalThis.requestAnimationFrame;let callback,focus=0;
  globalThis.requestAnimationFrame=fn=>{callback=fn;};
  t.after(()=>{globalThis.requestAnimationFrame=previousFrame;});
  const c=controller();c.restoreGameFocus=()=>focus++;
  c.close();assert.equal(focus,1);
  c.active=true;c.generation++;
  callback();assert.equal(focus,1);
});

test('one-answer dev mode still builds the full valid Office3 proof for the backend',()=>{
  const c=controller();
  c.proofAnswerCount=5;
  c.questionBank=Array.from({length:6},(_,index)=>({id:`q${index}`,answers:[`right-${index}`,'wrong','wrong','wrong'],correctAnswer:0}));
  c.correctAnswers=[{id:'q3',answer:'right-3'}];
  setDevPuzzleOneAnswerEnabled(true,{setItem(){}});
  try{
    const proof=c.answersForUnlock();
    assert.equal(proof.length,5);
    assert.equal(new Set(proof.map(answer=>answer.id)).size,5);
    assert.deepEqual(proof.map(({id,answer})=>[id,answer]),[
      ['q3','right-3'],['q0','right-0'],['q1','right-1'],['q2','right-2'],['q4','right-4'],
    ]);
  }finally{setDevPuzzleOneAnswerEnabled(false,{setItem(){}});}
});
