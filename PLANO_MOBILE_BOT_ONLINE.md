# Tempo de Colheita — Plano: Mobile, Bot e Online (versão 2)

Esta versão já considera TODOS os arquivos do jogo (agora li também `index.html`, `style.css`, `zoom.js`, `menu.js`, `acoes-plantio.js` e `iniciar.js`).

**Como usar numa conversa nova:** envie este arquivo + o `FICHAS_TECNICAS.md` + os arquivos da lista da etapa. **Uma etapa por conversa** (mobile, depois bot, depois online). **Sempre envie a versão mais recente dos arquivos**: cada etapa altera arquivos que a próxima também usa (`tela.js`, `janelas.js`, `menu.js`).

---

## O que os arquivos novos revelaram (e mudou em relação à versão 1)

| Descoberta | Efeito no plano |
|---|---|
| `index.html` **já tem** a tag `viewport`. | Para o celular só falta `viewport-fit=cover` (e opcionalmente `theme-color`). Antes eu havia dito que faltava a tag. |
| `style.css` **não tem nenhuma media query de layout** (só `prefers-color-scheme`). | A adaptação ao celular é trabalho novo, quase todo neste arquivo. |
| `zoom.js` usa um único ouvinte de `click`, que no celular funciona com o toque. O `Esc` não é crítico: as janelas têm botão "Fechar" e o plantio tem "Cancelar". | `zoom.js` deixa de ser essencial para o celular (vira opcional). |
| As ações do Mercado e da Feira **leem os valores direto dos campos da tela** (`A.listRes` lê `#rq…`/`#rp…`, `A.list` lê `#pr…`, `A.buyFeira` lê `#fq…`). `A.new` lê `#n`, `.nm` e campos do Dev. | Um bot e o online não conseguem chamar essas ações sem tela. **Primeiro passo do bot e do online: fazer essas ações receberem parâmetros** (com os campos da tela só como valor padrão). |
| As ações chamam `alert()` quando recusam (ex.: `A.up` "Nível máximo"). | O alerta trava o navegador. O bot precisa conferir as condições antes de agir. |
| `render()` grava o estado inteiro em `localStorage` (`tc_save`) a cada desenho. | No online, só o anfitrião deve guardar o estado completo. |
| `iniciar.js` só chama `render()`. | Irrelevante para o celular e o bot. No online é o ponto onde se lê o link `?sala=`. |
| `acoes-plantio.js` é só lógica (confirmado). | Não entra no celular. Entra no bot e no online. |

---

## PARTE 1 — Adaptação gráfica para celular

### Diagnóstico inicial (medido no navegador, sem as imagens do jogo)
- **PC (1366×768):** tudo certo.
- **Celular em pé (390×844):** as abas laterais dos jogadores (fixas, 91 px de largura) ficam em cima da borda da área de compra (que tem só 215 px de largura); a caixa "Evento Geral Ativo" (240 px, fixa no canto) cobre a região da mão; a barra de recursos ocupa 88 px; as 5 cartas da mão (130 px cada) são espremidas para caber.
- **Celular deitado (844×390):** barra de recursos e botões do topo consomem 192 px dos 390 px, e a mão fixa ocupa 233 px; sobra pouquíssimo espaço de jogo.
- **Em qualquer celular:** a carta da mão só "sobe" ao passar o mouse (`:hover`), o que não existe no toque (o toque abre o zoom, que funciona); `vh` causa erro com a barra do navegador do celular; botões pequenos (6×10 px de preenchimento).

### Arquivos a enviar

| Arquivo | Por quê |
|---|---|
| **style.css** | Principal. Todos os problemas acima estão aqui. |
| **tela.js** | Gera a estrutura da tela principal (`.top`, `.center`, `.hand`, `.side`, `#evb`) e a função `fit()`, que usa limites fixos (`CENTER_MAX`, `CENTER_MIN`) e lê `--ratio-campo`. |
| **janelas.js** | Estrutura das janelas (Governo, Feira, Mercado em colunas, Dev). Tem `style=` embutido no HTML. |
| **pecas-tela.js** | Gera as abas laterais (`sideTab`) e as caixinhas de informação. |
| **menu.js** | Tela inicial: até 10 campos de nome numa tela estreita. |
| **cartas-visual.js** | Gera o HTML das cartas (`cardHTML`): classes, imagem de fundo embutida e proporções. |
| **index.html** | Tem só 1 ajuste (`viewport-fit=cover`), mas é pequeno e mostra a ordem dos scripts. |
| **zoom.js** (opcional) | Só se você quiser mudar o comportamento (por exemplo, fechar com gesto). O visual do zoom (`#zoom`) é todo CSS. |
| **Prints** | Um do PC e um do celular. Ajudam muito, porque as sprites mudam o aspecto das cartas. |

