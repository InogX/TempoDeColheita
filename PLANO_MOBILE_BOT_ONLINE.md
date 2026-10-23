# Tempo de Colheita — Plano (versão 4): o que falta

**Como usar numa conversa nova:** envie este arquivo + o `FICHAS_TECNICAS.md` atualizado + os arquivos da lista da etapa. **Uma etapa por conversa.** Sempre envie a versão mais recente dos arquivos.

**Legenda de status:** ✅ confirmado · 🔄 em andamento (sendo feito em outra conversa, **ainda não entregue/confirmado**) · ⬜ não iniciado · ❓ a conferir

---

## Onde estamos

| Parte | Situação |
|---|---|
| **1. Mobile (visual)** | Entregue: `tela.js`, `menu.js` e `index.html` já vieram adaptados (`viewport-fit`, `#evb` recolhível, grupos `.st/.acts/.seats/.board`, modo compacto em `fit()`). **Não revisei** o `style.css`, `janelas.js`, `zoom.js` e `cartas-visual.js` dessa parte: confirme as etapas 4 e 5 do PROMPT 1 (janelas em tela cheia, zoom, toque) olhando no celular. |
| **2. Bot** | Pronto e ligado: `bot.js` (fácil e normal), `A.new(cfg)` com `p.bot`, ações com parâmetros (`A.sell`, `A.buyFeira`, `A.listRes`, `A.list`) e `Bot.simular()`. Testado em Node (190 partidas sem erro de estado), mas **ainda não** no navegador de verdade. |
| **2,5. Menus** | Pronto: Jogar Online / Jogar Local, com Criar Sala, Achar Sala, Buscar Partida (aviso "em implementação"), Continuar, Novo Jogo, Tutorial (aviso) e Configurações (antigo Dev). Arquivos: `menu.js`, `acoes-turno.js`, `style.css`. As telas Criar Sala e Achar Sala existem, mas a conexão ainda não está ligada. |
| **3. Online** | **Fases 0 e 5 feitas e confirmadas.** Infraestrutura do lado do dono pronta (ver quadro abaixo). Os arquivos estão sendo trabalhados em outra conversa (🔄), mas **nenhuma das Fases 1 a 11 está confirmada como entregue**. |

---

## Quadro de status do Online

### Infraestrutura (feita pelo dono, fora do código)
| Item | Status |
|---|---|
| Projeto Firebase criado (plano **Spark**, sem cartão) | ✅ |
| **Autenticação anônima ativa** | ✅ (confirmado pelo dono) |
| **Jogo publicado no GitHub Pages, online e funcionando** | ✅ (confirmado pelo dono) |
| Realtime Database criado + app Web registrado + `firebaseConfig` em mãos | ✅ o dono tem o `firebaseConfig` e vai colá-lo direto na conversa da Fase 5 (não vai neste arquivo) |
| Domínio do GitHub Pages (`usuario.github.io`) adicionado em *Authentication › Configurações › Domínios autorizados* | ✅ confirmado por captura de tela: `inogx.github.io` está em Domínios autorizados (tipo Custom) |
| Regras do banco trocadas do modo de teste (o modo de teste **expira**, em geral em 30 dias) | ✅ regras simples publicadas (confirmado pelo dono). Regras restritivas no **Apêndice A**, para a Fase 9 (as simples NÃO protegem segredos) |

### Fases do código
| Fase | Status |
|---|---|
| 0 — Decisões e inventário | ✅ |
| 1 — Identidade local e estado de interface | 🔄 |
| 2 — Resultado das ações | 🔄 |
| 3 — Visão filtrada | ⬜ |
| 4 — Camada de comandos | ⬜ |
| 5 — Rede (`rede.js`) | ✅ entregue e testada no Firebase real pelo dono: duas abas de `teste-rede.html` no GitHub Pages criaram/entraram na sala e trocaram mensagem, e a aba *Uso* do Realtime Database mostrou as duas conexões. (Não foi testado ainda: dois aparelhos diferentes, 4G/5G, nem a parte de privacidade, que só vale após a Fase 9.) |
| 6 — Lobby | ⬜ (próxima; usa `Rede.criar/entrar/aoJogadores/definirEstado` e `Rede.convite`) |
| 7 — Sincronização e vez | ⬜ |
| 8 — Janelas | ⬜ |
| 9 — Robustez + regras de segurança | ⬜ (regras prontas no Apêndice A) |
| 10 — Testes | ⬜ |
| 11 — Publicação | 🔄 parte já pronta: o jogo está no GitHub Pages; falta só documentar o convite (`?sala=`) na prática |

