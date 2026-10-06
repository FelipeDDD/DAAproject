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

Enabled in Payload only. `Q` places it 80 world pixels ahead of the accepted
facing direction. Defaults: cooldown 25s from cast, 500ms telegraph followed by
5s active, radius 56px and 5 HP/s. Damage is applied in 250ms intervals (1.25 HP
each), including the final interval. Friendly/self damage is excluded. Leaving
the foot-anchor circle stops damage on the next tick; returning resumes it.
Stationary positions are valid; moving samples older than 1s are excluded.
Server stalls never produce a catch-up damage burst. Initial fixed-distance
placement does not perform wall clipping or line-of-sight checks.

Match end, disconnect, owner death/life change and round/scene cleanup remove
instances. Death/respawn retains the owner's cooldown for the same round; Retry
starts fresh cooldowns. Old-round intents/snapshots are ignored/rejected.

Visual work belongs exclusively in `views/fire-zone/FireZoneView.js` and
`views/fire-zone/visualConfig.js`. The current placeholder is a subtle ground
circle: outline + center marker during telegraph, light fill during activity.
Radius/center/phase come from the relay. `SkillHud.js` displays `Q · Fire: READY`
or remaining seconds in a small tab attached to the player rail; style it with
`.pvp-hud-skills` / `.pvp-skill-hud` in `../pvp.css`.

For local testing, restart `npm run realtime:server` and reload both browsers.
The previously generated shared test build is unchanged; rebuild it explicitly
with `npm run build:test` when ready to share the new frontend.

Focused validation: `node --test tests/pvpSkills.test.js`, `npm run build`,
`git diff --check`.