Medidas das imagens (não precisa enviar o `cartas.js`): campos 1248×832 (3:2), demais cartas 576×1032, símbolos 256×256.

### Por que NÃO enviar os outros (e por que poderiam parecer necessários)

| Arquivo | Parece necessário porque... | Não precisa porque... |
|---|---|---|
| **acoes-plantio.js** | Parece "a tela de plantar". | Só muda o estado (`pick`, `plantIn`, `up`). O destaque dos campos (`.pick`, `.gray`) é CSS e `tela.js`. |
| **acoes-turno.js** | Tem "começar turno" e a tela "Vez do jogador". | Essa tela é desenhada em `tela.js`. Aqui só há regras e leitura do menu. |
| **acoes-economia.js, acoes-mercado.js** | Governo e Mercado são janelas. | As janelas são desenhadas em `janelas.js`. |
| **dev.js** | O painel Dev é uma janela. | A janela do Dev é desenhada em `janelas.js`. |
| **iniciar.js** | "Liga o jogo". | Só chama `render()`. |
| **estado.js, consultas.js, rodada.js, objetivos.js** | — | Só lógica. |
| **config.js / cartas.js** | Têm textos longos e caminhos de imagem. | Texto longo raramente quebra o layout. Se uma carta específica estourar, peça aquele trecho depois. |
| **editor.html** | É HTML. | Ferramenta de PC (usa a escolha de pasta do Chrome/Edge). Não faz parte do jogo no celular. |
| **qa.html** | Lê elementos da tela. | Veja o aviso abaixo. |

### Aviso: o QA depende de nomes na tela
O `qa.html` procura estes elementos: `#app .hand .card`, `#app .center .fs`, `#app .cards.mine .fv`, `#modal`, `#modal .mk section`, `#modal .gal .card`, `#zoom`, `.nm` e, no menu, `#n`, `#f` e `#nl`. **O prompt manda preservar esses nomes.** Pode adicionar classes novas, mas não renomear as existentes.

### PROMPT 1 — Adaptação gráfica para celular

