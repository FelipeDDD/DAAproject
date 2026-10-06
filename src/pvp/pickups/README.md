# PvP pickups

`spots.js` procura os nomes exatos de `PVP_PICKUP_SPOTS` nas Object Layers já
existentes, usando `objectsIn()` para aplicar os offsets da layer. No mapa atual,
todos estão em **Notes**. Os quatro `heal-*` são pontos: cada ponto representa o
**centro lógico** do pickup. Os retângulos `buff-top` e `buff-bottom` usam o centro
geométrico (incluindo rotação). Para mover um pickup, mova o objeto correspondente
no Tiled, preserve seu nome e salve `public/assets/maps/payload-map.tmj`. Recarregue
os browsers e reinicie o relay com uma nova partida para que todos leiam o mapa.

## Gameplay e authority

- `config.js`: nomes/tipos, `collectionRadius: 24` e `healRespawnMs: 20_000`.
- `gameplay.js`: área lógica e handlers de efeitos. Health retorna uma cura até
  `effectiveMatchSettings(match, player.team).maxHp`; HP cheio não produz efeito.
- `PvpPickupAuthority.js`: estado por round, consumo síncrono, respawn e teardown.
- `state.js`: validação do snapshot de rede.

Cada pickup é `{id, type, x, y, available, respawnAt}`. Os nomes red/blue indicam
a posição no mapa: qualquer equipe pode coletar qualquer health pack.

O `PvpDamageAuthority` recebe os spots do mapa carregado pelo relay. Após um
`pvp-movement` aceito, verifica o jogador autenticado naquele peer/room/round,
life atual, estado ativo, presença na arena, jogador vivo, distância do **pé do
player** ao centro do pickup e HP abaixo do máximo efetivo. A área é um círculo
fixo de 24 unidades do mundo; texture/scale/bob não participam da coleta. As
posições seguem o modelo de movimento já existente do PvP, informado pelos
clients e validado pelo relay; não foi introduzida outra simulação de movimento.

A primeira amostra válida consome o pack antes de qualquer await. A cura segue
o espelhamento autoritativo de HP já existente no Convex. Disponibilidade e
deadline são estado efêmero do relay por round, enviados no mesmo
`pvp-combat-state` que o HP. O client projeta sempre o snapshot mais recente,
com as mesmas verificações de authority/version/round do combate. Um eco Convex
não restaura a disponibilidade.

O deadline é incluído no scheduler central da authority. Só o servidor reativa
o pack; passar do deadline no browser nunca o torna disponível. No end, os
deadlines são descartados e novas coletas são bloqueadas. No Retry, o relay fecha
a authority antiga e cria outra para o novo round: health packs disponíveis,
sem deadlines antigos. A view reseta e aguarda o snapshot da nova authority.
O regen de Payload continua com suas regras anteriores; a coleta não muda seu
agendamento nem a lógica específica de TDM/Payload.

`buff-top`/`buff-bottom` são reconhecidos como `type: "buff"`, mas ficam
`available: false, respawnAt: null`. Não possuem handler de efeito nem visual.
Para um próximo tipo, acrescente o handler em `gameplay.js` e o estilo em
`visualConfig.js`, sem espalhar condições por ID na cena.

## Visual e DEV

`visualConfig.js` controla texture (já carregada na cena), scale, offsets, depth,
bob, rotação, pulse e efeitos opcionais de collect/respawn. `PvpPickupView.js`
desenha uma maleta branca com alça, base sombreada, fechos e cruz verde.
As cores ficam em `caseColor`, `caseShadeColor`, `handleColor`, `latchColor`,
`borderColor` e `color`; `placeholderRadius` controla suas proporções.
Se o texture não existir, usa o placeholder. Alterar o asset não muda o raio.
Nenhum timer visual altera HP ou disponibilidade.

O idle usa ondas senoidais: bob de ±4 px (1200 ms por direção), oscilação de
±0,07 rad (1800 ms por direção) e pulse do glow (1400 ms por direção). Não cria
tweens. `rotationMode: 'spin'` permite giro completo, usando `rotationDurationMs`
por volta; aumente esse tempo para um giro lento. `rotationMode: 'none'` desliga.
O glow é uma elipse suave de 30×10, alpha 0,18, escala 1, depth -1,8, fixa no
chão; seu alpha varia ±18% e sua escala ±4%. Não representa a área de coleta.

Cada mudança de disponibilidade pode criar **um tween finito**, sobre valores
cosméticos usados pela view. Coleta: escala 1 → 1,18 e fade out em 200 ms; o
servidor já consumiu o pack durante essa breve imagem residual. Respawn:
alpha 0 → 1 e escala 0,8 → 1 em 320 ms, com glow inicialmente 1,4× mais forte.
Ambos usam `Sine.Out`. O primeiro snapshot apenas mostra o estado atual, sem
reproduzir efeitos anteriores. `reset`, fim da partida e `destroy` cancelam
transições pendentes; Retry reaproveita os objetos com valores restaurados.
O glow e o ícone são destruídos juntos ao remover a view.

O debug fica desligado normalmente. Em DEV, use `VITE_PVP_PICKUP_DEBUG=true` ao
iniciar o Vite, ou `localStorage.setItem('daa-pvp-pickup-debug','true')` no console
e recarregue. Ele mostra ID, círculo lógico, disponibilidade e cooldown restante.
Para desligar, remova a chave e recarregue.

Validação focada: `node --test tests/pvpPickups.test.js tests/pvpRegen.test.js tests/pvpMatchSettings.test.js`.
