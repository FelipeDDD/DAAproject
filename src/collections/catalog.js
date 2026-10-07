import { CIGARETTE_PACKS } from '../npc/cigarettePacks.js';
import { CIGARETTE_REWARDS } from '../gamble/rewardCatalog.js';
// Sample data stays available for isolated previews; gameplay uses real quest history.
const originalClip='polygon(19% .5%,90% 3.5%,92% 4.5%,92% 87%,90.5% 89.5%,19% 89.5%,9.5% 86%,9.5% 8%)';
const editionClip='polygon(19% .7%,89% 3.8%,90.5% 4.5%,90.5% 90.4%,89.3% 91.7%,19% 91.7%,9% 89.5%,9% 7%)';

export function createPreviewCollections(){
  return [
    {id:'cigarettes',name:'Cigarettes',icon:'pack',menuIcon:'pack',description:'Small packs. Questionable legends.',
      subtitle:'A cabinet of unusually bad ideas.',items:[
        {id:'lung-3000',name:'Lung Crusher 3000',description:'The original. Bigger puffs, brighter days — and absolutely no sensible decisions.',
          image:'assets/items/lung-crusher-3000.png',imageClip:originalClip,rarity:'normal',unlocked:true,edition:'Original edition'},
        {id:'lung-4000',name:'Lung Crusher 4000',description:'For collectors who looked at the 3000 and thought: this could be considerably more ridiculous.',
          image:'assets/items/lung-crusher-3000-red.png',imageClip:editionClip,rarity:'normal',unlocked:true,edition:'Wildfire edition'},
        {id:'lung-flying',name:'Lung Crusher 3000 Flying Edition',description:'An ambitious departure from common sense. Carry-on allowance not included.',
          image:'assets/items/lung-crusher-3000-blue.png',imageClip:editionClip,rarity:'normal',unlocked:true,edition:'Flying edition'},
        {id:'unknown-01',name:'Undiscovered item',description:'Some curious things are still waiting to be found.',rarity:'normal',unlocked:false},
        {id:'unknown-02',name:'Undiscovered item',description:'An empty place for a future discovery.',rarity:'normal',unlocked:false},
        {id:'rare-variant',name:'Rare Variant',description:'A particularly unusual find. Its story is still a mystery.',
          image:'assets/items/lung-crusher-3000-green.png',imageClip:editionClip,rarity:'rare',unlocked:false,edition:'Rare discovery'},
      ]},
    {id:'weird-food',name:'Potions',icon:'flask',menuIcon:'potion',description:'Best admired. Probably not tasted.',comingSoon:true,items:[]},
    {id:'office-junk',name:'Office Junk',icon:'book',menuIcon:'files',description:'Every desk has its little secrets.',comingSoon:true,items:[]},
    {id:'director-secrets',name:'Director Secrets',icon:'diamond',menuIcon:'diamond',description:'Strictly between you and this cabinet.',comingSoon:true,items:[]},
  ];
}

// Delivery history is profile-owned and survives removal of the actual pack.
// Current ownership supplies newly found packs before their first hand-in.
export function collectionsFromQuestProgress(progress,ownedItems=[]){
  const discovered=new Set(progress?.deliveredPackIds??[]);
  if(progress?.hasPack)discovered.add(progress.currentPackId);
  const owned=new Set(ownedItems.map(item=>item.itemId));
  const collections=createPreviewCollections();
  collections[0].items=[...CIGARETTE_PACKS.map((pack,index)=>({
    id:pack.packId,name:pack.name,description:index===0?'The original questionable find.':'Another colourful chapter in a very questionable collection.',
    image:pack.card,imageClip:index===0?originalClip:editionClip,rarity:'normal',
    unlocked:discovered.has(pack.packId)||owned.has(pack.inventoryItemId)||owned.has(pack.packId),
  })),
    ...CIGARETTE_REWARDS.map(item=>({id:item.itemId,name:item.name,description:item.description,
      image:item.presentationImage,imageClip:item.presentationClip,rarity:item.rarity??'normal',unlocked:owned.has(item.itemId)})),
  ];
  return collections;
}