```
Estou enviando a Ficha Técnica e os arquivos do meu jogo "Tempo de Colheita" (HTML + JavaScript puro, sem framework): style.css, tela.js, janelas.js, pecas-tela.js, menu.js, cartas-visual.js, index.html e prints do jogo no PC e no celular.

OBJETIVO
Adaptar o VISUAL para funcionar bem em celular (retrato e paisagem), sem prejudicar o PC. Um código só, responsivo (media queries e unidades relativas). Não crie duas versões.

O QUE JÁ SEI (medido no navegador)
- O style.css não tem nenhuma media query de layout (só prefers-color-scheme). O index.html já tem a tag viewport, falta viewport-fit=cover.
- Em 390x844: as abas laterais fixas (.side/.tab, ~91px) cobrem a borda da área de compra (.center, 215px de largura); a caixa de eventos #evb (240px, fixa no canto) cobre a região da mão; a barra #hud ocupa ~88px; as 5 cartas da mão (.hand .card, 130px) são espremidas.
- Em 844x390 (paisagem): #hud + .top consomem ~192px dos 390px de altura e a mão fixa ocupa ~233px.
- A carta da mão só sobe com :hover (não existe no toque). O toque na carta já abre o zoom (zoom.js), isso deve continuar funcionando.
- Há usos de vh que dão erro com a barra do navegador do celular (usar dvh). Botões pequenos.

REGRAS
1. Não mude nenhuma regra do jogo nem os arquivos de lógica (acoes-*.js, rodada.js, objetivos.js, consultas.js, estado.js, config.js, cartas.js). Se achar que precisa, me avise antes.
2. PRESERVE ids e classes existentes (#app, #hud, .top, .center, .fs, .cards, .mine, .hand, .card, .side, .sideL, .sideR, .tab, #modal, .box, .wide, .mk, .gal, #evb, .log, #zoom, .zp, #n, #f, #nl, .nm), porque meu teste automático depende deles. Pode ADICIONAR classes novas.
3. Sem bibliotecas externas.
4. Mantenha o cabeçalho "FICHA TÉCNICA" de cada arquivo e atualize-o quando o papel do arquivo mudar.
5. Proporções das imagens: campos 3:2 (1248x832), demais cartas 576x1032 (vertical).

ETAPAS (entregue uma por vez e espere meu OK)
1. DIAGNÓSTICO: sem alterar nada, confirme/complete a lista de problemas por tela (menu, tela principal, janelas Governo/Feira/Mercado/Objetivo/Ver jogador/Dev, zoom de carta) em 360x640, 390x844, 412x915, paisagem 844x390, tablet 768x1024 e PC 1366x768. Proponha o layout de cada um (o que muda de lugar, o que recolhe).
2. BASE: viewport-fit=cover, variáveis de CSS, dvh em vez de vh, safe-area (env()), tamanhos de toque.
3. TELA PRINCIPAL: topo, #hud, campos à venda, seus campos, mão e abas laterais. A função fit() de tela.js usa limites fixos; torne-a adaptável.
4. JANELAS: tela cheia no celular, Mercado em coluna única, #evb recolhível, botões fáceis de tocar. O zoom (#zoom) com o painel .zp embaixo da carta em retrato.
5. MENU e TOQUE: campos de nome, alvos de toque de no mínimo 44px, nada que dependa de hover, sem zoom acidental por toque duplo (touch-action).
6. ENTREGA: arquivos completos alterados, lista objetiva de mudanças e como testar no modo dispositivo do navegador (F12).

CRITÉRIOS DE ACEITE
- Sem rolagem horizontal da página.
- Todos os botões tocáveis com o dedo.
- Mão e campos legíveis em retrato e utilizáveis em paisagem.
- O PC continua como está ou melhor.

Antes de começar, faça no máximo 3 perguntas, se necessário.
```

---

## PARTE 2 — Bot

### Arquivos a enviar

| Arquivo | Por quê |
|---|---|
| **acoes-turno.js** | `A.go()` e `A.end()` são o fluxo do turno, onde o bot entra e passa a vez. `A.new()` lê o menu na tela. |
| **acoes-economia.js, acoes-mercado.js, acoes-plantio.js** | São as ações que o bot chama. **Várias leem valores direto da tela e usam `alert()`** (ver tabela no início): precisam ser ajustadas. |
| **janelas.js** | É onde estão os campos lidos pelas ações do Mercado e da Feira e os `onclick` que as chamam. Se as ações passarem a receber parâmetros, os botões daqui precisam repassar os valores. |
| **rodada.js** | Ordem dos jogadores, virada de rodada, eventos ativos. |
| **consultas.js** | `cur()`, `alive()`, `fits()`, `free()` e as consultas dos eventos (`mercadoFechado()`, `feiraMax()`, `govPreco()`, `campoGratis()`...). |
| **objetivos.js** | `done(p)`, para o bot saber o que está perseguindo. |
| **pecas-tela.js** | Tem `sees()`, a regra do que cada jogador pode ver. O bot não pode trapacear. |
| **estado.js** | O formato de `S`. |
| **tela.js e menu.js** | Menu: marcar o jogador como bot. Tela: não mostrar "Passe o dispositivo" quando for a vez do bot. |
| **config.js e cartas.js** | Tipos de objetivo, preços, níveis, regras. |
| **index.html** | O `bot.js` novo precisa entrar na ordem de carregamento (antes de `iniciar.js`). |

### Por que NÃO enviar
| Arquivo | Por quê |
|---|---|
| **style.css, cartas-visual.js** | O bot chama ações, não clica em nada. |
| **zoom.js** | Só visual. `A.pick` remove o zoom (`#zoom`) se existir, e isso é inofensivo sem tela. |
| **dev.js, editor.html, iniciar.js** | Ferramentas, ou só chamam `render()`. |

### Vantagem e desvantagem de enviar o qa.html

**O que tem de útil:** um bot que joga partidas inteiras. O trecho que importa é pequeno: de `function melhorPlantio` até o fim de `function mercado` (cerca de 50 linhas, uns 5 KB de ~70 KB). Também há `partida()`, que mostra como rodar um jogo completo.

