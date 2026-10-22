# Tempo de Colheita — Fichas Técnicas dos Arquivos

Todos os arquivos ficam na MESMA pasta (junto com a pasta `img/`).
Para jogar: abra `index.html`. Para editar cartas: `editor.html`.

## Regra de ouro
Se for só mudar NÚMEROS e TEXTOS de cartas e regras → use o `editor.html` (não mexa em código).
Se algo "se comporta errado" → use a tabela "Onde mexer" no fim deste arquivo.

## Arquivos de dados (o que o jogo "sabe")
- **cartas.js** — O baralho: objetivos, campos, cartas de recurso, os 20 eventos gerais e os individuais, mais preços, níveis e regras. É escrito pelo editor.html. Não edite à mão.
- **config.js** — Nomes das culturas, textos dos objetivos, **textos das regras dos eventos gerais (EVT)**, valores padrão, os baralhos novos (DECKS_V5 = eventos gerais) e a função que completa arquivos antigos (`migrate`).

## Páginas
- **index.html** — A página do jogo. Só lista quais arquivos carregar (a ORDEM importa, não mude).
- **editor.html** — O editor de cartas e regras (use no Chrome/Edge).
- **qa.html** — O robô de testes que joga sozinho e procura erros. Tem oráculos próprios dos eventos gerais (Greve, Praga, Feira, Embargo etc.) e um teste dirigido com valores calculados à mão para cada carta nova.

## Aparência
- **style.css** — Cuida só da aparência: cores, tamanhos, posição das cartas, abas laterais, mão, janelas, zoom e animação de melhoria. Não tem nenhuma regra do jogo.

## Arquivos do motor do jogo (na ordem em que carregam)
1. **estado.js** — Guarda as peças básicas: o estado da partida, as regras lidas do editor e o embaralhador.
2. **cartas-visual.js** — Aparência e textos das cartas: nome, descrição, preço, nível, imagem de dia/noite. Monta o texto das regras dos eventos (`evTxt`) e a descrição de um evento ATIVO com a cultura sorteada (`evDesc`).
3. **consultas.js** — Perguntas rápidas: de quem é a vez, quem está vivo, comprar do baralho, se a carta cabe no campo, registro de eventos. **Também guarda as consultas dos eventos ativos:** produção bloqueada (Greve/Praga/Tempestade), manutenção (Isenção/Incentivo), preço do Governo, juros, Taxa do Mercado, Embargo, campo grátis e limite da Feira.
4. **objetivos.js** — Decide se um objetivo foi cumprido, se foi violado (eliminação) e quem vence a rodada.
5. **rodada.js** — A virada de rodada: sorteia o evento geral (`sorteiaGeral`, com a trava do Auxílio), cria o evento ativo (`novoEvento`: cultura sorteada, estoque da Feira), aplica os efeitos de uma vez só (`efeitoImediato`: Recessão, Imposto, Auxílio, Mudas), executa a Alta demanda no fim da rodada (`fimDeRodada`), cobra juros, define a ordem dos jogadores e repõe os campos à venda.
6. **acoes-turno.js** — O fluxo da partida: novo jogo, continuar, sair, começar turno (produção e manutenção com os efeitos dos eventos), encerrar turno.
7. **acoes-economia.js** — Dinheiro com o Governo: comprar campo (com Incentivo Fiscal), empréstimo, pagar dívida, carta extra, vender recursos (com Governo paga +100%) e **comprar na Feira Regional**.
8. **acoes-plantio.js** — Lavoura: escolher carta, plantar no campo, evoluir de nível.
9. **acoes-mercado.js** — Mercado entre jogadores: ofertar, cancelar, comprar (com Embargo e Taxa do Mercado) e contar as negociações.
10. **dev.js** — Ferramentas de teste (painel Dev): dar moedas, cartas, forçar eventos (o evento forçado também aplica os efeitos).
11. **menu.js** — Tela inicial: número de jogadores, nomes, quem começa.
12. **pecas-tela.js** — Peças pequenas da tela: ícones de moeda/recurso, abas laterais, quem pode ver as informações de quem.
13. **janelas.js** — As janelas de pop-up: Governo (inclui a Feira Regional), Mercado (mostra "fechado" no Embargo), Objetivo, Espiar, Ver jogador, Dev.
14. **tela.js** — Desenha a tela principal (mostra os eventos ativos e o preço dos campos, "Grátis" no Incentivo) e ajusta o tamanho das cartas do centro.
15. **zoom.js** — Ampliar carta, janela do campo, animação de melhoria, cliques e tecla Esc.
16. **iniciar.js** — Liga o jogo (último a carregar).

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
| Cores, tamanhos e posições (visual) | style.css |
| Quais elementos aparecem na tela principal | tela.js |
| Janelas (Governo, Feira, Mercado...) | janelas.js |
| Zoom/animação de carta (lógica) | zoom.js |
| Duração da animação de melhoria | zoom.js (UPGRADE_MS) e style.css (2s nas animações) |
| Ferramentas de teste | dev.js |
| Testes automáticos | qa.html |
