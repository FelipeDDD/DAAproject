import { createGuestIdentity } from './playerIdentity.js';

export const PROFILE_TOKEN_STORAGE_KEY='daa.profile.session';

export class ProfileAuth{
  constructor(presence,{onAuthenticated=()=>{},onGuest=()=>{},onLoggedOut=()=>{}}={}){
    Object.assign(this,{presence,onAuthenticated,onGuest,onLoggedOut});
    this.root=document.getElementById('profile-auth');
    this.message=document.getElementById('profile-auth-message');
    this.loginForm=document.getElementById('profile-login-form');
    this.registerForm=document.getElementById('profile-register-form');
    this.displayNameForm=document.getElementById('profile-display-name-form');
    this.title=document.getElementById('profile-auth-title');
    this.loginTab=document.getElementById('profile-login-tab');
    this.registerTab=document.getElementById('profile-register-tab');
    this.guestButton=document.getElementById('play-as-guest');
    this.onAuthKey=event=>event.stopPropagation();
    this.root.addEventListener('keydown',this.onAuthKey);
    this.root.addEventListener('keyup',this.onAuthKey);
    this.loginTab.addEventListener('click',()=>this.setMode('login'));
    this.registerTab.addEventListener('click',()=>this.setMode('register'));
    this.loginForm.addEventListener('submit',event=>this.submit(event,'login'));
    this.registerForm.addEventListener('submit',event=>this.submit(event,'register'));
    this.onDisplayNameSubmit=event=>this.submitDisplayName(event);
    this.displayNameForm.addEventListener('submit',this.onDisplayNameSubmit);
    this.guestButton.addEventListener('click',()=>this.playAsGuest());
  }

  storedToken(){try{return localStorage.getItem(PROFILE_TOKEN_STORAGE_KEY);}catch{return null;}}
  storeToken(token){try{localStorage.setItem(PROFILE_TOKEN_STORAGE_KEY,token);}catch{}}
  clearToken(){try{localStorage.removeItem(PROFILE_TOKEN_STORAGE_KEY);}catch{}}

  setMode(mode){
    const login=mode==='login';
    this.displayNameForm.hidden=true;this.loginTab.hidden=false;this.registerTab.hidden=false;
    this.guestButton.closest('.profile-guest-option').hidden=false;
    this.title.textContent='Player profile';
    this.loginForm.hidden=!login;this.registerForm.hidden=login;
    this.loginTab.setAttribute('aria-selected',String(login));
    this.registerTab.setAttribute('aria-selected',String(!login));
    this.message.textContent='';
  }

  setPending(pending){
    this.pending=pending;
    for(const control of this.root.querySelectorAll('button,input,select'))control.disabled=pending;
  }

  async start({onReady=()=>{}}={}){
    this.root.hidden=false;
    if(!this.presence){this.message.textContent='Configure Convex to use profiles.';onReady();return;}
    const token=this.storedToken();
    if(!token){onReady();return;}
    this.setPending(true);this.message.textContent='Restoring profile…';
    onReady();
    try{
      const profile=await this.presence.client.action(this.presence.api.profiles.me,{token});
      if(profile){this.accept(profile,token);return;}
      this.clearToken();this.message.textContent='Your session expired. Please log in again.';
    }catch{this.message.textContent='Could not restore the profile. Check the connection.';}
    finally{this.setPending(false);}
  }

  async submit(event,mode){
    event.preventDefault();if(this.pending||!this.presence)return;
    const form=event.currentTarget;
    const args={profileName:form.elements.profileName.value,password:form.elements.password.value};
    if(mode==='register')args.displayName=form.elements.displayName.value;
    this.setPending(true);this.message.textContent=mode==='register'?'Creating profile…':'Logging in…';
    try{
      const result=await this.presence.client.action(this.presence.api.profiles[mode],args);
      form.elements.password.value='';this.storeToken(result.token);this.accept(result.profile,result.token);
    }catch(error){
      const text=String(error);
      this.message.textContent=text.includes('PROFILE_EXISTS')?'That profile name is already in use.'
        :text.includes('INVALID_CREDENTIALS')?'Invalid profile name or password.'
        :text.includes('INVALID_PROFILE_NAME')?'Use 3–32 letters, numbers, dots, underscores or hyphens.'
        :text.includes('INVALID_PASSWORD')?'Password must contain between 8 and 128 characters.'
        :text.includes('INVALID_DISPLAY_NAME')?'Enter a display name with 1–32 characters.'
        :'Could not authenticate. Check the connection and try again.';
    }finally{this.setPending(false);}
  }

  accept(profile,token){
    if(typeof profile?.displayName!=='string'||!profile.displayName.trim()||profile.displayName.trim().length>32){
      this.showDisplayNameSetup(profile,token);return;
    }
    this.mode='profile';this.profile=profile;this.token=token;this.root.hidden=true;this.onAuthenticated(profile,token);
  }

  showDisplayNameSetup(profile,token){
    this.mode='profile';this.profile=profile;this.token=token;this.root.hidden=false;
    this.title.textContent='Choose your display name';
    this.loginTab.hidden=true;this.registerTab.hidden=true;this.loginForm.hidden=true;this.registerForm.hidden=true;
    this.guestButton.closest('.profile-guest-option').hidden=true;
    this.displayNameForm.hidden=false;this.displayNameForm.elements.displayName.value='';
    this.message.textContent='Choose the name other players will see. You only need to do this once.';
  }

  async submitDisplayName(event){
    event.preventDefault();if(this.pending||!this.presence||!this.token)return;
    const displayName=event.currentTarget.elements.displayName.value;
    this.setPending(true);this.message.textContent='Saving display name…';
    try{
      const profile=await this.presence.client.action(this.presence.api.profiles.setDisplayName,{token:this.token,displayName});
      this.accept(profile,this.token);
    }catch(error){
      this.message.textContent=String(error).includes('INVALID_DISPLAY_NAME')
        ?'Enter a display name with 1–32 characters.'
        :'Could not save the display name. Check the connection and try again.';
    }finally{this.setPending(false);}
  }

  playAsGuest(){
    if(this.pending||!this.presence)return;
    this.mode='guest';this.profile=null;this.token=null;this.root.hidden=true;
    this.onGuest(createGuestIdentity());
  }

  async logout(){
    const token=this.mode==='profile'?(this.token??this.storedToken()):null;
    if(token&&this.presence)await this.presence.client.action(this.presence.api.profiles.logout,{token});
    this.mode=null;this.profile=null;this.token=null;if(this.presence)this.presence.profileSessionToken=null;
    this.clearToken();this.root.hidden=false;this.setMode('login');
    this.message.textContent='Logged out.';this.onLoggedOut();
  }

  destroy(){
    this.root.removeEventListener('keydown',this.onAuthKey);
    this.root.removeEventListener('keyup',this.onAuthKey);
    this.displayNameForm.removeEventListener('submit',this.onDisplayNameSubmit);
    this.profile=null;this.token=null;
  }
}
