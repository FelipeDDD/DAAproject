# Combat Sandbox

Execute `npm run dev` e selecione **Combat Sandbox** no cabeçalho do VFX Lab.
Abra diretamente em `/tools/vfx-lab/?mode=combat` se preferir. O link **VFX Laboratory**
leva de volta às quatro barras de efeitos.

Escolha um inimigo em **Enemy** ou selecione **Mixed encounter** e clique em **Start fight**.
A composição mista inicial tem uma Poison Slime, uma Frost Slime e uma Big Slime.
Cada seletor permite de zero a três do mesmo tipo. Mushroom tem uma vaga e o
encontro aceita até seis inimigos no total.
Alterar a composição prepara a luta. **Reset fight** repete a composição atual. Use WASD ou
as setas para mover Michael e o mouse para mirar. **Pause AI** congela os movimentos,
ataques e status do encontro. Michael ainda pode se mover e atacar. **Show hitboxes**
mostra as áreas do corpo, dos pés e do projétil. **Reset fight** reinicia com 100 HP.
Trocar de inimigo encerra o encontro e mostra o novo adversário em espera.

## Balance Editor

Abra o Sandbox pelo Vite em `localhost` ou `127.0.0.1`. Em **Balance Editor**,
escolha uma habilidade ou inimigo e ajuste a coluna **Experimental**. **Reset
fight and test** aplica o rascunho a um encontro novo. **Save to Source** mostra
as diferenças e pede confirmação antes de gravar `src/combat/balance.json`.
Recarregue o Lab ou o Swamp para usar a nova configuração salva.

**Restore Saved** relê o arquivo atual. **Reset Original** carrega o snapshot em
`src/combat/balance.original.json` como rascunho. **Export JSON** e **Import JSON**
permitem trocar presets completos. A última versão anterior ao salvamento fica
em `src/combat/balance.json.bak`. A gravação só está disponível em um servidor
Vite vinculado ao loopback, com o Quick Tunnel desligado.

## Paridade com Swamp V3

O Sandbox e o Swamp usam `CombatBout`, `CombatSkillRunner` e o registro `ENEMIES`
para resolver os mesmos ataques. Ajuste as habilidades de Michael em
[`combatSkills.js`](../../src/vfx/lab/combatSkills.js), os disparos e saltos das
Slimes em [`slimeVariants.js`](../../src/vfx/lab/slimeVariants.js), e o bote e as
fintas da Snake em [`snakeEnemy.js`](../../src/vfx/lab/snakeEnemy.js).
Os parâmetros da Frog ficam em [`frogEnemy.js`](../../src/vfx/lab/frogEnemy.js).

Por padrão, os dois modos ativam **Anti-kiting attacks** e **Residual poison cloud**,
usam **By variant** e deixam **Randomized timings** desligado. Esses controles
mudam apenas a sessão do Sandbox. A velocidade base de Michael é 128 px/s nos dois modos.

O Sandbox usa as bordas do anel e permite configurar o encontro e o loadout. O Swamp
usa as colisões reais do mapa para movimento e ataques, incluindo projéteis e pousos.
Spawns, emboscadas, A\*, raio dos pés, roaming, Pack Aggro, retorno ao spawn, cura
fora de combate e reagro ficam em [`mobConfig.js`](../../src/swamp/mobConfig.js).
O Sandbox usa a regra de aggro do anel. O Swamp pode perder o alvo após 2 s
além de 500 px ou após o timeout de rota. Ao recuperar o alvo, a navegação pode
sinalizar uma oportunidade de contra-ataque e o mob usa a mesma execução da habilidade.
O Return Trap também impõe um tempo mínimo de reação na entrada da Snake.

## Loadout de Michael

Abra **Loadout**, escolha **LMB**, **Q**, **E** ou **R** e clique numa habilidade. A barra sob a arena muda na hora. O conjunto inicial é Ember Cleave, Copper Lash, Life Steal e Meteor Strike. Também estão disponíveis Frost Knives (arco com Slowed), Fireball (explosão no contato ou no alcance máximo) e Ice Lance (primeiro alvo com Slowed). Passe o mouse sobre a habilidade para consultar valores de combate.

Escolha um dos três presets, digite um nome e use **Save preset** para gravar os quatro slots. **Load** recupera esse conjunto. O navegador também guarda a configuração em uso, inclusive edições posteriores ao último Save. O formato local tem versão e usa IDs de habilidade. Reset reinicia a luta com os slots atuais.

A recarga começa ao aceitar o comando e pertence à habilidade, inclusive ao trocar slots ou carregar presets em combate. A faixa de casting mostra quanto falta para o golpe. Stunned interrompe a preparação e a recarga continua. Depois da liberação, o projétil ou a animação pode terminar enquanto outra habilidade é usada. **Pause AI** continua permitindo testar golpes contra alvos imóveis.

