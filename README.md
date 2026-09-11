# DAAproject

Protótipo local em JavaScript, Phaser e Vite. O mapa atual vem do Tiled,
com seis mesas, colisão e duas portas de teste. Sem multiplayer ou backend.

## Executar

Na pasta do projeto:

```powershell
npm.cmd install
npm.cmd run dev
```

Abra o endereço indicado pelo Vite. Use WASD ou setas para andar, **E** perto
de uma porta para abrir/fechar e **F** para acessar o destino de uma porta aberta.
Na área placeholder, **Esc** volta à escola na posição anterior. Os estados das
portas são preservados durante essa visita, mas reiniciam ao recarregar a página.

`npm.cmd test` executa testes com o Node; `npm.cmd run build` compila o projeto.

## Colisão no Tiled

Arquivo: `public/assets/maps/classroom.tmj`, layer **Collision**.

- Qualquer tile pintado nessa layer bloqueia os pés do personagem; apague o tile
  para liberar a passagem. Não é necessário definir uma propriedade `collides`.
- A layer é sempre invisível no jogo, mesmo que você a deixe visível no editor.
- Já estão marcados os limites e as seis mesas de 2×4 tiles da sala principal:
  colunas 26, 30 e 34, nas linhas 17 e 25 (coordenadas iniciando em zero).
- `Floor`, `Walls` e `Objects` são visuais: não criam colisão automaticamente.
  Se mover uma mesa ou parede, mova sua marcação na `Collision` também.
- Deixe as aberturas das portas vazias em `Collision`; os bloqueadores das portas
  controlam essas passagens. Pintá-las nessa layer as bloquearia permanentemente.
- Como alternativa aos tiles, pode substituir `Collision` por uma object layer
  com o mesmo nome e retângulos sem rotação. Polígonos/elipses não são suportados.
  Use apenas uma layer com esse nome, na raiz do mapa.

O carregamento está em `src/maps/collision.js`, chamado por `SchoolScene.js`.
A hitbox em `src/entities/Player.js` continua com tamanho 20×12 e offset (6,44),
em pixels da textura antes da escala. A câmera e a escala continuam definidas em
`src/game/settings.js`, sem alterações nesta implementação.

## Configurar portas

Edite **`src/maps/doors.js`**. Cada entrada define os estados iniciais `open` e
`locked`, posição, dimensões, imagens e destino opcional. Todas as coordenadas
são **pixels do mundo**, sem multiplicar pelo zoom.

As duas portas de teste estão em:

- `classroom-exit`: trecho estreito de saída para o corredor, tile (18,15),
  cobrindo três tiles na horizontal. Possui destino de teste.
- `bathroom-entry`: abertura existente no banheiro ao norte, tile (12,7).
  Só abre/fecha, sem destino.

Para trancar uma porta:

```js
open: false,
locked: true,
```

Uma porta trancada não abre nem permite viajar. Se `open` e `locked` começarem
ambos como `true`, ela será criada fechada. Os estados em execução ficam nas
instâncias de `Door` em `SchoolScene.doors`; use `toggle(player.body)` para alternar
com atualização de visual e física. A porta não fecha sobre os pés do jogador.

Para configurar o destino da saída:

```js
targetMap: 'empty-area',
targetX: 320,
targetY: 256,
```

Nesta primeira versão, `targetMap` é a **chave de uma cena Phaser registrada**,
não o caminho de um arquivo TMJ. `empty-area` usa `src/scenes/EmptyAreaScene.js`.
Para um mapa real, registre sua cena em `src/game/config.js`, faça-a carregar o
TMJ e usar `targetX`/`targetY` recebidos em `create(data)` como posição dos pés.
Remova `targetMap` para uma porta que só abre/fecha, como a do banheiro.

**E** abre/fecha; **F**, perto da porta aberta, pausa a escola e inicia a cena de
destino. Caminhar pela porta aberta também permite seguir no mapa atual. A
transição explícita evita trocar de área por acidente durante os testes.

Para trocar a arte sem animação, configure duas texturas ou frames:

```js
closedVisual: { texture: 'meu-spritesheet', frame: 0 },
openVisual: { texture: 'meu-spritesheet', frame: 1 },
```

Carregue essa textura/spritesheet no `preload` da cena. Os desenhos provisórios
ficam em `src/art/doors.js`; a lógica e o bloqueador ficam em `src/entities/Door.js`.
O visual se ajusta a `width`/`height` da porta, sem mudar seu bloqueador ao abrir.

## Validação

Testes automatizados verificam abertura/fechamento, trava, proteção contra fechar
sobre os pés, seleção de frames, destino opcional, colisão nas seis mesas,
aberturas livres na layer e caminhos que não contornam portas fechadas.
Os testes de portas usam adaptadores de render/física; os de caminhos verificam
a geometria do mapa. Não substituem um teste do Arcade Physics no navegador.

Compilação passou, com o aviso de bundle maior que 500 kB por incluir Phaser.
O navegador de teste estava indisponível nesta sessão. Conferência manual pendente:

1. Encostar nas mesas e paredes; os pés devem parar, inclusive na diagonal.
2. Tentar atravessar a saída fechada; abrir com E, atravessar e fechar pelo outro lado.
3. Com os pés na abertura, pressionar E: a porta deve continuar aberta.
4. Abrir a saída e pressionar F; andar na área vazia e retornar com Esc.
5. Ir ao banheiro pelo corredor, abrir/fechar sua porta com E, sem trocar de cena.
6. Definir `locked: true`, recarregar e confirmar que a porta não abre.
