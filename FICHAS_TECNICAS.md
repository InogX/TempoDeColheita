# Tempo de Colheita — Fichas Técnicas dos Arquivos

Todos os arquivos ficam na MESMA pasta (junto com a pasta `img/`).
Para jogar: abra `index.html` (no PC ou no celular). Para editar cartas: `editor.html`.

## Fluxo dos menus
`Jogar Online` → Criar Sala · Achar Sala · Buscar Partida (em breve) · Voltar. `Jogar Local` → Continuar Jogo (só se houver jogo salvo) · Novo Jogo · Tutorial (em breve) · Configurações (o antigo painel Dev) · Voltar. Criar Sala e Achar Sala já têm a tela, mas a conexão online ainda não está ligada (mostram "Essa função encontra-se em implementação ainda"). Sair de uma partida volta ao menu principal.

## Regra de ouro
Se for só mudar NÚMEROS e TEXTOS de cartas e regras → use o `editor.html` (não mexa em código).
Se algo "se comporta errado" → use a tabela "Onde mexer" no fim deste arquivo.

## Arquivos de dados (o que o jogo "sabe")
- **cartas.js** — O baralho: objetivos, campos, cartas de recurso, os 20 eventos gerais e os individuais, mais preços, níveis e regras. É escrito pelo editor.html. Não edite à mão.
- **config.js** — Nomes das culturas, textos dos objetivos, **textos das regras dos eventos gerais (EVT)**, valores padrão, os baralhos novos (DECKS_V5 = eventos gerais) e a função que completa arquivos antigos (`migrate`).

## Páginas
- **index.html** — A página do jogo. Só lista quais arquivos carregar (a ORDEM importa, não mude). Já tem as marcações para celular (`viewport-fit=cover` e `theme-color`). O `bot.js` entra logo depois de `acoes-mercado.js` o `rede.js` logo depois do `bot.js` e o `visao.js` logo depois do `pecas-tela.js`.
- **editor.html** — O editor de cartas e regras (use no Chrome/Edge). Não faz parte do jogo no celular.
- **qa.html** — O robô de testes que joga sozinho e procura erros. (Atenção: `menu()` agora abre o menu principal, não mais o formulário; se o QA precisa do formulário, ele deve chamar `Menu.ir('novo')` ou usar `A.new({ nomes, bots, first })`.) Tem oráculos próprios dos eventos gerais (Greve, Praga, Feira, Embargo etc.) e um teste dirigido com valores calculados à mão para cada carta nova. **Ainda não foi rodado depois das mudanças de celular e do bot: rode-o antes da próxima etapa.**

## Aparência
- **style.css** — Cuida só da aparência: cores, tamanhos, posição das cartas, abas laterais, mão, janelas, zoom e animação de melhoria. Agora é **responsivo** (celular em pé e deitado, tablet e PC, com media queries). No fim do arquivo está o bloco dos menus iniciais (`.menu .mb` botões grandes, `.mavs` aviso, `.sala` caixa do código, `.nmrow`/`.bt` humano ou bot). Não tem nenhuma regra do jogo.

