# NPC do pátio

Asset gerado com a ferramenta integrada de geração de imagens, usando
`assets-drafts/mendiga.png` como referência de identidade. O original foi preservado.
A segunda geração preserva o desenho aprovado e diferencia poses de passada
aberta e passagem. O ciclo continua estilizado/arrastado; não é uma animação
anatômica completa com alternância perfeita de pernas.

## Sheet e registro

- `mendiga-walk.png`: 512 × 576, 4 colunas × 4 linhas.
- Frames: 128 × 144, transparência, baseline dos pés em y=143.
- Linhas: frente, direita, esquerda, costas (ordem conferida na arte).
- Escala no jogo: .5; velocidade: 32 px/s; animação: 7 FPS.
- `mendiga-walk-registration.json`: bounds originais e escala uniforme aplicada.
- `mendiga-walk-preview.html`: preview animado independente do jogo.

Registro técnico usando o pipeline existente, sem esticar frames individualmente:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/register-character-sheet.ps1 -Source assets-drafts/mendiga-walk-raw-v2.png -OutputPrefix public/assets/npc/mendiga-walk -Columns 4 -Rows 4 -FrameWidth 128 -FrameHeight 144 -ContentHeight 132 -PreviewScale 2
```

Configuração em `src/npc/mendigaPatrol.js`. Trajeto definido pelos pontos
`mendiga-patrol-1` até `mendiga-patrol-4` na layer Notes de `outside.tmj`.
Posicione os pontos e todo o caminho entre eles em áreas livres: esta NPC é
decorativa, não usa pathfinding nem bloqueia o jogador. Cada cliente anima
localmente; não há sincronização ou chamadas Convex para a NPC.

## Prompts

Geração inicial: elderly stern hooded woman, gray hair, olive brown patched coat,
ragged mauve dress, bag and yellow cheese; hooked nose and scowling face.
Exactly 16 full-body sprites, 4 columns × 4 rows, transparent gutters,
four walking poses per direction, equal scale, centered heads and aligned soles,
richly shaded pixel RPG style readable at 65–75 pixels high.

Revisão: preserve approved identity/style/clothing/hood/face/cheese/bag;
fix walking pose clarity and grid registration only. Row order DOWN, RIGHT,
LEFT, UP. Column 1 left leg forward/right behind; column 2 passing with lifted
foot; column 3 opposite stride; column 4 opposite passing. Strong silhouette
difference between extended stride and passing in profile, slight bag swing,
stable torso, visible lower legs and shoes. Exactly 4 × 4, transparent background,
generous gutters, no extra pixels/decorations outside sprites.
