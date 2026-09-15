import test from 'node:test';
import assert from 'node:assert/strict';
import { nearbyChallengeLeaderboard,readChallengeLeaderboards } from '../src/maps/challengeLeaderboards.js';

test('challenge leaderboard geometry comes entirely from a Tiled entity',()=>{
  const source={layers:[{name:'Entities',type:'objectgroup',offsetx:2,offsety:3,objects:[{
    id:9,name:'score board',class:'challengeLeaderboard',x:100,y:80,width:64,height:32,gid:1,
    properties:[{name:'interactionDistance',value:24}],
  }]}]};
  const [board]=readChallengeLeaderboards(source);
  assert.deepEqual(board,{id:'9',x:102,y:51,width:64,height:32,interactionDistance:24});
  assert.equal(nearbyChallengeLeaderboard([board],{center:{x:120,y:70}}),board);
  assert.equal(nearbyChallengeLeaderboard([board],{center:{x:10,y:10}}),null);
});
