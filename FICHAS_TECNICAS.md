# Tempo de Colheita — Fichas Técnicas dos Arquivos

Todos os arquivos ficam na MESMA pasta (junto com a pasta `img/`).
Para jogar: abra `index.html` (no PC ou no celular). Para editar cartas: `editor.html`.

## Regra de ouro
Se for só mudar NÚMEROS e TEXTOS de cartas e regras → use o `editor.html` (não mexa em código).
Se algo "se comporta errado" → use a tabela "Onde mexer" no fim deste arquivo.

## Arquivos de dados (o que o jogo "sabe")
- **cartas.js** — O baralho: objetivos, campos, cartas de recurso, os 20 eventos gerais e os individuais, mais preços, níveis e regras. É escrito pelo editor.html. Não edite à mão.
- **config.js** — Nomes das culturas, textos dos objetivos, **textos das regras dos eventos gerais (EVT)**, valores padrão, os baralhos novos (DECKS_V5 = eventos gerais) e a função que completa arquivos antigos (`migrate`).

## Páginas
- **index.html** — A página do jogo. Só lista quais arquivos carregar (a ORDEM importa, não mude). Já tem as marcações para celular (`viewport-fit=cover` e `theme-color`). O `bot.js` entra logo depois de `acoes-mercado.js`.
- **editor.html** — O editor de cartas e regras (use no Chrome/Edge). Não faz parte do jogo no celular.
- **qa.html** — O robô de testes que joga sozinho e procura erros. Tem oráculos próprios dos eventos gerais (Greve, Praga, Feira, Embargo etc.) e um teste dirigido com valores calculados à mão para cada carta nova. **Ainda não foi rodado depois das mudanças de celular e do bot: rode-o antes da próxima etapa.**

## Aparência
- **style.css** — Cuida só da aparência: cores, tamanhos, posição das cartas, abas laterais, mão, janelas, zoom e animação de melhoria. Agora é **responsivo** (celular em pé e deitado, tablet e PC, com media queries). Não tem nenhuma regra do jogo.

## Arquivos do motor do jogo (na ordem em que carregam)
1. **estado.js** — Guarda as peças básicas: o estado da partida, as regras lidas do editor e o embaralhador.
2. **cartas-visual.js** — Aparência e textos das cartas: nome, descrição, preço, nível, imagem de dia/noite. Monta o texto das regras dos eventos (`evTxt`) e a descrição de um evento ATIVO com a cultura sorteada (`evDesc`). O bot usa daqui `free`, `NV`, `vef`, `nm` e `evDesc`: **não renomeie nem mude o que devolvem**.
3. **consultas.js** — Perguntas rápidas: de quem é a vez, quem está vivo, comprar do baralho, se a carta cabe no campo, registro de eventos. **Também guarda as consultas dos eventos ativos:** produção bloqueada (Greve/Praga/Tempestade), manutenção (Isenção/Incentivo), preço do Governo, juros, Taxa do Mercado, Embargo, campo grátis e limite da Feira.
4. **objetivos.js** — Decide se um objetivo foi cumprido, se foi violado (eliminação) e quem vence a rodada.
5. **rodada.js** — A virada de rodada: sorteia o evento geral (`sorteiaGeral`, com a trava do Auxílio), cria o evento ativo (`novoEvento`: cultura sorteada, estoque da Feira), aplica os efeitos de uma vez só (`efeitoImediato`: Recessão, Imposto, Auxílio, Mudas), executa a Alta demanda no fim da rodada (`fimDeRodada`), cobra juros, define a ordem dos jogadores e repõe os campos à venda.
6. **acoes-turno.js** — O fluxo da partida: novo jogo, continuar, sair, começar turno (produção e manutenção com os efeitos dos eventos), encerrar turno. **`A.new()` lê o menu da tela ou recebe `{ nomes, bots, first }` como parâmetro** (assim a partida pode ser criada sem tela). Cada jogador tem `p.bot`: `''` (humano), `'facil'` ou `'normal'`.
7. **acoes-economia.js** — Dinheiro com o Governo: comprar campo (com Incentivo Fiscal), empréstimo, pagar dívida, carta extra, vender recursos (com Governo paga +100%) e **comprar na Feira Regional**. `A.sell(k, qtd)` e `A.buyFeira(k, qtd)` aceitam a quantidade como parâmetro opcional (sem ela: vende tudo / lê o campo da tela).
8. **acoes-plantio.js** — Lavoura: escolher carta, plantar no campo, evoluir de nível.
9. **acoes-mercado.js** — Mercado entre jogadores: ofertar, cancelar, comprar (com Embargo e Taxa do Mercado) e contar as negociações. `A.listRes(k, qtd, preco)` e `A.list(kind, uid, preco)` aceitam os valores como parâmetros opcionais (sem eles: leem os campos da tela).
10. **bot.js** — **Jogador controlado pelo computador** (níveis fácil e normal). Joga só pelas ações `A.*`, como um humano, sem ver o que um humano não veria. Tem a tela "Bot X está jogando..." e o teste `Bot.simular()`. Detalhes na seção "Bot" abaixo.
11. **dev.js** — Ferramentas de teste (painel Dev): dar moedas, cartas, forçar eventos (o evento forçado também aplica os efeitos).
12. **menu.js** — Tela inicial: número de jogadores, nomes, **escolha humano ou bot de cada jogador (`select.bt`)**, quem começa. No celular o bloco fica dentro de `<div class="menu">`.
13. **pecas-tela.js** — Peças pequenas da tela: ícones de moeda/recurso, abas laterais, quem pode ver as informações de quem.
14. **janelas.js** — As janelas de pop-up: Governo (inclui a Feira Regional), Mercado (mostra "fechado" no Embargo), Objetivo, Espiar, Ver jogador, Dev.
15. **tela.js** — Desenha a tela principal (mostra os eventos ativos e o preço dos campos, "Grátis" no Incentivo) e ajusta o tamanho das cartas do centro. **Na vez de um bot mostra a tela do bot e chama `Bot.agenda()`.** Estrutura para celular: `.top` = `.st` (texto) + `.acts` (botões); `.seats` agrupa as abas; `.board` agrupa campos à venda + seus campos; `#evb` é recolhível (`EVB_OPEN`). No PC esses grupos não mudam nada.
16. **zoom.js** — Ampliar carta, janela do campo, animação de melhoria, cliques e tecla Esc.
17. **iniciar.js** — Liga o jogo (último a carregar).

