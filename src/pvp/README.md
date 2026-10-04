# Movimento e projéteis realtime na arena PvP

`PvpArenaScene` usa `PvpMovementClient` sobre `createRealtimeTransport`, sem acessar
o socket. `pvp-movement` passa pelo relay: `playerId`, x/y, direção,
vx/vy, moving, sampleSeq e life; o envelope inclui seq/sentAt e o relay atribui
senderId. `life` só identifica a geração do movimento para descartar amostras
anteriores; morte e respawn agora seguem a autoridade realtime.

A room é `pvp-<matchId>-<round>`. O ID vem da partida Convex; round isola novas
rodadas que reutilizam o mesmo documento. A presença Convex continua na room
`pvp-arena-test:<matchId>`, com posição fixa de entrada e heartbeats/leases.
Lobby, create/join, equipes, participantes e metadados/cosméticos ficam no
Convex. O relay decide hits, HP, morte, respawn, score, vitória e timeout;
os tiros locais continuam responsivos e o peer recebe apenas o visual.

`PvpProjectileClient` reutiliza o mesmo adapter/socket. `pvp-projectile-spawn`
envia `projectileId` (UUID), `playerId`, `life`, `shotSeq`, `x`, `y`, `vx`, `vy`
e `ttlMs`. O envelope existente contém room, seq, sentAt e senderId atribuído
pelo relay. `pvp-projectile-destroy` envia só a identidade/vida/sequência do
tiro e remove o visual quando o disparador detecta impacto/expiração. Não há
stream de posições dos projéteis. O receptor simula a velocidade e as colisões
visuais, rejeita duplicatas/vidas antigas/ecos e limpa ao sair/reconectar/encerrar.
A idade de entrega usa a estimativa de offset do relógio do relay; tiros que já
expiraram nessa estimativa são descartados. Isso não é sincronização perfeita
de relógios, e nenhum relógio de outro browser é subtraído.

## HP autoritativo (2026-10-04)

Inicie **Convex local antes do relay**. `scripts/pvp-convex-bridge.mjs` verifica
deployment local/loopback e identidade do backend, e lê sua credencial admin
somente no processo Node. Cloud/prod são recusados. O Lab continua independente;
sem backend local, dano PvP fica indisponível, sem fallback de dano pelo cliente.

`pvp-authorize` valida playerId/sessionId/partida/round no Convex; sessionId não
é replicado. Uma assinatura interna compartilhada por room acompanha participantes,
equipes, presença e vidas. `PvpDamageAuthority` usa posições realtime, Collision
do mapa, origem plausível, velocidade 420 px/s, TTL 1200 ms e cooldown 400 ms.
O hit precisa atingir o primeiro corpo antes de uma parede; não aceita alvo morto,
aliado, self, outra room, vida antiga, tiro inexistente/expirado/reutilizado.

O cliente envia `pvp-hit-attempt {projectileId,targetId,targetLife}` antes de
destroy; não envia dano. O relay consome o tiro e aplica até 25 HP, emitindo
`pvp-combat-state` (authorityId/version/round/damageRevision, estado completo do combate)
e `pvp-hit-result` (accepted/reason/damage/HP antes/depois). `PvpDamageClient`
projeta HP sem deixar snapshots Convex antigos restaurá-lo. A mutation pública
`pvpMatches.hit` está desativada. Cada hit aceito gera uma mutation **interna**
serializada, revisionada, que apenas copia o snapshot autoritativo de combate.
O Convex não calcula morte, respawn, score ou vitória. Falha de persistência
interrompe combate e pede um novo lobby.

Use um único relay por deployment local. Isso ainda não é anti-cheat completo:
movimento continua informado pelo cliente; validação usa posições mais recentes,
12 px de tolerância no corpo e 80 ms de tolerância no trajeto, sem rewind/rollback.
Latência alta pode rejeitar um impacto visual. O estado é de teste e não persiste
projéteis após reiniciar o relay. Não há novo timer, socket ou polling no cliente.

## Morte, tiros em voo e respawn

Tiros registrados enquanto o shooter estava vivo continuam após sua morte e
podem causar double kill. Morte/respawn não enviam destroy nem removem esses
visuais por owner/life. TTL original (1200 ms), impacto, paredes e encerramento
continuam governando a duração. Shooter morto não pode criar novos tiros.
Um spawn novo de vida antiga é rejeitado; um hit precisa usar um tiro já
registrado, não consumido e ainda dentro do TTL, com a vida atual do alvo.
Flights distintos podem atingir em ordem diferente da sequência de disparo.

