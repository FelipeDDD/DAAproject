import Phaser from 'phaser';
import { gameConfig } from './game/config.js';
import { closePresence, getPresence } from './multiplayer/client.js';
import { CharacterMenu } from './CharacterMenu.js';
import { DisplaySettingsController } from './ui/displaySettings.js';
import { BackgroundSettingsController } from './ui/backgroundSettings.js';
import { GameHudController,setGameHud } from './hud/GameHudController.js';
import { ProfileAuth } from './ProfileAuth.js';

let game, pausedScene;
const presence=getPresence();
const gameArea=document.getElementById('play-area');
const changeButton=document.getElementById('change-character');
const logoutButton=document.getElementById('logout-profile');
const menuLogoutButton=document.getElementById('logout-profile-menu');
const gameHud=setGameHud(new GameHudController());
const displaySettings=new DisplaySettingsController(document.getElementById('viewport-size'),()=>game?.scale.refresh());
const backgroundSettings=new BackgroundSettingsController(
  document.getElementById('background-toggle'),document.getElementById('background-options'));
const menu=new CharacterMenu(presence,()=>{
  gameArea.hidden=false;changeButton.hidden=false;logoutButton.hidden=false;gameHud.setVisible(true);
  logoutButton.textContent=presence?.identity?.kind==='guest'?'Exit guest session':'Logout';
  if(!game)game=new Phaser.Game(gameConfig);
  else if(pausedScene){
    const scene=pausedScene;pausedScene=null;
    scene.enter({targetX:scene.player.x,targetY:scene.player.y});
    scene.crosshair?.resume();
    scene.scene.resume();
  }
});
const auth=new ProfileAuth(presence,{
  onAuthenticated(profile,token){menu.setAuthentication(profile,token);menu.show();},
  onGuest(guest){menu.setGuestIdentity(guest);menu.show();},
  onLoggedOut(){menu.hide();},
});
function releaseInitialLoading(){
  const stylesheetReady=getComputedStyle(document.documentElement)
    .getPropertyValue('--app-stylesheet-ready').trim()==='1';
  if(window.appStylesheetFailed||!stylesheetReady){window.showBootstrapError();return;}
  document.getElementById('app-loading').hidden=true;
  document.documentElement.classList.remove('app-loading');
  document.querySelector('main')?.setAttribute('aria-busy','false');
}
void auth.start({onReady:releaseInitialLoading}).catch(()=>{
  auth.setPending(false);
  auth.message.textContent='Profile access could not be initialized. You can retry or play as guest.';
  releaseInitialLoading();
});

function releaseCurrentCharacter(){
  return presence?.release()??Promise.resolve({released:false});
}

function releaseOnPageHide(){void releaseCurrentCharacter().catch(()=>{});}
window.addEventListener('pagehide',releaseOnPageHide);

function isTextEntry(element){
  return element instanceof HTMLInputElement||element instanceof HTMLTextAreaElement
    ||element instanceof HTMLSelectElement||element?.isContentEditable;
}

function restoreProjectFocus(){
  if(document.visibilityState==='hidden'||gameArea.hidden||menu.pending)return;
  requestAnimationFrame(()=>{
    if(document.visibilityState==='hidden'||gameArea.hidden)return;
    const activeScene=game?.scene.getScenes(true)[0];
    if(activeScene?.terminal?.focusContent())return;
    if(isTextEntry(document.activeElement))return;
    activeScene?.input.keyboard.resetKeys();
    document.getElementById('game')?.focus({preventScroll:true});
  });
}

function restoreFocusWhenVisible(){if(document.visibilityState==='visible')restoreProjectFocus();}
window.addEventListener('focus',restoreProjectFocus);
document.addEventListener('visibilitychange',restoreFocusWhenVisible);

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
    activeScene.crosshair?.suspend();
    activeScene.inventoryHotbar?.destroy();activeScene.inventoryHotbar=null;
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
  gameArea.hidden=true;changeButton.hidden=true;gameHud.setVisible(false);menu.pending=true;menu.show();
  try{await releaseCurrentCharacter();}
  catch{menu.message.textContent='The previous session will be released after its timeout.';}
  menu.pending=false;menu.render();
}
async function logoutProfile(){
  if(menu.pending)return;
  try{
    if(!gameArea.hidden)await changeCharacter();
    await auth.logout();menu.hide();changeButton.hidden=true;logoutButton.hidden=true;
  }catch(error){menu.message.textContent='Logout failed. Check the connection and try again.';console.warn(error);}
}
changeButton.addEventListener('click',changeCharacter);
logoutButton.addEventListener('click',logoutProfile);
menuLogoutButton.addEventListener('click',logoutProfile);
window.addEventListener('character-session-lost',changeCharacter);

// Prevent duplicate canvases and keyboard listeners during Vite hot reloads.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    menu.close();game?.destroy(true);closePresence();
    changeButton.removeEventListener('click',changeCharacter);
    logoutButton.removeEventListener('click',logoutProfile);
    menuLogoutButton.removeEventListener('click',logoutProfile);
    window.removeEventListener('character-session-lost',changeCharacter);
    window.removeEventListener('pagehide',releaseOnPageHide);
    window.removeEventListener('focus',restoreProjectFocus);
    document.removeEventListener('visibilitychange',restoreFocusWhenVisible);
    displaySettings.destroy();
    backgroundSettings.destroy();
    gameHud.destroy();
    auth.destroy();
    document.getElementById('character-list').replaceChildren();
  });
}