## Arquivos do motor do jogo (na ordem em que carregam)
1. **estado.js** — Guarda as peças básicas: o estado da partida (`S`), o **estado de interface deste aparelho (`UI`)**, as regras lidas do editor e o embaralhador. `UI` (janela aberta, carta escolhida, jogador sendo visto, "atuar como" do Mercado, ferramentas Dev) fica FORA de `S`: não vai para o save nem, no online, para os outros jogadores. `UIreset()` zera. `ligaUI()` é uma **ponte provisória**: faz `S.modal`, `S.plantSel`, `S.actor`, `S.viewing`, `S.viewRes`, `S.devP` e `S.dv` continuarem funcionando como atalhos (não enumeráveis, não vão ao save) para o código ainda não migrado (`janelas.js`, `qa.html`).
2. **cartas-visual.js** — Aparência e textos das cartas: nome, descrição, preço, nível, imagem de dia/noite. Monta o texto das regras dos eventos (`evTxt`) e a descrição de um evento ATIVO com a cultura sorteada (`evDesc`). O bot usa daqui `free`, `NV`, `vef`, `nm` e `evDesc`: **não renomeie nem mude o que devolvem**.
3. **consultas.js** — Perguntas rápidas: de quem é a vez (`cur()`), **quem sou eu neste aparelho (`eu()` índice, `me()` jogador; `EU` fica `null` no jogo local, onde acompanha a vez, e será fixo no online)**, `peekPend()` (devo escolher quem espiar?), quem está vivo, comprar do baralho, se a carta cabe no campo, registro de eventos. **Também guarda as consultas dos eventos ativos:** produção bloqueada (Greve/Praga/Tempestade), manutenção (Isenção/Incentivo), preço do Governo, juros, Taxa do Mercado, Embargo, campo grátis e limite da Feira.
4. **objetivos.js** — Decide se um objetivo foi cumprido, se foi violado (eliminação) e quem vence a rodada.
5. **rodada.js** — A virada de rodada: sorteia o evento geral (`sorteiaGeral`, com a trava do Auxílio), cria o evento ativo (`novoEvento`: cultura sorteada, estoque da Feira), aplica os efeitos de uma vez só (`efeitoImediato`: Recessão, Imposto, Auxílio, Mudas), executa a Alta demanda no fim da rodada (`fimDeRodada`), cobra juros, define a ordem dos jogadores e repõe os campos à venda.
6. **acoes-turno.js** — O fluxo da partida: novo jogo, continuar, sair, começar turno (produção e manutenção com os efeitos dos eventos), encerrar turno. **Resultado das ações (Fase 2):** `recusa(msg)`, `exec(fn)` e `A.tentar(nome, ...args)` — rodam uma ação em silêncio (sem `alert`) e devolvem `{ ok, msg }`. O evento individual "espiar" deixa a pendência em `S.peekPend` (é parte do jogo; a janela de escolha aparece só para `eu()`). `A.cont()` migra saves antigos (tira os campos de interface de `S`). **`A.new()` lê o menu da tela ou recebe `{ nomes, bots, first }` como parâmetro** (assim a partida pode ser criada sem tela). Os campos Dev (moedas iniciais, recursos, ver tudo, objetivo de cada jogador) são lidos da tela e, se não estiverem nela, de `Menu.cfg` (a tela Configurações). `A.quit()` volta ao menu principal. Cada jogador tem `p.bot`: `''` (humano), `'facil'` ou `'normal'`.
7. **acoes-economia.js** — (toda recusa diz o motivo e devolve `false`) Dinheiro com o Governo: comprar campo (com Incentivo Fiscal), empréstimo, pagar dívida, carta extra, vender recursos (com Governo paga +100%) e **comprar na Feira Regional**. `A.sell(k, qtd)` e `A.buyFeira(k, qtd)` aceitam a quantidade como parâmetro opcional (sem ela: vende tudo / lê o campo da tela).
8. **acoes-plantio.js** — (toda recusa diz o motivo e devolve `false`) Lavoura: escolher carta (`UI.plantSel`), plantar no campo (`A.plantIn(fi, h)`: `h` opcional = carta da mão; sem ele usa a carta escolhida) e evoluir de nível.
9. **acoes-mercado.js** — (toda recusa diz o motivo e devolve `false`; só se oferta e cancela o que é seu, e não se compra a própria oferta) Mercado entre jogadores: ofertar, cancelar, comprar (com Embargo e Taxa do Mercado) e contar as negociações. Quem atua é `UI.actor` ("atuar como" da janela). `A.listRes(k, qtd, preco)` e `A.list(kind, uid, preco)` aceitam os valores como parâmetros opcionais (sem eles: leem os campos da tela).
10. **bot.js** — **Jogador controlado pelo computador** (níveis fácil e normal). Joga só pelas ações `A.*`, como um humano, sem ver o que um humano não veria. Tem a tela "Bot X está jogando..." e o teste `Bot.simular()`. Detalhes na seção "Bot" abaixo.
11. **rede.js** — **Transporte online** (Firebase Realtime Database + login anônimo). É o ÚNICO arquivo que conhece o Firebase; não depende de `S`, `A` nem `Menu`. O SDK só é baixado ao chamar `Rede.iniciar()`, então o jogo local não gasta nada. Interface: `Rede.iniciar`, `criar(nome, vagas)`, `entrar(codigo, nome)`, `enviar(tipo, args)`, `aoAcao`, `aoVisao`, `aoJogadores`, `aoMeta`, `darVisao(s)`, `gravarEstado/lerEstado`, `definirEstado`, `sair`, `lerConvite`, `linkConvite` e as propriedades `Rede.uid/codigo/ehHost/naSala/convite`. Para trocar de serviço no futuro, reescreva só este arquivo mantendo `Rede.*`. Ainda **não está ligado ao jogo**: o lobby (Fase 6) e a sincronização (Fase 7) vão usá-lo. Detalhes e estrutura gravada no cabeçalho do próprio arquivo.
12. **dev.js** — Ferramentas de teste (painel Dev; o alvo vem de `UI.devP`; ainda usa `alert` direto, pois só existe no jogo local): dar moedas, cartas, forçar eventos (o evento forçado também aplica os efeitos).
13. **menu.js** — Os menus iniciais. `Menu.tela` escolhe a tela (`main`, `online`, `local`, `novo`, `criar`, `achar`, `config`); `Menu.ir('tela')` navega e `Menu.wip()` mostra o aviso de "em implementação". A tela `novo` tem número de jogadores, nomes, **escolha humano ou bot de cada jogador (`select.bt`)** e quem começa (`names()` mantém o digitado ao mudar o número de jogadores). A tela `config` guarda os valores em `Menu.cfg` (só na memória; não vão para o save). No celular tudo fica dentro de `<div class="menu">`.
14. **pecas-tela.js** — Peças pequenas da tela: ícones de moeda/recurso, abas laterais, quem pode ver as informações de quem.
15. **visao.js** — **Visão filtrada** (Fase 3). `viewFor(i)` devolve uma cópia do estado `S` como o jogador `i` pode vê-lo (`i = null`: espectador). É o que o anfitrião vai enviar a cada jogador no online; segredo não sai daqui. Público: nomes, bot/humano, quem saiu, campos (sem os plantios), noite/revelação, rodada, ordem, eventos, campos à venda, Mercado, registro e vencedor. Só quando `sees()` permite: moedas, dívida, estoque, plantios e quantas cartas há na mão (cartas ocultas viram `{ oculta: true }`). Só do próprio jogador: mão, objetivo, evento individual e estatísticas. Nunca vai: baralhos, `uid` e `devAll`; o cofre do Governo só com "Tudo à vista"; `peek` e `peekPend` só para quem deve ter. Valores escondidos viram `null`. Usa `sees()` de `pecas-tela.js`; não altera `S`.
16. **janelas.js** — As janelas de pop-up: Governo (inclui a Feira Regional), Mercado (mostra "fechado" no Embargo), Objetivo, Espiar, Ver jogador, Dev.
17. **tela.js** — Desenha a tela principal (mostra os eventos ativos e o preço dos campos, "Grátis" no Incentivo) e ajusta o tamanho das cartas do centro. Mostra o jogador deste aparelho (`me()`) e, separado, quem está na vez (`cur()`). **Na vez de um bot mostra a tela do bot e chama `Bot.agenda()`** (no online, só o anfitrião deve rodar bots: ajuste da Fase 7). Estrutura para celular: `.top` = `.st` (texto) + `.acts` (botões); `.seats` agrupa as abas; `.board` agrupa campos à venda + seus campos; `#evb` é recolhível (`EVB_OPEN`). No PC esses grupos não mudam nada.
18. **zoom.js** — (sempre mostra as cartas do jogador deste aparelho, `me()`) Ampliar carta, janela do campo, animação de melhoria, cliques e tecla Esc.
19. **iniciar.js** — Liga o jogo (último a carregar): lê o link de convite (`?sala=CODIGO`, guardado em `Rede.convite`) e manda desenhar a primeira tela.