**Vantagens de enviar:**
- Ponto de partida pronto, em vez de começar do zero.
- Mostra uma sequência de ações que o jogo aceita.
- `partida()` serve de modelo para testar bot contra bot.

**Desvantagens de enviar o arquivo inteiro:**
- É pesado e cheio de testes que o bot não usa. Gasta atenção e espaço da conversa.
- O bot do QA foi feito para **achar erros**, não para vencer.
- É acoplado ao QA. Como as ações leem campos da tela, o QA usa um auxiliar próprio (`inp()`, que cria esses campos escondidos) e verificadores próprios. Extrair isso sem trazer lixo dá trabalho. **Esse é o ponto mais importante:** o bot de verdade deve chamar ações com parâmetros, e não imitar o truque do QA.
- O QA só tem verificação própria para os objetivos antigos, então a lógica de objetivos dele pode estar desatualizada.
- Risco de a IA mexer no `qa.html` sem você pedir.

**Recomendação:** não envie o `qa.html` inteiro. **Copie só o bloco do bot** (`melhorPlantio`, `decide`, `mercado`) para um `bot-referencia.txt` e avise que é só leitura. Se preferir não enviar nada, o bot sai do zero, só que mais devagar.

### PROMPT 2 — Bot

```
Estou enviando a Ficha Técnica e os arquivos do meu jogo "Tempo de Colheita" (HTML + JS puro): acoes-turno.js, acoes-economia.js, acoes-mercado.js, acoes-plantio.js, janelas.js, rodada.js, consultas.js, objetivos.js, pecas-tela.js, estado.js, tela.js, menu.js, config.js, cartas.js, index.html. Se enviei, há também um trecho de referência (bot-referencia.txt) retirado do meu arquivo de testes: é apenas LEITURA; não altere nem recrie o qa.html.

OBJETIVO
Permitir que um ou mais jogadores sejam controlados pelo computador (bot) numa partida normal.

PROBLEMAS JÁ CONHECIDOS NO CÓDIGO
- A.listRes, A.list e A.buyFeira leem quantidade e preço direto dos campos da tela ($('#rq'+k), $('#rp'+k), $('#pr'+uid), $('#fq'+k)). Um bot não tem esses campos. A.new() também lê o menu na tela.
- As ações chamam alert() quando recusam. O alert trava o navegador; o bot deve conferir as condições ANTES de chamar a ação.
- render() é chamado dentro das ações e grava o estado inteiro em localStorage.

REQUISITOS
1. No menu, cada jogador pode ser marcado como bot (guardar em p.bot). Deve funcionar também em "Continuar" (partida salva).
2. O bot usa SOMENTE as ações do jogador (A.go, A.buyF, A.pick/A.plantIn, A.up, A.sell, A.listRes, A.list, A.buyM, A.cancel, A.buyFeira, A.loan, A.pay, A.extra, A.end...). Não altere o estado diretamente.
3. Na vez do bot NÃO mostrar "Passe o dispositivo / Estou pronto". O bot joga sozinho, com pequenos atrasos (setTimeout) para eu acompanhar, e mostra "Bot X está jogando...".
4. O bot não pode trapacear: usa só o que um humano naquela posição vê (o próprio estado, o mercado, os eventos ativos e o que sees() permitir).
5. O bot persegue o próprio objetivo (done(p) e os tipos de objetivo) e evita eliminação (dívida, piso de moedas, objetivos com elim:1).
6. O bot entende os eventos gerais ativos: Embargo (mercadoFechado), Feira Regional (feiraMax / A.buyFeira), Incentivo Fiscal (campoGratis), Governo paga +100% (govPreco), Alta demanda, Taxa do Mercado, Greve/Praga/Tempestade (prodBloqueada).
7. Dois níveis: Fácil (decisões simples, às vezes erra) e Normal (busca o objetivo com planejamento básico).
8. Proteções: limite de ações por turno (sem loop infinito), try/catch, e sempre terminar com A.end().

ARQUIVOS
- Crie bot.js novo (com cabeçalho "FICHA TÉCNICA"). Diga em que posição entra na ordem do index.html (a ordem importa).
- PRIMEIRO PASSO: faça A.listRes(k, qty, price), A.list(kind, uid, price) e A.buyFeira(k, qty) aceitarem parâmetros opcionais; sem parâmetro, continuam lendo da tela como hoje. Ajuste os onclick de janelas.js se necessário. O jogo normal não pode mudar de comportamento.
- Altere o mínimo possível e liste cada alteração. Atualize a Ficha Técnica.
- Preserve ids e classes da tela (meu teste automático depende deles).

ETAPAS (uma por vez, espere meu OK)
1. Proponha o desenho: como o bot decide e em que ponto do fluxo é chamado. Confirme os ajustes de parâmetros.
2. Ações com parâmetros (sem mudar o jogo).
3. Bot básico jogando um turno completo.
4. Mercado, Feira e eventos.
5. Menu, dificuldades e partida salva.
6. Teste: função no console que rode N partidas só com bots e informe erros, quantas terminaram e quem vence.

Antes de começar, faça no máximo 3 perguntas, se necessário.
```

