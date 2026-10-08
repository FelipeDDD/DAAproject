const item=(itemId,name,file,extra={})=>({itemId,name,icon:`assets/items/${file}-inv.png`,
  presentationImage:`assets/items/${file}.png`,type:'collectible',useBehavior:'presentation',rewardOnly:true,
  quantity:1,description:'A Lucky Machine collectible.',
  iconFrame:{x:498,y:450,width:262,height:329,sourceWidth:1254,sourceHeight:1254},...extra});

// Render-time silhouette crop: preserve the PNG and trim its backdrop/reflection.
const commonPack=(id,name,file)=>item(id,name,file,{
  presentationStyle:'cigarette-pack',
  presentationClip:'polygon(19% .8%,90% 3.7%,91.5% 4.3%,91.5% 88.5%,90% 89.2%,19% 89.2%,9.5% 87.4%,9.5% 6.4%)',
});
export const CIGARETTE_REWARDS=Object.freeze([
  commonPack('roulette_pack_pink','Lung Crusher 3000 Pink','lung-crusher-3000-pink'),
  commonPack('roulette_pack_orange','Lung Crusher 3000 Orange','lung-crusher-3000-orange'),
  commonPack('roulette_pack_purple','Lung Crusher 3000 Purple','lung-crusher-3000-purple'),
]);
export const RARE_CIGARETTE=item('roulette_pack_rare','Lung Crusher 3000 Rare','lung-crusher-3000-rare',{rarity:'rare',
  iconFrame:{x:498,y:445,width:248,height:335,sourceWidth:1254,sourceHeight:1254}});
export const CIGARETTE_VOUCHER=item('cigarette_voucher','Zigarettenschachtel Voucher','gutschein',
  {type:'voucher',maxStack:1_000_000,
    iconFrame:{x:375,y:497,width:505,height:258,sourceWidth:1254,sourceHeight:1254},
    description:'Awarded when the cigarette collection is complete. Keep it for a future exchange.'});
export const TIER3_SKIN_ITEM={itemId:'tier3_skin',name:'Tier 3 Skin',type:'cosmetic',rewardOnly:true,
  icon:'assets/characters/experimental/michael-level3-hd-idle.png',quantity:1,useBehavior:'presentation',
  description:'Unlocks the existing Tier 3 appearance in the wardrobe.'};
export const SPECIAL_REWARDS=Object.freeze([
  {itemId:'special_exam_coupon',name:'50% discount coupon for a prostate exam'},
  {itemId:'special_broken_key',name:'One broken keyboard key'},
  {itemId:'special_floppy_disk',name:'A suspicious floppy disk'},
  {itemId:'special_paperclip',name:'A premium paperclip'},
].map(entry=>({...entry,type:'collectible',rewardOnly:true,quantity:1,maxStack:1_000_000,
  description:'A particularly questionable Lucky Machine prize.',icon:'assets/items/gutschein-inv.png',useBehavior:'presentation'})));
export const ROULETTE_ITEMS=Object.freeze([...CIGARETTE_REWARDS,RARE_CIGARETTE,CIGARETTE_VOUCHER,TIER3_SKIN_ITEM,...SPECIAL_REWARDS]);

// Absolute percentages of all spins. The backend uses these weights within the 40% coin category.
export const COIN_BRACKETS=Object.freeze([
  {id:'coins_3_5',min:3,max:5,weight:22},
  {id:'coins_6_10',min:6,max:10,weight:10},
  {id:'coins_11_20',min:11,max:20,weight:5},
  {id:'coins_21_35',min:21,max:35,weight:2},
  {id:'coins_36_50',min:36,max:50,weight:1},
]);
export const ROULETTE_CATEGORIES=Object.freeze([
  {id:'nothing',name:'Nothing',weight:32,icon:'sad',description:'The wheel offers its sincere congratulations. And nothing else.',reward:{type:'none'}},
  {id:'coins',name:'Coin Rewards',weight:40,icon:'coin',description:'One coin bracket is selected, then a whole-number amount within that range.',reward:{type:'coin-brackets'}},
  {id:'cigarette_collection',name:'Cigarette Collection',weight:10,icon:'pack',
    description:'Receive one of the three unowned common editions. Own all three? Receive a Zigarettenschachtel Voucher instead.',
    previewImages:CIGARETTE_REWARDS.map(entry=>({src:entry.icon,label:entry.name,frame:entry.iconFrame})),reward:{type:'cigarette-collection'}},
  {id:'lung_crusher_rare',name:'Lung Crusher 3000 Rare',weight:2,icon:'ticket',
    description:'The rare edition of the collection.',previewImage:RARE_CIGARETTE.icon,previewFrame:RARE_CIGARETTE.iconFrame,reward:{type:'item',itemId:RARE_CIGARETTE.itemId}},
  {id:'tier3_skin',name:'Tier 3 Skin',weight:1,icon:'star',premium:true,
    description:'Unlock the Tier 3 appearance for your characters.',reward:{type:'item',itemId:TIER3_SKIN_ITEM.itemId}},
  {id:'special',name:'Special Rewards',weight:15,icon:'gift',
    description:'A random selection of unusually useful prizes.',reward:{type:'special'}},
]);
export function rouletteCategoryId(rewardId){return ['coins_2','coins_5','coins_20'].includes(rewardId)?'coins':rewardId;}