## Bot (bot.js)
- **Como joga:** cada passo escolhe UMA ação e a executa pelas mesmas ações do jogador (`A.go`, `A.pick/plantIn`, `A.up`, `A.sell`, `A.buyF`, `A.loan`, `A.pay`, `A.extra`, `A.buyFeira`, `A.listRes`, `A.buyM`, `A.cancel`, `A.end`). Ordem: recolhe ofertas antigas, sobrevive (vende tudo/empréstimo se faltar moeda), se o objetivo já está cumprido só vende a sobra, fecha objetivos de moedas, planta, evolui, usa a Feira, Mercado, converte estoque em moedas, compra campo, carta extra e paga dívida.
- **Níveis:** `Bot.PF` (fácil: descuida, guarda pouca reserva; normal: persegue o objetivo e evita eliminação). **Velocidade:** `Bot.delay` (padrão 700 ms; 0 = o mais rápido). Há um botão ⏩ na tela do bot.
- **Alert:** `Bot.tenta()` executa a ação pelo `exec()` (sem `alert`); se a ação foi recusada ou nada mudou, não tenta de novo naquele turno.
- **Teste:** no console do navegador, `Bot.simular(20, 3, ['normal'])` roda 20 partidas só com bots, sem tela, e informa quantas terminaram, quem venceu, por qual objetivo e erros de estado. Não mexe na partida salva.
- **Limites conhecidos:** com 2 jogadores alguns objetivos de muitas moedas ou de Mercado (`noLoan`, `allLvl`, `clean`, `mUnits`, `mProfit`, `noites`, `floorUntil`) podem não fechar em 150 rodadas (é questão de balanceamento). Os testes do bot foram feitos em Node, com as funções de `cartas-visual.js` simuladas.