O relay preserva o resultado de `advanceMatch`: life aumenta uma vez, HP volta
a 100 após 2.5 s e posições antigas são descartadas. Contadores de movimento/
tiro são comparados dentro da mesma life; a sequência global do transporte não
é reiniciada. Amostras rejeitadas não alteram caches. O cliente aplica life/HP
do relay aos adapters mesmo antes de receber um snapshot Convex atrasado.
PlayerId/sessionId/room/socket e listeners permanecem os mesmos; não reconectar.

`[PvP combat]` no relay registra death/respawn, vidas antes/depois, primeiro movement,
projectile spawn e hit attempt da nova vida e motivos de rejeição. No navegador,
ative o diagnóstico existente (`localStorage.setItem('daa-pvp-movement-debug','true')`
e recarregue) para death/respawn recebidos e snapshots aplicados. Para testar double
kill, deixe ambos com 25 HP, dispare quase ao mesmo tempo e observe os tiros
depois da primeira morte; após respawn, mova e atire novamente nos dois browsers.

Altere `PVP_MOVEMENT_CONFIG.hz` em `movementConfig.js` (20 inicialmente; permite
25, 30, 40 e 50). O envio acompanha os frames usando `performance.now()` e uma
grade de tempo; após uma pausa envia no máximo uma amostra, sem rajada de atraso.
Abas em segundo plano podem enviar abaixo do Hz solicitado. Input local não
aguarda confirmação. O buffer `RemoteSnapshotBuffer` já usado no jogo interpola
os remotos, com atraso configurável de 100 ms, armazenamento limitado e sem
extrapolação. Sequências antigas, ecos próprios, outras rooms/participantes e
amostras de vidas anteriores são ignorados. Reentrada/reconexão reinicia o buffer.

## Duas abas locais

1. Em terminais separados, execute `npm run convex`, `npm run realtime:server`
   e `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`.
2. Abra `http://localhost:5173` em duas abas com identidades distintas. Se o
   login compartilhado impedir duas sessões, use outro perfil/janela privada.
3. No host, DEV Tools → **PvP Arena: ON** → **Open PvP Lobby** → **Create PvP
   Lobby**. Na segunda aba, **Open PvP Lobby** → **Join PvP by Code**, usando o
   código do host. Garanta pelo menos um jogador em cada equipe e inicie.
4. Mova os dois jogadores. No console, habilite mensagens Debug/Verbose e procure
   `[PvP movement] connected`, `joined` (room, peerId, playerId), `remote sender`
   e `discarded stale`. Em Network → WS, `/pvp-realtime` deve transportar
   `pvp-movement`, aproximadamente a cada 50 ms em primeiro plano.
5. Saia/encerre a partida: o socket deve fechar. Reinicie o relay durante uma
   partida para verificar reconexão/rejoin. A entrada local continua responsiva;
   sem autoridade local válida, o combate falha de forma segura e pede reentrada.

Para testar tiros, reinicie `npm run realtime:server` após atualizar o protocolo
e recarregue ambas as abas. Atire em espaço livre e nas paredes/jogadores:
ambos devem ver a bolinha na cor do time e o mesmo HP; cada acerto aceito tira
25 HP uma vez. `[PvP hit]` no relay mostra accepted/rejected, motivo e HP.
O disparador envia somente o hit realtime, nunca a mutation pública Convex.
Com o diagnóstico abaixo habilitado, `[PvP projectile]` mostra
`spawn sent`, `spawn received` e `projectile discarded`, com ID do tiro,
shooterId e motivo. O tunnel/proxy e a URL continuam os mesmos.

## Segundo jogador via tunnel

Mantenha Convex local e o relay rodando. No terminal do Vite:

```powershell
$env:VITE_QUICK_TUNNEL='true'
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Em outro terminal:

```powershell
cloudflared tunnel --url http://127.0.0.1:5173
```

Compartilhe a URL HTTPS gerada e o código do lobby. Ambos abrem essa URL e usam
identidades distintas. Vite encaminha `/api` para Convex em 3210 e
`/pvp-realtime` para o relay em 8787; o navegador usa WSS pelo mesmo tunnel.
Não é necessário um segundo tunnel para movimento. Reinicie Vite ao trocar
essas variáveis; encerre os processos com Ctrl+C após o teste.

Para um relay separado, defina `VITE_REALTIME_URL=wss://<host-do-relay>` no
ambiente do Vite ou `.env.local` e reinicie Vite. HTTP/HTTPS também são aceitos e
convertidos para WS/WSS. Essa variável já é usada pelo lab. Se ela estiver
definida, substitui o proxy padrão; evite um endereço localhost ao compartilhar
o jogo pela Internet. O proxy é de desenvolvimento; hosting futuro precisa
encaminhar esse caminho ou fornecer uma URL WSS.

