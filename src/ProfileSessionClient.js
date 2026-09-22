export function requireProfileSessionToken(presence){
  const token=presence?.profileSessionToken;
  if(typeof token!=='string'||!token)throw new Error('Profile session is unavailable.');
  return token;
}