> Atualize este quadro quando cada fase for **entregue e testada**. Fases marcadas 🔄 só passam a ✅ depois que o arquivo novo for conferido.

---

## Custos (conferido em 23/10/2026 — **reconferir antes de divulgar para mais gente**)
- **Plano Spark: gratuito e sem forma de pagamento.** Sem cartão cadastrado, não há o que cobrar.
- Realtime Database no Spark: **100 conexões simultâneas** e **1 GB armazenado**. O limite de download mensal (cerca de 10 GB, citado antes) **não foi reconfirmado**; ver a aba *Uso* do banco e `firebase.google.com/pricing`.
- **Nunca clicar em Upgrade / Blaze / Ativar faturamento.** Só o Blaze cobra.
- **Não usar** Cloud Storage, Functions, App Hosting nem Firebase Hosting. O jogo fica no GitHub Pages.

---

## Antes do online: conferir no navegador (30 minutos)

Nada disso trava o online, mas é melhor achar agora do que misturado com a rede. (Ainda **não confirmado** como feito.)

1. **Rodar o `qa.html`.** Ele não foi rodado depois das mudanças de celular, do bot e dos menus. Atenção: `menu()` agora abre o **menu principal**; se o QA precisava do formulário, ele deve chamar `Menu.ir('novo')` (ou `A.new({ nomes, bots, first })`). Se o QA quebrar, envie o `qa.html` para ajuste.
2. **Testar o bot de verdade:** no menu marque um jogador como bot, inicie, e veja se ele joga sozinho, se "Continuar" retoma a vez dele e se a tela do bot fica legível no celular. Teste também `Bot.simular(20, 3, ['normal'])` no console (F12).
3. **Menus:** o CSS já está no `style.css` entregue. Confira no celular se os botões grandes e a linha nome + humano/bot ficaram bons.
4. **Decisão pendente:** a tela do bot mostra a caixa de eventos que inclui o **evento individual do bot**. Se quiser esconder isso de quem está olhando, é um ajuste pequeno em `tela.js` e `bot.js`.
5. **Balanceamento (opcional):** com 2 jogadores, estes objetivos raramente fecham: `noLoan`, `allLvl`, `clean`, `mUnits`, `mProfit`, `noites`, `floorUntil`. O motivo provável é o cofre do Governo ser finito e esses objetivos pedirem muitas moedas ou negociação.

---

## PARTE 3 — Online (o que falta fazer)

### O que o bot e o mobile já deixaram pronto
| Já feito | Vantagem para o online |
|---|---|
| Ações com parâmetros: `A.sell`, `A.buyFeira`, `A.listRes`, `A.list` | A Fase 2 do roteiro antigo está **quase toda feita**: ações de rede não precisam ler campos da tela. |
| `A.new({ nomes, bots, first })` | O anfitrião cria a partida sem tela de menu. |
| `p.bot` e `bot.js` | **Bots podem ocupar vagas** numa partida online: quem roda o jogo (anfitrião) roda também os bots. |
| `Bot.tenta()` (executa uma ação com o `alert()` silenciado e detecta recusa) | É a mesma técnica que a camada de comandos do online precisa para não travar com `alert()`. |
| Gancho `if (p.bot) ...` em `tela.js` | É o mesmo ponto onde entra "Aguardando [jogador]". |

