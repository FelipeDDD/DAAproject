# Lucky Machine

The machine reads the gamble-machine floor point in the Notes object layer
of public/assets/maps/classroom.tmj. Move this marker in Tiled to reposition
it. The 62 x 124px visual, 52 x 16px physical base and independent 104px
interaction range remain configured in src/gamble/config.js.

## Rewards and authority

src/gamble/rewardCatalog.js contains the shared categories, items, previews,
descriptions and weights. src/economy/config.js exports them as ROULETTE_REWARDS
and keeps the cost at 5 coins. Quiz rewards are unchanged.

| Category | Chance |
| --- | --- |
| Nothing | 40% |
| Coin Rewards | 32% |
| Cigarette Collection | 10% |
| Lung Crusher 3000 Rare | 2% |
| Tier 3 Skin | 1% |
| Special Rewards | 15% |

Coin bracket weights are absolute percentages of all spins and sum to the 32% coin category: 12% for 1-3, 9% for 4-5, 5% for 6-10, 3% for 11-20, 2% for 21-35, and 1% for 36-50. The backend normalizes those weights within the coin category, then draws a uniform integer within the selected range. With a 5-coin spin cost, the average coin return is 2.50 coins per spin.

Cigarette Collection uniformly chooses among the three unowned common editions:
pink, orange and purple. Owning all three yields a stackable Zigarettenschachtel
Voucher. The separate 2% category alone grants the rare edition. Tier 3 grants
a persistent wardrobe unlock for existing per-character Tier 3 assets.
Special Rewards uniformly selects one of four configurable joke items.
Voucher exchange is reserved for a future task.

convex/rouletteRewards.js validates the authenticated profile/player/session.
Cost, item/coin prize and spin receipt commit in one Convex transaction.
Retrying a profile/spin ID returns the saved outcome without charging or
granting again. Legacy coin receipts retain their labels and map to the coin
category. Reward-only inventory items reject public client-side claims.

## Presentation

GambleMachineController.js owns the DOM modal. A large wheel sits left; six
clickable categories and a details panel sit right. Balance, Spin and Close
occupy the bottom. Cost appears only on Spin. Category selection replaces
only details, preserving the wheel and its animation.

Collection, rare and voucher previews use only the inventory PNG miniatures.
All original and miniature PNGs are copied to public/assets/items; drafts
remain untouched. Render-time SVG frames crop empty miniature margins without
modifying files. Full artwork appears only for owned-item inspection.
Tier 3 uses the selected character's experimentalVisual.previewAsset from
src/characters.js, with Michael as the standalone UI fallback.

src/gamble/visualConfig.js controls colors, rare styles, fonts, modal width
(1200px), maximum height (920px), wheel size (520px) and animation settings.
gambleMachine.css controls layout, details and responsive stacking/scrolling.

The wheel has eight equal slices for six categories, repeating Nothing and
Coins. segmentOrder and extraSegmentCategories configure the arrangement.
Repeats affect presentation only, never probabilities. The server category
maps deterministically to its first matching segment. The final angle aligns
the negative segment center with the fixed top pointer plus safe visual jitter.
Five full turns plus alignment run over 3600ms; jitter is at most 16% of a
slice on either side. Spin and Close stay blocked until the wheel stops;
only then is the server outcome shown and its row/segment highlighted.

Categories accept previewImage, previewImages, previewFrame and description.
Add a grant type in grantRoulettePrize when needed, and register item definitions
through ROULETTE_ITEMS. No client RNG chooses a prize.

Focused validation: node tests/gambleMachine.test.js, node tests/economy.test.js,
node tests/collections.test.js, npm run build, git diff --check.