O Lab permanece sem autenticação. O PvP exige autenticação local Convex e usa
a autoridade de combate do relay; movimento ainda é informado pelo cliente.

## Validação

### Diagnóstico Firefox / Vivaldi

No console de cada browser, antes de entrar na arena, execute:

```js
localStorage.setItem('daa-pvp-movement-debug', 'true');
```

Recarregue ambos e habilite Debug/Verbose no console. Alternativamente, defina
`VITE_PVP_MOVEMENT_DEBUG=true` no ambiente do Vite e reinicie-o. O diagnóstico é
opcional e não altera o Hz. Eventos `[PvP movement]` incluem a room e o ID local:
`snapshot received` (peer/player, sequência e tipos dos IDs), `snapshot accepted`,
`snapshot discarded` com motivo, `snapshot deferred` aguardando participante/sprite,
`remote created`, `movement buffered`, `snapshot applied` e `position rendered`.
Este último é limitado a uma mensagem por segundo por remoto e inclui posição,
textura, validade da textura, alpha, visible, depth e presença no campo da câmera.
Se o WS em Network recebe `pvp-movement` sem `snapshot received`, verifique erros
de inicialização/conexão e o conteúdo/versão do protocolo enviado pelo relay.

O último snapshot de cada peer da room permanece em memória até os dados Convex
e o sprite estarem disponíveis. Ele é reaplicado após criação/recriação do remoto,
sem exigir outro pacote. Apenas o participante confirmado por Convex ganha sprite;
ecos locais, outras rooms e sequências antigas continuam descartados. Cache e
callbacks de diagnóstico são limpos na saída/reconexão.

Repita criando primeiro o Firefox e depois o Vivaldi, e depois na ordem inversa;
mantenha ambos visíveis, mova e pare cada um, saia/entre novamente na arena. Para
desativar: `localStorage.removeItem('daa-pvp-movement-debug')` e recarregue.

`node --test tests/pvpMovement.test.js` cobre Hz configurável, sequências,
metadados sem movimento Convex, interpolação real, ciclo de vida da cena e
troca de movimento com múltiplos adapters WebSocket conectados ao relay real.
`npm test` executa a suíte existente; `npm run build` valida o bundle.

## Full combat lifecycle authority (2026-10-04)

The same room authority owns death, score, 2.5s respawn (HP 100, life+1),
score-limit victory (5), and the 180s match deadline. One server-local deadline
timer handles countdown, respawns, timeout and presence expiry, including when
no messages arrive. End/close/participant departure cancel pending respawns.
The client only displays timestamps; it never decides a combat transition.

`pvp-combat-state` carries state/scores/start/end/result, full fighter
HP/life/K/D/respawn metadata and an `events[]` batch (death, respawn, match-ended).
A snapshot is applied once by authorityId/version/round; events are descriptive,
never score increments applied again. The final state survives socket cleanup,
and the Convex subscription still handles host/opponent departure afterwards.

Internal `acquireRealtimeCombat` binds authorityId transactionally per round.
Concurrent clients await the same initialization and one internal subscription.
Internal `mirrorRealtimeCombat` copies sequential snapshots; duplicate revisions
are acknowledged without writes. Private sessions/membership stay in Convex,
and queued snapshots cannot reopen a lobby closed by concurrent departure.
`applyRealtimeDamage` is disabled. Public `finish` cannot force combat end;
DEV End Match sends authenticated `pvp-end-request` and only the host is allowed.
Mirrors run on hits and lifecycle transitions, never on movement/timer ticks.

Registered flights survive shooter death; both points of a posthumous double
kill count if both hits remain valid before match end. A victory-ending hit
freezes combat immediately; subsequent hits do not extend the final result.
Spawn captures target lives, so a previous flight cannot damage a new life.
Timeout chooses the higher score (equal scores draw), clears respawns, and
opens the shared 10s Retry/Leave decision window. Relay failures still use the
existing safe departure recovery UI.