### O que ainda atrapalha (ainda não foi tratado, salvo se a fase correspondente for entregue)
| Problema | Onde |
|---|---|
| Tudo depende do jogador da vez (`cur()` = `S.order[S.t]`), inclusive visões, janelas e zoom. | `consultas.js`, `acoes-*.js`, `tela.js`, `janelas.js`, `zoom.js`, `bot.js` |
| Mercado e Dev têm "atuar como" outro jogador (`S.actor`, `S.devP`). | `janelas.js`, `acoes-turno.js`, `dev.js` |
| As ações ainda usam `alert()` ao recusar, e não devolvem "ok/erro". | `acoes-*.js` |
| `zoom.js`: `Z.field`, `Z.card` e `Z.up` leem `cur()` (os campos do jogador da vez); `Z.up` chama `A.up` e confere NA HORA se o nível subiu para decidir a animação (no online a resposta vem depois); os cliques e o `Esc` usam `S.hide`, `S.modal`, `S.viewRes` e `S.plantSel`. | `zoom.js` |
| `dev.js`: `D.i()` e todas as ferramentas mexem em `S` direto, sem passar pelas ações, e leem `S.devP` e campos da tela. | `dev.js` (desligar no online) |
| `iniciar.js` só chama `render()`: é ali que entra a leitura de `?sala=` e a ligação da rede. | `iniciar.js` |
| `style.css`: o modo compacto usa `(max-width:700px),(max-height:520px)`; `.menu` já estica `.nm`, `#n` e `#f` a 100%; o lobby pode reaproveitar `.menu`. | `style.css` |
| O estado de interface mora dentro de `S` (`S.modal`, `S.plantSel`, `S.viewing`, `S.viewRes`, `S.actor`, `S.devP`, `S.dv`) e iria junto no save e na rede. | `acoes-*.js`, `tela.js`, `janelas.js`, `dev.js` |
| A tela "Passe o dispositivo / Estou pronto" (`S.hide`) esconde informação num aparelho só. | `tela.js`, `acoes-turno.js` |
| `render()` grava o estado inteiro em `localStorage` (`tc_save`). | `tela.js` |
| `sees()` decide o que cada jogador vê, mas hoje só filtra o desenho, não os dados enviados. | `pecas-tela.js` |

### Fase 5 entregue (rede.js) — o que mudou para as próximas fases
- **SDK:** Firebase JS 12.19.0 fixa, via `import()` de gstatic.com (13.x ficou de fora por ser muito nova/versão principal nova). Só baixa ao chamar `Rede.iniciar()`.
- **Interface:** `iniciar`, `criar(nome, vagas)`, `entrar(codigo, nome)`, `enviar(tipo, args)`, `aoAcao` (anfitrião; apaga a ação processada; entrega "ao menos uma vez", então ignore `id` repetido), `aoVisao`, `aoJogadores`, `aoMeta`, `darVisao(s)`, `gravarEstado/lerEstado`, `definirEstado`, `sair`, `lerConvite`, `linkConvite`. Propriedades `Rede.uid/codigo/ehHost/naSala/convite`.
- **Mudança de formato (caminhos iguais aos do Apêndice A):** `args`, `visao/{uid}` e `estado` são gravados como **texto JSON**, porque o banco apaga arrays/objetos vazios e recusa chaves com `. $ # [ ] /`. As regras não podem inspecionar `args` (já eram `true`).
- **Fase 6 deve:** reatribuir `idx` ao iniciar (o do convidado é provisório), criar bots como `jogadores` com chave própria (o `aoAcao` ignora quem tem `bot`), e ler `Rede.convite` na tela 'achar'.
- **Fase 7 deve:** tratar ações repetidas (por `id`) e ordenar entre jogadores (por jogador a ordem é garantida; entre jogadores, por chegada ou `ts`).
- **Fase 9 deve:** fechar/limpar salas (host que sai, salas antigas), reconexão com uid novo, e conferir sala cheia/partida iniciada no servidor, se desejado.
- **Login:** persistência padrão `'local'`: duas abas do mesmo navegador são o MESMO jogador. Para testar dois jogadores: `teste-rede.html` (uid por aba), outro navegador ou janela anônima.
- **Custos conferidos de novo (23/10/2026):** Spark = 100 conexões, 1 GB, 10 GB/mês de download (≈360 MB/dia na página oficial).

