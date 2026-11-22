# Curadoria do VFX Lab

As quatro barras contêm 38 habilidades e 75 combinações. Use **Page Up / Page Down** para trocar de barra.
O número em cada botão continua sendo seu atalho. **Play** usa a última mira na arena,
**Loop** repete o lançamento e **Reset** limpa a simulação. As medidas abaixo usam o tempo padrão.

| Barra / tecla | Seleção e teste |
|---|---|
| Essentials / 0 | **Smoke Burst → Smoke screen** mantém a fumaça original, regulável de 32 a 144 px. Em **Camouflage**, lance sobre Sarina e caminhe pela borda. **Fade everyone** ajusta a transparência de todos dentro da elipse. **Team camouflage** mostra aliados como silhuetas; um inimigo dentro da elipse desaparece junto com o nome e a barra. Alterne **Observer** entre A e B ou mude **Opacity** durante o efeito. Michael e o dummy são A, Sarina é B. Camouflage começa com raio de 96 px e aliados a 80% de opacidade. O raio entra em vigor no próximo lançamento. |
| Experiments / 1, 2 | **Ember Cleave** mantém o arco original e Riposte. **Frost Knives** é o golpe curto principal da tecla 2, com lâminas frias que acompanham a mão. |
| Experiments / 3 | **Copper Lash** acompanha a mão e a mira. Aproxime-se do dummy selecionado e clique. No estalo, somente os 7 px em torno da ponta, a cerca de 73 px da mão, podem acertar o centro marcado. O anel verde confirma acerto e o bege mostra onde a ponta errou. |
| Experiments / 4 | **Life Steal** carrega por 750 ms. Mire no tronco do dummy até a liberação. O raio tem tolerância de 7 px. Se acertar, quatro orbes pequenos voltam à mão em movimento. Compare de perto e de longe. |
| Experiments / 6, 0 | **Tesla Coil → Sentry** e **Sporecap → Proximity mine** têm uma baliza azul aliada dentro do campo antes da chegada das vermelhas. A bobina dispara a cada segundo por inimigo no raio de 54 px. A mina gasta sua única carga no primeiro inimigo dentro de 32 px; o cogumelo conserva apenas seus próprios esporos e fumaça. **Relay array** continua disponível como coreografia de comparação. |
| Experiments / 7 | **Root Snare** fixa o aviso no chão. **Cast Preparation** acrescenta 600 ms por padrão. A etapa seguinte mantém o aviso curto e reproduz as raízes na velocidade da fonte (2,7 s). Lance sob Sarina para observar o aprisionamento. |
| Experiments / 8 | **Necro Skulls** ocupa o antigo slot das mãos. A indicação de alcance e a detecção usam o mesmo círculo de 62 px, centrado na base visível da chama. Cada caveira voadora usa as cores de osso e fogo do altar e sai da posição de uma caveira na órbita. |
| Area & support / 1 | **Healing Grove** combina o anel de expansão, uma flor e pulsos verdes de cura sobre uma runa baixa. O pulso final concede Haste visual por 1,7 s aos aliados na elipse central (44 × 31 px de raios). Compare com a variante mais discreta **Ring & motes**. |
| Area & support / 3 | **Runic passage**, a versão principal de Summoning Portal, sobrepõe as runas à abertura, sustenta a passagem vertical por um ciclo e retoma a parte final do portal de chão. **Ritual threshold** e **Combined passage** continuam disponíveis para comparar o ritmo. |

Outras comparações preservadas incluem **Echo blast**, **Long warning**, **Storm field**,
**Arcane Beam → Channel**, as três perseguições elementais do tornado e os campos venenosos.
Os atalhos 2 de Area & support e 5 de Experiments ficaram livres com a retirada de Frost Nova
e Runic Seal. Life Steal, Healing Grove e Necro Skulls substituem Capacitor Cast, Healing Ritual
e Grasping Hands nos respectivos atalhos.

As balizas têm posições e equipes locais. A órbita de cinco caveiras é pré-renderizada,
portanto mantém cinco silhuetas mesmo durante um lançamento. O movimento do braço também
continua vindo da caminhada do personagem. A camuflagem é visual e atacar não revela o ator.

## Target reactions

Escolha Sarina (B) ou Felipe (A), o status e a duração e clique em **Apply status**.
**Walk** alterna a caminhada do dummy selecionado. Você pode alternar entre os dois e
aplicar reações simultaneamente. Aplicar um novo status ao mesmo dummy substitui o anterior.
O Haste da cura pode coexistir com o status selecionado. **Reset** encerra tudo e
devolve os personagens às posições iniciais.

Burning usa chamas nos contornos; Poisoned, veias e gotas esverdeadas; Frozen, gelo sobre
a silhueta; Electrified, arcos com um instante de raio X; Stunned, estrelas em órbita;
Slowed, gotas lentas, película fria e ondulações nos pés.

**Test hit** mostra um impacto e um número fictício. **Critical** escolhe a versão
maior, dourada e com exclamação. Copper Lash, Life Steal e os encontros de proximidade
também acionam o feedback ao confirmar contato. Números normais usam 12–18 e críticos
32–38, apenas para comparar a leitura. Nenhum status altera movimento ou HP.

**Próxima experiência.** Comparar a tolerância central de Copper Lash e Life Steal
com uma área de tronco sobre alvos de alturas diferentes, sem modificar a colisão física.