Restart the relay and reload both browsers after updating local functions.
Create a new lobby for testing. Active-round takeover/failover is not supported:
restart/disconnect/mirror failure ends safe play and requires a new lobby.
Latest-position hit checks still have no historical rewind/lag compensation;
movement and collision notifications remain client-reported (not full anti-cheat).
No boss/solo or reward/progression changes.

Focused checks:

`node --test tests/pvpLifecycle.test.js tests/pvpDamage.test.js tests/pvpRespawn.test.js tests/pvp.test.js tests/pvpMovement.test.js tests/pvpProjectiles.test.js`

## Retry / next round (2026-10-04)

Each authenticated participant can confirm Retry on the final HUD. Relay-only
`PvpRetryCoordinator` keeps votes and one fixed 10s deadline; the host votes like
everyone else. All active peers voting resolves immediately. At timeout, only
voters remain; Leave/disconnect/lease expiry remove a peer from unanimity.

The relay serializes the final combat mirror before internal
`advanceRealtimeRound`, which validates live sessions and stores the chosen roster.
Same match/code/teams, round+1, HP100, life+1, zero score/K/D/shot state, no
respawns/result, and fresh 3s countdown/180s deadline. Missing opponents or a lone
survivor returns to waiting; no voters deletes the abandoned lobby. A missing
host transfers only for subsequent lobby management, never vote priority.

`pvp-round-transition` supplies the next public snapshot. Survivors reuse the same
WebSocket/listeners, clear movement/interpolation/projectile caches, reset spawns,
join the next round room and authorize again. The old server subscription closes
before handoff; the next room acquires one authority. Convex's earlier echo cannot
restart clients before this handoff. Old room/round/life/mirror generations are
rejected; delayed Leave cannot remove someone from the next round.

Keep local Convex running, restart `npm run realtime:server`, reload two tabs and
create a fresh lobby. End with five kills, timeout, or DEV End Match. Confirm Retry
on both tabs to start the next countdown immediately. Then test just one Retry
and let ten seconds expire (voter returns to the same lobby; other leaves), and
one Retry followed by Leave/disconnect in the other tab. Also test neither voting.

Focused feature tests: `node --test tests/pvpRetry.test.js`.

## Payload MVP (2026-10-04)

Create **Payload Lobby** in the existing DEV PvP menu; join by the same code and
start with at least one player on each team. **Create TDM Lobby** keeps the existing
mode. Start local Convex before restarting the relay; reload both browsers.

`payload/config.js` centralizes speed 10 px/s, radius 64 px, 100 ms objective
snapshots, 3s fixed respawn and 180s duration. `PVP_MAP_DEFINITION` in `config.js`
selects `payload-map.tmj` (id `payload-map`, revision 1) for TDM, Payload,
inspection scene and relay; `PVP_MAP_FILE` derives from that definition. The logical
scene/room key stays `pvp-arena-test`; it is not a reference to the old layout.
World/camera bounds follow Tiled dimensions (currently 1472x1088); zoom comes from
`PVP_MAP_LAYOUT.cameraZoom` for both live PvP and the walking inspection shortcut.

Convex publishes the same `arenaMap` descriptor in `current`, relay state and
Retry handoffs for every participant. Lobby entry and Retry validate it and refuse
missing/mismatched definitions, rather than guessing from mode or saved browser
state. `pvp-authorize` also sends map ID/revision; the relay refuses stale clients
and stale backend definitions with an explicit map mismatch message. No schema
migration or extra query is needed. The old `pvp-arena-test.tmj` remains only as an
unused reference asset; no runtime path or fallback loads it.

`PvpMapScene` is the shared loader/trigger implementation for `PvpArenaScene` and
`PayloadMapScene`. Cache keys include physical map identity/revision. Each new
entry stops a slept scene, clears only its map caches and reloads the map, with a
fresh URL token during DEV. Retry keeps the currently loaded map and resets its
teleport lock. Class restore/localStorage never selects a PvP map. The inspection
shortcut stays a walking test, with regular presence and no match membership;
real PvP retains authenticated membership and the existing realtime transport.

Spawns: `PVP_MAP_LAYOUT` maps A/blue to `Notes/spawnBlue` (right base) and B/red
to `Notes/spawnRed` (left base). Move these points in Tiled to move base spawns.
Temporary teammate offsets (0,0)/(0,32) are configurable in the same object.
Numbered `Spawns/teamA_spawn1`, `teamA_spawn2`, `teamB_spawn1`,
`teamB_spawn2` points take priority and disable offsets for that team. Optional
string `direction` marker property selects facing; defaults look inward.
Scene, respawn, Retry and relay all call `teamSpawn`.

