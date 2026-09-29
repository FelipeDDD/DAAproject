import test from 'node:test';
import assert from 'node:assert/strict';
import { Office3PuzzleController } from '../src/office3/Office3PuzzleController.js';
import { NORMAL_FOLDER, PASSWORD_FOLDER, PASSWORD_FILE } from '../src/office3/office3Computer.js';

function node(){return {children:[],classList:{add(){},remove(){}},append(...n){this.children.push(...n);},
  replaceChildren(...n){this.children=n;},setAttribute(){},addEventListener(){},focus(){}};}
function controller(){
  return Object.assign(Object.create(Office3PuzzleController.prototype),{
    active:true,generation:1,busy:false,panel:node(),root:node(),correctAnswers:[],
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
