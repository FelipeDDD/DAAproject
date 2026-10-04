# Project context

**Read this file when:**

- starting a new Codex session;
- the local environment/configuration differs or is unclear;
- working on Convex, deployment, environment, architecture, or cross-machine issues;
- previous project decisions are needed.

Do not reread it for routine isolated edits when the current session already has sufficient context.

## Office3 safe / fictional computer (2026-09-29)

- New `office3Safes` stores a unique four-digit puzzle code per profile (not per class), with indexed transactional allocation, safe-attempt cooldown and computer shutdown cooldown. No data reset, scheduled jobs or polling. The code space is limited to 10,000 profiles. Guest progression remains non-persistent.
- The first five correct answers create the profile's safe row. Later visits require one; the backend reads this persistent marker and checks the answer count at unlock. The Office3 quiz and command window now open slightly taller, within the viewport.
- `Notes/cofre` in the authored Office3 map controls the safe footprint; `office3-safe.png` has closed/open frames, smooth per-texture filtering and a separate one-second green pulse. The local open appearance follows the profile's inventory.
- The fictional command prompt supports `dir`, `cd`, the authored joke files and Notepad. `very_safe_program.exe` closes it and imposes a ten-second persisted per-profile cooldown. No real commands/files execute. See `src/office3/README.md` for art and implementation details.
- The Office3 prompt uses reusable `src/terminal/virtualComputer.js` with per-PC configuration. Command parsing, nested virtual files, hostname/IP settings, DNS server versus local cache, ping, ipconfig, nslookup and hostname-sensitive `connect` services are simulated entirely on the client. PC-USER starts with stale Director DNS; `/flushdns` repairs it for that open session. Configured services may expose an `interaction` to the UI (Director recovery below); the parser does not contain puzzle/minigame logic. Port clue and a separate connect tutorial remain future work. Original Office3 quiz/safe progress still lives in Convex; ordinary simulated commands do not call it.
- The original Office3 computer stays at its existing puzzle position and retains the password, five-question quiz, files, safe and key flow. A separate `PC-User` Tiled point in Office3 opens the network investigation shell directly, with its own configuration in `src/office3/investigationComputer.js` and no files or folders inherited from the puzzle computer. `PC-director` in Office2 opens the Director security screens. These named markers resolve via `src/maps/namedMapMarkers.js` in any visible object layer. Optional `PC-USER-INTERACTION` and `PC-DIRECTOR-INTERACTION` rectangles define their E interaction areas; without a rectangle, each marked PC uses its circular fallback.
- The original Office3 computer keeps its green status light at `OFFICE3_MONITOR_STATUS` (122,107). The separate marked `PC-User` gets another green light at its Tiled point via `src/art/computerStatusLight.js`. Office2 offsets are adjustable through `DIRECTOR_PC_STATUS_LIGHT` in `src/office2/directorComputer.js`.
- PC-DIRECTOR requires explicit **VERIFY PHYSICAL KEY** (`director_access_badge`, never consumed). Opening only reads progress. Factor 2 is **Prostate Examination Confirmation**; either impossible answer fails, and two distinct failed choices persist local compromise. `directorWorkstations.attemptedChoices` records which of the two statements has been answered; the UI disables/grays it and leaves the other active, while duplicate submissions do not count twice. Remote recovery is an emergency fallback, never Factor 2. `directorWorkstations` stores profile-owned `physicalKeyVerifiedAt`, `failedAttempts`, `attemptedChoices`, `compromisedAt` and `recoveryCompletedAt`. Legacy `remoteApprovedAt` is tolerated but grants nothing; old compromised rows require explicit key verification once. DevTools `Fresh` clears the entire workstation row with boss rewards.
- After DNS repair, PC-USER `connect director.daa.local 8443` (also `host:port`) dispatches `DirectorRecoveryFlow`. One status query checks verified key + local compromise; a short local packet animation leads to the dinosaur runner in `src/office2/executiveRunner.js`. Four fixed obstacles, Space/Up/touch-button jumps, quick restart, then an automatic Gill Bates encounter (~14 seconds total). Frames/jumps/restarts make no Convex calls. One idempotent completion mutation validates the live profile/session in Office3 and saves recovery; a failed save can retry without replay. This client-side parody game is not an anti-cheat boundary. Closing cancels animation and ignores late UI responses. Reopening PC-DIRECTOR recognizes completion and offers **Open Director files**, through the same recovered-state gate. `Hacking_Class_Material` and its fictional connect jokes remain; the Director port clue is still deferred.
- Director files/album metadata live in `src/office2/directorFiles.js`. `Private` contains `Endlich_Ferien.album`, six joke text files and a decoy album using the same photos. The shared virtual parser adds `open <file>` (including quoted/qualified paths); `type` continues reading text and rejects albums. `PhotoAlbumViewer` in `src/ui/` displays one configured photo at a time with an inert terminal underlay, bounded navigation, missing-photo fallback and Escape/close focus restoration. The host delegates keyboard events and consumes gallery Escape through keyup so it cannot close the PC too. Images go in `public/assets/director/vacation/`; its README lists expected filenames. No images have been provided yet. Opening/navigating photos makes no Convex calls and introduces no security/progression changes.

## Director hidden-key investigation (2026-10-02)

- After Director authentication/recovery, reading root file `Lost key.txt` (`type`, direct filename or `open`) activates the investigation. File metadata carries `interaction: 'director-hidden-key'`; listing directories and opening the vacation album do not activate it. Existing Office3 quiz/files/safe and PC-USER DNS/recovery remain separate.
- `directorInvestigations`, indexed by `profileId`, stores `discoveredAt`, unique `investigatedClueIds`, a once-randomized `discoveryCount` (5 or 6), optional `keyFoundAt` / `doorUnlockedAt`, and `updatedAt`. Count is derived from the unique IDs. The first four inspections fail; the configured fifth/sixth unique inspection grants the key atomically. Neither repeated inspections nor rereading the note re-roll or grant another key.
- Canonical Tiled locations: `Notes/clue1` through `clue5` in `office3`; `Notes/clue6` in `office2`. `src/office2/directorInvestigation.js` derives **32 x 24 px** feet hitboxes, starting 32 px below the marker. Where paintings/furniture sit inside collision rectangles, the nearest small collision-free zone on the accessible side is chosen (at most 48 px sideways / 128 px below the marker). This avoids increasing the interaction radius or editing the maps. Tune `DIRECTOR_CLUE_HITBOX`, or set per-marker `interactionWidth`, `interactionHeight`, `interactionOffsetX`, `interactionOffsetY`; explicit Y disables automatic placement.
- `scripts/sync-director-investigation.mjs` validates exactly one of each clue and generates `convex/directorInvestigationLocations.generated.js`, including the existing secret wall's Tiled-derived position/radius. `predev`, `preconvex` and `prebuild` run it. After editing these map notes while servers are running, rerun the generator so backend/frontend geometry agrees.
- `DirectorInvestigationController` reads status once on Office2/Office3 entry, then consumes mutation results. Proximity/prompt checks stay local; no recurring calls, subscriptions or scheduled cleanup. Exiting/sleeping destroys the controller/prompt and ignores late responses. Explicit close-range inspection/unlock flushes current feet position once through `Presence.send(..., {forcePosition:true})`; regular movement throttling/heartbeats are unchanged.
- Backend `directorInvestigation.status / activate / investigate / unlock` validates token, matching live `playerId + sessionId`, room and proximity. Activation additionally requires the existing recovered Director workstation state. Guests cannot persist this quest, and stale/foreign sessions cannot advance it. Normal gameplay shows only `[E] Investigate`, flavor feedback and the existing item-acquired overlay; the hidden discovery threshold is not returned to the UI.
- Distinct profile-wide backpack key: `director_hidden_key`, **Director's Hidden Key**, using existing `assets/items/key-office.png`. It is a non-consumable quest/key item, not equipment; generic item claim cannot grant it. Office2 Key and the Director authentication badge/key remain unchanged. The secret wall now requires this new key instead of the old provisional badge access. `[E] Unlock` is explicit and persists; the key is retained according to existing key conventions, with `doorUnlockedAt` marking its use.
- No data reset/migration is required. The previous wall-open flag was local-only; a profile must now complete this quest for the persistent unlock. The wall art restores open state on reentry/login. **No destination/secret room exists yet**: unlock and visual opening are wired, but passage/loot must be connected when that map is authored. Current wall collisions are preserved. No new DevTools bypass/diagnostics or album asset integration was added.

## Director album / key preview frames (2026-10-02)

- The root Director filesystem now exposes `Endlich Ferien.album` alongside `Lost key.txt`; the older `Private/Endlich_Ferien.album` and decoy remain compatible. Seven original PNGs were copied (drafts retained) into `public/assets/director/vacation/`: `cover.png`, then `foto1.png` through `foto6.png`, preserving the authored order. Metadata and German captions are in `src/office2/directorFiles.js`; the gallery only shows a technical filename when one is explicitly configured. The existing HTML gallery loads only the selected photo, uses a compact navy/cream/gold theme, restores terminal input on Escape/Close, and never calls Convex or changes quest/security state.
- `key-office.png` contains three size variants in one sheet; displaying the entire image caused the triple preview. Shared `presentationFrame` metadata on Office2 Key and Director's Hidden Key selects the large left-hand variant. `src/inventory/itemPresentation.js` renders one clipped inline SVG image with a centered viewBox, preserving the original PNG. Pickup/examination and backpack preview share the crop. Ordinary cards without frame metadata retain their full PNG presentation, titles/descriptions and actions.

## Arena solo / DEV co-op foundation (2026-10-01)