### Decisões já tomadas (Fase 0)
- **Arquitetura:** o navegador de um jogador (**anfitrião**) roda o jogo e os bots; os outros enviam ações e recebem uma visão filtrada. Não precisa de servidor próprio.
- **Transporte: Firebase Realtime Database**, plano **Spark** (gratuito, sem cartão). Limites no quadro "Custos" acima.
- **Identidade: autenticação anônima do Firebase** (já ativa). Cada navegador recebe um `uid`; as regras de segurança usam esse `uid`.
- **Por que não PeerJS:** a sinalização é gratuita, mas o TURN gratuito foi desativado; sem TURN, jogadores atrás de certos tipos de NAT não conseguem conectar (provavelmente afeta quem joga no 4G/5G; só testando para saber).
- **Rede isolada em `rede.js`** com uma interface simples (criar sala, entrar, enviar, ao receber), para dar para trocar o transporte depois.
- **Segurança:** o anfitrião tem o estado inteiro no navegador e pode trapacear pelo console. Entre amigos costuma bastar. Regras restritivas no **Apêndice A** (Fase 9).
- **Hospedagem: GitHub Pages — já online.** O jogo só entrega arquivos.
- **Bots online:** o anfitrião roda os bots; se o anfitrião sai, os bots param.

### O que VOCÊ faz em paralelo (não precisa de código)
1. ✅ Projeto Firebase criado, Realtime Database, app Web e `firebaseConfig`.
2. ✅ Autenticação anônima ativa.
3. ✅ GitHub Pages no ar.
4. ✅ Domínio `inogx.github.io` em *Authentication › Configurações › Domínios autorizados*.
5. ✅ `firebaseConfig` entregue e já gravado em `rede.js` (não coloque nada de pagamento).
6. ✅ Regras simples publicadas; restritivas ficam para a Fase 9.
7. ✅ `rede.js`, `teste-rede.html`, `index.html` e `iniciar.js` no GitHub Pages e teste de duas abas feito.

### Arquivos a enviar
| Arquivo | Por quê |
|---|---|
| **estado.js, consultas.js** | O estado `S` e `cur()` (quem joga) são a base de "quem sou eu". |
| **acoes-turno.js, acoes-economia.js, acoes-plantio.js, acoes-mercado.js** | As ações viram comandos validados. |
| **rodada.js, objetivos.js** | A virada de rodada e a vitória são decididas pelo anfitrião. |
| **pecas-tela.js** | `sees()` vira o filtro do que cada jogador recebe. |
| **tela.js, janelas.js, menu.js** | "Passe o dispositivo" vira "Aguardando"; o menu ganha criar/entrar na sala; as janelas deixam de permitir "atuar como" outro jogador. |
| **zoom.js** | Usa `cur()`: precisa usar o jogador local. |
| **iniciar.js, index.html** | `iniciar.js` é onde se lê o link `?sala=` (já feito: `Rede.lerConvite()`); o `index.html` já carrega o `rede.js` depois do `bot.js`. |
| **rede.js** (Fase 5, já entregue) | Enviar nas fases seguintes junto com a Ficha. |
| **bot.js** | O anfitrião roda os bots; o gancho de vez do bot precisa conviver com "Aguardando". |
| **dev.js** | Precisa ser desligado no online. |
| **config.js, cartas.js** | Regras e baralhos (embaralhados só no anfitrião). |
| **style.css** (só os trechos de menu/botões, ou inteiro) | As telas novas (sala e lobby) devem aproveitar o visual de celular que já existe. |

Não enviar: `cartas-visual.js` (visual puro), `editor.html` e `qa.html` (ferramentas; o online é testado com duas abas abertas).

