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

async function changeCharacter(){
  if(menu.pending||pausedScene)return;
  pausedScene=game?.scene.getScenes(true)[0];
  if(pausedScene){
    pausedScene.chat?.close();pausedScene.chat=null;
    pausedScene.player.setVelocity(0,0);pausedScene.input.keyboard.resetKeys();
    pausedScene.doorSync?.close();pausedScene.doorSync=null;
    pausedScene.scene.pause();
  }
  presence?.leave();gameArea.hidden=true;changeButton.hidden=true;menu.pending=true;menu.show();
  const identity=presence?.identity;
  if(identity)try{
    await presence.client.mutation(presence.api.players.release,{characterId:identity.characterId,sessionId:identity.sessionId});
  }catch{menu.message.textContent='A sessão anterior será liberada pelo timeout.';}
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
    document.getElementById('character-list').replaceChildren();
  });
}
