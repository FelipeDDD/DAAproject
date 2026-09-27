import test from 'node:test';
import assert from 'node:assert/strict';
import { CharacterMenu,createCharacterSessionId } from '../src/CharacterMenu.js';
import { QuizLobby, QUIZ_TIMEOUT_MAX_ATTEMPTS,quizTimeoutRetryDelay,shouldConfirmQuizLeave,shouldShowStartButton } from '../src/QuizLobby.js';
import { readQuizSettingsControls,topicsForQuizCategory } from '../src/quiz/QuizSettingsControls.js';
import { PRESENCE_TIMEOUT_MS } from '../src/multiplayer/presencePolicy.js';

test('menu expires cached active reservations locally without new Convex calls',t=>{
  const lastSeen=1_000_000;let now=lastSeen+PRESENCE_TIMEOUT_MS-1,tick,receive,subscriptions=0;
  t.mock.method(Date,'now',()=>now);
  t.mock.method(globalThis,'setInterval',(callback,delay)=>{
    assert.equal(delay,500);tick=callback;return undefined;
  });
  const button={},state={};
  const menu=Object.assign(Object.create(CharacterMenu.prototype),{
    root:{hidden:true},message:{textContent:''},cards:[{c:{id:'felipe'},button,state}],closed:false,
    presence:{api:{players:{availability:'availability'}},client:{
      onUpdate(_fn,_args,callback){subscriptions++;receive=callback;return()=>{};},
      mutation(){assert.fail('local expiry must not send mutations');},
      query(){assert.fail('local expiry must not poll');},
    }},
  });
  try{
    menu.show();receive([{characterId:'felipe',active:true,lastSeen}]);
    assert.equal(button.disabled,true);assert.equal(state.textContent,'In use');
    now=lastSeen+PRESENCE_TIMEOUT_MS;tick();
    assert.equal(button.disabled,false);assert.equal(state.textContent,'Available');
    assert.equal(menu.rows[0].active,true); // No server callback or cleanup changed the row.
    for(let i=0;i<10;i++)tick();
    assert.equal(subscriptions,1);
    // A fresh heartbeat makes the card busy again through the existing subscription.
    receive([{characterId:'felipe',active:true,lastSeen:now}]);
    assert.equal(button.disabled,true);
  }finally{menu.close();}
});

test('character session id works without crypto.randomUUID',()=>{
  let value=0;
  const cryptoApi={getRandomValues(bytes){for(let index=0;index<bytes.length;index++)bytes[index]=value++;return bytes;}};
  const id=createCharacterSessionId(cryptoApi);
  assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.ok(createCharacterSessionId(null).length>=16);
});

test('menu locally expires stationary reservations using the lease, not cached active or lastSeen',t=>{
  let now=100_000;t.mock.method(Date,'now',()=>now);
  const button={},state={};
  const menu=Object.assign(Object.create(CharacterMenu.prototype),{
    ready:true,cards:[{c:{id:'felipe'},button,state}],
    rows:[{characterId:'felipe',active:true,presenceMode:'stationary',lastSeen:0,stationaryLeaseExpiresAt:200_000}],
  });
  menu.render();assert.equal(button.disabled,true);assert.equal(state.textContent,'In use');
  now=200_000;menu.render();assert.equal(button.disabled,false);assert.equal(state.textContent,'Available');
});

test('character selection sends a valid presence snapshot before the map loads',async()=>{
  let snapshot;
  const menu=Object.assign(Object.create(CharacterMenu.prototype),{
    sessionId:'session-123456789',render(){},message:{textContent:''},root:{hidden:false},
    mode:'profile',authToken:'profile-token',presence:{api:{profiles:{claimCharacter:'claim'}},client:{action:async()=>({ok:true,profile:{profileId:'profile-id'}})},enter:(room,getState)=>{
      assert.equal(room,'selection');snapshot=getState();
    }},onChoose(){},
  });
  await menu.choose({id:'felipe',name:'Felipe'});
  assert.deepEqual(snapshot,{x:0,y:0,direction:'down',activeCharacterItem:null});
  assert.equal(menu.presence.identity.kind,'profile');
});

test('guest character selection claims presence without a profile action',async()=>{
  let claimArgs;
  const menu=Object.assign(Object.create(CharacterMenu.prototype),{
    mode:'guest',guest:{guestId:'guest-temporary-identity-123456'},sessionId:'session-123456789',
    render(){},message:{textContent:''},root:{hidden:false},
    presence:{api:{players:{claimGuest:'claim-guest'}},client:{
      mutation:async(_fn,args)=>{claimArgs=args;return {ok:true};},
      action:async()=>assert.fail('guest selection must not use a profile action'),
    },enter(){}},onChoose(){},
  });
  await menu.choose({id:'sarina',name:'Sarina'});
  assert.deepEqual(claimArgs,{
    guestId:'guest-temporary-identity-123456',characterId:'sarina',sessionId:'session-123456789',
  });
  assert.equal(menu.presence.identity.kind,'guest');
  assert.equal(menu.presence.identity.profileId,undefined);
});

