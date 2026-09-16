import assert from 'node:assert/strict';
import { ConvexClient } from 'convex/browser';
import { anyApi as api } from 'convex/server';
import seatsByRoom from '../convex/quizSeatDefinitions.js';
import { QUIZ_QUESTIONS } from '../convex/quizQuestions.js';
import { claimTestCharacter, releaseTestCharacter } from './claim-test-character.mjs';

const clients=[new ConvexClient(process.env.VITE_CONVEX_URL),new ConvexClient(process.env.VITE_CONVEX_URL)];
const identities=[];let lobbyA=null,lobbyB=null,unsubscribeA,unsubscribeB;
const wait=async(predicate,label,timeout=10_000)=>{
  const end=Date.now()+timeout;
  while(!predicate()){
    if(Date.now()>end)throw new Error(`Timeout: ${label}`);
    await new Promise(resolve=>setTimeout(resolve,50));
  }
};
const updateAtSeat=async index=>{
  const identity=identities[index],seat=seatsByRoom.school.find(item=>item.characterId===identity.characterId);
  await clients[index].mutation(api.players.update,{...identity,room:'school',x:seat.seatX,y:seat.seatY,direction:seat.direction});
};
const args=index=>({room:'school',characterId:identities[index].characterId,sessionId:identities[index].sessionId});
const answer=(clientIndex,answerIndex)=>clients[clientIndex].mutation(api.quizLobbies.answer,{...args(clientIndex),answerIndex});
const statistics=index=>clients[index].query(api.quizStatistics.summary,{
  characterId:identities[index].characterId,sessionId:identities[index].sessionId,mode:'multiplayer',
});

