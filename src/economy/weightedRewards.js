export function validateWeightedRewards(entries){
  if(!Array.isArray(entries)||!entries.length)throw new Error('Rewards must not be empty.');
  const ids=new Set();let totalWeight=0;
  for(const entry of entries){
    if(typeof entry.id!=='string'||!entry.id||ids.has(entry.id))throw new Error('Reward IDs must be unique.');
    ids.add(entry.id);
    if(!Number.isFinite(entry.weight)||entry.weight<=0)throw new Error('Reward weights must be positive and finite.');
    if(!entry.reward||typeof entry.reward.type!=='string')throw new Error('Reward definition required.');
    if(entry.reward.type==='coins'&&(!Number.isSafeInteger(entry.reward.amount)||entry.reward.amount<=0))
      throw new Error('Coin rewards must be positive safe integers.');
    totalWeight+=entry.weight;
  }
  if(!Number.isFinite(totalWeight))throw new Error('Invalid total reward weight.');
  return totalWeight;
}

// Pure helper. Gameplay must call it in the backend only.
export function selectWeightedReward(entries,randomValue){
  const total=validateWeightedRewards(entries);
  if(!Number.isFinite(randomValue)||randomValue<0||randomValue>=1)throw new Error('Invalid random value.');
  const target=randomValue*total;let cumulative=0;
  for(const entry of entries){cumulative+=entry.weight;if(target<cumulative)return entry;}
  return entries.at(-1);
}