Para adicionar uma habilidade, cadastre um ID em `src/vfx/lab/combatSkills.js`, com a miniatura, o efeito e os valores efetivos de combate. Os slots, a biblioteca e os tooltips leem o registro. Reutilize um dos comportamentos de arco, ponta, raio, projétil ou área de chão. Um comportamento novo precisa de resolução em `CombatSkillRunner.js` / `CombatBout.js` e da apresentação correspondente em `CombatSkillView.js`.

Life Steal mede da mão ao centro da hitbox do primeiro alvo atingido. O tooltip lista dano e cura por faixa. Durante os 750 ms de preparação, Michael anda a 30% da velocidade disponível após os outros efeitos de lentidão. O dano aparece sobre o inimigo no acerto. A cura fica limitada pelo teto da faixa e pelo HP retirado do alvo. Cada um dos quatro orbes cura uma parcela inteira quando chega à mão. No último, aparece sobre Michael um único número verde com a cura efetiva total, quando maior que zero. Derrota e Reset cancelam as parcelas e o popup pendentes. Copper Lash sorteia 50% de chance de crítico por alvo tocado pela ponta no estalo.

Meteor Strike mantém a área fixa desde o início do aviso. A rocha cai na parte final da preparação e o dano coincide com o primeiro quadro de impacto. Fica para uma próxima rodada comparar o aviso e a queda do Sandbox com a versão do VFX Lab.

## Poison Slime

O Slime detecta Michael a até 220 px e se aproxima com pequenos saltos. O Jump Attack
tem 500 ms de preparação. A sombra escurece e seu contorno avança até o pouso, que
causa 24 de dano se o círculo atingir os pés. Poison Shot faz a preparação no corpo
do Slime e tem um projétil verde visível. Um acerto causa 16 de dano direto e renova
um único Poisoned de 4 ticks, 3 HP a cada segundo.

**Residual poison cloud** mantém uma névoa de chão após o pouso ou o fim
do projétil. Cada névoa dura até 2,7 s e é substituída pela seguinte. Após um segundo
de contato contínuo ela causa 2 de dano, com um intervalo de um segundo entre ticks.
O status Poisoned tem prioridade sobre os ticks da névoa. Cada Slime verde mantém no máximo uma névoa residual.

## Variantes e áreas de morte

As quatro áreas de morte duram 10 s e desvanecem no chão. A sobreposição corporal causa dano com 1 s de recarga por Slime e uma janela compartilhada de 200 ms entre contatos. Durante o salto ofensivo, o dano do próprio salto é resolvido no pouso. Um pouso que acerta consome também a recarga de contato daquele Slime.

| Inimigo | Preparação do salto e contato | Área após a morte |
| --- | --- | --- |
| Poison Slime · 100 HP | 500 ms de preparação. Contato causa 6 de dano. | Poça verde. Entrar aplica Poisoned e permanecer renova o mesmo efeito, inclusive quando duas poças se sobrepõem. |
| Frost Slime · 100 HP | 500 ms de preparação. Contato causa 6 de dano. Pouso e projétil reduzem a velocidade em 50% por 2,3 s. | Gelo. Dentro da elipse, Michael anda a 45% da velocidade. Ao sair, volta à velocidade correspondente aos status restantes. |
| Big Slime · 180 HP | 650 ms de preparação. Contato causa 10 de dano. | Poça roxa com raio horizontal de 49 px. Causa 9 de dano a cada 600 ms de contato contínuo. |
| Swift Slime · 60 HP | 400 ms de preparação. Contato causa 4 de dano. O pouso causa 17 de dano e 1 s de Stunned. | Campo elétrico. Entrar paralisa o movimento por 500 ms. Para repetir o stun é preciso sair e entrar de novo, ao menos 1,3 s após a ativação anterior daquele campo. |

Para testar a esquiva, selecione **Swift Slime**, clique em **Start fight** e saia do círculo amarelo assim que a preparação começar. Em **Mixed encounter**, o seletor da Swift começa em zero e aceita até três, respeitando as seis vagas do encontro.

### Ajustar ou criar uma variante

Em `src/vfx/lab/slimeVariants.js`, cada entrada de `SLIMES` herda os parâmetros básicos de salto e perseguição. Na Swift, `speed` acelera o ciclo dos saltos de aproximação, `zigzag.amplitude` define o desvio lateral máximo em pixels e `zigzag.frequencyHz` controla a oscilação durante esses saltos. O alvo do Quick Jump fica fixo desde o aviso no chão.

