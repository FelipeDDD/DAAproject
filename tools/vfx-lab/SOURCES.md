# Arte do VFX Lab

## Folhas do spritefx

As 22 folhas em `sheets/` foram renderizadas offline com o spritefx de Long Nguyen,
revisão [e5867cc](https://github.com/HoangLong256/spritefx/tree/e5867cc05f6e1dc6207b8e1c3c65cef75e6ba51a).
A licença acompanha as receitas em [LICENSE-spritefx.txt](LICENSE-spritefx.txt).
A lista `RECIPES` de [generate-sheets.py](generate-sheets.py) associa cada PNG
ao JSON de origem e registra as substituições de paleta, forma e partículas.

| Barra | Como a arte é usada |
| --- | --- |
| Essentials | Slots 1–6 preservam o Fire Zone do jogo e as adaptações PixelFX existentes. Os slots 7–0 usam blast, shards, spark e smoke. |
| Attacks | Folhas de impacto, meteorito, corte, chão rachado, feixe e névoa. O Phaser desenha as trajetórias de fogo, gelo e veneno, os arcos elétricos entre pontos e a marca de impacto. |
| Area & support | Folhas de ritual, bênção, nova, portal, fumaça, tornado, escudo, neve, energia, raio e vórtice. O Phaser coordena as etapas, o deslocamento, a sustentação e a dissipação. |

Cada célula mantém o tamanho e o pivô da simulação. O manifesto conserva a duração
de cada quadro e o recorte da miniatura. O empacotamento em até oito colunas
evita tiras muito largas. Apenas a página de desenvolvimento carrega essas texturas.

### Regenerar após editar uma receita

As folhas já estão incluídas. Para regenerá-las, use Python 3.11+ em um ambiente
de arte separado e faça checkout da revisão acima do spritefx. Na pasta do projeto,
execute os comandos abaixo, substituindo o caminho pelo checkout local.

```sh
python -m pip install "/caminho/para/spritefx"
python tools/vfx-lab/generate-sheets.py "/caminho/para/spritefx"
```

Para criar uma combinação ou variante usando as folhas existentes, edite
`src/vfx/lab/sequenceEffects.js`. Cada etapa informa o instante inicial, a duração
e a folha ou forma a desenhar. Para criar uma barra, acrescente uma entrada a
`LAB_BANKS` em `src/vfx/lab/effects.js`. O campo opcional `keys` preserva os atalhos de uma barra com vagas.

## Quarta barra e variantes de curadoria

As 22 folhas ativas listadas no manifesto `sheets/pixelfx.json` vêm do
[PixelFX 0.3.1, revisão 5294518](https://github.com/patch-gg/pixelfx/tree/5294518ce7c72e48b6100a744596e0acf57f2826).
O mapeamento de módulos e as duas paletas roxas estão em
[generate-pixelfx.mjs](generate-pixelfx.mjs). Para reproduzir, execute
`node tools/vfx-lab/generate-pixelfx.mjs "/caminho/para/pixelfx"` sobre esse checkout.
O exportador usa o renderizador oficial, amostra a 20 fps, conserva o pivô e
recorta uma margem comum a toda a sequência. A cena compõe os quadros transparentes
sem o ator da galeria. A [licença MIT](../../src/vfx/lab/vendor/pixelfx/LICENSE) e os
[créditos de Patch e Hugo Duprez](../../src/vfx/lab/vendor/pixelfx/NOTICE.md) acompanham o laboratório.

A caveira voadora recebe as paletas de osso e fogo de `shadow/necro-skulls`.
**Frost knives** reexporta `melee/dagger-flurry` com lâminas e faíscas frias.
**Healing Grove** combina `holy/heal` (exportado sem o ator), `holy/heal-aoe` e
`nature/healing-bloom`. A mina usa `nature/spore-burst`. A névoa lateral `nature/poison-cloud` segue disponível em Poison Cloud.
O portal combina `arcane/rune-circle`, `spawn/spawn-portal` e `arcane/portal`.

O Life Steal atual usa a paleta e as fases de `shadow/life-steal` como referência:
quatro orbes locais saem do alvo, pairam e retornam à mão com tamanho constante.
As exportações anteriores `pfx-hands.png` e `pfx-drain.png` ficaram fora do manifesto
e do carregamento da arena.

## Inimigos do Combat Sandbox

`pfx-slime.png` é uma exportação de `critters/slime` da mesma revisão, com manifesto
`combat-pixelfx.json` carregado pela arena. O Phaser usa as fases de preparação
(500–840 ms), voo (900–1440 ms) e recuperação para acompanhar os saltos da IA.
Para regenerar, acrescente `--combat` ao comando de exportação PixelFX. O projétil
venenoso reutiliza o desenho do Poison Shot do laboratório. A névoa opcional é
desenhada em uma elipse no chão pelo Phaser.

`pfx-frost.png` e `pfx-big.png` usam o mesmo `critters/slime`, pivô e fases, com paletas ciano e violeta aplicadas durante a exportação. O impacto gelado usa quadros de `ice/frost-nova` em `pfx-frost-nova.png`. As poças são desenhadas no plano do chão. A poça verde reaproveita o campo de esporos do laboratório.

`pfx-ghost.png` mantém o ciclo de flutuação e a sombra de `critters/ghost`.
`pfx-spectral-orb.png` adapta a escala e o pivô de `arcane/arcane-orb` para a
preparação do Ghost e para o Spectral Bolt. Essas folhas usam o mesmo manifesto e
o mesmo comando de exportação do Slime.

`pfx-snake.png` e `pfx-frog.png` vêm de `critters/snake` e `critters/frog`
da revisão 5294518. O exportador gera 48 quadros de 89 × 17 px para a Snake
e 52 quadros de 82 × 52 px para a Frog, ambos a 20 fps e com pivô no chão.
As sombras, a poeira e a mosca da Frog fazem parte dos quadros originais.

`pfx-combat-meteor.png` usa a queda, o impacto e a dissipação de `fire/meteor` da
mesma revisão. `moves/meteor-call` combina esse efeito com a conjuração da
galeria. A arena usa o ponto de impacto da folha e avança cada quadro em 50 ms.
O primeiro quadro amostrado com impacto coincide com o dano da habilidade.

### Dark Fantasy Mushroom

O Combat Sandbox usa os PNGs originais de Twizzydoesntcode, extraídos de
`Mushroom_Enemie.zip`. O Phaser divide as tiras horizontais em células e usa
um pivô próprio por folha. [Pacote original](https://twizzydoesntcode.itch.io/free-dark-fantasy-mushroom-animated-pixel-art)

| Arquivo em `mushroom/` | Animação | Quadros | Célula (px) |
| --- | --- | ---: | --- |
| `mushroom_idle_sheet.png` | Idle | 12 | 154 × 207 |
| `mushroom_attack_sheet_aligned.png` | Attack | 12 | 134 × 239 |
| `mushroom_death_sheet_aligned.png` | Death | 14 | 156 × 152 |

O [README original](mushroom/README.txt) e o [aviso CC0 1.0](mushroom/LICENSE.txt)
acompanham as folhas. A dedicação aplica-se aos direitos que o autor detém.

## Reações nos personagens

As reações usam diretamente os módulos `status/burning`, `status/poisoned`,
`status/frozen`, `status/stunned`, `status/slowed`, `lightning/electrified` e
`status/haste` da mesma revisão MIT. O laboratório recorta a máscara e lê as cores do
quadro atual do sprite uma vez por quadro de origem. O PixelFX desenha uma camada
atrás e outra à frente do personagem. O pequeno raio X foi desenhado no laboratório;
o Slowed omite o mostrador grande e mantém a película, o contorno e as gotas. O Haste usa dois rastros curtos na paleta do Grove.
Os créditos originais permanecem nos módulos distribuídos.

## Outras ferramentas

- O conjunto PixelFX já usado pelo laboratório está identificado no [aviso local](../../src/vfx/lab/vendor/pixelfx/NOTICE.md).
- PVFX Foundry 1.2 oferece 253 efeitos CC0 e exportação para Phaser pelo Studio.
  A página de distribuição usa download interativo. Nenhuma folha desse pacote foi incorporada nesta edição. [PVFX Foundry](https://nerijs.itch.io/pvfx-foundry)
- CrunchyVFX permite exportar partículas, anéis e impactos como CC0. O aplicativo
  tem licença própria. Para os impactos desta edição foram usadas receitas reproduzíveis
  do spritefx. [CrunchyVFX](https://crunchyvfx.com/)
