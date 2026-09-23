export function hasProfileSession(presence){
  return presence?.identity?.kind!=='guest'
    &&typeof presence?.profileSessionToken==='string'
    &&Boolean(presence.profileSessionToken);
}

export function requireProfileSessionToken(presence){
  const token=hasProfileSession(presence)?presence.profileSessionToken:null;
  if(typeof token!=='string'||!token)throw new Error('Profile session is unavailable.');
  return token;
}
