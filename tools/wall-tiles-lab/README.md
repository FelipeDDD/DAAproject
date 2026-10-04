# Classroom: diagnóstico de paredes

## Abrir o teste

Execute `npm run dev` e abra `/tools/wall-tiles-lab/` no endereço do Vite.
O visualizador usa **public/assets/maps/classroom-wall-lab.tmj**, uma cópia inicial
exata de classroom.tmj, na mesma pasta para manter os caminhos relativos dos TSX.
Pode abrir essa cópia diretamente no Tiled. Arraste para mover a câmera; compare
0,75× / 1× / 2× com grade e contornos das colisões.

**Isolamento:** nenhum código do jogo principal referencia a cópia. O visualizador
não importa MapScene, autenticação ou Convex. Não é uma sala jogável: não inclui
NPCs, HUD, portas interativas e decoração adicional criada por SchoolScene.
As camadas, objetos, dimensões e colisões foram preservados. Os TSX/imagens antigos
continuam compartilhados: não edite esses recursos para fazer experiências;
crie um TSX e uma imagem novos e associe-os apenas à cópia.

## Resultado da inspeção das três imagens

Todas têm **1448×1086 pixels, RGB opaco, sem canal alpha**. Nenhuma constitui um
atlas regular de células 32×32. Há fundo escuro, intervalos desiguais, peças em
escalas diferentes e, na primeira, texto incorporado à imagem. Não basta escolher
tile size 32 no Tiled ou reduzir a folha inteira.

| Referência em assets-drafts/tilesets | Aproveitamento | Problema principal |
| --- | --- | --- |
| Atlas de Paredes Escolares em Azulejos.png | Melhor referência: face bege, rodapé azul e trechos N–S vistos por cima | A indicação 32×32 é ilustrativa. Capas, faces e cantos têm larguras incompatíveis |
| Conjunto Modular de Paredes Pixel Art.png | Paleta, acabamento de paredes e algumas terminações | Vários cantos em V/isométricos, inadequados à grade ortogonal |
| Tileset de Paredes e Portas em Pixel Art.png | Referência de portas, janelas e painéis | Colunas frontais não substituem paredes N–S vistas por cima; cantos inconsistentes |

As referências permanecem intactas e ignoradas pelo Git. O visualizador as abre
localmente em tamanho original para inspeção; não as incorpora ao jogo/build.

## Paredes atuais

- Mapa: **40×30 tiles, 32×32, 1280×960 pixels**. Classroom inclui os corredores.
- `src/art/mapPlaceholders.js` desenha **26 objetos wall** de Entities como
  retângulos bege, normalmente 32×32 (há também 64×32).
- Outros **17 objetos** de FloorDetails/Entities usam GID 1609, inclusive com
  flip. É o frame 23 do `campus/prototype.tsx`, originalmente **128×128**.
  Eles são redimensionados para aproximadamente 32 pixels de largura e alturas
  variáveis, até **769,67 pixels**. Há posições/dimensões fracionárias.
- A camada Walls também contém tiles; não é suficiente trocar só os placeholders.
- Colisão é independente, na camada Collision. Ela contém também móveis: não
  deve ser convertida automaticamente numa máscara de paredes.
- Objetos-tile do Tiled usam Y na base; retângulos usam Y no topo. Uma substituição
  precisa respeitar essa diferença, os flips e os espaços das portas.

## Menor conjunto coerente a preparar

Primeiro normalizar um kit ortogonal, sem portas/janelas:

1. Um segmento horizontal repetível com capa, face bege e rodapé azul.
2. Um segmento vertical N–S **apenas com a capa vista por cima**.
3. Quatro cantos exteriores: NW, NE, SW, SE, com bordas no mesmo ponto da célula.
4. Terminações para portas e pontas abertas. Cantos interiores e T entram na
   próxima etapa, conforme necessário nos corredores.

Começar com células 32×32. A célula não obriga a parede a ter 32 pixels de
espessura: vale comparar capas de **12 e 16 pixels**, alinhadas ao mesmo eixo
(por exemplo, x=16 nos segmentos verticais). A face frontal ocupa o restante da
célula horizontal. Estes são valores propostos, ainda não aprovados visualmente.
Se a altura de face desejada não couber, usar peças 32×64 compostas por dois tiles,
sem esticar a imagem. Não girar a face bege para obter o segmento vertical.

Retirar o fundo exterior preservando os contornos escuros da arte; recortar e
registrar peças individualmente; ajustar costuras/luz/paleta; reconstruir os
cantos que estão em perspectiva incorreta. Exportar PNG transparente + TSX novo.
Na primeira folha há detalhes úteis, mas os cantos **precisam de reformulação**,
não somente de recorte.

Antes de aplicar ao corredor, testar um retângulo fechado (por exemplo, 6×4
células), uma passagem de porta e repetições longas em 1×/2×. Depois substituir
somente visuais na cópia, repetindo peças por trechos em vez de esticar a textura.
Preservar Collision e aberturas existentes. Não substituir automaticamente todos
os objetos pelo nome ou por retângulos de colisão.

## Limite desta entrega

Cópia e bancada prontas; **não há atlas final nem paredes novas aplicadas**.
Os desenhos fornecidos não têm os encaixes necessários para uma substituição
direta fiel. O próximo passo é produzir/registrar esse kit mínimo e aprovar o
quadrado de teste. O mapa original e os PNGs fornecidos não foram modificados.
