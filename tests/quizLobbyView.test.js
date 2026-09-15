import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacterSessionId } from '../src/CharacterMenu.js';
import { QuizLobby, shouldConfirmQuizLeave, shouldShowStartButton } from '../src/QuizLobby.js';
import { readQuizSettingsControls,topicsForQuizCategory } from '../src/quiz/QuizSettingsControls.js';

test('character session id works without crypto.randomUUID',()=>{
  let value=0;
  const cryptoApi={getRandomValues(bytes){for(let index=0;index<bytes.length;index++)bytes[index]=value++;return bytes;}};
  const id=createCharacterSessionId(cryptoApi);
  assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.ok(createCharacterSessionId(null).length>=16);
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