test('character availability subscribes only while the menu is visible',()=>{
  let subscriptions=0,unsubscriptions=0;
  const callbacks=[];
  const menu=Object.assign(Object.create(CharacterMenu.prototype),{
    root:{hidden:true},message:{textContent:''},cards:[],render(){},closed:false,
    presence:{api:{players:{availability:'availability'}},client:{onUpdate(_fn,_args,callback){
      subscriptions++;callbacks.push(callback);return()=>{unsubscriptions++;};
    }}},
  });
  try{
    menu.show();assert.equal(subscriptions,1);
    menu.show();assert.equal(subscriptions,1);
    menu.hide();assert.equal(unsubscriptions,1);
    menu.show();assert.equal(subscriptions,2);
    callbacks[0]([{characterId:'felipe',active:true}]);
    assert.deepEqual(menu.rows,[]);
    callbacks[1]([{characterId:'felipe',active:true}]);
    assert.equal(menu.rows.length,1);
  }finally{menu.close();}
  assert.equal(unsubscriptions,2);
});

function expiredQuizClient({seated=true,participants=['felipe']}={}){
  const calls=[];
  const quiz=Object.assign(Object.create(QuizLobby.prototype),{
    seated,room:'school',selectedAnswer:2,render(){},
    lobby:{status:'starting',participants,question:{id:'expired-question'},questionDeadline:0,allAnswered:false},
    timerElement:{classList:{toggle(){}}},
    presence:{identity:{characterId:'felipe',sessionId:'session-123456789'},
      api:{quizLobbies:{finishTimedQuestion:'finish'}},
      client:{async mutation(name,args){calls.push({name,args});return {answerIndex:args.answerIndex};}}},
  });
  return {quiz,calls};
}

test('unseated or nonparticipant clients never finalize expired multiplayer questions',async()=>{
  for(const options of [{seated:false},{participants:['michael']}]){
    const {quiz,calls}=expiredQuizClient(options);
    for(let tick=0;tick<40;tick++)quiz.updateTimer();
    await quiz.finishTimedQuestion();quiz.retryTimedQuestion();
    assert.equal(calls.length,0);
    assert.equal(quiz.timerRetryCount,undefined);
  }
});

test('seated participant finalizes timeout with the selected answer and does not repeat success',async()=>{
  const {quiz,calls}=expiredQuizClient();
  quiz.updateTimer();await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(calls,[{name:'finish',args:{room:'school',characterId:'felipe',sessionId:'session-123456789',answerIndex:2}}]);
  assert.equal(quiz.confirmedAnswer,2);
  for(let tick=0;tick<40;tick++)quiz.updateTimer();
  assert.equal(calls.length,1);
});

test('participant timeout timer respects retry backoff',async()=>{
  const {quiz,calls}=expiredQuizClient();
  quiz.presence.client.mutation=async()=>{calls.push('attempt');throw new Error('temporary failure');};
  quiz.updateTimer();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls.length,1);assert.ok(quiz.timerRetryAt>Date.now());
  for(let tick=0;tick<40;tick++)quiz.updateTimer();
  assert.equal(calls.length,1);
  quiz.timerRetryAt=0;quiz.updateTimer();await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls.length,2);
});

test('quiz timeout retries back off and stop until the player retries explicitly',async()=>{
  let calls=0;
  const quiz=Object.assign(Object.create(QuizLobby.prototype),{
    seated:true,room:'school',lobby:{status:'starting',participants:['felipe'],question:{id:'question-1'}},render(){},
    presence:{identity:{characterId:'felipe',sessionId:'session-123456789'},
      api:{quizLobbies:{finishTimedQuestion:'finish'}},client:{async mutation(){calls++;throw new Error('persistent failure');}}},
    questionHasExpired(){return true;},
  });
  for(let attempt=1;attempt<=QUIZ_TIMEOUT_MAX_ATTEMPTS;attempt++){
    const before=Date.now();
    await quiz.finishTimedQuestion();
    if(attempt===QUIZ_TIMEOUT_MAX_ATTEMPTS)assert.equal(quiz.timerRetryAt,Infinity);
    else{
      const delay=quizTimeoutRetryDelay(attempt);
      assert.ok(quiz.timerRetryAt>=before+delay&&quiz.timerRetryAt<=Date.now()+delay);
    }
  }
  assert.equal(calls,QUIZ_TIMEOUT_MAX_ATTEMPTS);
  assert.match(quiz.answerError,/Retry with the button/);
  quiz.timerElement={hidden:false,textContent:'',dateTime:'',classList:{toggle(){}}};
  quiz.lobby={...quiz.lobby,status:'starting',questionDeadline:0,allAnswered:false};
  for(let i=0;i<20;i++)quiz.updateTimer();
  assert.equal(calls,QUIZ_TIMEOUT_MAX_ATTEMPTS);
  quiz.retryTimedQuestion();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls,QUIZ_TIMEOUT_MAX_ATTEMPTS+1);
});