- Arena map/physics identity remains `arena`; presence/chat/emotes/doors use
  `arena:solo:<playerId>` for solo or `arena:coop:<arenaLobbies ID>` for co-op.
  Solo keeps the existing local boss and retry/reward flow. Normal rooms and
  noncombat class checkpoints are unchanged. Bare legacy `arena` publications
  are normalized to the player's solo room; arbitrary solo-room entry is rejected.
- DevTools **Co-op Arena: OFF / ON** uses `daa-dev-coop-arena` localStorage and
  applies to the next entrance without reload. ON exposes Create/Join; OFF hides
  normal co-op controls but permits an explicit invitation/code without changing
  the flag. Production still cannot create/join on a backend without the existing
  DEV deployment gate; this local toggle never bypasses backend security.
- `arenaLobbies` stores host playerId, generation-bound participants, configurable
  capacity (4), waiting/started/closed state and a fixed 30-minute lifetime. A
  six-character invitation code uses `by_code` with transactional collision checks;
  raw document/player IDs appear only in DevTools diagnostics. Older development
  lobbies without codes remain readable but must be recreated to invite by code.
  Host starts with 1+ players; participants enter the same room. Host departure/expiry closes
  the encounter without host migration. Each created lobby schedules one bounded
  GC callback at expiry, with no permanent cron or idle worker. Queries/local
  expiry checks reject absent/expired hosts before physical deletion.
- The compact navy/gold entrance/lobby shows display names, classes, host badge,
  vacancies, count and Copy Code (Clipboard API or select + Ctrl+C fallback).
  Join trims/uppercases codes, supports Enter and friendly errors. `?coop=CODE`
  opens a prefilled confirmation after character selection, never autojoins, and
  consumes only that URL parameter without hardcoded domains. Leaving closes the
  local view immediately; host closure preserves a reason for guests and returns
  arena participants to their saved entrance. Generations/busy guards prevent
  stale callbacks and double-click creates/starts.
- Co-op is preparation only: **no local BossController, combat or rewards**;
  the arena shows a DEV notice and a leave button. Runtime flag changes do not
  terminate existing lobbies. SessionId stays private; all mutations validate
  playerId + session ownership. Subscription generations ignore stale callbacks.
- Deferred: separate realtime host/WebSocket transport, boss authority/AI/events,
  client combat interpolation, host migration and polished co-op gameplay.

## PvP test foundation (2026-10-02)

- Shared **TDM/Payload** scene `pvp-arena-test` loading `payload-map.tmj`, room `pvp-arena-test:<pvpMatches ID>`.
  DevTools **PvP Arena: ON** enables creation; **Open PvP Lobby** opens create/join. The
  existing arena entrance also has a DEV-only **PvP Arena (test)** link, usable by
  guests. Code-based joining does not enable the local toggle. Backend create/join
  retains the DEV deployment gate. Boss Solo/Co-op semantics are unchanged.
- `pvpMatches` owns a short code, host, generation-bound player membership and
  temporary match state. Teams A/B hold at most 2 players each, 4 total; 1v1, 2v1,
  1v2 and 2v2 may start. Host-only start locks teams/membership. Non-host departure
  removes only that participant; countdown/active matches continue with at least
  one member per team (dead players awaiting respawn still count). Empty teams
  end with `team_empty`; host departure ends with `host_left`, without migration.
  Each match has one 30-minute GC callback, no permanent cron/polling/history.
- Rules live in `src/pvp/config.js`: score limit **5**, time **180s**, countdown
  **3s**, respawn **2.5s**, HP **100**, test projectile damage **25**, cooldown **400ms**.
  `matchState.js` owns waiting/countdown/active/ended, friendly-fire rejection,
  kill/death attribution, life generations, respawns and winner/draw. Deadlines
  are checked logically even before any write; local UI clock ticks make no calls.
- Host departure recovery (2026-10-04): shared `reconcileParticipants` detects
  missing hosts even after an ordinary ended round, preserves scores/winner and
  changes the exit reason to `host_left`. A new departure gets its own 10-second
  return countdown; an existing interruption countdown remains stable. Convex
  match subscription stays alive until arena exit, independently of realtime
  movement cleanup. Delayed same-round results cannot erase host departure or
  backdate it to a victory; the HUD freezes match time at `endedAt`. Existing
  `PvpReturnFlow` returns/cleans up once, with no new polling or timers.
- Empty-team recovery also applies after score/time victory: when the last
  opponent leaves, the surviving host gets a fresh 10-second return countdown
  and can reuse the same lobby. Scores/winner are preserved until lobby reset;
  delayed victory snapshots cannot restore departed members or erase recovery.
- `PvpMatchClient` retains Convex lobby snapshots and discrete lifecycle commands.
  Client collision only requests a realtime hit; the relay validates it and owns HP
  (see authority section below). This is still **not complete anti-cheat**.
  Arena membership/metadata
  still use room Presence; movement now follows the separate adapter below.
- PvP movement (2026-10-04): `PvpMovementClient` uses the existing realtime factory
  and adapter, with a dedicated `pvp-movement` message (playerId, x/y, direction,
  vx/vy, moving, sampleSeq, life; envelope seq/sentAt and server-authored senderId).
  Room `pvp-<Convex matchId>-<round>` isolates matches and reused documents. Input
  stays local/immediate; remote sprites reuse `RemoteSnapshotBuffer` at 100 ms.
  Self, stale sequences, unknown peers/participants, other rooms and old-life
  movement are ignored. Reconnection resets peer bindings/buffers. Exit/end/sleep/
  shutdown disconnect and remove listeners. `src/pvp/movementConfig.js` owns the
  movement Hz (20 initially, tested at 25/30/40/50); frame scheduling skips overdue
  slots. Convex receives only the entry position and existing heartbeats/leases,
  while retaining lobby, teams, metadata and a mirror of relay combat state.
  Default `/pvp-realtime` uses the Vite WS proxy to 8787, including WSS through
  the existing single Quick Tunnel with `VITE_QUICK_TUNNEL=true`; optional
  `VITE_REALTIME_URL` selects a separate endpoint. See `src/pvp/README.md` for
  two-client/tunnel steps and local-only relay authentication.
- PvP projectile visuals (2026-10-04): `PvpProjectileClient` shares the movement
  adapter's existing socket/room. Reliable `pvp-projectile-spawn` publishes UUID,
  playerId, life, shotSeq, x/y, vx/vy and ttlMs; `pvp-projectile-destroy` removes
  the same visual on shooter impact/expiry. Local shots render before sending;
  remote shots simulate the trajectory/collisions locally and never submit hits.
  Peer/participant/life/round filters, bounded tombstones and sequence checks
  reject echoes/replays. Relay clock-offset estimates shorten delayed visuals'
  lifetime; no browser clocks are compared. End/leave/disconnect remove visuals
  and listeners. Projectile replication adds no sockets/timers or Convex calls.
  Damage/HP authority now uses the relay below. Restart the relay after updating
  its protocol, reload both browsers; existing tunnel/proxy configuration applies.
- PvP hit authority (2026-10-04): start **local Convex before realtime:server**.
  `scripts/pvp-convex-bridge.mjs` reuses the database-transfer local/loopback/instance
  guard; local admin credential stays in Node, never the frontend. Cloud/prod are
  refused. `pvp-authorize` validates playerId/sessionId/round; one internal reactive
  match subscription per room follows membership, teams and presence leases.
  `PvpDamageAuthority` validates projectile ownership/TTL/replay/life, active enemy
  target in the same arena, fixed speed/cooldown, origin and first-body/cover
  intersection against current realtime positions and authored Collision.
  Client `pvp-hit-attempt` carries only projectileId/targetId/targetLife; fixed
  server damage is 25. Immediate HP comes from versioned `pvp-combat-state`;
  `PvpDamageClient` rejects stale HP/life and overlays older Convex snapshots.
  Public `pvpMatches.hit` is disabled. Each accepted hit is mirrored by one
  serialized, internal `mirrorRealtimeCombat` snapshot with `damageRevision`;
  combat death/respawn/score/winner now belong to the relay, not Convex.
  Lobby ownership/departure and the existing host recovery remain intact.
  Persistence failure stops combat, without client fallback. No new client timer,
  socket or polling. One relay per local deployment; no production setup/deploy.
  No lag compensation: latest-position checks allow 12 px body/80 ms trajectory
  tolerance; high latency may reject visual hits. Movement remains client-reported.
- PvP death/respawn correction (2026-10-04): relay clock reconciliation keeps
  `advanceMatch`'s NEW participants (previously it restored dead/old-life rows).
  `life` increments once at the existing 2.5s deadline; the same room/player/session/
  socket/listeners stay alive. Authoritative HP/life updates reach movement and
  projectile adapters immediately, even before a delayed browser Convex snapshot.
  Per-life movement/shot high-water marks accept new-life sequences; old/future
  rejected movement cannot poison relay caches. Transport envelope seq stays global.
  Respawn resets lastShot/lastHitAt, local firing serial/cooldown and movement buffer.
  Already registered flights survive shooter death/respawn and can cause posthumous
  kills; only their original TTL/ownership/target life/room/cover/consumption govern
  hits. Dead shooters cannot create NEW flights. Target life is captured at spawn,
  so a previous-life flight cannot hit a newly respawned target. Distinct flights
  may land out of order. No extra client timers, subscriptions or reconnects.
  Relay logs death/respawn,
  first post-respawn movement/spawn/hit and explicit rejection reasons; browser
  logs use the existing `daa-pvp-movement-debug` flag. Restart relay/reload both
  clients after changes; keep local Convex dev running. Boss/solo unchanged.
