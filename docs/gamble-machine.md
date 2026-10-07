# Lucky Machine UI

The unmodified 887 × 1774 PNG is copied from `assets-drafts/gamble-machine.png`
to `public/assets/furniture/gamble-machine.png`. Drafts are preserved and are
not used at runtime.

The school scene reads the point `gamble-machine` in the `Notes` object layer of
`public/assets/maps/classroom.tmj`. Its current floor/base position is (752, 912),
in the southwest corner of the classroom, near the south wall and left of the
desks. Drag this point in Tiled to move the machine, collider and interaction
together. No position is hardcoded in runtime code.

To recreate the marker: open `classroom.tmj` in Tiled, select `Notes`, choose
Insert Point, click the desired floor/base location and set its Name to
`gamble-machine`. Keep the point and layer visible. Save the map and reload it
in the game; sleeping scenes retain their current map until recreated/reloaded.

Missing marker: production omits the machine. DEV logs an explicit warning;
optionally create another Tiled point named `gamble-machine-dev` for a DEV-only
fallback. There is no automatic coordinate fallback.

`src/gamble/config.js` centralizes the asset, maximum display dimensions, origin,
visual offsets, depth offset, base hitbox, proximity radius and prompt gap.
At 32 px tiles the original aspect ratio produces a 62 × 124 px sprite. Origin
is bottom-center (0.5, 1); offset Y = 3 compensates for the source's transparent
bottom padding. Container depth equals the marker's floor Y, matching player
depth sorting. The base is a separate static 52 × 16 px rectangle whose bottom
center is the marker; the upper visual has no collider.

The physical base stays 52 × 16 px. Interaction distance is independently set
to 3.25 tiles (104 px) from that base; adjust `interactionDistanceTiles` to tune
it without changing collision. Approaching shows `Press E · Lucky Machine`.

E opens the wide, burgundy-and-gold two-column arcade panel. The left side has a
decorative eight-segment SVG wheel; its symbols do not select or predict a
reward. The right side renders reward names, icons and percentages directly
from `ROULETTE_REWARDS`. Percentages use each weight divided by the configured
total, and chances up to the configured rare cutoff get a gold highlight.
Balance comes from the same `CurrencyClient` subscription as the persistent
coin HUD. Cost comes from `ROULETTE_COST`.

When the balance is unavailable, the spin control is disabled. With too few
coins it reads `NOT ENOUGH COINS`. With enough coins it shows the configured
price but remains disabled with a coming-soon status: `resolveRoulette` is only
a helper, and there is not yet an authenticated public mutation that validates
the owner, issues a server spin ID and calls it. This panel does not spend or
roll. Escape, Close and backdrop clicks dismiss it. Its open animation is 210
ms and the wheel lights pulse once. Sleep closes the panel; scene shutdown
destroys its UI, prompt, collider and visual.

Edit `src/gamble/visualConfig.js` for panel width/height, colors, spacing, wheel
size and animation time; edit `src/gamble/config.js` for the interaction
distance. `GambleMachineController.js` builds the prize rows and wheel,
subscribes to the shared balance and owns the modal. `gambleMachine.css` styles
the responsive two-column view. Reward names/icons/weights live in
`src/economy/config.js`; the UI formats the weights without a hand-maintained
reward list. The existing economy config already supplies cost and prizes.

To enable spins, add an authenticated server mutation that resolves the live
profile, validates or creates its spin ID, and calls the existing transactional
resolver. Then wire that mutation from the panel; keep the result animation
presentation-only and show the returned reward. Do not accept profile or spin
IDs supplied as authority by the client.
