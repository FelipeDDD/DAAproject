import assert from 'node:assert/strict';
import test from 'node:test';
import { ProfileAuth,PROFILE_TOKEN_STORAGE_KEY } from '../src/ProfileAuth.js';

function storage(){
  const values=new Map();
  return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
}

test('profile login stores only the returned bearer token and never the password',async()=>{
  const oldStorage=globalThis.localStorage;const local=storage();globalThis.localStorage=local;
  let authenticated;
  try{
    const auth=Object.assign(Object.create(ProfileAuth.prototype),{
      presence:{api:{profiles:{login:'login'}},client:{action:async(_fn,args)=>{
        assert.equal(args.password,'correct horse');
        return {token:'secure-session-token',profile:{profileName:'felipe',displayName:'Alex'}};
      }}},pending:false,message:{textContent:''},root:{hidden:false},setPending(){},
      onAuthenticated:(profile,token)=>authenticated={profile,token},
    });
    const form={elements:{profileName:{value:'Felipe'},password:{value:'correct horse'}}};
    await auth.submit({preventDefault(){},currentTarget:form},'login');
    assert.equal(local.getItem(PROFILE_TOKEN_STORAGE_KEY),'secure-session-token');
    assert.equal(form.elements.password.value,'');
    assert.deepEqual([...local.values.values()],['secure-session-token']);
    assert.equal(authenticated.profile.profileName,'felipe');
    assert.equal(authenticated.profile.displayName,'Alex');
  }finally{globalThis.localStorage=oldStorage;}
});

test('profile registration submits the explicit displayName before character selection',async()=>{
  let submitted,authenticated;
  const auth=Object.assign(Object.create(ProfileAuth.prototype),{
    presence:{api:{profiles:{register:'register'}},client:{action:async(_fn,args)=>{
      submitted=args;return {token:'new-session-token',profile:{profileName:'new-user',displayName:'The Player'}};
    }}},pending:false,message:{textContent:''},root:{hidden:false},setPending(){},storeToken(){},
    accept(profile,token){authenticated={profile,token};},
  });
  const form={elements:{profileName:{value:'new-user'},password:{value:'correct horse'},displayName:{value:'The Player'}}};
  await auth.submit({preventDefault(){},currentTarget:form},'register');
  assert.equal(submitted.displayName,'The Player');
  assert.equal(submitted.selectedCharacterId,undefined);
  assert.equal(authenticated.profile.displayName,'The Player');
});

test('restoring a valid token skips credentials and invalid logout removes the local token',async()=>{
  const oldStorage=globalThis.localStorage;const local=storage();globalThis.localStorage=local;
  local.setItem(PROFILE_TOKEN_STORAGE_KEY,'stored-session-token');
  const calls=[];
  try{
    const auth=Object.assign(Object.create(ProfileAuth.prototype),{
      presence:{api:{profiles:{me:'me',logout:'logout'}},client:{action:async(fn,args)=>{
        calls.push({fn,args});return fn==='me'?{profileName:'felipe',displayName:'Alex'}:{ok:true};
      }}},root:{hidden:true},message:{textContent:''},setPending(){},setMode(){},
      onAuthenticated(){},onLoggedOut(){calls.push({fn:'logged-out'});},
    });
    await auth.start();
    assert.equal(auth.profile.profileName,'felipe');
    await auth.logout();
    assert.equal(local.getItem(PROFILE_TOKEN_STORAGE_KEY),null);
    assert.deepEqual(calls.map(call=>call.fn),['me','logout','logged-out']);
  }finally{globalThis.localStorage=oldStorage;}
});

test('a profile missing displayName is prompted once and continues after saving it',async()=>{
  const calls=[],authenticated=[];
  const guestOption={hidden:false};
  const displayNameForm={hidden:true,elements:{displayName:{value:''}}};
  const auth=Object.assign(Object.create(ProfileAuth.prototype),{
    presence:{api:{profiles:{setDisplayName:'setDisplayName'}},client:{action:async(fn,args)=>{
      calls.push({fn,args});return {profileName:'legacy',displayName:args.displayName.trim()};
    }}},pending:false,root:{hidden:true},title:{textContent:''},message:{textContent:''},
    loginTab:{hidden:false},registerTab:{hidden:false},loginForm:{hidden:false},registerForm:{hidden:false},
    guestButton:{closest:()=>guestOption},displayNameForm,
    onAuthenticated:(profile,token)=>authenticated.push({profile,token}),
    setPending(value){this.pending=value;},
  });

  auth.accept({profileName:'legacy'},'existing-token');
  assert.equal(displayNameForm.hidden,false);
  assert.equal(guestOption.hidden,true);
  assert.equal(authenticated.length,0);
  displayNameForm.elements.displayName.value='  Alex  ';
  await auth.submitDisplayName({preventDefault(){},currentTarget:displayNameForm});
  assert.deepEqual(calls,[{fn:'setDisplayName',args:{token:'existing-token',displayName:'  Alex  '}}]);
  assert.equal(authenticated.length,1);
  assert.equal(authenticated[0].profile.displayName,'Alex');

  auth.root.hidden=false;
  displayNameForm.hidden=true;
  auth.accept({profileName:'legacy',displayName:'Alex'},'existing-token');
  assert.equal(displayNameForm.hidden,true);
  assert.equal(authenticated.length,2);
});

test('guest mode creates only a temporary client identity and exits without a backend logout',async()=>{
  let guest;
  let actions=0;
  const auth=Object.assign(Object.create(ProfileAuth.prototype),{
    presence:{profileSessionToken:null,client:{action:async()=>{actions+=1;}},api:{profiles:{logout:'logout'}}},
    pending:false,root:{hidden:false},message:{textContent:''},onGuest:value=>{guest=value;},
    clearToken(){},setMode(){},onLoggedOut(){},
  });
  auth.playAsGuest();
  assert.equal(auth.mode,'guest');assert.equal(auth.root.hidden,true);
  assert.equal(guest.kind,'guest');assert.match(guest.guestId,/^guest-/);
  assert.equal(auth.profile,null);assert.equal(auth.token,null);
  await auth.logout();assert.equal(actions,0);assert.equal(auth.mode,null);
});
