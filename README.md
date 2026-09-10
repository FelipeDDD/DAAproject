# DAAproject · v0.1

Protótipo local de uma sala de TI 2D em JavaScript, Phaser e Vite. Paredes brancas,
piso claro e quatro mesas com computadores provisórios. Uma porta aberta ao sul
leva a um pequeno corredor no mesmo mapa, sem transição de cena ou interação.

## Executar

Na pasta do projeto, com Node.js instalado:

```powershell
npm.cmd install
npm.cmd run dev
```

Abra o endereço indicado pelo Vite. Use WASD ou setas. Precisa de teclado;
controles de toque não fazem parte desta versão. Para compilar: `npm.cmd run build`.
Para visualizar a compilação: `npm.cmd run preview`.

## Organização

- `src/main.js`: inicia e encerra o jogo no hot reload.
- `src/game/config.js`: Phaser, Arcade Physics e resolução lógica de 960×640.
- `src/game/settings.js`: zoom, escala do personagem e velocidade ajustáveis.
- `src/scenes/SchoolScene.js`: montagem, colisões e câmera.
- `src/entities/Player.js`: movimento local, velocidade e corpo de colisão.
- `src/maps/classroom.js`: geometria em tiles e ponto inicial em pixels.
- `src/art/placeholders.js`: texturas geradas e decoração provisória.
- `src/style.css`: apresentação da página.

Mapa de sala e corredor de 26×20 tiles de 32×32. Personagem de 32×56 com escala
1,35× (43,2×75,6 no mundo), origem nos pés e corpo de colisão de 20×12 antes
da escala (27×16,2 no mundo). Zoom 3×: a câmera mostra cerca de 10×6,7 tiles e segue
o jogador até os limites da sala. O canvas se ajusta à página mantendo a proporção.
Velocidade de 144 pixels/segundo, inclusive na diagonal, aplicada pela física.

## Trocas futuras

A arte pode ser substituída mantendo a chave `student`, tamanho e origem;
se o tamanho mudar, ajuste o corpo e offset em `Player.js`. O mapa está separado
da cena para futuramente carregar um tilemap do Tiled e suas colisões. O desenho
provisório da sala será substituído nesse passo.

Não há Convex, rede, chat, NPCs ou transições nesta versão. Uma futura camada de
sincronização pode ler o estado do jogador em intervalos moderados, sem transferir
o controle do movimento local para o backend. Nenhuma infraestrutura futura foi criada.

## Verificação manual

Validação executada: compilação de produção e respostas HTTP 200 da página e dos
módulos no servidor Vite. O build emite um aviso de bundle maior que 500 kB
(inclui Phaser), sem falhar. A conferência visual e de teclado abaixo está pendente:
o navegador de teste não estava disponível na sessão de implementação.

1. Andar nos quatro sentidos com WASD e repetir com as setas.
2. Soltar as teclas: o personagem deve parar. Diagonais não devem acelerar.
3. Caminhar contra cada parede e os cantos: os pés ficam dentro da sala.
4. Atravessar a sala: câmera acompanha e para nos limites do mapa.
5. Trocar de janela durante o movimento e voltar: nenhuma tecla fica presa.
6. Redimensionar a janela: proporção preservada e sem rolagem ao usar setas.
7. Sair pela abertura central da parede sul e voltar pelo corredor.
8. Caminhar contra as mesas: os pés não atravessam os móveis.
