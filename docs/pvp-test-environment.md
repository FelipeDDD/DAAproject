# Build PvP para colegas

O caminho recomendado usa **uma URL HTTPS temporária**: Cloudflare Tunnel →
`preview:test` em 4174 → Convex local em 3210 (`/api`, HTTP e WS) e relay em 8787
(`/pvp-realtime`, WS). O frontend usa a origem da página, portanto os colegas
nunca precisam acessar o localhost deles. HTTPS converte o endpoint do relay em
WSS. A URL temporária não fica gravada no código nem exige outra build.

O build fica em `builds/test`, ignorado pelo Git e pelo upload da Vercel. Não
altera `dist`, `.env.local`, `vite.config.js` nem os comandos normais. Os assets
e código do frontend ficam congelados até o próximo `build:test`.

**A build de teste desabilita DEV TOOLS**, a seção DEV do HUD e diagnósticos de
pickups, com `import.meta.env.DEV=false`. Uma flag específica da build,
`VITE_PVP_TEST_BUILD=true`, mantém acesso ao PvP pelo botão **PvP Lobby** na barra
acima do jogo, incluindo criar TDM/Payload e entrar por código. Não depende de
ativar um toggle em localStorage. O desenvolvimento normal mantém suas ferramentas
DEV e toggles existentes; nenhuma validação do servidor é removida.

**Esta opção compartilha o Convex e o relay locais com o desenvolvimento.** Não
isola dados, personagens disponíveis, funções do Convex ou autoridade do relay.
Mudar funções com `convex dev`, reiniciar o relay ou modificar regras/mapas no
servidor durante a sessão pode afetar os colegas ou incompatibilizar a build.
Use lobbies e identidades distintos. Para congelar também backend e dados, use
uma cópia/worktree e outra instância local Convex com portas e estado próprios;
isso não foi provisionado nesta tarefa. O bridge existente aceita apenas Convex
local validado, e uma URL cloud sozinha não habilita a autoridade PvP.

## Comandos PowerShell na ordem

Execute todos os terminais na raiz do projeto. `npm.cmd` evita a restrição de
execution policy do shim `npm.ps1` em algumas instalações Windows.

1. Gere a build (não precisa de backend rodando):

   ```powershell
   npm.cmd run build:test
   ```

2. Terminal do backend. Se já está rodando, mantenha o processo existente:

   ```powershell
   npm.cmd run convex
   ```

   Espere o backend e as funções ficarem prontos em `127.0.0.1:3210`.
   Não precisa trocar a URL Convex em `.env.local`. O preview encaminha `/api`
   para esse backend; a chave administrativa permanece apenas no host.

3. Terminal do relay. Use o existente se estiver atualizado; após alterar o
   código do relay, reinicie-o antes de começar a sessão:

   ```powershell
   npm.cmd run realtime:server
   ```

   Confirme `local PvP authority enabled`. Se mostrar `unavailable`, confira o
   Convex local e reinicie o relay. A conexão WS do Lab não comprova authority PvP.
   Não inicie outro relay para o mesmo match: a posse autoritativa continua
   validada pelo Convex.

4. Terminal do frontend de teste:

   ```powershell
   npm.cmd run preview:test
   ```

   Abra `http://127.0.0.1:4174`. Em outro terminal, confira a rede:

   ```powershell
   npm.cmd run check:test
   ```

   O check lê `test-environment.json` da build e testa o frontend compilado,
   uma query e subscription reais do Convex e dois clients efêmeros do relay.
   Não cria players, lobbies ou mutations de gameplay. Não substitui o teste
   manual do handshake autenticado de PvP.

5. Terminal do tunnel, com `cloudflared` instalado separadamente e disponível
   no PATH:

   ```powershell
   cloudflared tunnel --url http://127.0.0.1:4174
   ```

   Se o executável instalado no Windows não estiver no PATH deste terminal,
   use o caminho completo (instalação encontrada neste computador):

   ```powershell
   & "$env:LOCALAPPDATA\Programs\cloudflared\cloudflared.exe" tunnel --url http://127.0.0.1:4174
   ```

   Copie a URL `https://...trycloudflare.com` impressa. Não altere `.env.local`
   ou `VITE_REALTIME_URL` neste fluxo. Se quiser conferir os endpoints públicos:

   ```powershell
   npm.cmd run check:test -- https://SUBSTITUA.trycloudflare.com
   ```