### PROMPT 3 — Preparação do online

```
Estou enviando a Ficha Técnica e os arquivos do meu jogo "Tempo de Colheita" (HTML + JS puro): estado.js, consultas.js, acoes-turno.js, acoes-economia.js, acoes-plantio.js, acoes-mercado.js, rodada.js, objetivos.js, pecas-tela.js, tela.js, janelas.js, menu.js, zoom.js, iniciar.js, index.html, config.js, cartas.js, dev.js, bot.js e style.css.

OBJETIVO
Preparar o jogo para ser jogado ONLINE, eu contra um amigo (depois, mais jogadores), entrando por código de sala e link de convite, SEM gastar dinheiro (somente serviços gratuitos e seguros). Hoje o jogo é "passe o aparelho": um navegador guarda todo o estado (S) e esconde as informações com a tela "Estou pronto". O jogo já funciona no celular (visual responsivo) e já tem bots (p.bot, bot.js).

JÁ DECIDIDO E PRONTO NO MEU LADO (não refaça)
- Transporte: Firebase Realtime Database, plano Spark (gratuito, SEM cartão; não usar Blaze, Storage, Functions nem Hosting).
- Autenticação anônima do Firebase já está ATIVA no projeto.
- O jogo já está publicado e funcionando no GitHub Pages.
- A.sell, A.buyFeira, A.listRes, A.list aceitam parâmetros opcionais, e A.new aceita { nomes, bots, first }. Sem parâmetro, leem a tela como antes.
- Cada jogador tem p.bot ('', 'facil' ou 'normal'). bot.js joga pelas ações A.* e usa Bot.tenta() para silenciar o alert(). tela.js tem o gancho "if (p.bot) { Bot.agenda(); ... }".

O QUE AINDA DEPENDE DO JOGADOR DA VEZ
- cur() (S.order[S.t]), S.actor (Mercado "atuar como"), S.devP (Dev), S.hide e sees() são usados em consultas.js, acoes-*.js, tela.js, janelas.js, zoom.js, pecas-tela.js e bot.js.
- As ações usam alert() ao recusar e não devolvem sucesso/erro.
- render() grava o estado inteiro em localStorage (tc_save) a cada desenho.

REGRAS DE TRABALHO
1. Trabalhe por FASES. Ao fim de cada fase o jogo OFFLINE (passe o aparelho, com e sem bots) deve continuar funcionando igual. Entregue uma fase por vez e espere meu OK.
2. Não reescreva o jogo: mudanças pequenas e localizadas, listadas por arquivo.
3. Mantenha o cabeçalho "FICHA TÉCNICA" e atualize a Ficha.
4. Nada de bibliotecas pagas ou que peçam cartão. Antes de recomendar um serviço, CONFIRA os limites gratuitos ATUAIS (pesquise) e me diga.
5. Informações secretas (mão, objetivo, estoque e dívida de outros, conforme sees()) NUNCA podem ser enviadas a quem não pode vê-las.
6. Preserve os ids e classes da tela, inclusive .nm e .bt do menu (meu teste automático e o bot dependem deles).
7. Se rodar código para testar, teste em Node com os arquivos reais; não diga que testou o que não testou.

ROTEIRO (status no quadro do plano)
FASE 0 — FEITA.
FASE 1 — Identidade local e estado de interface. (a) Criar "quem sou eu" neste navegador (índice do jogador local); offline, ele acompanha o jogador da vez. (b) Separar o estado de INTERFACE do estado do JOGO: hoje S.modal, S.plantSel, S.viewing, S.viewRes, S.actor, S.devP e S.dv moram dentro de S; no online cada jogador tem os seus, então passam para um objeto local (UI) que não é compartilhado nem salvo junto com a partida.
FASE 2 — Resultado das ações. Fazer as ações devolverem sucesso/erro (sem alert quando vêm da rede), reaproveitando a ideia de Bot.tenta(). Sem mudar o jogo offline.
FASE 3 — Visão filtrada. Criar viewFor(i): o estado como o jogador i pode vê-lo (mão e objetivo só do próprio; moedas, dívida e estoque dos outros só se sees() permitir).
FASE 4 — Camada de comandos. Toda ação passa por um único ponto que valida "quem enviou" e "é a vez dele" (ou é permitida fora da vez, como o Mercado). Offline e bots passam pelo mesmo ponto; nada muda.
FASE 5 — Rede (rede.js novo), com Firebase Realtime Database + autenticação anônima. Criar sala, código de sala e link ?sala=CODIGO (lido no iniciar.js), entrar, enviar e receber mensagens, e trocar as regras do modo de teste por regras simples (autenticado). Confira os limites gratuitos atuais e a versão atual do SDK. Teste simples entre duas abas.
FASE 6 — Lobby. As telas 'criar' (código + formulário + "Jogadores conectados") e 'achar' (nome + código + Conectar) JÁ EXISTEM em menu.js, só com o aviso de "em implementação"; ligá-las à rede: gerar e mostrar o código, listar quem conectou, vagas de bot (fácil/normal), botão "Iniciar" (só o anfitrião), usando A.new({ nomes, bots, first }). Buscar Partida e Tutorial continuam como aviso.
FASE 7 — Sincronização e vez. O anfitrião aplica as ações e envia a cada jogador a sua visão. Trocar "Passe o dispositivo" por "Aguardando [jogador]" (no mesmo ponto do gancho do bot em tela.js). Só quem está na vez joga. Só o anfitrião grava o estado completo em localStorage.
FASE 8 — Janelas. Mercado e Governo atuam só pelo jogador local (sem "atuar como" outros). Dev desligado no online. Ver jogador e zoom respeitam sees() e usam o jogador local, não cur().
FASE 9 — Robustez e segurança. Desconexão e reconexão, retomar a partida da sala, mensagens duplicadas ou fora de ordem, anfitrião que sai (os bots param). Publicar as regras restritivas do Apêndice A (ajustando os nomes dos nós ao que o rede.js realmente grava) e testá-las no Rules Playground do console.
FASE 10 — Testes. Roteiro com duas abas e depois dois aparelhos, e uma conferência de que nenhuma informação secreta aparece nas mensagens.
FASE 11 — Publicação. O jogo JÁ está no GitHub Pages; documentar como o convite (?sala=CODIGO) funciona na prática e o que conferir (domínio autorizado no Firebase Authentication).
```