Para adicionar uma variante, defina uma chave em `SLIMES` com nome, paleta, escala, tamanho da hitbox, HP, parâmetros de ataque e a chave de uma área de morte de `combatAreas.js`. Use `shot: null` para uma variante que só salta. O registro de combate e os dois seletores leem essas definições. Gere a folha da nova paleta com `node tools/vfx-lab/generate-pixelfx.mjs "<checkout do pixelfx>" --combat`. A revisão da biblioteca está em [SOURCES.md](SOURCES.md).

Ember Cleave pode atingir cada corpo no arco uma vez. Copper Lash pode acertar os corpos tocados pela ponta no estalo. Life Steal drena apenas o primeiro corpo no raio. As áreas medem contato nos pés. Gelo, veneno e dano das poças roxas podem coexistir. Após a última morte, Michael ainda pode andar e precisa sobreviver até as áreas e o veneno terminarem.

## Timings e ataques de retirada

**Randomized timings** varia as recargas dos Slimes em ±20%, incluindo a do ataque especial. Cada Slime sorteia na própria sequência quando inicia um ataque. Os avisos e os quadros de animação mantêm seus tempos. O Ghost usa sua IA habitual.

Cada Slime adquire Michael como alvo a até 220 px ou ao receber dano de uma habilidade. Continua perseguindo enquanto o alvo estiver ao alcance da arena. Só desiste depois de 1,8 s contínuos além de 460 px. Esses limites usam coordenadas do mundo. O anel atual mede 288 × 288 px.

Com **Anti-kiting attacks** ativo, fugir por 450 ms arma o especial. Após uma aproximação a 140 px, o gatilho fica em 170 px. Se o primeiro contato ocorreu mais longe, basta abrir 30 px sobre a menor distância alcançada, respeitando o mínimo de 170 px. Uma margem de 10 px evita reiniciar a contagem ao oscilar na borda. Um primeiro golpe recebido de longe também permite um contra-ataque. A Slime guarda a oportunidade enquanto persegue, termina a ação em curso e começa a carga a até 360 px quando estiver livre e sem projéteis em voo. A carga dura 550 ms e termina com o disparo mesmo que Michael continue fugindo.

Após o disparo, a Slime recua durante até 300 ms na direção oposta a Michael. A borda da arena encurta o passo. Poison e Frost recuam 34 px, Big recua 26 px e Swift recua 42 px. A Slime continua vulnerável e depois retoma a luta. Para outro especial é preciso voltar a até 140 px e fugir novamente. A recarga individual parte de 6,2 s e há 1,05 s entre inícios de especiais no encontro.

Em **Special**, escolha **By variant** para usar Homing Shot com Poison e Swift ou Spread Volley com Frost e Big. As outras opções forçam a modalidade escolhida para os quatro Slimes. Homing Shot viaja a 220 px/s e dura até 1,7 s. A correção é de até 1,10 rad/s nos primeiros 440 ms e 0,18 rad/s depois, com teto acumulado de 0,65 rad. Spread Volley mira no lançamento e tem três trajetórias retas a 260 px/s, separadas por cerca de 19,5°, com duração de até 1,5 s. Cada rajada pode causar dano a Michael uma vez. O dano especial por variante é 16 para Poison e Frost, 20 para Big e 12 para Swift. Os projéteis expiram ao sair dos limites da arena. Os valores estão em `src/vfx/lab/slimeVariants.js`.

## Snake e Frog

Escolha **Snake** ou **Frog** em **Enemy** para testar um adversário isolado. Em
**Mixed encounter**, adicione até três de cada entre as seis vagas do encontro.
Use **Show hitboxes** para ver o corpo e a área ativa da cabeça durante o bote.
Ambas detectam Michael a 220 px ou ao receber dano e desistem após 1,8 s
consecutivos além de 460 px. A arena usa os ciclos de perfil do PixelFX espelhados
para esquerda e direita durante o movimento.

- **Snake** tem 80 HP e rasteja alternando aproximação com desvios laterais.
  Quando a perseguição é predominantemente vertical, usa diagonais a 32°
  com trechos de 300–500 ms e acompanha cada trecho com o espelhamento.
  **Venom Bite** contrai o corpo durante 450 ms, avança na direção escolhida
  e só causa dano quando a cabeça atravessa a hitbox de Michael. Um acerto
  causa 15 de dano e aplica Poisoned com os quatro ticks habituais. O intervalo
  mínimo entre mordidas é de 2,2 s. A Snake pode recuar 32 px, buscar um flanco
  e tentar uma finta com 35% de chance quando há espaço. Ajustes em
  `src/vfx/lab/snakeEnemy.js`.