test('start button follows the current host and lobby status',()=>{
  const lobby={status:'lobby',hostCharacterId:'michael'};
  assert.equal(shouldShowStartButton(lobby,'michael'),true);
  assert.equal(shouldShowStartButton(lobby,'felipe'),false);
  lobby.hostCharacterId='felipe';
  assert.equal(shouldShowStartButton(lobby,'michael'),false);
  assert.equal(shouldShowStartButton(lobby,'felipe'),true);
  lobby.status='starting';
  assert.equal(shouldShowStartButton(lobby,'felipe'),false);
});

test('changed quiz settings are captured before realtime rendering restores old values',async()=>{
  let sent;
  const quiz=Object.assign(Object.create(QuizLobby.prototype),{
    pendingSettings:false,lobby:{status:'lobby',hostCharacterId:'michael'},room:'school',
    categorySelect:{value:'Hardware'},difficultySelect:{value:'hard'},quantitySelect:{value:'10'},
    presence:{identity:{characterId:'michael',sessionId:'session-123456789'},client:{
      async mutation(_name,args){sent=args;},
    },api:{quizLobbies:{configure:'configure'}}},
    isHost(){return true;},
    renderSettings(){
      this.categorySelect.value='';this.difficultySelect.value='';this.quantitySelect.value='5';
    },
    render(){},
  });
  await quiz.updateSettings();
  assert.deepEqual(sent,{
    room:'school',characterId:'michael',sessionId:'session-123456789',
    category:'Hardware',topic:null,difficulty:'hard',count:10,
  });
});

test('topics are category-specific and an invalid topic resets to All',()=>{
  const options={
    categories:['Hardware','Rechnungen'],topicsByCategory:[
      {category:'Rechnungen',topics:['Rabatt','Dreisatz','Prozentrechnung']},
    ],difficulties:['medium','hard'],quantities:[5,10,15],
  };
  assert.deepEqual(topicsForQuizCategory(options,'Hardware'),[]);
  assert.deepEqual(topicsForQuizCategory(options,'Rechnungen'),['Dreisatz','Prozentrechnung','Rabatt']);
  const settings=readQuizSettingsControls({
    categorySelect:{value:'Hardware'},topicSelect:{value:'Rabatt'},
    difficultySelect:{value:'medium'},quantitySelect:{value:'5'},
  },options);
  assert.deepEqual(settings,{category:'Hardware',topic:null,difficulty:'medium',count:5});
});

test('leaving needs confirmation only while a quiz is in progress',()=>{
  assert.equal(shouldConfirmQuizLeave({status:'lobby'}),false);
  assert.equal(shouldConfirmQuizLeave({status:'starting'}),true);
  assert.equal(shouldConfirmQuizLeave({status:'finished'}),false);
});

test('first leave request asks for confirmation and the second leaves',async()=>{
  let mutations=0;
  const quiz=Object.assign(Object.create((await import('../src/QuizLobby.js')).QuizLobby.prototype),{
    seated:true,pending:false,confirmingLeave:false,lobby:{status:'starting'},room:'school',
    presence:{identity:{characterId:'michael',sessionId:'session-123456789'},client:{
      async mutation(){mutations++;},
    },api:{quizLobbies:{leave:'leave'}}},
    render(){},standLocally(){this.seated=false;this.confirmingLeave=false;},status:{textContent:''},
  });
  assert.equal(await quiz.leave(),false);
  assert.equal(quiz.confirmingLeave,true);
  assert.equal(mutations,0);
  assert.equal(await quiz.leave(),true);
  assert.equal(quiz.seated,false);
  assert.equal(mutations,1);
});

test('joining renders once more after pending clears so Leave lobby is enabled',async()=>{
  const renderedPending=[];
  const quiz=Object.assign(Object.create((await import('../src/QuizLobby.js')).QuizLobby.prototype),{
    pending:false,seated:false,seatPrompt:{setVisible(){}},status:{textContent:''},root:{hidden:true},
    nearbySeat(){return {seatX:100,seatY:120,direction:'down'};},
    presence:{identity:{characterId:'michael',sessionId:'session-123456789'},client:{
      async mutation(){return {seatX:100,seatY:120,direction:'down'};},
    },api:{quizLobbies:{join:'join'}}},room:'school',
    scene:{player:{body:{reset(){}},setFlipX(){},setVelocity(){},facing:'down'}},
    render(){renderedPending.push(this.pending);},
  });
  await quiz.interact();
  assert.equal(quiz.seated,true);
  assert.deepEqual(renderedPending,[true,false]);
});