---

## Ordem sugerida
1. **Conferir no navegador** (a lista de 30 minutos acima), principalmente o `qa.html` e o bot no celular.
2. **Online** (Parte 3), por fases, uma por conversa quando for grande. Envie sempre o `FICHAS_TECNICAS.md` mais recente.

---

## Apêndice A — Regras de segurança do Realtime Database (Fase 9)

> Nota da Fase 5: o `rede.js` grava exatamente esta estrutura. Só o **valor** de `args`, `visao/{uid}` e `estado` é um texto JSON. Nenhuma regra precisou mudar. As regras simples da Fase 5 (`/salas` legível e gravável por qualquer autenticado) NÃO protegem segredos.

**Estrutura de dados que estas regras assumem** (a Fase 5 deve gravar assim, ou as regras precisam ser ajustadas):

```
/salas/{CODIGO}/
    meta/          { host: uid, estado: 'lobby'|'jogando'|'fim', vagas: n, criadaEm: ts }
    jogadores/{uid}  { nome, idx, online, bot }        (bots: o anfitrião cria chaves próprias)
    acoes/{uid}/{id} { tipo, args, ts }                (cada jogador escreve só na própria caixa)
    visao/{uid}      (visão filtrada de cada jogador)  (só o anfitrião escreve; só o dono lê)
    estado           (estado COMPLETO do jogo)         (só o anfitrião lê e escreve)
```

