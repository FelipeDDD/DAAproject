# PvP skills

Skills are a separate round-scoped relay layer. They do not own normal attacks,
pickups, objectives, Match Settings or Team Overrides.

- `config.js`: gameplay defaults, mode permissions/overrides and input bindings.
- `SkillRegistry.js`: stable IDs, registered gameplay modules and config resolution.
- `SkillAuthority.js`: ownership/session, match/round/life/presence, replay and
  cooldown validation; instance cleanup. It has no timers of its own.
- `SkillClient.js`: configurable input -> authenticated reliable intent, using
  `PvpDamageClient`'s validated round snapshots. It sends the latest reliable pose
  first; callers cannot choose a zone center, radius, damage or cooldown.
- `SkillView.js` and `SkillHud.js`: independent Phaser presentation and DOM HUD.
- `state.js`: bounded input/snapshot wire validation.

`PvpDamageAuthority` integrates skill deadlines into its existing scheduler. Its
separate skill damage adapter applies existing HP/death/score/respawn/regen rules.
Only combat results are mirrored to Convex; skill instances/cooldowns remain in
the realtime round. No database schema or additional connection is required.

## Registering another skill

1. Add a gameplay module under `skills/` with a stable `id` and these hooks:
   `validConfig(config)`, `create({player,position,config,now})`,
   `advance(instance,world,now)`, `nextDeadline(instance)`,
   `expired(instance,now)` and `snapshot(instance)`.
2. Register it in `SkillRegistry` and add its defaults to `SKILL_DEFAULTS`.
3. Enable the ID in the desired mode's `skills` array. An omitted ID is denied by
   the authority even if a client sends it manually.
4. Add its snapshot shape in `state.js`. For a visible skill, register a factory
   in `SkillView.js`; add a `SKILL_INPUTS` binding if it needs keyboard input.

Modules receive a `world` adapter with current `state()`, `position(player)`,
`connected(playerId)` and `damage(instance,target,amount,now)`. Future skills can
extend this small adapter for their own effect; do not duplicate shared checks.
Module code and view code do not import each other.

## Mode overrides

For example, edit `PVP_MODE_SKILLS.payload` in `config.js` to contain:

```js
{
  skills: ['fire-zone'],
  skillOverrides: { 'fire-zone': { cooldownMs: 20000 } },
}
```

Resolution is `{...skillDefaults, ...modeOverride}`. Unspecified fields retain
their defaults; unknown fields and invalid numeric values fail at startup. These
are trusted server configuration, not player-editable Match Settings.

## Fire Zone

Enabled in Payload only. Key `2` or clicking hotbar slot 2 arms ground targeting:
a crosshair and local area preview follow the mouse. Left click confirms;
Escape, right click or `2` again cancels. The confirmation click does not fire a
normal attack. Preview/placement clamp to six 32px map tiles from the player;
an orange preview indicates clamping. Only the server creates the actual zone,
using its accepted player position and the same `clampSkillAim` geometry.
Death, round changes, input blocking and scene cleanup cancel targeting.
Defaults: cooldown 25s from cast,
temporarily overridden to **5s in Payload** for testing via
`PVP_MODE_SKILLS.payload.skillOverrides['fire-zone'].cooldownMs` in `config.js`.
Remove that override to restore 25s. The aim limit lives with the skill defaults
as `maxRangeTiles` and `tileSize`. Other defaults: 500ms telegraph followed by
5s active, radius 56px and 5 HP/s. Damage is applied in 250ms intervals (1.25 HP
each), including the final interval. Friendly/self damage is excluded. Leaving
the foot-anchor circle stops damage on the next tick; returning resumes it.
Stationary positions are valid; moving samples older than 1s are excluded.
Server stalls never produce a catch-up damage burst. Placement does not perform
wall clipping or line-of-sight checks. Legacy intents without aim use facing.

Match end, disconnect, owner death/life change and round/scene cleanup remove
instances. Death/respawn retains the owner's cooldown for the same round; Retry
starts fresh cooldowns. Old-round intents/snapshots are ignored/rejected.

Visual work belongs exclusively in `views/fire-zone/FireZoneView.js` and
`views/fire-zone/visualConfig.js`. Telegraph uses a subtle ground outline and
center marker. Activity adds 49 small, four-frame pixel flames with warm cores,
ground glow and occasional embers. The 2px cells animate every 110ms using the
render timestamp, with one Graphics object and no tweens, timers or textures.
The fire-test.png draft is a reference only; runtime has no draft dependency.
Sixteen flames explicitly follow the perimeter; pixels and glows stay inside the
zone. Tune pixelSize, flameCount, edgeFlameCount, edgeInset, flameFrameMs,
flameSpread, flameColors, aimCursor, aimColor, aimClampedColor and alpha in
the visual config. Flame tips/embers are clipped to the server radius. Snapshot
removal still owns cleanup; animation never expires or damages a target locally.
Radius/center/phase come from the relay. `SkillHud.js` reuses `InventoryHotbar`
(the ordinary four consumable slots), without loading persistent inventory.
Slot 2 displays a flame icon and READY or authoritative remaining seconds;
clicks use `SkillClient.activate`, exactly like the key binding. Its generic
`quickSlotActions` option provides transient actions, without treating skills as
owned items or starting backpack/collections/reward controllers. Unavailable slots,
cooldowns and dead/inactive players cannot activate the button. TDM has no skills
and hides the bar. Scene cleanup removes its DOM and callbacks; Retry renders
the new round's clean authoritative cooldowns.
Edit `SKILL_INPUTS` in the same `config.js` for future skills' slot, Phaser key,
label and SVG icon path. Slot count/layout remain the ordinary inventory's.
Style the action icon/status with `.inventory-action-slot` and
`.inventory-action-status` in `../../style.css`.

For local testing, restart `npm run realtime:server` and reload both browsers.
The previously generated shared test build is unchanged; rebuild it explicitly
with `npm run build:test` when ready to share the new frontend.

Focused validation: `node --test tests/pvpSkills.test.js`, `npm run build`,
`git diff --check`.
