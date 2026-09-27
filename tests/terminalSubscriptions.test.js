import test from 'node:test';
import assert from 'node:assert/strict';
import { EmoteSync } from '../src/emotes/EmoteSync.js';
import { QuizLobby } from '../src/QuizLobby.js';
import { TerminalOverlayController } from '../src/terminal/TerminalOverlayController.js';

function syncFixture(){
 let subscriptions=0,unsubscribes=0;const received=[],cleared=[];
 const sync=new EmoteSync({identity:{},api:{emotes:{inRoom:'emotes'}},client:{onUpdate(_q,_args,onValue){subscriptions++;onValue([{createdAt:1}]);return()=>unsubscribes++;}},fail(){}},'school',{receive:rows=>received.push(rows),clear:()=>cleared.push(true)});
 return {sync,counts:()=>({subscriptions,unsubscribes,received:received.length,cleared:cleared.length})};
}
test('emote subscription suspends and resumes exactly once, retaining stale-event filter path',()=>{
 const {sync,counts}=syncFixture();assert.equal(counts().subscriptions,1);
 assert.equal(sync.suspend(),true);assert.equal(sync.suspend(),false);assert.equal(counts().unsubscribes,1);
 assert.equal(sync.resume(),true);assert.equal(sync.resume(),false);assert.equal(counts().subscriptions,2);
 assert.equal(counts().received,2);sync.close();assert.equal(counts().unsubscribes,2);
});
test('unseated quiz current subscription stops and resumes once; seated state is preserved',()=>{
 let stops=0,starts=0;const q=Object.assign(Object.create(QuizLobby.prototype),{closed:false,seated:false,currentSuspended:false,unsubscribe:()=>stops++,presence:{identity:{characterId:'felipe'},api:{quizLobbies:{current:'current'}},client:{onUpdate(){starts++;return()=>stops++;}}},room:'school'});
 assert.equal(q.suspendCurrent(),true);assert.equal(q.suspendCurrent(),false);assert.equal(q.resumeCurrent(),true);assert.equal(q.resumeCurrent(),false);assert.deepEqual({starts,stops},{starts:1,stops:1});
 q.seated=true;assert.equal(q.suspendCurrent(),false);assert.equal(q.currentSuspended,false);
});
function controller(scene){return Object.assign(Object.create(TerminalOverlayController.prototype),{scene,disposed:false,terminalSubscriptionsSuspended:false});}
test('terminal lifecycle suspends only after successful entry and restores only after successful exit',async()=>{
 let emoteSuspend=0,emoteResume=0,quizSuspend=0,quizResume=0;let entered=true,exited=true;
 const c=controller({presence:{async enterTerminal(){if(!entered)throw Error('entry');},async exitTerminal(){if(!exited)throw Error('expired');}},emoteSync:{suspend(){emoteSuspend++;},resume(){emoteResume++;}},quiz:{seated:false,suspendCurrent(){quizSuspend++;},resumeCurrent(){quizResume++;}}});
 entered=false;await assert.rejects(c.enterTerminalMode());assert.equal(emoteSuspend,0);assert.equal(quizSuspend,0);
 entered=true;await c.enterTerminalMode();assert.equal(emoteSuspend,1);assert.equal(quizSuspend,1);
 exited=false;await assert.rejects(c.exitTerminalMode());assert.equal(emoteResume,0);assert.equal(quizResume,0);
 exited=true;await c.exitTerminalMode();assert.equal(emoteResume,1);assert.equal(quizResume,1);
 c.scene.quiz.seated=true;assert.equal(await c.enterTerminalMode(),false);assert.equal(emoteSuspend,1);
});
test('repeated terminal cycles do not accumulate subscriptions or restore after expired exit',async()=>{
 const {sync,counts}=syncFixture();let quizSub=0,quizUnsub=0;const q={seated:false,suspendCurrent(){if(this.suspended)return false;this.suspended=true;quizUnsub++;return true;},resumeCurrent(){if(!this.suspended)return false;this.suspended=false;quizSub++;return true;}};
 let failExit=false;const c=controller({presence:{async enterTerminal(){},async exitTerminal(){if(failExit)throw Error('CHARACTER_SESSION_LOST');}},emoteSync:sync,quiz:q});
 for(let i=0;i<3;i++){await c.enterTerminalMode();await c.exitTerminalMode();}
 assert.deepEqual(counts(),{subscriptions:4,unsubscribes:3,received:4,cleared:3});assert.equal(quizUnsub,3);assert.equal(quizSub,3);
 await c.enterTerminalMode();failExit=true;await assert.rejects(c.exitTerminalMode());assert.equal(counts().subscriptions,4);assert.equal(quizSub,3);
});