- PvP full combat authority (2026-10-04): `PvpDamageAuthority` owns HP,
  death/K/D/team score, 2.5s respawn with HP 100 and life+1, score-limit victory
  (5), 180s timeout and final result. One local deadline timer per match handles
  countdown/respawn/timeout/presence expiry without traffic or polling; end/leave/
  close cancel pending respawns. Already-fired shots survive death until TTL/hit/
  cover/end; double kills award both points while both hits are valid in active
  play. Once victory ends the match, later hits cannot add points.
  Versioned `pvp-combat-state` includes full scores/timing/result and fighter state,
  plus explicit death/respawn/match-ended events. Clients never advance combat by
  their own clock; local timers only render clocks and expire lobby membership.
  Convex `acquireRealtimeCombat` binds one authorityId per round transactionally;
  concurrent joins share one initialization/subscription. Internal
  `mirrorRealtimeCombat` copies sequential snapshots, acknowledges duplicate
  revisions without writes and preserves concurrent lobby departure. It never
  computes damage/death/score/respawn/victory. Legacy public hit and internal
  hit-only mirror are disabled; public force-finish is refused. DEV End Match
  goes through authenticated `pvp-end-request` (host only).
  Convex keeps create/join/teams/session ownership, world presence, lobby
  departure/return/expiry and combat persistence. No profile rewards added.
  Start local Convex, restart relay, reload clients and create a fresh lobby.
  Active-match relay failover is deliberately unsupported: after restart/loss,
  recreate the lobby rather than transferring a bound round to another authority.
  No lag compensation/rollback or authoritative movement physics. Focused tests:
  `pvpLifecycle`, `pvpDamage`, `pvpRespawn`, `pvp`, `pvpMovement`, `pvpProjectiles`.
- PvP Retry (2026-10-04): final relay snapshots carry `retry` with a fixed 10s
  deadline, connected/lease-valid participant IDs and individual votes.
  `PvpRetryCoordinator` on the relay owns one decision/timer per ended round;
  authenticated `pvp-retry` is idempotent and round-bound. Unanimity resolves early;
  otherwise only voters survive the deadline. Leave/disconnect/lease expiry remove
  participants from unanimity. The host has no special vote.
  The relay waits for queued combat mirrors, then internal `advanceRealtimeRound`
  validates remaining sessions and saves the same match/code with round+1,
  zero scores/K/D/shot counters, HP100, life+1 and cleared respawns/result/authority.
  Opposing teams start a fresh 3s countdown +180s match; one survivor or a single
  team returns to waiting. Teams persist; lobby host transfers only if needed.
  Zero voters delete the abandoned lobby and all clients leave normally.
  `retryDeadline` prevents legacy `returnToLobby` competing with the relay;
  `retryFromAuthorityId` makes the generation transaction idempotent.
  `pvp-round-transition` hands off clients before gameplay resumes. They reuse the
  same socket/adapters/listeners, join the next round's room and reauthenticate;
  the old relay subscription/timers are closed and one new authority is acquired.
  Interpolation/projectiles/sequence caches reset, players return to team spawns,
  and old room/round/life/revision messages cannot alter the next round.
  Convex echoes/removal errors during the decision cannot bypass the relay handoff.
  Relay errors retain the existing safe departure countdown; no polling, jobs,
  boss/solo or profile progression changes. HUD shows Retry/Leave, confirmations
  and countdown. Restart relay/reload clients for this protocol change.
  Focused regression suite: `tests/pvpRetry.test.js`, including repeated real
  two-WebSocket rounds, no votes, disconnect, same-team/solo waiting and Leave races.
- Payload MVP (2026-10-04): DEV PvP lobby offers **Create TDM Lobby** and
  **Create Payload Lobby**. `pvpMatches.mode` accepts `tdm | payload`; shared
  membership/session/team/combat/Retry lifecycle remains unchanged. Mode tuning
  and HUD labels live in `src/pvp/gameModes.js`; `modeAuthority.js` / `modeView.js`
  select separate objective rules/presentation, with no Payload controller for TDM.
  `src/pvp/payload/config.js` owns speed **10 px/s**, radius **64 px**, objective
  cadence **100 ms**, respawn **3s**, time **180s**. TDM keeps 2.5s respawn/5 kills.
  `PayloadRoute/payload-route` is an optional authored Tiled polyline, ordered
  BLUE/A first -> RED/B last, with `initialFraction` defaulting to 0.5. Until it is
  authored in the new map, the isolated fallback in `PVP_MAP_LAYOUT` connects the
  two team base markers; client and relay use the same `routeFromMap` helper.
  `PayloadAuthority` uses existing authenticated realtime positions, current
  life/HP/presence/connection and Euclidean radius. A alone pushes towards RED,
  B alone towards BLUE; both contested, none neutral; escorts never stack speed.
  Stale moving samples cannot continue pushing. Physical arc-length progress
  follows bends/clamps endpoints. Endpoint delivery selects the pushing winner;
  kills only update K/D/score, never end Payload. Timeout without delivery draws.
  The shared relay timer drives the objective; versioned `pvp-combat-state` adds
  optional `payload` with x/y/distance/routeLength/radius/control/contested/moving.
  Updates use the same socket at up to 10Hz plus immediate control changes.
  Objective ticks do NOT invoke Convex; state is mirrored only with existing
  combat/lifecycle writes. `pvpMatches.payload` is optional persistence metadata.
  `PayloadView` draws route/cart and gray/blue/red/amber ground circle using
  Phaser Graphics, with visual interpolation only and configurable visibility.
  No image assets/new collision bodies. Retry clears saved objective, creates a
  fresh centered authority, resets visuals/spawns, and rejects old room/round/life
  events. No checkpoints, overtime, sabotage, repair, buffs or dynamic respawn.
  Focused tests: `tests/pvpPayload.test.js` plus shared TDM/lifecycle/Retry checks,
  including two real WebSocket clients completing delivery and the next round.
  Restart relay/reload clients with local Convex running after this change.
- PvP main map (2026-10-04): `src/pvp/config.js` selects
  `public/assets/maps/payload-map.tmj` for both TDM/Payload, the walking inspection
  scene and realtime relay. Logical scene/room prefix `pvp-arena-test` remains
  stable for session/membership compatibility; the old physical map is unused.
  Current map is 46x34 tiles at 32px = 1472x1088 world pixels. Physics/camera bounds
  derive from Tiled dimensions with player follow. `PVP_MAP_LAYOUT.cameraZoom`
  applies to both the live `pvp-arena-test` scene and walking `payload-map`
  inspection scene; other maps use their own camera zoom settings.
  Background images retain authored position/size; no PNG/TMJ/collision edits.
  `PVP_MAP_LAYOUT` owns Notes marker names: A/blue `spawnBlue` currently
  (1323,495), B/red `spawnRed` (130.25,495.75), facing inward. Teammates use
  temporary offsets (0,0)/(0,32), shared by scene, relay, respawn and Retry.
  Prefer numbered points `Spawns/teamA_spawn1`, `teamA_spawn2`,
  `teamB_spawn1`, `teamB_spawn2` when ready; these override Notes/offsets.
  Optional string property `direction` on a marker overrides default facing.
  Temporary Payload route runs blue -> red, starts midway at (726.625,495.375).
  To replace it, add `PayloadRoute` object layer + unrotated `payload-route`
  polyline; no scene/relay code change needed. Keep its path clear of collisions.
  Layer convention: image `background` underneath (-3); image or tile layer
  `Overlay`/`Foreground` (case-insensitive) above avatars by default
  (map pixel height + 100). Numeric layer property `depth` overrides this;
  existing `overlay` keeps 1200. Tile `Floor`/`Decoration`/`Walls` keep
  current lower depths. Only exact `Collision` object layer creates blockers;
  `Notes`, `Spawns`, `PayloadRoute` points/polylines do not. Rotated Collision
  rectangles/polygons use the same one-pixel scanline conversion on client/relay,
  honoring Tiled rotation around x/y; no collision objects were changed. Images remain
  under `public/assets/maps/`, referenced relative to the TMJ. Restart
  `npm run realtime:server` after map edits, then reload both clients: the relay
  reads collisions/spawns/route at startup, while clients load the same TMJ.
  Optional Pac-Man flanks use a `Teleport` object layer with unrotated rectangle
  objects `top` and `bottom`; both markers now exist in the map. Put each in
  its safe upper/lower passage and keep the arrival foot body clear of Collision. Areas are
  triggers, not blockers. A 650 ms cooldown and a lock until exiting the destination
  prevent ping-pong. One normal realtime movement sample carries a one-shot
  `teleport` flag, clearing remote interpolation for a snap. No TMJ was edited.
  Entry consistency correction: `PVP_MAP_DEFINITION` (id/file/revision) is the single
  physical map source; Convex publishes `arenaMap` to host/joiners/relay/Retry.
  Entry/Retry and relay authorization reject missing/mismatched definitions;
  `pvp-authorize` includes mapId/mapRevision so old clients cannot silently join.
  `PvpMapScene` shares map loading and teleport triggers between live PvP and
  DEV inspection. Cache keys include physical identity; new entry reloads slept
  scenes/map caches (DEV cache-busted URL). Retry keeps that same map and resets
  the trigger lock. The old TMJ is an unused reference, with no runtime fallback.
  DEV inspection now has an accepted regular presence room. Both narrow authored
  teleports center feet inward and synchronize Arcade offsets/previous positions,
  avoiding wall overlap or postUpdate drift; map/collision objects were untouched.
  Restart local Convex watcher/realtime relay and reload both browsers for the
  new map contract. No production deployment or localStorage reset is required.