- **Frog** tem 90 HP, avança em pulos curtos com pausas e tenta ficar a
  cerca de 70 px de Michael. **Leaping Slam** marca um destino a até 118 px,
  agacha por 420 ms e salta. O pouso causa 18 de dano se alcançar os pés
  dentro do raio de 24 px. **Long Leap** tem 40% de chance por oportunidade
  acima de 118 px e até 192 px, aviso de 500 ms e a mesma área e dano no pouso. A recarga
  própria é de 6,5 s e um sorteio sem sucesso espera 2,4 s até o próximo.
  A animação original estende a língua para uma mosca
  pintada nos quadros. Essa língua é visual. Ajustes em `src/vfx/lab/frogEnemy.js`.

## Mushroom

Escolha **Mushroom** em **Enemy** ou acrescente uma unidade em **Mixed encounter**.
O Mushroom tem 800 HP, persegue a 44 px/s e usa uma caixa de 40 × 44 px sobre o
corpo. O pacote original tem Idle, Attack e Death. Durante a perseguição, o jogo
desloca o ciclo Idle e espelha a vista de três quartos. A escala de 65% usa
nearest e cada folha tem um pivô alinhado aos pés. [Origem e licença](SOURCES.md)

- **Spore Burst** carrega por 800 ms com partículas no chapéu e solta três
  esporos em leque. Cada rajada pode tirar até 16 HP.
- **Toxic Bloom** marca três pontos ao redor da posição de Michael e ativa
  as áreas após 1 s. As nuvens duram 5 s e renovam o mesmo Poisoned ao pisar
  nelas ou continuar dentro. O Mushroom mantém até três nuvens e as áreas
  liberadas somem quando ele morre ou o combate reinicia.

### Fases do boss

| Fase | Marcos de HP | Invocações | Controle de área | Recarga dos ataques normais |
| --- | --- | --- | --- | --- |
| Infection | 90%, 80% | Mini Poison Slime, 45 HP, 65% do tamanho normal, salto venenoso de 12 | Toxic Bloom | 100% |
| Proliferation | 70%, 60%, 50%, 40% | Poison Slime de 100 HP ou Big Slime de 180 HP | Toxic Bloom ou Sporecap | 88% |
| Enraged | 35%, 25%, 15% | Uma Enraged Big Slime aos 35%, 260 HP, salto de 42 e contato de 12 | Toxic Bloom ou Sporecap nos marcos seguintes | 76% |

O golpe que alcança um marco para exatamente nele. O Mushroom termina o ataque
que já começou e fica protegido durante o evento. A preparação dura 1 s e a
recuperação, 600 ms. O relógio do combate controla a proteção, inclusive durante
**Pause AI**. Cada marco vale uma vez. O excesso de dano se perde.

Nas duas primeiras fases, o sorteio dá 50% para invocação e 50% para controle.
Com duas invocações anteriores vivas ou seis inimigos vivos no encontro, entra
controle de área. A Sporecap usa a mina do VFX Lab. Após o aviso ela dura até
5,9 s e dispara uma vez, causando 12 de dano e Poisoned. A Big Slime especial
aparece mesmo que ainda existam invocações anteriores. Se o encontro já tiver
seis inimigos aos 35%, o Mushroom usa Toxic Bloom e a invocação especial ocupa
a primeira vaga liberada. A luta continua até derrotar os sobreviventes e
escapar dos efeitos no chão.

Abra **Mushroom debug**, escolha **Starting phase** e clique em **Start fight**.
As fases 2 e 3 começam no próprio marco de entrada. O painel mostra fase, próximo
marco, último evento e eventual espera por vaga. Ajuste HP, marcos, pools,
recargas e variantes em `src/vfx/lab/mushroomBoss.js`.

## Ghost

O Ghost detecta Michael a até 226 px, flutua em torno de uma distância média
e se aproxima para usar Haunt. **Spectral Bolt** carrega perto do corpo por 490 ms
e dispara um orbe violeta que causa 17 de dano. **Haunt** carrega por 450 ms,
avança até o ponto escolhido no início do ataque e pulsa ao chegar. Se o pulso
alcançar os pés de Michael, causa 22 de dano e reduz a velocidade em 28% por
1,7 s. O Ghost se afasta antes de voltar a patrulhar a distância média.

A luta usa o espaço central livre do mapa de testes. Os inimigos se movem dentro
desse espaço, com caixas corporais que acompanham o salto do Slime ou a oscilação
do Ghost. Os raios de pouso e do pulso são medidos no chão. HP, status e recargas
são locais à luta. Cada inimigo tem suas próprias fases e projétil. A pausa congela
as IAs, as áreas e os ticks. Reset limpa todos esses estados.