## Quem sou eu e interface (Fase 1)
`cur()` = quem joga agora. `me()`/`eu()` = quem é o jogador DESTE aparelho (no jogo local é o mesmo que `cur()`). As **telas, janelas e o zoom mostram `me()`**; as **ações continuam em `cur()`** (no online só valem na vez de quem enviou). Tudo que é só deste aparelho está em `UI`. O que é do jogo, mesmo parecendo interface (`S.hide`, `S.peek`, `S.peekPend`), continua em `S`.

## Resultado das ações (Fase 2)
Toda ação do jogador (`A.*`) recusa por `recusa(msg)`: mostra o `alert` como sempre e devolve `false`. Quem precisa saber o resultado (bots, testes, a rede no online) chama `A.tentar('sell', 'soja', 5)` e recebe `{ ok, msg }`, sem `alert`. Recusas que antes eram silenciosas (plantar onde não cabe, pagar sem dívida, ofertar item que não é seu etc.) agora também dizem o motivo. `A.tentar` aceita qualquer ação de `A`; a lista do que a rede pode chamar é da Fase 4. `A.go` e `A.end` ainda não conferem fase nem turno (Fase 4).

## Visão filtrada (Fase 3)
`viewFor(i)` (visao.js) é a ÚNICA porta de saída do estado para outros jogadores: nada de `S` inteiro pela rede. Ao criar um campo novo em `S` ou em um jogador, decida se é público, só de quem `sees()` permite, só do dono ou nunca sai, e ajuste `viewFor`. O teste confere que todo campo de `S` foi tratado. Tamanho medido: cerca de 5 KB por visão (máximo 12 KB).

## Nomes que NÃO podem ser renomeados (o qa.html e o bot dependem deles)
`UI`, `me()`, `eu()`, `cur()`, `S.peekPend`, `recusa`, `exec`, `A.tentar`, `viewFor`, `#app`, `.menu`, `#mavs`, `#hud`, `.top`, `.center`, `.fs`, `.cards`, `.mine`, `.hand`, `.card`, `.side`, `.sideL`, `.sideR`, `.tab`, `#modal`, `.box`, `.wide`, `.mk`, `.gal`, `#evb`, `.log`, `#zoom`, `.zp`, `#n`, `#f`, `#nl`, **`.nm`** (um por jogador) e **`.bt`** (um por jogador, na mesma ordem de `.nm`). Também os campos de tela lidos pelas ações quando não há parâmetro: `#rq…`, `#rp…`, `#pr…`, `#fq…`. Pode ADICIONAR classes novas, não renomear as existentes.

## Eventos gerais (20 cartas)
Cada carta tem `dur` (rodadas) e, quando tem efeito especial, o campo `fx`. Os números (valor, %, limite...) são editáveis no editor.html e o texto da carta acompanha.