- PvP combat bootstrap (2026-10-05): relay discards pre-authorization movement.
  On `pvp-authorized`, the movement adapter publishes one reliable current pose
  through its existing sequence/socket before the damage listener enables fire;
  this bypasses the next movement deadline and is idempotent per connection/round.
  Arena fire requires authorization, an active relay snapshot and that pose sent,
  preventing local shots whose spawn was never registered during initialization.
  Normal cadence, combat rules, life/HP and respawn remain unchanged. Diagnostics
  cover initial player registration, match activation, first movement/spawn/hit
  per life, and rejection reasons with position source/age, HP, life, ownership,
  room and round (no secret sessionId). Focused tests reproduce the discarded-pose
  window and verify first hits in both directions with two actual sockets, plus
  initial-vs-respawn state equivalence. The reported intermittent browser case
  still needs a manual retest; do not assume every rejection has this cause.
- Compact HUD shows scores, time, team, HP/K/D, countdown, respawn and final result;
  **Leave Arena** returns to the saved entrance, with host-only DEV End Match.
  The dedicated scene reuses Tiled loading/player visuals but creates no inventory,
  quest, study, boss or reward controllers. PvP rooms are excluded from persistent
  class checkpoints. No profile progression or inventory tables are written.
- Lobby cards highlight the local team in blue (A) or warm red (B), with **YOUR
  TEAM** and a separate **YOU** marker on the local row; HOST remains independent.
  Interrupted matches show their reason and a **10-second return countdown**.
  `PvpReturnFlow` uses the scene clock and one `returnToLobby` command: survivors
  reuse the same code/document if the host remains; missing/closed/expired lobbies
  return to the saved pre-PvP map. A stalled return request falls back after five
  more seconds; late results cannot travel twice and release unused membership.
  This remains the fallback for relay failure/expired lobbies; ordinary realtime
  ends now use the shared Retry/Leave deadline described above. No polling is added.
- An optional `pvpMatches.round` (legacy default 0) increments when an interrupted
  round returns to waiting. Round/session/life checks reject delayed combat,
  end and leave commands. Return resets fighters/scores once, removes departed
  members, and blocks starting until survivors have left the arena presence room.
  Public member lease deadlines permit local disconnect detection without new
  calls; `finish` persists the projected interruption through a discrete command.
- Local **direct** projectiles now collide with teammates and are consumed without
  a hit request, damage or score. This adapter has no AoE attacks; boss area attacks
  are untouched. Future PvP AoE needs a separate target filter, not body blocking.
  Remote projectile visuals are replicated through the adapter above. No Vivaldi
  Alt+Tab investigation or modal keyboard changes were made for this PvP polish.
- Deferred: movement authority, lag compensation/prediction, active-match host
  migration, full anti-cheat and CTF.
  No deployment or existing data reset is needed to keep developing; apply the new
  schema/functions only to the intended local/dev backend when running the test.

## Local development commands

### Realtime Lab (isolated development experiment)

- Peer RTT (2026-10-03): `peer-ping` / `peer-pong` are directed to same-room peers through the relay, with server-authored sender identity. The existing one-second probe timer samples each peer; immediate responses bypass simulated gameplay delays/loss. Only sender `performance.now()` measures elapsed time. Correlation rejects wrong/duplicate/out-of-order/expired pongs (10 s timeout); disconnect/reconnect clears pending state. Panel shows separate **Server RTT** and per-peer **Peer RTT** (current, rolling 30-sample average, mean successive variation). Copy Benchmark adds per-peer pooled `peerRtt` distributions plus per-run data; samples before benchmark start are excluded, missing timings are null. Existing `aggregate.rtt` remains Server RTT for JSON compatibility. Restart the realtime server and reload both tabs after this protocol change; tunnels need no restart if ports remain unchanged.

- Internet tests: editable **Socket URL** accepts `ws://` / `wss://`, defaults to `ws://127.0.0.1:8787` (or `VITE_REALTIME_URL`), and restores the last valid URL from browser-local `realtime-lab.socket-url`. Connect/Reconnect uses the entered URL; **Active Socket** shows the actual connection rather than unsaved edits. Storage failure does not prevent manual connection. Use `cloudflared tunnel --url http://127.0.0.1:8787`; paste the generated HTTPS URL directly into Socket URL on both clients; HTTP/HTTPS are converted to WS/WSS automatically and the final URL is saved. Existing WS/WSS URLs remain unchanged. For a friend without the repo, also tunnel Vite on 5173 and share that HTTPS URL plus `/tools/realtime-lab/`. In Vite's PowerShell terminal set `$env:__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS='.trycloudflare.com'` before `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`. This allows only tunnel hosts without enabling the existing Convex proxy. Both clients must use the same socket URL/room. Stop tunnels with Ctrl+C after testing; URLs change on a new Quick Tunnel. No `.env.local` changes or deployment needed.

- Benchmark visibility distinguishes `senderBackgrounded` and `receiverBackgrounded` per run and in JSON counters. `foregroundAggregate` filters **only sender visibility**; receiver-hidden runs retain valid foreground sender timings. Generic background flags remain compatibility aliases, not aggregation criteria. Only `document.visibilityState`/`visibilitychange` affects classification; scrolling does not. Receive-to-render requires an actual first canvas draw: hidden receivers or expired/capped visuals can legitimately have count 0 with null timings. Older exports are not rewritten; use their local sender visibility for manual browser comparisons.

- Repeatable benchmark is lab-only (`src/realtime/lab/Benchmark.js`): 10/50/100 runs; Standard 10 ×100 ms, Stress 20 Hz 20 ×50 ms, Stress 50 Hz 50 ×20 ms. Each run waits for expected peer summaries (8.5 s timeout with missing reports marked **unknown**), then pauses 500 ms. Cancel/disconnect stops the chain; cancellation preserves the connection and partial report. Copy Benchmark stays local and includes per-run samples, metadata, pooled percentiles and foreground-only aggregate. Interval-jitter percentiles mean absolute deviation from the requested interval; per-run standard deviation remains available separately. RTT is the rolling probe average at run end. Benchmark visuals use the same projectile path but are capped at 24 with a 500 ms visual lifetime; normal manual shots are unchanged. Receiver summaries carry at most 50 values per timing series. Restart `npm run realtime:server` after protocol edits (not hot-reloaded); reload both lab tabs. Keep receiver settings fixed and avoid simultaneous benchmark senders for comparisons.

- Browser timer APIs must be called through global wrappers (`globalThis.setTimeout` / `globalThis.clearTimeout`), not stored as native methods on Lab/transport instances. Node timers tolerate a foreign receiver and can hide browser-only invocation failures. The UI regression test models strict receiver checks; connection status stays beside Connect and initialization explicitly shows **Ready**.

- Auto Fire / Pulse Generator is lab-only: 50/100/200/500 ms presets (custom 50–2000), 10/50/continuous shots and **Burst Test** (10 ×100 ms). Manual and auto shots share the same spawn/simulation/relay path; only auto bypasses the manual 150 ms cooldown. One deadline `setTimeout` uses `performance.now()` and an anchored intended schedule. A stall skips obsolete slots, emits at most one shot per callback, then resumes the original time grid; finite runs still emit their requested count with contiguous shot sequences. Skipped slots and worst wake lateness are reported separately from emitted-shot schedule error. OFF stops generation immediately; previously fired messages may still arrive through simulated/network delay. Disconnect/close cancels timers and queued simulation work; reconnect resets the experiment.
- Pulse summaries distinguish sender browser scheduling, receiver application-arrival intervals (including lab impairment), and receiver arrival-to-first-draw delay. Jitter is population standard deviation; no cross-browser `performance.now()` subtraction is used. Missing sequence counts are provisional until completion, count missing tail events, and never imply TCP packet loss. Control start/end/report messages bypass simulation; receiver summaries settle for both sides' maximum configured simulated delay plus 500 ms (cap 6.5 s). Exceptionally late messages can miss that cutoff. Detail/dedup storage is bounded to 512 shots; very old reordered messages in continuous runs are ignored. Hidden-tab changes produce a warning for each affected sender/receiver test. **Copy Results** exports local JSON with user agent, transport/settings/RTT, summaries and available per-shot scheduled/fired/sent/received/rendered timestamps; receiver summaries are relayed only to room peers, with no external analytics or persistence.

- Run `npm run realtime:server` and `npm run dev` in separate terminals. Open DEV Tools → **Open Realtime Lab**, or `http://localhost:5173/tools/realtime-lab/` directly; use two tabs with the same room ID. The standalone lab needs no Convex. The game/DevTools path still needs its normal local backend/login.
- `scripts/realtime-server.mjs` is a test WebSocket relay, default `127.0.0.1:8787`; override `REALTIME_HOST` / `REALTIME_PORT` in its shell. Lab rooms remain unauthenticated; PvP combat uses local Convex authentication/authority described above. Stop it with Ctrl+C. Lab supports `wss://` tunnels; HTTPS pages require WSS. No tunnel was created here.
- `src/realtime/config.js` centralizes defaults: 20 Hz, 100 ms interpolation, 15-second ping/pong sweep (dead peer removed on a missed next sweep), 8 KiB messages, 120 messages/client/second, 16 clients/room, 64 total, 64 KiB outbound backpressure. JSON/type/payload/room/sequence checks and server-generated IDs are enforced; only authenticated PvP has hit validation, not authoritative movement physics.
- `RealtimeTransport`, `WebSocketTransport`, `realtimeMessages`, `realtimeStats` and `createTransport` are independent of Phaser/UI/Convex. Reliable/unreliable APIs currently both use ordered WebSocket; a future WebTransport/WebRTC adapter implements the same interface/envelope and is selected in the factory. A compatible server endpoint is also required; no additional protocol is implemented yet.
- Lab-only canvas controls: WASD/arrows, Space or click to shoot; 10/20/30/60 Hz; interpolation ON/OFF and configurable buffer; per-direction simulated delay/jitter/application-message loss; optional 10 Hz numbered-state experiment. Simulation affects only lab gameplay messages (including reliable projectile events), not membership or RTT probes, and never TCP. Local input remains immediate.
- Remote snapshots interpolate linearly on local arrival timestamps, reject stale sample sequences, hold on underrun, and use bounded buffers. Projectiles use one spawn event with ID/origin/velocity/server-clock-estimated start/TTL, then local simulation; destroy events/TTL remove them and IDs are deduplicated. Clock offset uses welcome/probe timing and is approximate, not synchronized physics authority.
- Stats show connection/identity/room, latest and 30-sample-average RTT, successive-RTT jitter estimate, rolling one-second message/JSON-byte rates, configured simulation loss and stale numbered updates. They do not measure packet loss or TCP head-of-line blocking. Reconnection backs off 0.5–10 seconds, rejoins once, and clears transient entities/queued simulation callbacks.
- Vite serves this HTML only in development; it is not a production build entry and has a DEV guard. No PvP/co-op combat, current Presence, persistent state or Convex function was changed. Live two-client transport tests pass; browser visual playtesting is still required.