---

## PARTE 3 — Online (preparação e passo a passo)

### Arquivos a enviar
Quase todos de motor e tela, porque o online atravessa o jogo:

| Arquivo | Por quê |
|---|---|
| **estado.js, consultas.js** | O estado `S` e `cur()` (jogador da vez) são a base de "quem sou eu". |
| **acoes-turno.js, acoes-economia.js, acoes-plantio.js, acoes-mercado.js** | As ações viram comandos validados. Leem a tela e usam `alert()`, e `A.new()` lê o menu. |
| **rodada.js, objetivos.js** | A virada de rodada e a vitória são decididas pelo anfitrião. |
| **pecas-tela.js** | `sees()` vira o filtro do que cada jogador recebe. |
| **tela.js, janelas.js, menu.js** | "Passe o dispositivo" vira "Aguardando"; o menu ganha criar/entrar na sala; as janelas deixam de permitir "atuar como" outro jogador. `render()` grava o estado inteiro em `localStorage`. |
| **zoom.js** | Usa `cur()` (janela do campo, ver carta): precisa usar o jogador local. |
| **iniciar.js, index.html** | `iniciar.js` é onde se lê o link `?sala=`; o `index.html` define a ordem do `rede.js` novo. |
| **config.js, cartas.js** | Regras e baralhos (embaralhados só no anfitrião). |
| **dev.js** | Precisa ser desligado no online (dá moedas e cartas). |

### Por que NÃO enviar
| Arquivo | Por quê |
|---|---|
| **style.css, cartas-visual.js** | Visual puro. Para as telas novas (sala/lobby), a conversa pede o CSS na hora. |
| **editor.html, qa.html** | Ferramentas. O online será testado com duas abas abertas. |

### Antes de começar: decisões
- **Arquitetura recomendada:** o navegador de um jogador (anfitrião) roda o jogo; os outros enviam ações e recebem uma visão filtrada. Não precisa de servidor próprio.
- **Transporte gratuito:** WebRTC direto entre navegadores (por exemplo PeerJS) ou o Firebase Realtime Database como retransmissor. Confirme os limites gratuitos atuais antes de decidir. Segundo páginas consultadas, o plano gratuito do Firebase (Spark) não pede cartão e limita o Realtime Database a 100 conexões simultâneas e 1 GB de armazenamento.
- **Segurança:** o anfitrião tem o jogo inteiro no navegador, então um amigo mal-intencionado poderia trapacear pelo console. Entre amigos costuma bastar; para estranhos seria preciso um servidor que valide as jogadas.
- **Hospedagem:** o jogo continua podendo ficar no GitHub Pages (ele só entrega arquivos).
- **Dica:** fazer o bot antes ajuda, porque as ações com parâmetros (primeiro passo do bot) também são necessárias aqui.

### PROMPT 3 — Preparação do online (roteiro)