Optional Pac-Man flank teleports use an unrotated rectangle object layer named
`Teleport`, with rectangles named `top` and `bottom`. Place each rectangle over
the safe walkable part of the upper/lower passage. Arrival centers the foot body,
with narrow top/bottom triggers aligned inward to avoid straddling the outer wall.
Keep the arrival footprint clear of `Collision`. These areas
are triggers only and do not create physical blockers. Cooldown is 650 ms, plus
a lock that remains until the player leaves the destination area. The current TMJ
contains both markers; the same reader/controller runs in live PvP and inspection.
Arcade body offsets/previous positions are synchronized at landing to prevent
post-update drift, without modifying authored markers or collision geometry.
Realtime sends the destination in the next normal movement packet with a one-shot
`teleport` flag; remote clients clear old interpolation and snap to that sample.

The physical route is an unrotated Tiled polyline `PayloadRoute/payload-route`:
BLUE/A first, RED/B last; numeric `initialFraction` defaults to 0.5. Until this
polyline exists, `PVP_MAP_LAYOUT.temporaryPayloadRoute` connects the base spawns
and starts halfway. This fallback is temporary, shared by client and relay, and
never replaces a malformed authored route. Keep the route clear of collisions.

Layers: image `background` below tiles/players; image or tile `Overlay` or
`Foreground` (case-insensitive) above all player foot-y depths. A numeric layer
property `depth` overrides the default map pixel height + 100 (current overlay
has 1200). Only exact `Collision` object layer creates physics blockers. Rotated rectangles
and polygons are read through the existing one-pixel polygon scanline converter
on both client and relay; the authored objects are preserved.
`Floor`, `Decoration`, `Walls` tile layers and `Entities`/
`objectDecoration` tile objects retain their existing behavior. Keep layer images
next to the TMJ in `public/assets/maps/`, using relative image references.
No background or collision layer was regenerated. After editing the map, restart
`npm run realtime:server` and reload both browsers so server/client walls agree.

Only the relay's `PayloadAuthority` computes progress. Living authenticated peers
inside the radius control the cart from their existing movement samples: A pushes
towards B, B towards A, both stop/contest, none stop/neutral. Extra teammates do not
increase speed. Dead/expired/disconnected players and stale moving samples cannot
push. Escort the moving cart rather than expecting it to follow a player forever.
Delivery at the enemy endpoint ends with that team's win. Kills still record stats
and respawn, but do not trigger a score-limit win; undelivered timeout is a draw.

The same `pvp-combat-state` snapshots include optional `payload` objective data.
Control changes publish immediately; moving progress publishes at 10Hz. No new
movement stream, polling, Convex tick writes or scheduled jobs. Existing combat
mirrors persist the latest objective only alongside hits/lifecycle changes.
`PayloadAuthority` uses `payload/config.js` for gameplay rules only. `PayloadView`
uses `payload/visualConfig.js` for its presentation theme and optional route trace;
the default `equipmentCart` keeps the current placeholder, neutral gray/A blue/B
red/contested amber states, and 1:1 presentation radius. Select a theme by passing
`theme:'equipmentCart'` (or a partial theme object) to `PayloadView`; a registered
Phaser `sprite`, scale, x/y offsets, depth (`'y'` follows the interpolated feet
position), radius scale, label offset and state/cart colors are visual-only.
`PAYLOAD_VIEW_CONFIG.showRoute` toggles the subtle Tiled `PayloadRoute/payload-route`
trace; `routeDepth` keeps it on the ground. The moving ring and cart use the same
interpolated authoritative coordinates. Foreground/Overlay map layers keep their
existing higher depth. No prediction or objective state is held in the view.

Retry/Leave reuse the shared end window. Retry creates the next round's neutral
centered objective, resets players/HP/scores/generations and swaps rooms on the
same sockets. Checkpoints, repair/sabotage, buffs, dynamic respawn and overtime
are deliberately not implemented. Theme changes belong in visualConfig/PayloadView;
route/progression changes belong in the objective controller/config/map.

Manual test: use two tabs on opposing teams. Walk blue into the circle and escort
the cart towards the red/left base; move red inside to contest, move blue outside to push towards blue/right, then
leave both outside to stop it. Escort to an endpoint, confirm Retry on both, and
verify center/neutral/new countdown. Optional 2v2 checks equal push speed.

`node --test tests/pvpPayload.test.js` covers objective rules, physical routing,
combat integration, two actual WebSocket clients, Retry and stale-round rejection.