Run in separate terminals from the repository root:

```powershell
npm run convex  # local Convex backend + watch/push local functions
npm run dev     # Vite frontend
```

The local Convex CLI may ask whether to link the anonymous deployment to an account; answer `n` to keep it local and unlinked. Current package script pins backend `precompiled-2026-09-21-0cf49cb` to match the existing local database. Vite is at `http://localhost:5173`; local Convex HTTP/site ports are 3210/3211.

## Convex: local, dev, and prod

- **Local:** current machine uses `CONVEX_DEPLOYMENT=anonymous:anonymous-DAAproject`; CLI reports `[Local] Port 3210`. This is a local anonymous backend, not cloud `dev`.
- **Cloud dev:** the previously linked cloud deployment was `dev:kindly-butterfly-946` (`https://kindly-butterfly-946.eu-west-1.convex.cloud`). It is not the current `.env.local` target.
- **Production:** separate cloud deployment and data. Local commands above do not deploy to production. Convex backend deployment and Vercel frontend deployment are separate operations.

## Machine-specific environment and local data

`.env.local` is ignored by Git and machine-specific. Never copy it between computers or commit it. On this machine it points Vite at `http://127.0.0.1:3210` and the Convex site URL at `http://127.0.0.1:3211`. Recheck all deployment values when changing machines.

Local Convex config/database/storage are under `.convex/local/default/`, especially `convex_local_backend.sqlite3` and `convex_local_storage/`. This directory contains persistent local test data; do not delete or recreate it casually.

On 2026-10-02 the disposable local deployment was reset with explicit approval. After confirmation that the fresh deployment works, `.convex-old-20261002-233558/` was deleted with explicit approval. Fresh schema/functions/indexes initialized on the same anonymous deployment name and loopback ports, with new local credentials and all 27 application tables initially empty. Initial size: ~0.87 MB SQLite + ~0.70 MB modules, versus ~324 MB + ~145 MB before. Old browser tokens/profiles are invalid: reload and register again; `.env.local` URLs and the pinned backend version remain unchanged. No cloud deployment or data was modified.

## Transfer local database between machines

Keep `npm run convex` running; close the game before restoring. Both commands verify the local configuration and running loopback instance, then pin the installed Convex CLI to that URL/key. Cloud/prod targets and URL overrides are rejected. `db:push` exports logical application data plus file storage (not SQLite/history) and atomically replaces `convex-latest.zip` only after a successful export. `db:pull` makes a local `backups/convex/convex-before-restore-*.zip` safety backup, then imports with `--replace-all` and reload is required. Deployment environment variables/functions are not transferred; initialize the other machine's local backend first.

Set `CONVEX_BACKUP_DIR` in each machine's `.env.local` or shell to a shared/synchronized folder. Without it, snapshots stay in Git-ignored `backups/convex/` and must be copied manually to the other machine. Relative paths resolve from the project root. Snapshots contain accounts/progress; do not commit them. Safety backups are retained until manually removed.

End work on the authoritative machine:
```powershell
git push
npm run db:push
```
Start on the other machine, after the shared ZIP finishes syncing:
```powershell
git pull
npm run db:pull
```
This is snapshot replacement, **not merge/sync**. Pull the latest snapshot before database edits and push a new one when finished. Simultaneous divergent edits are unsupported. Use the same current code/schema on both machines; incompatible snapshots fail import. Once Convex starts an import, it continues server-side even if the CLI is interrupted: check completion before retrying. The local round-trip test restored a changed test profile's original displayName, ID and session successfully.

## DEV_TOOLS_ENABLED

`convex/bossProgress.js` enables boss Dev Tools when the deployment has `DEV_TOOLS_ENABLED=true` (or its configured Convex URL is loopback). Set the flag only on a local/test deployment. Never enable it on production. The flag is stored per Convex deployment, not in Vite's `.env.local`.

## Live identity (character separation)

- profileId: persistent account; playerId: independent live presence ID (fresh Convex document ID on every claim); sessionId: ownership generation; characterBaseId: class/art; transitional characterId: selected base ID for compatibility, not a unique slot.
- Presence lifecycle, quiz seating, chat and emotes use playerId + sessionId. Room changes retain playerId. Claims enforce the configurable online player capacity, not per-base occupancy.
- Legacy rows remain usable; omitted playerId on legacy Presence mutations resolves only legacy IDs, never a new claim. Study/Challenge validate playerId + sessionId and can retain characterId compatibility arguments without using them as persistent ownership.

## Character identity phase 3

- profileId = persistent account; playerId = unique live presence; sessionId = ownership generation; characterBaseId = class/art; characterId = a compatibility field, never a live quiz/emote key.
- Multiplayer quiz participants, host, answers, scores and timeouts use playerId. Quiz chairs are generic authored seats. Emote rows/state/rendering use playerId; a new claim cannot inherit a prior emote. Chat stores authorPlayerId and a displayName snapshot alongside legacy attribution.
- Development gameplay/statistics data is disposable until profile-owned architecture is finalized. Do not auto-reset. A later manual one-time reset may clear quizLobbies, quizAnswers, quizCleanupWorker (including its scheduled job), emoteEvents, quizPerformance, quizAttempts, quizQuestionHistory, soloQuizRuns, itChallengeRuns and itChallengeHighScores. Old quiz lobbies without hostPlayerId are intentionally not loaded by the new UI and require that reset.
- At this phase the menu still used exclusive synthetic slots; that temporary behavior was removed in character phase 5 below.

## Character identity phase 4

- Quiz attempts, aggregate performance, question history, Solo Study runs, IT Challenge runs and high scores are written/read by `profileId`. Active Study/Challenge calls authenticate `playerId + sessionId`; runs also bind to that live session. Changing base preserves profile statistics/history/high scores. Guest quiz participation stays live-only; guest Study/Challenge still require sign-in and write no persistent rows.
- `bossProgress`, victory receipts and `characterItems` remain profile-owned. New boss/reward rows do not write a legacy slot ID; new item rows record only optional `characterBaseId` attribution. Item compatibility uses the selected base. The later class-specific loadout foundation below supersedes the former profile-wide active-item state.
- Legacy quiz/statistics development rows without `profileId` are deliberately not migrated or read. Before pushing this schema to a development deployment that contains old data, back it up and plan a **local/dev-only** manual reset of `quizPerformance`, `quizAttempts`, `quizQuestionHistory`, `soloQuizRuns`, `itChallengeRuns` and `itChallengeHighScores`. Do not reset production or `.convex/local/default/` automatically. Optional schema owner fields temporarily permit old rows to coexist until the manual cleanup; new writes require `profileId`.
- Safe manual reset procedure, if needed later: verify `.env.local` names the local deployment and loopback URL; run `npx convex export --deployment local --path phase4-before-reset.zip` to back up data; open `npx convex dashboard --deployment local` and remove rows only from those six tables. Verify the dashboard target says local before deleting anything. Keep the export outside Git. Never run the reset against production.
- Before character phase 5, `characterId` was still treated as a transitional exclusive slot. No persistent quiz/statistics owner is a character slot.

## Character identity phase 5: duplicate bases and generic quiz seats

- CharacterMenu lists only the four real bases (`michael`, `jassine`, `sarina`, `felipe`). `felipe-2`/`michael-2` synthetic options are removed. `baseCharacterId()` still resolves legacy synthetic IDs for old rows/art compatibility.
- Multiple live players may select the same base. Claim APIs prefer `characterBaseId`; `characterId` is still accepted as a compatibility alias. Each claim creates its own playerId and sessionId; the transitional `characterId` field on new player rows equals the selected base and is not exclusive. `players.availability` returns a player roster plus the independent max capacity. `MAX_PLAYER_CAPACITY` in `src/multiplayer/playerCapacity.js` defaults to 10; backend claims are authoritative and count active players, not bases.
- Quiz chairs are generic stable `seatId`s from Tiled. Runtime seat parsing ignores any old authored character/class custom property; generated `quizSeatDefinitions.js` contains only generic seat IDs and coordinates. Lobby `seatAssignments` maps `{playerId, seatId}`; same-base players can join but cannot occupy the same seat. Current classroom capacity is limited by its four authored chairs.
- Stale player sessions are removed from the reactive current-lobby seat assignment view. Quiz participants, answers, scores and emotes continue to key by playerId; class attribution remains characterBaseId.
- Remaining `characterId` usage is compatibility/session validation and the selected base field carried by existing APIs, plus legacy profile-data migration/indexes. It no longer enforces online exclusivity. Old Tiled chair metadata can remain in the map source because runtime ignores it; the generated definitions are generic.

## Class-specific loadout foundation

