import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ItemRewardOverlay } from '../src/inventory/ItemRewardOverlay.js';
import { CHARACTER_ITEM_IDS,characterItemDefinition } from '../src/inventory/characterItems.js';
import { BackpackMenu } from '../src/inventory/BackpackMenu.js';
import { menuFixture } from './helpers/menuFixture.js';

for(const id of [CHARACTER_ITEM_IDS.DIRECTOR_HIDDEN_KEY,CHARACTER_ITEM_IDS.OFFICE2_KEY]){
  test(`${id} pickup and examination render one centered large frame, not the whole variant sheet`,()=>{
    const item=characterItemDefinition(id),f=menuFixture(BackpackMenu,{items:[item]});
    const overlay=new ItemRewardOverlay({documentRef:f.doc,baseUrl:'/'});
    const png=readFileSync(new URL('../public/assets/items/key-office.png',import.meta.url));
    assert.equal(png.readUInt32BE(16),item.presentationFrame.sourceWidth);
    assert.equal(png.readUInt32BE(20),item.presentationFrame.sourceHeight);
    for(const source of ['pickup','inventory']){
      overlay.show(item,{source});
      const panel=overlay.root.children[0],art=panel.children[1];
      assert.equal(art.tag,'svg');assert.equal(art.viewBox,'320 0 620 724');
      assert.equal(art.preserveAspectRatio,'xMidYMid meet');assert.equal(art.overflow,'hidden');
      assert.equal(art.children.length,1);assert.equal(art.children[0].tag,'image');
      assert.equal(art.children[0].href,'https://game.test/assets/items/key-office.png');
      assert.equal(panel.children[2].textContent,item.name);
      assert.equal(panel.children[3].textContent,item.description);
      assert.equal(panel.children.at(-1).textContent,source==='inventory'?'Back':'Continue');
    }
    f.menu.open();assert.equal(f.menu.preview.querySelectorAll('svg').length,1);
    overlay.destroy();f.menu.destroy();
  });
}

test('ordinary consumable/equipment/quest cards keep their single full presentation image',()=>{
  const f=menuFixture(BackpackMenu),overlay=new ItemRewardOverlay({documentRef:f.doc});
  for(const id of [CHARACTER_ITEM_IDS.HEALTH_POTION,CHARACTER_ITEM_IDS.LUNG_CRUSHER_3000,CHARACTER_ITEM_IDS.LUNG_CRUSHER_PACK]){
    const item=characterItemDefinition(id);overlay.show(item,{source:'inventory'});
    const art=overlay.root.children[0].children[1];assert.equal(art.tag,'img');
    assert.equal(art.src,`https://game.test/${item.presentationImage}`);assert.equal(art.alt,item.name);
  }
  overlay.destroy();f.menu.destroy();
});
