# Tempo de Colheita — Plano (versão 3): o que falta

**Como usar numa conversa nova:** envie este arquivo + o `FICHAS_TECNICAS.md` atualizado + os arquivos da lista da etapa. **Uma etapa por conversa.** Sempre envie a versão mais recente dos arquivos.

---

## Onde estamos

| Parte | Situação |
|---|---|
| **1. Mobile (visual)** | Entregue: `tela.js`, `menu.js` e `index.html` já vieram adaptados (`viewport-fit`, `#evb` recolhível, grupos `.st/.acts/.seats/.board`, modo compacto em `fit()`). **Não revisei** o `style.css`, `janelas.js`, `zoom.js` e `cartas-visual.js` dessa parte: confirme as etapas 4 e 5 do PROMPT 1 (janelas em tela cheia, zoom, toque) olhando no celular. |
| **2. Bot** | Pronto e ligado: `bot.js` (fácil e normal), `A.new(cfg)` com `p.bot`, ações com parâmetros (`A.sell`, `A.buyFeira`, `A.listRes`, `A.list`) e `Bot.simular()`. Testado em Node (190 partidas sem erro de estado), mas **ainda não** no navegador de verdade. |
| **3. Online** | **Falta fazer.** É o que o resto deste arquivo explica. |

---

## Antes do online: conferir no navegador (30 minutos)

Nada disso trava o online, mas é melhor achar agora do que misturado com a rede.

1. **Rodar o `qa.html`.** Ele não foi rodado depois das mudanças de celular e do bot. O menu agora tem `<div class="nmrow">` em volta de cada `.nm`, e o QA procura `.nm`, `#n`, `#f` e `#nl`.
2. **Testar o bot de verdade:** no menu marque um jogador como bot, inicie, e veja se ele joga sozinho, se "Continuar" retoma a vez dele e se a tela do bot fica legível no celular. Teste também `Bot.simular(20, 3, ['normal'])` no console (F12).
3. **CSS do menu:** a linha nome + escolha humano/bot (`.nmrow`, `.bt`) precisa de estilo no `style.css`. Sugestão:
   ```css
   .nmrow { display: flex; gap: 6px; margin: 4px 0; }
   .nmrow .nm { flex: 1; min-width: 0; }
   .nmrow .bt { min-height: 44px; width: auto; flex: none; }
   ```
4. **Decisão pendente:** a tela do bot mostra a caixa de eventos que inclui o **evento individual do bot**. Se você quiser esconder isso de quem está olhando, é um ajuste pequeno em `tela.js` e `bot.js`.
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

### O que ainda atrapalha (ainda não foi tratado)
| Problema | Onde |
|---|---|
| Tudo depende do jogador da vez (`cur()` = `S.order[S.t]`), inclusive visões, janelas e zoom. | `consultas.js`, `acoes-*.js`, `tela.js`, `janelas.js`, `zoom.js`, `bot.js` |
| Mercado e Dev têm "atuar como" outro jogador (`S.actor`, `S.devP`). | `janelas.js`, `acoes-turno.js`, `dev.js` |
| As ações ainda usam `alert()` ao recusar, e não devolvem "ok/erro". | `acoes-*.js` |
| A tela "Passe o dispositivo / Estou pronto" (`S.hide`) esconde informação num aparelho só. | `tela.js`, `acoes-turno.js` |
| `render()` grava o estado inteiro em `localStorage` (`tc_save`). | `tela.js` |
| `sees()` decide o que cada jogador vê, mas hoje só filtra o desenho, não os dados enviados. | `pecas-tela.js` |

### Decisões a tomar (a IA da etapa vai pedir, mas já decida)
- **Arquitetura recomendada:** o navegador de um jogador (anfitrião) roda o jogo e os bots; os outros enviam ações e recebem uma visão filtrada. Não precisa de servidor próprio.
- **Transporte gratuito:** WebRTC direto entre navegadores (por exemplo PeerJS) ou Firebase Realtime Database como retransmissor. **Os limites gratuitos mudam: confirme os atuais na hora de decidir** (a IA da etapa deve conferir, não confiar em memória).
- **Segurança:** o anfitrião tem o estado inteiro no navegador, então um amigo mal-intencionado poderia trapacear pelo console. Entre amigos costuma bastar; para estranhos seria preciso um servidor que valide as jogadas.
- **Hospedagem:** o jogo só entrega arquivos, então pode ficar no GitHub Pages.
- **Bots online:** o anfitrião roda os bots; se o anfitrião sai, os bots param.