- `characterItems` remains the profile-wide ownership table (`profileId + itemId`); `characterBaseId` there records acquisition attribution only. New item rows do not use `active`. Legacy `active` fields are ignored, not migrated automatically.
- `characterLoadouts` stores one current `activeItemId` per `profileId + characterBaseId`, indexed by both fields. A class with no row has no active item. One active item matches the current UI; additional slots and class skills are deferred. Item cooldown remains on the profile-owned item row.
- `characterItems.forProfile` derives `active` from the selected base's loadout and owned item. `setActive` authenticates the profile token and the live `playerId + sessionId`, checks that the player belongs to the profile and selected base, checks ownership and compatibility, then updates the loadout and the live `players.activeCharacterItem` mirror in one mutation. Stale sessions cannot change a loadout.
- `players.claim` restores the selected base's saved active item into the new live player row after verifying that the item is owned and compatible. `players.update` preserves this backend-owned mirror instead of accepting the client's movement snapshot as equipment authority. Guests keep their temporary, non-persistent presence and have no loadout rows.
- The Director reward's `bossProgress.equippedSkin` is a separate cosmetic preference and remains profile-wide; this change does not alter reward unlocks or combat rules.
- For legacy/dev data, an old `characterItems.active` value does not activate a class. Re-equip the item once per class to create its new loadout. If a local reset is preferable, back up the local deployment first and clear only `characterLoadouts`; do not clear `characterItems` or production data automatically.

## Persistent per-class position foundation

- Shared profile state remains in `characterItems`, `bossProgress`, keys/unlocks and other profile-owned tables. `characterLoadouts` owns equipped items per `profileId + characterBaseId`. The new `profileCharacterState` table owns a safe room and position per `profileId + characterBaseId`, with `version: 1` and `updatedAt`. The temporary `players` row remains authoritative for realtime room/position while its `playerId + sessionId` is active.
- The backend saves the previous safe-room position when a valid live player changes rooms, on explicit release (character switch/logout/pagehide attempt), or when the same profile's active presence is replaced by a new claim. It does not write per-class state during ordinary movement, heartbeat, stationary renewal or cleanup. `selection` and combat `arena` are not saved; abrupt disconnect may resume from the last meaningful safe checkpoint rather than the exact last pixel.
- A profile claim returns only its selected base's saved state. The first Phaser scene is chosen from that room, and map entry restores the saved position only when the state has the supported version, matches the room and fits within the current Tiled map bounds. Otherwise it uses the map's default spawn; a class without state starts in `school`. Character switching no longer reuses the previous class's scene coordinates. Guest claims do not read or write persistent class state.
- Save operations use the server's session-owned `players` row after ownership checks; a stale `playerId + sessionId` cannot overwrite newer state. Existing profiles need no data migration: absent rows use the normal spawn and acquire state at the next safe event. HP, resources, skills, XP, stats, combat-based switch restrictions and periodic/exact disconnect recovery are deferred.

## Experimental third-skin sprite preview

- The character menu again shows only the four real bases, including in DEV. Their experimental sheets remain registered and are loaded only in DEV. Dev Tools **All Skins** uses the `all_skins` boss preset to unlock Remastered without deleting other rewards, then enables the selected base's local Skin test immediately; the wardrobe exposes Classic, Remastered and Skin test for that character. The test skin follows room changes through local `identity.visualPreview` and is never published as a remote appearance or persistent equipped skin. Other Dev Tools presets disable this local access.
- `Get Office2 key` in Dev Tools uses `characterItems.devGrantOffice2Key`, guarded by `DEV_TOOLS_ENABLED`/local deployment and an active matching profile/player/session. Ordinary `claim` still blocks the key; the Office3 safe remains the gameplay route. Grant is idempotent and profile-owned.
- Ground potion drops use `public/assets/items/loot-drop.png`, a transparent-background game copy of `assets-drafts/loot-drop.png`: both the Dev Tools pickup and Koetting's three drops use the same neutral bag. Character-specific inventory/presentation potion art stays intact.
- Yassin's final approved test hair is extremely close shaved stubble: visible warm scalp with subtle gray/darker dots, not a solid black/gray cap. Current registered assets use `yassin-walk-raw-v3.png`, based on `yassin-anchor-soft-stubble-v2.png`. Previous brown v1 and black v2 registered sheets/previews/reports are preserved in `tools/sprite-preview/archive/yassin/` for future reuse (outside production public assets). All other character sheets remain intact.
- Michael and Yassin have registered third-skin sheets based on the approved B anchors: Michael fully bald, Yassin with a slimmer face. New sheets use 128x144 frames, 0.5 world scale, five walk poses at 10 FPS, unchanged foot hitbox, no recolor masks. The test skins now live in DEV tools/wardrobe, with only the four real bases in selection. See `tools/sprite-preview/michael-yassin-generation.md` for prompts and reproducible registration; the preview page includes all four experiments.
- Sarina's `sarina-level3-hd.png` uses the same 768x576 sheet, 128x144 frames at 0.5 scale, five walking poses at 10 FPS and unchanged foot hitbox. Her brown curls/purple shirt/blue jeans use original colors, with no recolor masks. The test remains a local visual override, not a persistent unlock or networked skin.
- Sarina generation used the approved raw Felipe walk poses/style plus existing Sarina art as identity reference, then `register-character-sheet.ps1` at ContentHeight 132. Draft source stays in ignored `assets-drafts/character-customization/sarina-walk-raw-v1.png`; normalized sheet, idle thumbnail, enlarged preview and registration report are versioned. The animation comparison page now includes both Sarina test and current Sarina.

- Felipe's test remains a local `identity.visualPreview` override on the Felipe base, preserving profile/class ownership, collisions and equipment data; other clients still see the published normal skin. It is selected through DEV tools/wardrobe rather than an extra menu card.
- The active prototype uses `public/assets/characters/experimental/felipe-level3-hd.png`: 6x4, 128x144 pixels per frame at scale 0.5, preserving the former 64x72 world size and foot hitbox. It retains the exact approved poses: down/left/right/up, column 0 idle, columns 1–5 walking at 10 FPS. The initial 64x72 `felipe-level3.png` is retained for comparison. Existing skins/animations and global texture filtering are unchanged.
- Felipe's test uses real runtime recoloring from `src/art/felipeRecolor.js`. Sheet-specific material masks separate hair/shirt/trousers/shoes; `FELIPE_TEST_PALETTE` sets chestnut/teal/light gray/burgundy. Original skin, eyes, emblem, drink can, alpha and geometry stay fixed. A derived Phaser spritesheet is created once and cached across scenes before animation registration; no extra Convex calls or saved appearance changes. Masks are authored for this exact HD sheet and need revision for new art. A future persistent/multiplayer palette is deferred. The preview page uses the same code and can toggle original/test colors.
- `scripts/register-character-sheet.ps1` registers isolated generated frames with one scale, head centering and feet on the last frame row (y=143 for HD). Raw sources stay in ignored `assets-drafts/character-customization`; normalized assets are versioned. `tools/sprite-preview/` compares HD, first test and Remastered at equal displayed sizes without Convex; its README contains prompts and rebuild instructions.

## Profile display names

- Profiles use persistent `displayName` (trimmed, 1–32 characters, non-unique). Registration asks for it before character-base selection. Legacy profiles missing a valid value are prompted after login; the session-authenticated `profiles.setDisplayName` action saves it. Profile schema keeps `displayName` optional only for this onboarding compatibility.
- CharacterMenu continues to show base/class names. Claimed player rows snapshot the profile display name; `players.name` remains a transitional visible-name alias, not class identity. Remote overhead labels, chat attribution and quiz participant labels prefer `displayName`. Chat `characterName` remains the separate class/base label for legacy history and class attribution. Guests keep the selected character's name as their display name.

## Recent multiplayer / Convex optimizations

- Player identity phase 1 (historical): presence rows gained optional `characterBaseId`; phase 2 separated `playerId`, and phase 5 removed exclusive synthetic slot selection. Legacy rows derive the base from `characterId`.

- Stationary lease phase 2: after 20 seconds without a meaningful position/room/direction/appearance change, Presence sends one `players.enterStationary`. Only acknowledgement suppresses normal heartbeats; the 200 ms timer/subscriptions remain. Lease lasts 5 minutes with no renewal yet, so idle expiry requires character selection. The next meaningful `players.update` atomically returns an unexpired stationary session to playing and clears its lease, including room changes. Terminal entry replaces the stationary lease; terminal exit stays playing. Pending requests are serialized and failed entry uses existing retry/session-loss handling.
- Stationary lease phase 3: `players.renewStationary` verifies matching session, stationary mode and unexpired lease, then renews from server time to +5 minutes without changing `lastSeen` or player visuals. Presence schedules renewal at expiry minus 60 seconds (about every 4 minutes); one request can run at a time. Transient failure retries after at most 30 seconds, but no later than 5 seconds before expiry. Movement and terminal entry are serialized behind renewal and their authoritative mutations set the final mode; expired leases trigger session recovery. No polling or scheduled job was added.

- Stationary lease phase 1: shared `isPlayerActive` supports three modes. Legacy/playing expires at `lastSeen + 60s`; stationary uses a finite `stationaryLeaseExpiresAt > now`; terminal keeps its separate lease deadline. Availability and client visibility use the shared rule; claims clear old leases and indexed GC handles each mode. Stationary lifecycle is not implemented yet: normal 10-second heartbeats and 200 ms movement sync remain unchanged. Planned later: 5-minute lease, 4-minute renewal, 15–30-second idle dwell.

- Terminal lease phases 1–2: shared `isPlayerActive(player, now)` handles normal/legacy 60-second expiry and terminal lease deadlines. `players.enterTerminal` validates playing ownership and grants 10 minutes; `exitTerminal` validates the active lease, clears it and renews playing presence. Claims clear old leases; GC preserves valid leases. Client availability/remote visibility use the same rule.

