import Phaser from 'phaser';
import { gameConfig } from './game/config.js';
import './style.css';
import { closePresence, getPresence } from './multiplayer/client.js';
import { CharacterMenu } from './CharacterMenu.js';

let game, pausedScene;
const presence=getPresence();
const gameArea=document.getElementById('play-area');
const changeButton=document.getElementById('change-character');
const menu=new CharacterMenu(presence,()=>{
  gameArea.hidden=false;changeButton.hidden=false;
  if(!game)game=new Phaser.Game(gameConfig);
  else if(pausedScene){
    const scene=pausedScene;pausedScene=null;
    scene.enter({targetX:scene.player.x,targetY:scene.player.y});
    scene.scene.resume();
  }
});

function releaseCurrentCharacter(){
  const identity=presence?.identity;
  if(!identity)return Promise.resolve();
  return presence.client.mutation(presence.api.players.release,{
    characterId:identity.characterId,sessionId:identity.sessionId,
  });
}

function releaseOnPageHide(){void releaseCurrentCharacter().catch(()=>{});}
window.addEventListener('pagehide',releaseOnPageHide);

async function changeCharacter(event){
  if(menu.pending||pausedScene)return;
  const activeScene=game?.scene.getScenes(true)[0];
  const sessionLost=event?.type==='character-session-lost';
  if(activeScene?.terminal?.active){
    if(!sessionLost)return;
    activeScene.terminal.destroy();activeScene.terminal=null;
  }
  if(!sessionLost&&activeScene?.quiz?.seated&&!(await activeScene.quiz.leave()))return;
  activeScene?.soloStudy?.closePanel();
  if(activeScene){
    activeScene.emoteBar?.close();activeScene.emoteBar=null;
    activeScene.emoteSync?.close();activeScene.emoteSync=null;
    activeScene.emoteRenderer?.close();activeScene.emoteRenderer=null;
  }
  pausedScene=activeScene;
  if(pausedScene){
    pausedScene.chat?.close();pausedScene.chat=null;
    pausedScene.player.setVelocity(0,0);pausedScene.input.keyboard.resetKeys();
    pausedScene.doorSync?.close();pausedScene.doorSync=null;
    pausedScene.scene.pause();
  }
  presence?.leave();gameArea.hidden=true;changeButton.hidden=true;menu.pending=true;menu.show();
  try{await releaseCurrentCharacter();}
  catch{menu.message.textContent='The previous session will be released after its timeout.';}
  menu.pending=false;menu.render();
}
changeButton.addEventListener('click',changeCharacter);
window.addEventListener('character-session-lost',changeCharacter);

// Prevent duplicate canvases and keyboard listeners during Vite hot reloads.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    menu.close();game?.destroy(true);closePresence();
    changeButton.removeEventListener('click',changeCharacter);
    window.removeEventListener('character-session-lost',changeCharacter);
    window.removeEventListener('pagehide',releaseOnPageHide);
    document.getElementById('character-list').replaceChildren();
  });
}
