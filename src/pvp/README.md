# Movimento e projéteis realtime na arena PvP

`PvpArenaScene` usa `PvpMovementClient` sobre `createRealtimeTransport`, sem acessar
o socket. `pvp-movement` passa pelo relay: `playerId`, x/y, direção,
vx/vy, moving, sampleSeq e life; o envelope inclui seq/sentAt e o relay atribui
senderId. `life` só identifica a geração do movimento para descartar amostras
anteriores; morte e respawn continuam no fluxo existente.

A room é `pvp-<matchId>-<round>`. O ID vem da partida Convex; round isola novas
rodadas que reutilizam o mesmo documento. A presença Convex continua na room
`pvp-arena-test:<matchId>`, com posição fixa de entrada e heartbeats/leases.
Lobby, create/join, equipes, participantes, metadados/cosméticos, morte, respawn,
score e vitória continuam no Convex. O relay valida hits e mantém o HP imediato;
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
O hit precisa atingir o primeiro corpo antes de uma parede; não aceita morto,
aliado, self, outra room, vida antiga, tiro inexistente/expirado/reutilizado.

O cliente envia `pvp-hit-attempt {projectileId,targetId,targetLife}` antes de
destroy; não envia dano. O relay consome o tiro e aplica até 25 HP, emitindo
`pvp-combat-state` (authorityId/version/round/damageRevision, HP por playerId/life)
e `pvp-hit-result` (accepted/reason/damage/HP antes/depois). `PvpDamageClient`
projeta HP sem deixar snapshots Convex antigos restaurá-lo. A mutation pública
`pvpMatches.hit` está desativada. Cada hit aceito gera uma mutation **interna**
serializada, revisionada, que espelha HP e usa as regras existentes de morte,
respawn e score. Falha de persistência interrompe combate e pede reentrada.

Use um único relay por deployment local. Isso ainda não é anti-cheat completo:
movimento continua informado pelo cliente; validação usa posições mais recentes,
12 px de tolerância no corpo e 80 ms de tolerância no trajeto, sem rewind/rollback.
Latência alta pode rejeitar um impacto visual. O estado é de teste e não persiste
projéteis após reiniciar o relay. Não há novo timer, socket ou polling no cliente.

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

O relay existente é de desenvolvimento, sem autenticação Convex. A room e o
filtro de participantes isolam o tráfego normal, mas não comprovam a identidade
de um cliente malicioso. Esta integração não adiciona autoridade de hits.

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