- Presence movement sends at most every 200 ms (up to 300 movement mutations/min/player while continuously moving), and ignores position changes under 2 px. Stationary players use a 10-second heartbeat (about 6/min).
- The 200 ms remote multiplayer sync interval is intentionally accepted for normal/non-PvP maps to reduce Convex usage. Remote movement uses client-side snapshot interpolation with a default rendering delay of one sync interval. If future PvP or latency-sensitive multiplayer is added, reassess both the sync rate and interpolation.
- `players:availability` subscribes only while the character menu is visible.
- The menu recalculates 60-second reservation expiry locally from `lastSeen`; cached `active` booleans do not block selection indefinitely. Expired sessions cannot renew through update/heartbeat and must claim again. Claims can reuse stale rows; explicit release remains session-specific.
- Timed quiz completion retries are capped at 4 attempts with exponential delays, then require a manual retry.
- `players:inRoom` uses the `by_room` index. It returns rows in that room; any matching row update can invalidate subscriptions for that room, so frequent movement still creates read/fan-out cost.
- Emotes keep at most one row per character; clients reject stale events and render lifetime from the original `createdAt`. `emotes.cleanup` is defensive garbage collection scheduled every 24 hours.
- Terminal open awaits entry; close awaits exit before restoring gameplay. The same 200 ms Presence timer and all scene subscriptions remain active, but Presence sends no normal heartbeats/updates during the acknowledged lease. Backend normal update/heartbeat leave valid terminal rows untouched and reject expired sessions. Local expiry/failed ownership routes to character selection. Normal exit restores 200 ms sync/10-second heartbeat without an immediate burst. No Study/Challenge lease refresh or subscription suspension yet.

## Current Convex usage investigation

- `players:availability` still uses `players.collect()` across the whole table. A possible safe narrowing is indexed lookups for the fixed character IDs; assess reactive behavior before changing it.
- Presence has one `inRoom` subscription per active `Presence.enter`; `leave()` unsubscribes. Character availability is guarded by menu visibility and subscription identity.
- `convex/crons.js` registers players garbage collection (1 hour), profile sessions (6 hours), login attempts (6 hours), emote cleanup (24 hours); quiz lobby repair now uses a shared on-demand worker (see below). Session and lockout validity are timestamp-based; those cleanups are garbage collection only and each removes at most 200 rows per run. Invocations count even when cleanup finds nothing. With no clients, these crons make about 990 scheduled calls per 30-day month (~0.023/minute), ignoring retries and any other platform work; cloud deployments use this only after deployment.
- `players:inRoom` call totals can plausibly rise with movement mutations and subscribers in the same room; verify against actual dashboard time range and connected-player count before attributing a total.
- Local code changes do not update cloud Convex deployments. Backend production changes require an explicit Convex deployment; verify the target first. No production deployment has been requested here.

## Deployment notes

`npm run deploy:prod` runs the Vercel CLI for the frontend; it does not deploy Convex functions. Convex deployment is separate. Always confirm the selected project and target before any Convex deploy, and treat production as opt-in. Vercel and Convex credentials/configuration are machine-specific.

## DO NOT

- Do not commit `.env.local`, admin keys, deploy keys, or local database contents.
- Do not delete `.convex/local/default/` to fix a selection/configuration issue; preserve local test data.
- Do not use cloud `dev` or production for load tests intended to avoid cloud quota.
- Do not deploy Convex or change production flags/data without an explicit request.
- Do not assume Vercel deployment also updates Convex functions.

## Current next steps

1. If optimizing `players:availability`, compare indexed per-character reads with the current table scan and preserve the menu-only subscription lifecycle.
2. Measure `inRoom` reactive reads and cron invocations in Convex dashboard before changing schedules or query behavior.
3. Keep movement frequency/threshold and quiz retry caps unless measurements or a reproducible gameplay issue justify adjustment.

## Multiplayer quiz recovery worker

- Quiz lobby recovery no longer has a permanent cron. One shared worker runs every 30 seconds only while any multiplayer lobby row exists (including finished lobbies awaiting departure).
- `quizCleanupWorker` has one transactional coordination row, indexed by key, with generation and scheduled job ID. First/joined lobbies ensure scheduling; final deletion cancels the pending job. Each callback consumes its generation; obsolete callbacks cannot restart a chain. No per-lobby or per-movement jobs.
- Recovery retains participant pruning, host transfer and score repair. `finishTimedQuestion` still handles normal question timeout progression.
- On first installation with pre-existing lobbies, invoke internal `quizLobbies:cleanup` once with `{}` to bootstrap, or a successful join ensures the worker. No production deployment has been performed.
- With no lobbies, quiz recovery adds zero idle calls/month (previously ~86,400 per 30-day month). See the cron baseline above for the current schedules.

- Terminal lease phase 3: Study start/markViewed/recordSoloAnswer and IT Challenge start/finish refresh valid leases inside existing mutations to server now +10 minutes. Playing sessions are unchanged; expired leases use session-loss recovery. Responses update the local deadline with no extra requests, polling or scheduled jobs. Subscriptions remain active.

- Terminal phase 4A suspends only `emotes.inRoom` and the unseated player's `quizLobbies.current` subscription after successful lease entry. Successful exit restores each through idempotent unsubscribe/subscribe methods; seated quiz participation blocks terminal entry. Presence, chat, doors, inventory, Study and Challenge subscriptions remain active.
- Terminal phase 4B also suspends `doors.inRoom` after lease entry. A normal exit waits for DoorSync's initial resubscription snapshot to apply authoritative room door and blocker state before the terminal close animation restores player input. Old callbacks are ignored by a subscription generation guard; no separate door query was added.
- Terminal phase 4C also suspends the local `players.inRoom` subscription after successful lease entry and clears remote visuals/buffers. Exit waits for the initial room snapshot before proceeding to door resynchronization and restoring input. Subscription generations reject obsolete callbacks; the local timer sends nothing in terminal mode. Other clients still see valid terminal players through lease expiry. No extra query or mutation beyond reactive resubscription; movement remains 200 ms.
- Quiz-bank loading is lazy on the frontend. Office3 loads only the static questions after the correct password starts the quiz. Terminal Question Database loads static and generated data through the same cached loader only when opened. The initial game bundle excludes `quizStaticQuestions.generated.js`; Vite emits separate lazy static and generated question chunks. `src/quiz-database/main.js` is not imported by the normal game entry.


- Experimental adaptive movement: `ADAPTIVE_MOVEMENT` in `src/multiplayer/presencePolicy.js` is enabled for comparison. Disable it to restore accepted 200 ms sending/render delay. Adaptive mode publishes resolved moving/stopped + velocity state; start/stop, direction/velocity (12 px/s), appearance/item and >160 px corrections bypass cruise throttling. A separate local deadline targets 300 ms cruise; requests remain serialized. Remote interpolation uses 300 ms, with no extrapolation. Stationary/terminal leases retain their existing rules. Long straight movement can reduce updates from 300 to approximately 200/min; visual comparison is still required.

## Arena encounter foundation

- `ArenaEncounter` holds a local encounter ID, Solo/Co-op mode, lifecycle
  (`waiting -> active -> defeated -> completed`), optional host player ID,
  participant count and a boss configuration. Repeated defeat/completion calls
  are ignored. Solo retry and scene re-entry reset the lifecycle.
- `LocalSoloBossAuthority` owns the Director's HP, phase, attack choice/start,
  attack event sequence and defeat/completion transitions. `BossController`
  still owns Phaser sprites, projectiles, timings, HUD, dialogue and effects;
  it consumes locally created attack events with type, sequence ID, start time,
  phase, target/origin and attack parameters. No event is sent remotely.
- `encounterConfig.js` keeps proposed 1–4 participant HP multipliers
  (1/1.75/2.40/3) and outgoing damage multipliers (1/1.10/1.20/1.30).
  Solo always uses 1 player: 100 boss HP, 4 player attack damage and current
  16/19/31 Director damage values. Co-op scaling is configuration only.
- `ArenaScene` keeps the existing `arenaPresenceRoom` identity and entry/lobby
  flow above. `ArenaEncounterController` owns scene entry/sleep/re-entry and
  exposes the lifecycle model as `scene.arenaEncounter`. Solo creates or resets
  a `LocalSoloBossAuthority` and passes it into `BossController`; each Solo player
  retains its isolated `arena:solo:<playerId>` presence room and local boss.
- Co-op destinations use the existing `arenaLobbyId` from `ArenaEntryController`,
  which becomes `ArenaEncounter.encounterId` without another lobby/room scheme.
  The existing `ArenaLobbyClient` subscription supplies authoritative host and
  active participant count to the model; count changes update the future scaling
  configuration only. Lobby `started` means entry is permitted, while combat
  remains `waiting`: no local boss, crosshair, damage or reward is created.
  `arena:coop:<arenaLobbies ID>` still isolates lobbies; leave/host-close behavior,
  DEV toggle and code invitations are unchanged. A future realtime host authority
  can use the encounter identity/events; no transport or shared boss is enabled.
- Solo boss completion passes once through the local authority before opening
  the exit, dropping loot and recording the existing profile victory. The
  existing Convex victory ID and pending reward recovery are unchanged; guest
  fights still open the exit without a persistent reward.

# NPC decorativa do pátio (outside)

- `OutsideScene` usa `MendigaNpc`: caminhada local em quatro direções, sem
  sincronização de movimento ou colisão dinâmica com jogadores.
- `public/assets/npc/mendiga-walk.png`: 16 frames de 128×144, pés alinhados em
  y=143, linhas down/right/left/up. Escala .5, 7 FPS e 32 px/s configuráveis
  em `src/npc/mendigaPatrol.js`.
