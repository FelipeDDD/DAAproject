# Collections

HTML/CSS cabinet opened through the book icon beside **Inventory**. One modal
contains the collection directory and its item grid/preview. Close with X, Escape
or the backdrop; **All collections** returns to the directory. On small screens
the preview sits below the grid and selecting a card scrolls it into view.

- `catalog.js`: isolated preview data via `createPreviewCollections()`; real
  cigarette discoveries via `collectionsFromQuestProgress(progress, ownedItems)`.
- `CollectionsMenu.js`: navigation, selection, locked/rare states, image fallback,
  navigation and display; shared focus/input/dialog handling in `GameMenuModal`.
- `collections.css`: bronze/gold borders, layout and responsive styles. Main knobs:
  `.collections-panel` width; `.collections-detail` column proportions;
  `.collection-item-art` / `.collection-preview-art` image heights;
  `--collection-gold`, `--collection-muted`, `--collection-line` colors.

Gameplay displays the four actual cigarette packs. Owned packs and persistent NPC
`deliveredPackIds` mark discoveries: handing in a pack removes it from Inventory
without hiding it here. Existing quest subscriptions feed updates; opening the
menu performs one `npcQuests.progress` read where needed. No new polling, backend
functions or persistence fields. Other categories and rare/future slots remain
placeholders. The DEV reset intentionally clears cigarette deliveries/discoveries.

## Connect real data later

Pass `collections` to the constructor or update the mounted menu with
`scene.inventoryHotbar.collections.setCollections(collections)`:

```js
[
  {
    id: 'cigarettes', name: 'Cigarettes', icon: 'pack',
    description: 'Small packs. Questionable legends.',
    items: [
      {
        id: 'stable-item-id', name: 'Item name', description: 'Short description.',
        image: 'assets/items/example.png', // path relative to public/
        rarity: 'normal', // or 'rare'
        unlocked: true,
      },
    ],
  },
]
```

Collection icon names: `pack`, `flask`, `book`, `diamond`. Optional `comingSoon`
shows a placeholder page. An empty items array shows **No items yet**. Item
`icon` is a fallback for `image`; optional `imageClip` crops the displayed source
backdrop with CSS, and `edition` labels the preview. Locked items never request
their image. Image loading uses the native browser cache and lazy thumbnails.

Connect to persistent **discoveries**, rather than only current inventory: an item
handed to the NPC should eventually stay discovered. That ownership decision is
intentionally deferred. `setCollections` retains the selected collection/item
when their IDs still exist, so a future subscription can update unlocks directly.

The inventory owns the menu lifecycle. Scene sleep/logout destroys it and removes
listeners; closing restores previous input settings and focus without a mouse click.

Focused checks: `node --test --test-isolation=none tests/collections.test.js tests/inventory.test.js`.
