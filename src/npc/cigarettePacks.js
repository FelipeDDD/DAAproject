export const CIGARETTE_PACKS = Object.freeze([
  {packId:'cigarette_pack_01',inventoryItemId:'lung_crusher_3000_pack',room:'school',markerNames:['lung-crusher'],
    name:'Lung Crusher 3000 Pack',icon:'assets/items/lung-crusher-floor.png',card:'assets/items/lung-crusher-3000.png',
    groundTexture:'lung-crusher-pack-ground',groundAsset:'assets/items/lung-crusher-floor.png',width:8,height:9},
  {packId:'cigarette_pack_02',inventoryItemId:'cigarette_pack_02',room:'office3',markerNames:['lung-crusher-3000-red','long-crusher-3000-red'],
    name:'Lung Crusher 3000 · Wildfire',icon:'assets/items/lung-crusher-3000-red-inv.png',card:'assets/items/lung-crusher-3000-red.png',
    groundTexture:'lung-crusher-red-ground',groundAsset:'assets/items/lung-crusher-red-ground.svg',width:10,height:12,litter:true},
  {packId:'cigarette_pack_03',inventoryItemId:'cigarette_pack_03',room:'school',markerNames:['lung-crusher-3000-green','long-crusher-3000-green'],
    name:'Lung Crusher 3000 · Forest',icon:'assets/items/lung-crusher-3000-green-inv.png',card:'assets/items/lung-crusher-3000-green.png',
    groundTexture:'lung-crusher-green-ground',groundAsset:'assets/items/lung-crusher-green-ground.svg',width:10,height:12},
  {packId:'cigarette_pack_04',inventoryItemId:'cigarette_pack_04',room:'secret-path',markerNames:['lung-crusher-3000-blue','long-crusher-3000-blue'],
    name:'Lung Crusher 3000 · Storm',icon:'assets/items/lung-crusher-3000-blue-inv.png',card:'assets/items/lung-crusher-3000-blue.png',
    groundTexture:'lung-crusher-blue-ground',groundAsset:'assets/items/lung-crusher-blue-ground.svg',width:10,height:12},
]);
export function cigarettePack(packId) {return CIGARETTE_PACKS.find(pack=>pack.packId===packId)??null;}
export function questInventoryItemId(packId) {return cigarettePack(packId)?.inventoryItemId??packId;}
export function isPackSpawn(spawn,packId) {return !spawn.packId||spawn.packId===packId;}