- Trajeto autorado em `outside.tmj`, layer Notes, pontos `mendiga-patrol-1..4`.
  Os segmentos devem permanecer livres de obstáculos; não há pathfinding.
- Preview animado em `public/assets/npc/mendiga-walk-preview.html`.
  O ciclo gerado é estilizado/arrastado; poses de passada aberta/passagem foram
  diferenciadas, mas a alternância anatômica de pernas ainda pode ser refinada.

## Beggar NPC: dialogue and collectible progression

- `BeggarInteraction` adds German speech and explicit E interaction to the local
  wandering NPC. `beggarDialogue.js` centralizes configurable bands: 0–1 tile
  prompt/explicit interaction only, >1–3 normal speech, >3–6 occasional shouts.
  Local checks every 750 ms; near cooldown 8–12 s / 25% chance, far 12–20 s /
  15% chance. Failed rolls consume cooldown, active speech is never overwritten
  by ambient lines, and consecutive identical lines are avoided. Speech stays
  head-anchored/clamped for 6 s. No proximity/idle mutations or timers on Convex.
- `npcCollectibleQuests` stores profile-wide `profileId + questId`, ordered
  delivered IDs, current pack, active spawn, completed/rewardClaimed and timestamp.
  Four progression IDs `cigarette_pack_01..04` track the sequence. Step 1 now uses
  the existing profile inventory item `lung_crusher_3000_pack`, preserving prior
  ownership and its original school position. Michael's activatable equipment,
  keys and boss progression remain independent.
- `npcQuests` exposes progress/start/collect/handIn. Mutations verify the current
  authenticated profile/player/session. Pickup validates configured spawn and
  realtime room/position; hand-in validates outside room, expected ID and owned
  item. The moving NPC's one-tile range remains local. Item deletion and sequence
  advancement are atomic; old/duplicate requests cannot advance again.
- `CollectibleQuestController` subscribes only in outside or maps with configured
  spawns, unsubscribes on sleep/shutdown and performs one start request on entry.
  Persistent quest state survives login/class changes; guests get dialogue only.
- Four temporary authored Notes spawns are connected: `lung-crusher` in classroom,
  `lung-crusher-3000-red` in office3, `long-crusher-3000-green` in classroom,
  `long-crusher-3000-blue` in secret-path. Blue was added in the authoring TMX and
  copied into the runtime TMJ without changing the remaining map objects.
  `cigarettePacks.js` centralizes ordered pack metadata, inventory ID mapping,
  expected rooms, marker aliases and ground textures/sizes. The generator binds
  each spawn to its packId so colors cannot spawn at another stage's location.
  Additional globally unique `cigarette-spawn-*` points may use a string `packId`
  property. Run `node scripts/sync-npc-collectible-spawns.mjs`; preconvex/prebuild
  also regenerate positions. Existing undelivered test states get a valid matching
  spawn on map entry, without resetting delivered progress.
- The generic legacy school pickup is no longer mounted; the quest controller
  owns that same first pickup, preventing duplicates/respawn after delivery.
  Inventory ownership of the original pack is accepted immediately. Early test
  `cigarette_pack_01` inventory is also accepted/removed on first delivery.
  Original PNG cards/icons for red/green/blue are copied to public/assets/items;
  hotbar-only iconScale/iconClip metadata handles the supplied large margins.
  Small colored ground SVGs reuse the existing pack silhouette; red adds minor
  non-colliding local litter. Cards remain static in the existing overlay.
- Fourth delivery sets completion and clears current pack/spawn; future reward
  is deliberately deferred (`rewardClaimed: false`). Setup: `src/npc/README.md`.
- Dev Tools has **Reset cigarette collection** (reset this profile's deliveries
  and remove only collection items/legacy aliases) and **Get all cigarette packs**
  (grant the four inventory items idempotently without requiring prior hand-ins
  or altering delivered progress). Sequential NPC delivery remains normal.
  `npcQuests.devResetCollection/devGrantCollection` use the existing backend DEV
  gate and active authenticated profile/player/session checks; no idle traffic.

## Collections UI foundation

- **Collections** beside the backpack opens one HTML dialog: collection directory,
  then item grid + right preview; mobile stacks the preview below. Dark bronze/gold
  CSS frame, rare and locked slots, empty/coming-soon states, no progress bar.
- `src/collections/catalog.js` retains `createPreviewCollections()` for isolated
  previews. Gameplay uses `collectionsFromQuestProgress(progress, ownedItems)`:
  the four real pack IDs are discovered from owned packs/current quest pack or
  persistent `deliveredPackIds`. Hand-in removes ownership but keeps discovery.
  Rare/future slots remain locked; other collections remain coming-soon entries.
- `CollectibleQuestController.receive()` reuses its existing subscription to pass
  history into the HUD. Opening Collections also performs one existing
  `npcQuests.progress` query for maps without that subscription. No new backend
  functions, polling, persistent fields or mutations. Late query results cannot
  replace a newer quest update or update a destroyed HUD.
- `CollectionsMenu.setCollections(data)` remains the integration point for future
  discovery sources. Explicit DEV collection reset clears the current cigarette
  history; normal NPC hand-ins never clear it.
- `InventoryHotbar` owns the button/dialog lifecycle. The dialog blocks game
  keyboard/pointer input, handles focus/Tab/Escape and restores input on close;
  scene sleep/logout destroys it. No changes to item ownership or quest rules.

## Backpack and quick-use HUD

- Previously the HUD projected ownership into six numbered slots: functional
  items from the left, presentation/key/quest items from the right. Slot positions
  were frontend-only; they never represented database ownership or loadouts.
- `inventorySlots()` now projects only compatible consumables into four quick
  slots, automatically assigned with existing `preferredSlot` support. `1–4`
  use those slots; `5/6` no longer trigger inventory actions. `0`/numpad `0` still
  use the potion. Emotes remain `Shift + 1–6`.
- The existing rail contains a four-slot quick group and a separate utility group
  (round backpack/book buttons, larger centered icons, gold divider after slot 4).
  Utility buttons do not have item-slot classes or numbers. No HUD height, HP,
  emote, settings or canvas resolution change.
- `BackpackMenu.setItems(items)` receives the complete normalized owned inventory,
  not the quick-slot projection. Its grid expands with ownership; empty cells are
  cosmetic space, not capacity. Selection displays artwork, quantity, description
  and current equipment state. Use/Equip/Unequip delegates to the existing
  `InventoryHotbar.activate()` / `CharacterItemController.use()` logic, including
  backend class checks, consumable cooldowns and class loadouts.
- `ItemRewardOverlay` has explicit `source: 'pickup' | 'inventory'` presentation.
  Ground pickups preserve Continue and the 500 ms dismissal lock. Backpack
  inspection mounts the shared card inside the still-active native dialog with
  Back instead of Continue. Back, header X or Escape returns to the current
  inventory selection; only another close exits the backpack. Backdrop clicks
  do nothing while inspecting, and repeated held Escape cannot dismiss both
  views. Inventory updates are retained without rebuilding an active inspection;
  returning renders the latest owned state. Teardown suppresses return callbacks.
- The backpack icon toggles `BackpackPopup`, a compact non-modal HTML dialog above
  the button, clamped horizontally to the viewport and repositioned on resize or
  page scroll. It previews at most eight owned items. Clicking any item now shows
  its presentation card inside this same popup; Back returns to the mini grid,
  and functional items expose Use/Equip there. Only Open Backpack expands the
  main modal. Nothing is persisted or fetched just to inspect an item.
- The popup reuses `GameMenuModal` input/focus/Escape lifecycle without a screen
  backdrop or scroll lock. X/Escape/outside pointer close only the popup; outside
  dismissal consumes that pointer so it cannot attack/interact in the world.
  Opening Backpack or Collections closes the popup without a pending game-focus
  restore. Scene sleep/logout destroys all owned popup/card/dialog listeners.
- `GameMenuModal` shares the HTML dialog frame/lifecycle between backpack and
  Collections: input isolation, Tab, Escape keyup, focus restoration and teardown.
  The close X is CSS geometry centered independently of font metrics.
- Ownership remains `characterItems` by profile; equipment remains
  `characterLoadouts` by profile + characterBaseId. Keys/quests/equipment remain
  owned and usable in the backpack even though they no longer occupy quick slots.
  Login/class/map restoration is unchanged; guests keep their previous behavior.
- Michael's old equippable cigarette `lung_crusher_3000` is temporarily disabled
  by `LUNG_CRUSHER_CIGARETTE_ENABLED` in `src/inventory/characterItems.js`:
  it cannot be newly claimed/equipped, appears in neither backpack, and saved
  loadouts cannot revive its visual. Existing rows are retained for later reuse.
  The separate collectible `lung_crusher_3000_pack` and colored quest packs keep
  their pickup/card/quest behavior. Their colored mini icons use silhouette CSS
  clipping to hide the black PNG canvas without changing the source art.
- No reset or database migration needed. Manual quick assignment, drag/drop,
  sorting/filtering and an equipment UI redesign are intentionally deferred.
  Extend the quick projection or backpack renderer without changing ownership.

## Wall tiles inspection sandbox (2026-10-03)

- tools/wall-tiles-lab/ is an isolated, dev-only Phaser map viewer without gameplay/Convex. It loads public/assets/maps/classroom-wall-lab.tmj, initially an exact copy of classroom.tmj. Edit only the copy and NEW tileset resources: existing TSX/images are shared with the live map.
- The three assets-drafts/tilesets references are opaque 1448x1086 concept sheets, not 32x32 atlases. North-south top caps and orthogonal corners need registration/reconstruction before replacement. No new walls are applied yet. See tools/wall-tiles-lab/README.md for diagnosis and proposed minimal kit.