**Regras** (colar em *Realtime Database › Regras › Publicar*):

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "salas": {
      "$sala": {
        "meta": {
          ".read": "auth != null",
          ".write": "auth != null && $sala.matches(/^[A-Z0-9]{4,8}$/) && (!data.exists() || data.child('host').val() === auth.uid)",
          ".validate": "newData.hasChildren(['host', 'estado'])",
          "host": { ".validate": "newData.val() === auth.uid || newData.val() === data.val()" },
          "estado": { ".validate": "newData.isString() && newData.val().matches(/^(lobby|jogando|fim)$/)" },
          "vagas": { ".validate": "newData.isNumber() && newData.val() >= 2 && newData.val() <= 8" },
          "criadaEm": { ".validate": "newData.isNumber()" },
          "$outro": { ".validate": false }
        },
        "jogadores": {
          ".read": "auth != null",
          "$uid": {
            ".write": "auth != null && (root.child('salas/' + $sala + '/meta/host').val() === auth.uid || (auth.uid === $uid && (data.exists() || root.child('salas/' + $sala + '/meta/estado').val() === 'lobby')))",
            ".validate": "newData.hasChildren(['nome'])",
            "nome": { ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 20" },
            "idx": { ".validate": "newData.isNumber()" },
            "online": { ".validate": "newData.isBoolean()" },
            "bot": { ".validate": "newData.isString() && newData.val().matches(/^(facil|normal)?$/)" },
            "$outro": { ".validate": false }
          }
        },
        "acoes": {
          ".read": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid",
          "$uid": {
            ".write": "auth != null && (auth.uid === $uid || root.child('salas/' + $sala + '/meta/host').val() === auth.uid)",
            "$id": {
              ".validate": "newData.hasChildren(['tipo', 'ts'])",
              "tipo": { ".validate": "newData.isString() && newData.val().length <= 30" },
              "args": { ".validate": true },
              "ts": { ".validate": "newData.isNumber()" },
              "$outro": { ".validate": false }
            }
          }
        },
        "visao": {
          "$uid": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid"
          }
        },
        "estado": {
          ".read": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid",
          ".write": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid"
        }
      }
    }
  }
}
```

**O que estas regras garantem**
- Nada fora de `/salas/...` pode ser lido ou escrito. Ninguém consegue listar todas as salas; só entra quem sabe o código.
- Só quem está autenticado (login anônimo) acessa qualquer coisa.
- O primeiro a criar `meta` vira o anfitrião; ninguém "toma" a sala depois.
- Cada jogador só escreve a **própria** entrada em `jogadores/{uid}` e a **própria** caixa em `acoes/{uid}`.
- Só dá para entrar em uma sala nova durante o `lobby`. Depois que o jogo começa, só entra de novo quem já estava na lista (mesmo `uid`).
- **A visão de cada jogador só pode ser lida pelo próprio jogador**, e o estado completo só pelo anfitrião. É isso que impede um jogador de espiar a mão e o objetivo dos outros pela rede.

**O que elas NÃO garantem (limites conhecidos)**
- O anfitrião vê tudo e pode trapacear, como já decidido.
- Não limitam o número de jogadores por sala nem o tamanho de cada mensagem (as regras não medem tamanho). Mantenha as mensagens pequenas e apague a sala ao terminar.
- O `uid` anônimo muda se o jogador limpar os dados do navegador ou trocar de aparelho. Para voltar **durante o jogo** com um `uid` novo, o anfitrião precisa recriar `jogadores/{novoUid}` (ele tem permissão). Isso é parte da reconexão da Fase 9.
- Opcional e gratuito: no Google Cloud Console (APIs e serviços › Credenciais), restringir a chave de API do Firebase ao domínio do GitHub Pages. A chave não é segredo, mas a restrição reduz abuso.

**Como testar:** use o **Rules Playground** (aba Regras): simule leitura de `/salas/ABC123/estado` como um `uid` que não é o anfitrião (deve ser negada) e leitura de `/salas/ABC123/visao/{outroUid}` (deve ser negada).