6. Compartilhe **essa URL HTTPS** e o código de lobby. Abra também essa URL no
   seu browser. Use duas identidades/sessões independentes (por exemplo, janela
   normal e privada). Depois de selecionar personagem, clique em **PvP Lobby**
   na barra acima do jogo. Crie/join lobby, confirme times, inicie, mova e atire.
   Teste TDM/Payload e Retry. Em Network → WS, confira Convex em `/api/.../sync`
   e relay em `/pvp-realtime`, ambos no hostname compartilhado com status 101.
   Um colega deve repetir o teste em outro computador/rede.

Mantenha **Convex, relay, preview e cloudflared** abertos enquanto jogam. Use
Ctrl+C no tunnel e preview para encerrar o compartilhamento. `npm.cmd run dev`
continua funcionando em paralelo; não há variável a desfazer no fluxo padrão.

Cloudflared não é instalado ou iniciado pelo projeto. O acesso externo depende
desse tunnel ainda não provisionado, ou de outro proxy/hosting equivalente.
Quick Tunnels são temporários e a URL muda ao reiniciar. Referências oficiais:
[Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/),
[Vite preview.proxy](https://vite.dev/config/preview-options#preview-proxy) e
[Convex local deployments](https://docs.convex.dev/cli/local-deployments).

## Configuração opcional e endpoints separados

O ambiente de teste usa **somente** `config/pvp-test` como `envDir`. Não basta
`--mode test` na raiz, porque Vite também carregaria o `.env.local` de dev.
Valores já definidos no terminal têm precedência sobre os arquivos; use um
terminal novo para evitar overrides antigos.

```powershell
Copy-Item -LiteralPath config/pvp-test/.env.test.example -Destination config/pvp-test/.env.test.local
notepad config/pvp-test/.env.test.local
```

Esse arquivo local é ignorado pelo Git. Não coloque tokens, admin/deploy keys
ou outros secrets em variáveis `VITE_*`: entram no bundle público.

| Variável | Padrão | Função |
| --- | --- | --- |
| `VITE_QUICK_TUNNEL` | `true` | Convex usa a origem da página; `/api` precisa de proxy. |
| `VITE_REALTIME_URL` | `/pvp-realtime` | Proxy na mesma origem ou endpoint público WSS explícito. |
| `VITE_CONVEX_URL` | vazio | Usado apenas com `VITE_QUICK_TUNNEL=false`; URL pública HTTPS. |
| `PVP_TEST_CONVEX_TARGET` | `http://127.0.0.1:3210` | Destino local do proxy Convex do preview. |
| `PVP_TEST_REALTIME_TARGET` | `http://127.0.0.1:8787` | Destino local do proxy WS do preview. |
| `PVP_TEST_ALLOWED_HOST` | vazio | Hostname exato adicional para um tunnel com domínio próprio. |

URLs explícitas do browser rejeitam localhost/loopback e protocolos inseguros.
O preview permite `.trycloudflare.com` e o hostname adicional declarado, sem
`allowedHosts: true`, CORS global ou alteração de Origin dos WebSockets.
Validações de sessão, mapa, round e Match Settings do relay permanecem intactas.
`REALTIME_HOST`/`REALTIME_PORT` já existem no relay; se mudar sua porta, ajuste
também `PVP_TEST_REALTIME_TARGET`. Não é preciso abrir portas no roteador.

Para um relay em outro tunnel, exponha `http://127.0.0.1:8787` nesse tunnel,
configure `VITE_REALTIME_URL=wss://HOST-DO-RELAY/pvp-realtime` no arquivo de teste
e refaça `build:test`. O relay atual aceita esse path sem removê-lo.

Para hospedagem estática sem proxy, configure **ambos** os endpoints públicos:

```dotenv
VITE_QUICK_TUNNEL=false
VITE_CONVEX_URL=https://HOST-DO-CONVEX
VITE_REALTIME_URL=wss://HOST-DO-RELAY/pvp-realtime
```

Nesse caso, um tunnel adicional em `http://127.0.0.1:3210` pode expor o mesmo
Convex local usado pelo relay. Sirva o frontend por HTTPS. Não misture um Convex
cloud com o relay conectado ao banco local. A pasta estática `builds/test`
sozinha não contém proxies: só `preview:test` ou um reverse proxy implementam
`/api` e `/pvp-realtime`. Vite preview é para teste, não hosting de produção.

Refaça a build após mudar variáveis `VITE_*`. Mudar somente `PVP_TEST_*` exige
reiniciar o preview, sem rebuild. Em endpoints temporários separados, mudar
suas URLs exige outra build; o fluxo recomendado com um único tunnel evita isso.