### Arquivos a enviar
| Arquivo | Por quê |
|---|---|
| **estado.js, consultas.js** | O estado `S` e `cur()` (quem joga) são a base de "quem sou eu". |
| **acoes-turno.js, acoes-economia.js, acoes-plantio.js, acoes-mercado.js** | As ações viram comandos validados. |
| **rodada.js, objetivos.js** | A virada de rodada e a vitória são decididas pelo anfitrião. |
| **pecas-tela.js** | `sees()` vira o filtro do que cada jogador recebe. |
| **tela.js, janelas.js, menu.js** | "Passe o dispositivo" vira "Aguardando"; o menu ganha criar/entrar na sala; as janelas deixam de permitir "atuar como" outro jogador. |
| **zoom.js** | Usa `cur()`: precisa usar o jogador local. |
| **iniciar.js, index.html** | `iniciar.js` é onde se lê o link `?sala=`; o `index.html` define a ordem do `rede.js` novo. |
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

O QUE JÁ ESTÁ PRONTO (não refaça)
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

ROTEIRO
FASE 0 — Decisões e inventário. Confirme comigo a arquitetura (anfitrião roda o jogo e os bots; os outros enviam ações e recebem visão filtrada) e o transporte (WebRTC direto, ex. PeerJS, ou Firebase Realtime Database). Liste todos os pontos do código que dependem de cur(), S.order[S.t], S.actor, S.devP, S.hide e sees().
FASE 1 — Identidade local. Criar "quem sou eu" neste navegador (índice do jogador local). Offline, ele acompanha o jogador da vez.
FASE 2 — Resultado das ações. Fazer as ações devolverem sucesso/erro (sem alert quando vêm da rede), reaproveitando a ideia de Bot.tenta(). Sem mudar o jogo offline.
FASE 3 — Visão filtrada. Criar viewFor(i): o estado como o jogador i pode vê-lo (mão e objetivo só do próprio; moedas, dívida e estoque dos outros só se sees() permitir).
FASE 4 — Camada de comandos. Toda ação passa por um único ponto que valida "quem enviou" e "é a vez dele" (ou é permitida fora da vez, como o Mercado). Offline e bots passam pelo mesmo ponto; nada muda.
FASE 5 — Rede (rede.js novo). Criar sala, código de sala e link ?sala=CODIGO (lido no iniciar.js), entrar, enviar e receber mensagens. Teste simples entre duas abas.
FASE 6 — Lobby. Telas de criar/entrar na sala, lista de jogadores, nomes, vagas de bot (fácil/normal) e botão "Iniciar" (só o anfitrião), usando A.new({ nomes, bots, first }).
FASE 7 — Sincronização e vez. O anfitrião aplica as ações e envia a cada jogador a sua visão. Trocar "Passe o dispositivo" por "Aguardando [jogador]" (no mesmo ponto do gancho do bot em tela.js). Só quem está na vez joga. Só o anfitrião grava o estado completo em localStorage.
FASE 8 — Janelas. Mercado e Governo atuam só pelo jogador local (sem "atuar como" outros). Dev desligado no online. Ver jogador e zoom respeitam sees() e usam o jogador local, não cur().
FASE 9 — Robustez. Desconexão e reconexão, retomar a partida da sala, mensagens duplicadas ou fora de ordem, anfitrião que sai (os bots param).
FASE 10 — Testes. Roteiro com duas abas e depois dois aparelhos, e uma conferência de que nenhuma informação secreta aparece nas mensagens.
FASE 11 — Publicação. Como publicar de graça (GitHub Pages para o jogo) e como o convite funciona na prática.

Antes da Fase 0, faça no máximo 3 perguntas, se necessário.
```

---

## Ordem sugerida
1. **Conferir no navegador** (a lista de 30 minutos acima), principalmente o `qa.html` e o bot no celular.
2. **Online** (Parte 3), por fases, uma por conversa quando for grande. Envie sempre o `FICHAS_TECNICAS.md` mais recente.