| Carta | fx / campo | Onde a regra está |
|---|---|---|
| Chuva generosa (x1,5 · 2 rod.) | `mult` | acoes-turno.js |
| Safra recorde (x2 · 1 rod.) | `mult` | acoes-turno.js |
| Clima ameno (x1,25 · 3 rod.) | `mult` | acoes-turno.js |
| Feira Regional | `feira` (estoque, limite, preco) | rodada.js (estoque) · acoes-economia.js (`buyFeira`) · janelas.js |
| Alta demanda | `demanda` (teto) | rodada.js (`fimDeRodada`) |
| Governo paga +100% | `govPaga` (fator) | consultas.js (`govPreco`) · acoes-economia.js |
| Incentivo Fiscal (2 rod.) | `incentivo` (pct, campoMax) | consultas.js (`manutOf`, `campoGratis`) · acoes-economia.js |
| Isenção | `isencao` | consultas.js (`manutOf`) |
| Auxílio aos pequenos | `auxilio` (valor, minRound) | rodada.js (`geralOk`, `efeitoImediato`) |
| Entrega de mudas | `mudas` | rodada.js (`efeitoImediato`) |
| Campos noturnos (2 rod.) | `night` | cartas-visual.js (`isNight`) |
| Tudo à vista (2 rod.) | `reveal: all` | pecas-tela.js (`sees`) |
| Recessão | `recessao` (valor) | rodada.js (`efeitoImediato`) |
| Praga (cultura sorteada) | `praga` | consultas.js (`prodBloqueada`) |
| Juros em alta (2 rod.) | `juros` (fator) | consultas.js (`jurosPct`) · rodada.js |
| Embargo | `embargo` | consultas.js · acoes-mercado.js · janelas.js |
| Taxa do Mercado (2 rod.) | `taxa` (pct) | consultas.js (`taxaMercado`) · acoes-mercado.js |
| Imposto sobre fortunas | `imposto` (valor) | rodada.js (`efeitoImediato`) |
| Tempestade | `tempestade` | consultas.js (`prodBloqueada`) |
| Greve | `greve` | consultas.js (`prodBloqueada`) |

Regras de detalhe: o Auxílio só sai da rodada 10 em diante, uma vez por jogo e com 3+ jogadores (carta barrada volta ao baralho). Entrega de mudas passa do limite da mão. Recessão e Imposto vão para o cofre do Governo. O Governo paga 1 moeda por recurso por padrão (editável em "Governo paga por unidade").

## Onde mexer (guia rápido)
| Quero mudar... | Arquivo |
|---|---|
| Valores, preços, regras, sprites, números dos eventos | editor.html |
| Texto de um tipo de objetivo | config.js |
| Texto da regra de um evento geral | config.js (EVT) |
| Trocar/adicionar cartas de evento geral | config.js (DECKS_V5) e depois abrir/salvar no editor.html |
| Condição para vencer um objetivo | objetivos.js |
| O que acontece na virada de rodada / efeitos imediatos dos eventos | rodada.js |
| Produção/manutenção no início do turno | acoes-turno.js (e consultas.js para os efeitos dos eventos) |
| Empréstimo, juros pagos, venda ao Governo, compra de campo, Feira | acoes-economia.js |
| Plantar ou evoluir | acoes-plantio.js |
| Mercado entre jogadores (Embargo, Taxa) | acoes-mercado.js |
| Como o bot decide, níveis fácil/normal, velocidade | bot.js (`Bot.PF`, `Bot.delay`) |
| Testar o bot jogando sozinho | console do navegador: `Bot.simular(...)` |
| Quem é bot (seleção no menu) | menu.js (`.bt`) e acoes-turno.js (`A.new`) |
| Opções e textos dos menus, o que cada botão faz | menu.js |
| Configurações (antigo Dev do menu inicial) | menu.js (`cfgHTML`, `Menu.cfg`) e acoes-turno.js (`A.new` lê `Menu.cfg`) |
| Visual dos menus | style.css (bloco "Menus iniciais", no fim) |
| Tela "Bot X está jogando..." | bot.js (`Bot.tela`) e o gancho em tela.js (`if (p.bot) ...`) |
| O que cada jogador pode ver (privacidade, o que vai pela rede) | visao.js (`viewFor`) e pecas-tela.js (`sees`) |
| Mensagem de recusa de uma ação / saber se a ação deu certo | acoes-*.js (`recusa`) e acoes-turno.js (`exec`, `A.tentar`) |
| Quem sou eu / o que é só deste aparelho (janela aberta, carta escolhida) | consultas.js (`eu`, `me`) e estado.js (`UI`) |
| Falar com o Firebase (criar/entrar na sala, enviar ações) | rede.js (só ele) |
| Cores, tamanhos e posições (visual, inclusive celular) | style.css |
| Quais elementos aparecem na tela principal | tela.js |
| Janelas (Governo, Feira, Mercado...) | janelas.js |
| Montagem da partida (jogadores, humano/bot, quem começa) | menu.js (`formJogo`, `names`) |
| Zoom/animação de carta (lógica) | zoom.js |
| Duração da animação de melhoria | zoom.js (UPGRADE_MS) e style.css (2s nas animações) |
| Ferramentas de teste | dev.js |
| Testes automáticos | qa.html |