```
Estou enviando a Ficha Técnica e os arquivos do meu jogo "Tempo de Colheita" (HTML + JS puro): estado.js, consultas.js, acoes-turno.js, acoes-economia.js, acoes-plantio.js, acoes-mercado.js, rodada.js, objetivos.js, pecas-tela.js, tela.js, janelas.js, menu.js, zoom.js, iniciar.js, index.html, config.js, cartas.js, dev.js.

OBJETIVO
Preparar o jogo para ser jogado ONLINE, eu contra um amigo (depois, mais jogadores), entrando por código de sala e link de convite, SEM gastar dinheiro (somente serviços gratuitos e seguros). Hoje o jogo é "passe o aparelho": um navegador guarda todo o estado (S) e esconde as informações com a tela "Estou pronto".

O QUE JÁ SEI NO CÓDIGO
- cur() (jogador da vez), S.order/S.t, S.actor, S.hide e sees() são usados em vários arquivos (inclusive zoom.js e janelas.js).
- Ações do Mercado e da Feira (A.listRes, A.list, A.buyFeira) e A.new() leem valores direto de campos da tela. As ações usam alert() ao recusar.
- render() grava o estado inteiro em localStorage (tc_save) a cada desenho.

REGRAS DE TRABALHO
1. Trabalhe por FASES. Ao fim de cada fase o jogo OFFLINE (passe o aparelho) deve continuar funcionando igual. Entregue uma fase por vez e espere meu OK.
2. Não reescreva o jogo: mudanças pequenas e localizadas, listadas por arquivo.
3. Mantenha o cabeçalho "FICHA TÉCNICA" e atualize a Ficha.
4. Nada de bibliotecas pagas ou que peçam cartão. Antes de recomendar um serviço, confira os limites gratuitos ATUAIS e me diga.
5. Informações secretas (mão, objetivo, estoque e dívida de outros, conforme sees()) NUNCA podem ser enviadas a quem não pode vê-las.
6. Preserve ids e classes da tela (meu teste automático depende deles).

ROTEIRO
FASE 0 — Decisões e inventário. Confirme comigo a arquitetura (anfitrião roda o jogo; os outros enviam ações e recebem visão filtrada) e o transporte (WebRTC direto, ex. PeerJS, ou Firebase Realtime Database). Liste todos os pontos do código que dependem de cur(), S.order[S.t], S.actor, S.hide e sees().
FASE 1 — Identidade local. Criar "quem sou eu" neste navegador (índice do jogador local). Offline, ele acompanha o jogador da vez.
FASE 2 — Ações com parâmetros. Fazer A.listRes, A.list, A.buyFeira e A.new aceitarem parâmetros (sem ler a tela e sem alert para erros de rede); sem parâmetro, continuam como hoje.
FASE 3 — Visão filtrada. Criar viewFor(i): o estado como o jogador i pode vê-lo (mão e objetivo só do próprio; moedas, dívida e estoque dos outros só se sees() permitir).
FASE 4 — Camada de comandos. Toda ação passa por um único ponto que valida "quem enviou" e "é a vez dele" (ou é permitida fora da vez, como o Mercado). Offline, nada muda.
FASE 5 — Rede (rede.js novo). Criar sala, código de sala e link ?sala=CODIGO (lido no iniciar.js), entrar, enviar e receber mensagens. Teste simples entre duas abas.
FASE 6 — Lobby. Telas de criar/entrar na sala, lista de jogadores, nomes e botão "Iniciar" (só o anfitrião).
FASE 7 — Sincronização e vez. O anfitrião aplica as ações e envia a cada jogador a sua visão. Trocar "Passe o dispositivo" por "Aguardando [jogador]". Só quem está na vez joga. Só o anfitrião grava o estado completo em localStorage.
FASE 8 — Janelas. Mercado e Governo atuam só pelo jogador local (sem "atuar como" outros). Dev desligado no online. Ver jogador e zoom respeitam sees() e usam o jogador local, não cur().
FASE 9 — Robustez. Desconexão e reconexão, retomar a partida da sala, mensagens duplicadas ou fora de ordem, anfitrião que sai.
FASE 10 — Testes. Roteiro com duas abas e depois dois aparelhos, e uma conferência de que nenhuma informação secreta aparece nas mensagens.
FASE 11 — Publicação. Como publicar de graça (GitHub Pages para o jogo) e como o convite funciona na prática.

Antes da Fase 0, faça no máximo 3 perguntas, se necessário.
```

---

## Ordem sugerida
1. **Mobile:** só visual, é a etapa mais segura.
2. **Bot:** o primeiro passo (ações com parâmetros) também serve ao online, e o bot ajuda a testar o jogo sozinho.
3. **Online:** a maior. Faz sentido depois do visual novo, para as telas de sala aproveitarem o layout.
