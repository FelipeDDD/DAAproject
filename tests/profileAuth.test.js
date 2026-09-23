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
        return {token:'secure-session-token',profile:{profileName:'felipe'}};
      }}},pending:false,message:{textContent:''},root:{hidden:false},setPending(){},
      onAuthenticated:(profile,token)=>authenticated={profile,token},
    });
    const form={elements:{profileName:{value:'Felipe'},password:{value:'correct horse'}}};
    await auth.submit({preventDefault(){},currentTarget:form},'login');
    assert.equal(local.getItem(PROFILE_TOKEN_STORAGE_KEY),'secure-session-token');
    assert.equal(form.elements.password.value,'');
    assert.deepEqual([...local.values.values()],['secure-session-token']);
    assert.equal(authenticated.profile.profileName,'felipe');
  }finally{globalThis.localStorage=oldStorage;}
});

test('restoring a valid token skips credentials and invalid logout removes the local token',async()=>{
  const oldStorage=globalThis.localStorage;const local=storage();globalThis.localStorage=local;
  local.setItem(PROFILE_TOKEN_STORAGE_KEY,'stored-session-token');
  const calls=[];
  try{
    const auth=Object.assign(Object.create(ProfileAuth.prototype),{
      presence:{api:{profiles:{me:'me',logout:'logout'}},client:{action:async(fn,args)=>{
        calls.push({fn,args});return fn==='me'?{profileName:'felipe'}:{ok:true};
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