## Bot (bot.js)
- **Como joga:** cada passo escolhe UMA ação e a executa pelas mesmas ações do jogador (`A.go`, `A.pick/plantIn`, `A.up`, `A.sell`, `A.buyF`, `A.loan`, `A.pay`, `A.extra`, `A.buyFeira`, `A.listRes`, `A.buyM`, `A.cancel`, `A.end`). Ordem: recolhe ofertas antigas, sobrevive (vende tudo/empréstimo se faltar moeda), se o objetivo já está cumprido só vende a sobra, fecha objetivos de moedas, planta, evolui, usa a Feira, Mercado, converte estoque em moedas, compra campo, carta extra e paga dívida.
- **Níveis:** `Bot.PF` (fácil: descuida, guarda pouca reserva; normal: persegue o objetivo e evita eliminação). **Velocidade:** `Bot.delay` (padrão 700 ms; 0 = o mais rápido). Há um botão ⏩ na tela do bot.
- **Alert:** `Bot.tenta()` executa a ação com o `alert()` silenciado; se a ação foi recusada ou nada mudou, não tenta de novo naquele turno.
- **Teste:** no console do navegador, `Bot.simular(20, 3, ['normal'])` roda 20 partidas só com bots, sem tela, e informa quantas terminaram, quem venceu, por qual objetivo e erros de estado. Não mexe na partida salva.
- **Limites conhecidos:** com 2 jogadores alguns objetivos de muitas moedas ou de Mercado (`noLoan`, `allLvl`, `clean`, `mUnits`, `mProfit`, `noites`, `floorUntil`) podem não fechar em 150 rodadas (é questão de balanceamento). Os testes do bot foram feitos em Node, com as funções de `cartas-visual.js` simuladas.

## Nomes que NÃO podem ser renomeados (o qa.html e o bot dependem deles)
`#app`, `#hud`, `.top`, `.center`, `.fs`, `.cards`, `.mine`, `.hand`, `.card`, `.side`, `.sideL`, `.sideR`, `.tab`, `#modal`, `.box`, `.wide`, `.mk`, `.gal`, `#evb`, `.log`, `#zoom`, `.zp`, `#n`, `#f`, `#nl`, **`.nm`** (um por jogador) e **`.bt`** (um por jogador, na mesma ordem de `.nm`). Também os campos de tela lidos pelas ações quando não há parâmetro: `#rq…`, `#rp…`, `#pr…`, `#fq…`. Pode ADICIONAR classes novas, não renomear as existentes.

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
| Tela "Bot X está jogando..." | bot.js (`Bot.tela`) e o gancho em tela.js (`if (p.bot) ...`) |
| Cores, tamanhos e posições (visual, inclusive celular) | style.css |
| Quais elementos aparecem na tela principal | tela.js |
| Janelas (Governo, Feira, Mercado...) | janelas.js |
| Tela inicial (jogadores, humano/bot) | menu.js |
| Zoom/animação de carta (lógica) | zoom.js |
| Duração da animação de melhoria | zoom.js (UPGRADE_MS) e style.css (2s nas animações) |
| Ferramentas de teste | dev.js |
| Testes automáticos | qa.html |