try{
  identities.push(await claimTestCharacter(clients[0]),await claimTestCharacter(clients[1]));
  const statisticsBefore=await Promise.all([statistics(0),statistics(1)]);
  unsubscribeA=clients[0].onUpdate(api.quizLobbies.current,{room:'school',characterId:identities[0].characterId},value=>lobbyA=value);
  unsubscribeB=clients[1].onUpdate(api.quizLobbies.current,{room:'school',characterId:identities[1].characterId},value=>lobbyB=value);
  await Promise.all([updateAtSeat(0),updateAtSeat(1)]);
  await clients[0].mutation(api.quizLobbies.join,args(0));
  await clients[1].mutation(api.quizLobbies.join,args(1));
  await wait(()=>lobbyA?.participants.length===2&&lobbyB?.participants.length===2,'two participants');
  assert.equal(lobbyA.hostCharacterId,identities[0].characterId);
  const settings={category:'Netzwerk',topic:null,difficulty:'medium',count:5};
  await assert.rejects(clients[1].mutation(api.quizLobbies.configure,{...args(1),...settings}),/host/);
  await clients[0].mutation(api.quizLobbies.configure,{...args(0),...settings});
  await wait(()=>lobbyA?.settings.difficulty==='medium'&&lobbyB?.settings.difficulty==='medium','shared host settings');
  assert.deepEqual(lobbyA.settings,settings);assert.deepEqual(lobbyB.settings,settings);
  assert.ok(lobbyA.configurationOptions.categories.includes('Programmierung'));
  const topicGroups=lobbyA.configurationOptions.topicsByCategory;
  const rechnungenTopics=topicGroups.find(group=>group.category==='Rechnungen')?.topics??[];
  for(const topic of ['Dreisatz','Netto-Brutto','Prozentrechnung','Rabatt','Textverständnis'])
    assert.ok(rechnungenTopics.includes(topic));
  assert.deepEqual(topicGroups.find(group=>group.category==='Prüfungssprache')?.topics,
    ['Aufgabenverben','Prüfungsformulierungen','Textverständnis']);
  assert.deepEqual(lobbyA.configurationOptions.difficulties,['medium','hard']);
  await assert.rejects(clients[1].mutation(api.quizLobbies.start,args(1)),/host/);
  await clients[0].mutation(api.quizLobbies.start,args(0));

  const expectedCount=5;
  const seenQuestionIds=new Set(),expectedScores=[0,0];
  for(let questionIndex=0;questionIndex<expectedCount;questionIndex++){
    await wait(()=>lobbyA?.questionIndex===questionIndex&&lobbyA?.question?.id===lobbyB?.question?.id,`shared question ${questionIndex+1}`);
    const sourceQuestionId=lobbyA.question.id.replace(/#\d+$/,'');
    const bankQuestion=QUIZ_QUESTIONS.find(question=>question.id===sourceQuestionId);
    assert.ok(bankQuestion);seenQuestionIds.add(sourceQuestionId);
    assert.equal(lobbyA.questionCount,expectedCount);
    assert.ok(lobbyA.question.id===bankQuestion.id||lobbyA.question.id.startsWith(`${bankQuestion.id}#`));
    assert.equal(lobbyA.question.category,bankQuestion.category);
    assert.equal(lobbyA.question.difficulty,bankQuestion.difficulty);
    assert.equal(typeof lobbyA.question.question,'string');
    assert.equal(lobbyA.question.answers.length,4);
    assert.equal(new Set(lobbyA.question.answers).size,4);
    assert.equal(lobbyA.question.explanation,null);
    if(bankQuestion.type!=='generated'){
      assert.equal(lobbyA.question.question,bankQuestion.question);
      assert.deepEqual([...lobbyA.question.answers].sort(),[...bankQuestion.answers].sort());
      assert.deepEqual(lobbyA.question.media,bankQuestion.media);
    }
    assert.ok(lobbyA.questionDeadline>Date.now());
    assert.deepEqual(lobbyB.question,lobbyA.question);
    const concreteQuestion=structuredClone(lobbyA.question);
    assert.equal(lobbyA.correctAnswerIndex,null);assert.equal(lobbyB.correctAnswerIndex,null);

    const choices=[0,1];
    await answer(0,choices[0]);
    await wait(()=>lobbyA?.ownAnswerIndex===choices[0],`first answer ${questionIndex+1}`);
    assert.equal(lobbyA.allAnswered,false);assert.equal(lobbyB.ownAnswerIndex,undefined);
    assert.equal(lobbyA.correctAnswerIndex,null);
    if(questionIndex===0){
      await assert.rejects(clients[0].mutation(api.quizLobbies.nextQuestion,args(0)),/still answering/);
      await answer(0,choices[0]);
      await assert.rejects(answer(0,2),/already answered/);
    }

    await answer(1,choices[1]);
    await wait(()=>lobbyA?.allAnswered&&lobbyB?.allAnswered,`reveal question ${questionIndex+1}`);
    assert.equal(lobbyA.correctAnswerIndex,lobbyB.correctAnswerIndex);
    assert.ok(Number.isInteger(lobbyA.correctAnswerIndex));
    assert.equal(lobbyA.question.answers[lobbyA.correctAnswerIndex],lobbyB.question.answers[lobbyB.correctAnswerIndex]);
    if(bankQuestion.type!=='generated')
      assert.equal(lobbyA.question.answers[lobbyA.correctAnswerIndex],bankQuestion.answers[bankQuestion.correctAnswer]);
    assert.equal(lobbyA.question.question,concreteQuestion.question);
    assert.deepEqual(lobbyA.question.answers,concreteQuestion.answers);
    if(bankQuestion.type==='generated')assert.ok(lobbyA.question.explanation);
    else assert.equal(lobbyA.question.explanation,bankQuestion.explanation??null);
    choices.forEach((choice,index)=>{if(choice===lobbyA.correctAnswerIndex)expectedScores[index]++;});
    if(questionIndex===0)await assert.rejects(clients[1].mutation(api.quizLobbies.nextQuestion,args(1)),/host/);
    await clients[0].mutation(api.quizLobbies.nextQuestion,args(0));
  }

  assert.equal(seenQuestionIds.size,expectedCount);
  await wait(()=>lobbyA?.status==='finished'&&lobbyB?.status==='finished','shared result screen');
  const scoreA=Object.fromEntries(lobbyA.scores.map(score=>[score.characterId,score.points]));
  assert.equal(scoreA[identities[0].characterId],expectedScores[0]);
  assert.equal(scoreA[identities[1].characterId],expectedScores[1]);
  assert.equal(lobbyA.question,null);
  const statisticsAfter=await Promise.all([statistics(0),statistics(1)]);
  for(let index=0;index<2;index++){
    assert.equal(statisticsAfter[index].overall.answered-statisticsBefore[index].overall.answered,expectedCount);
    assert.equal(statisticsAfter[index].overall.correct-statisticsBefore[index].overall.correct,expectedScores[index]);
  }

  await clients[0].mutation(api.quizLobbies.leave,args(0));
  await wait(()=>lobbyA?.hostCharacterId===identities[1].characterId,'host transfer after quiz');
  await clients[1].mutation(api.quizLobbies.leave,args(1));
  await wait(()=>lobbyA===null&&lobbyB===null,'empty lobby removal');

  await Promise.all([updateAtSeat(0),updateAtSeat(1)]);
  await clients[0].mutation(api.quizLobbies.join,args(0));
  await clients[1].mutation(api.quizLobbies.join,args(1));
  await wait(()=>lobbyA?.participants.length===2,'second quiz participants');
  await clients[0].mutation(api.quizLobbies.configure,{...args(0),...settings});
  await wait(()=>lobbyA?.settings.category===settings.category&&lobbyB?.settings.category===settings.category,'second shared settings');
  await clients[0].mutation(api.quizLobbies.start,args(0));
  await wait(()=>lobbyA?.status==='starting'&&lobbyA?.question?.id===lobbyB?.question?.id,'second quiz started');
  assert.ok(!seenQuestionIds.has(lobbyA.question.id.replace(/#\d+$/,'')));
  await clients[1].mutation(api.quizLobbies.leave,args(1));
  await wait(()=>lobbyA?.status==='finished','quiz ended with one participant');
  assert.equal(lobbyA.finishedReason,'insufficient-participants');
  assert.deepEqual(lobbyA.participants,[identities[0].characterId]);
  assert.equal(lobbyA.question,null);
  await clients[0].mutation(api.quizLobbies.leave,args(0));
  await wait(()=>lobbyA===null,'ended lobby removal');
  console.log('PASS: shared sequence, scores, individual statistics, host controls, final result and insufficient-participant ending.');
} finally {
  await Promise.all(identities.map((identity,index)=>releaseTestCharacter(clients[index],identity)));
  unsubscribeA?.();unsubscribeB?.();
  await Promise.all(clients.map(client=>client.close()));
}
