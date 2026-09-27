# Project context

**Read this file when:**

- starting a new Codex session;
- the local environment/configuration differs or is unclear;
- working on Convex, deployment, environment, architecture, or cross-machine issues;
- previous project decisions are needed.

Do not reread it for routine isolated edits when the current session already has sufficient context.

## Local development commands

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

## DEV_TOOLS_ENABLED

`convex/bossProgress.js` enables boss Dev Tools when the deployment has `DEV_TOOLS_ENABLED=true` (or its configured Convex URL is loopback). Set the flag only on a local/test deployment. Never enable it on production. The flag is stored per Convex deployment, not in Vite's `.env.local`.

## Recent multiplayer / Convex optimizations

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
