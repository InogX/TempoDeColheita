# Balanceamento — relatório (rodadas 1, 2 e 3)

Medido com o **jogo real** (cartas.js, config.js, objetivos.js, rodada.js, bot.js, comandos.js, acoes-*.js...) rodando em Node, só com bots, sorteio reprodutível. **Bot não é humano:** onde o resultado depende de como o bot joga, está dito.

## 1. Diagnóstico (rodada 1)

**1.1 O dinheiro total do jogo é fixo:** 500 iniciais por jogador + 1000 de cofre por jogador = **1500 × nº de jogadores** (3000 com 2 jogadores; sobe só a ~3300 na rodada 60 por causa dos eventos individuais). Por isso `coins` 6000 e `clean` 4000 eram impossíveis com 2 jogadores (0–4% de sucesso); foram pensados para 5 jogadores.

**1.2 Os objetivos tinham velocidades muito diferentes** (mediana de 5–6 a 70+ rodadas, ou "nunca"). A partida dura ~13 rodadas, então os lentos quase nunca ganhavam, não por serem impossíveis, mas porque o adversário fechava o dele antes.

**1.3 Causa do `allLvl` (descoberta na rodada 2):** o bot **enchia todos os campos de plantios de nível 1** e ficava sem vaga livre; sem vaga livre nenhum plantio consegue evoluir (chegou a ter 31 mil unidades paradas no estoque). Era defeito do bot, não da regra.

## 2. O que foi feito

### Rodada 1
- **`cartas-visual.js` / `objetivos.js`:** as metas em MOEDAS (`coins`, `clean`, `noLoan`, `noites`, `floorUntil`) e a meta de moedas do `azar` escalam com o total de dinheiro do jogo; o `v` no `cartas.js` é o valor para 5+ jogadores (2 jogadores = 40%).
- **`cartas.js`:** números ajustados para aproximar a velocidade dos objetivos (~20 rodadas).

### Rodada 2 (suas decisões)
| Decisão | O que foi feito |
|---|---|
| `mAll` e `mSellTo` só com 6+ jogadores | `"minJ":6` nas duas cartas (o sorteio já respeitava `minJ`). |
| Retirar `mBuys` e `mProfit` por enquanto | `"minJ":99` nas duas: **desligadas**, mas a definição fica guardada. Para religar: `minJ` volta a 0 (ou apague o campo). |
| `allLvl` com regra nova | **"Tenha 10+ plantios, com mais da metade acima do nível 1"** (sem rodada mínima nem moedas). Código em `objetivos.js`, texto em `config.js`, e **1 linha no `bot.js`**: com esse objetivo o bot não lota o último espaço livre de campos de 2+ vagas. |
| `lvl3n`/`lvl3crops`: mudar a quantidade | `lvl3n` de 4 para **1** (efeito medido abaixo). `lvl3crops` ficou em 2 (1 seria igual ao `lvl3n`). |
| `coins`/`clean` ligados ao nº de jogadores | Já estava (rodada 1). Além disso, a escala agora **acompanha as regras de moedas iniciais e cofre** do editor (com os valores atuais o resultado é idêntico). |
| Conferir o `editor.html` | Ver seção 5. |

### Números do `cartas.js` (valores para 5+ jogadores; entre parênteses o efetivo com 2 jogadores)
| Objetivo | Antes | Depois |
|---|---|---|
| `coins` | 6000 | **4000** (1600) |
| `clean` | 4000 | **3500** (1400) |
| `noLoan` | 3000 | 3000 (**1200**, pela escala) |
| `noites` | 2000, 3 noites | 2000 (**800**), 3 noites |
| `floorUntil` | rodada 25, 2500 | **rodada 20, 2000** (800) |
| `azar` | 5 eventos, 1500 | 5 eventos, **2500** (1000) |
| `slots` | 14 | **32** |
| `chrome` | 3 | **6** |
| `lvlsum` | 16 | **36** |
| `prodEach` | 150 | **500** |
| `stockN` | 250 | **350** |
| `mSales` | 10 (meta 3) | **16** (meta 4) |
| `lvl3n` | 4 | **1** |
| `allLvl` | rodada 30, 4 plantios todos acima do nível 1, 1000 moedas | **10+ plantios, mais da metade acima do nível 1** |
| `mAll`, `mSellTo` | — | só com 6+ jogadores |
| `mBuys`, `mProfit` | — | **desligados** |
| `lvl3crops`, `mUnits` | — | sem mudança |

## 3. Resultados com 2 jogadores (3000 partidas de bots normais)
Partidas: mediana **13 → 18** rodadas (p90 22); sem final em 150 rodadas: **170 → 1** (de 3000). O sorteio de 2 jogadores agora tem 16 objetivos (os 4 acima saíram dele).

| Objetivo | Venceu antes | Venceu depois | Mediana de rodadas, isolado: antes → depois |
|---|---|---|---|
| `mSales` | 67% | **76%** | 15 → 18 |
| `mUnits` | 53% | **74%** | 18 → 19 |
| `azar` | 49% | 67% | 24 → 20 |
| `slots` | 88% | 66% | 10 → 18 |
| `noLoan` | 23% | **66%** | 70 → 20 |
| `prodEach` | 82% | 61% | 11 → 21 |
| `stockN` | 65% | 53% | 16 → 20 |
| `clean` | 10% | **52%** | nunca → 20 |
| `floorUntil` | 40% | 49% | 29 → 20 |
| `lvlsum` | 77% | 43% | 11 → 20 |
| `chrome` | 83% | 43% | 11 → 19 |
| `coins` | 12% | **41%** | nunca → 22 |
| `allLvl` | 1% | **41%** | nunca → 21 |
| `noites` | 41% | 35% | 28 → 25 |
| `lvl3n` | 37% | **26%** | 32 → 24 |
| `lvl3crops` | 33% | **10%** | 31 → 28 |

Isolados (o adversário com um objetivo que nunca fecha), **todos os objetivos ativos fecham em 97–100% das vezes em 18–28 rodadas**.

**Com 6 jogadores** (1000 partidas): `mSellTo` 63% e `mAll` 39% (referência justa = ~17%), então funcionam; os de dinheiro (`coins`, `clean`, `noLoan`) ficam perto de 0% (ver 4.3).

## 4. O que NÃO ficou resolvido
1. **`lvl3crops` (10%)**. Reduzir a quantidade ajuda pouco: mesmo exigindo só 1 plantio no nível 3, o bot leva ~23 rodadas; com 3, ~29. O gargalo não é o custo de evoluir (testei baixar 250 → 150: quase sem efeito), e sim comprar o campo de 3 vagas e juntar os recursos certos. Deve continuar um objetivo "de partida mais longa".
2. **`mSales` e `mUnits` (76% e 74%)** dependem do Mercado: o bot só vende se outro bot compra. Como você tem dúvidas sobre o Mercado com humanos, vale **medir jogando com pessoas** antes de mexer nos números (ou desligar como os outros dois, com `minJ` 99).
3. **3 a 6+ jogadores:** nos jogos grandes os objetivos de dinheiro têm um piso de ~24 rodadas qualquer que seja o valor (medi de 1500 a 4000 com 5 jogadores), e a partida de 5+ dura 10–16 rodadas. Resolver exige uma rodada própria de calibração por tamanho de partida.
4. **Concentração de dinheiro:** o cofre do Governo zera e um jogador pode ficar com quase tudo (visto em várias partidas). É característica da economia fechada; só vale mexer se as partidas parecerem "decididas cedo".

## 5. `editor.html`: está correto
Reproduzi em Node o que ele faz (abrir, `migrate`, salvar) com os arquivos novos:
- Abrir **não altera nada** nos dados; abrir → salvar → reler dá dados **idênticos** (os campos novos `minJ`, `v` etc. são preservados; os 20 objetivos continuam).
- O texto dos objetivos fica no `config.js`, que o editor **não** edita (por isso o `allLvl` novo mudou lá).
- Ajuste feito (só rótulos, 9 linhas): `minJ`, `n`, `r`, `v2`, `floor`, `elim` e `esc` apareciam com o nome cru; o `v` aparecia como "Valor", mas nos objetivos de dinheiro é o valor para 5+ jogadores; as regras "moedas iniciais" e "cofre" avisam que as metas acompanham. **O editor.html não afeta o jogo**, só a sua tela de edição.
- Ao usar: para desligar um objetivo, ponha `minJ` = 99; para exigir mais jogadores, `minJ` = o mínimo.

## 6. Cuidados ao usar
- **Arquivos do jogo a trocar juntos (5):** `cartas.js`, `cartas-visual.js`, `objetivos.js`, `bot.js`, `config.js`. Para voltar atrás, volte com os antigos. `editor.html` é opcional (só rótulos).
- **A carta mostra a meta efetiva** (com 2 jogadores, "Acumule 1600 moedas"), não o `v` do arquivo.
- **Jogos já em andamento** (salvos no aparelho ou salas online): o objetivo fica guardado dentro da partida. Um `allLvl` guardado no formato antigo ficaria com meta de 1000 plantios (porque agora o `v` é a quantidade de plantios), ou seja, impossível. **Comece partida nova depois de trocar os arquivos e não publique com partida em andamento.**
- **Para publicar:** mude o `VERSAO` em `online.js` (`PUBLICACAO_FASE11.md`). O `bot.js` mudou, então anfitrião e convidados precisam estar na mesma versão.
- **Testes:** a bateria `rodar_todos.js` passou (12 de 12) com o `bot.js` novo, mas ela usa cartas e objetivos falsos, então não cobre esta mudança. Verifiquei com os arquivos reais: 900 partidas de bots (2, 3, 4, 6 e 10 jogadores, fácil e normal) com **0 erros** e os textos dos 20 objetivos de 2 a 10 jogadores. **Falta o teste jogando** (você).

## 7. Como reproduzir as medidas
`balanceamento_medicao.zip` (veja o `LEIA-ME.md`; o comando mais simples é `node medir_tudo.js`).


---

# Rodada 3 — com a LOJA DE CAMPOS POR JOGADOR (item F) e partidas de 3 a 6 jogadores

Medido como antes: jogo real, só bots normais, 2000 partidas por tamanho (`node medir.js natural 200`, com `NJOG=2,3,4,6`) e cada objetivo isolado. **Bot não é humano.**

## 1. Achados que não eram do balanceamento
- **O `config.js` e o `bot.js` que estavam no jogo não tinham as correções da rodada 2:** o texto do `allLvl` aparecia como "A partir da rodada undefined, tenha undefined+ plantios…" e o bot ainda lotava os campos de 2+ vagas. Recoloquei as duas (texto novo no `config.js`; 1 linha no `bot.js` em `plantio`).
- O `rodada.js` ainda enchia o antigo centro compartilhado. Limpei (`refillCenter` saiu).

## 2. Efeito da loja por jogador
Partida de 2 jogadores: mediana 17 → 16 rodadas. `chrome` foi de 61% para 87% de vitórias (a loja mostra mais campos cromados) e vários objetivos isolados ficaram mais rápidos que o alvo de ~20 rodadas (`chrome` 13, `slots` 15, `prodEach` 16, `lvlsum` 17).

## 3. Descoberta sobre 3 a 6 jogadores
O ritmo de ganhar moedas depende da **renda de cada jogador**, não do dinheiro total da mesa: a meta que dá ~20 rodadas é quase a mesma (1400 a 1600) em qualquer tamanho. A regra antiga (meta proporcional ao dinheiro total) deixava `coins`, `clean` e `noLoan` com 0 a 10% de vitórias a partir de 3 jogadores. Além disso, em partida grande o jogo termina quando o primeiro de N jogadores fecha o objetivo, então objetivos lentos perdem sempre.

## 4. O que foi mudado
| Onde | Mudança |
|---|---|
| `cartas-visual.js` | Metas em moedas (`coins`, `clean`, `noLoan`, `noites`, `azar`): escala por tabela `FMOEDA` = 40% (2 jog.), 37,5% (3), 35% (4+) do `v`. `floorUntil` tem a própria tabela `FFLOOR` (40/45/50/50%) e a rodada-alvo encurta com mais jogadores (`rEf`: 90/80/75/65% do `r`). Metas de construção (`chrome`, `slots`, `lvlsum`, `prodEach`) × 100/100/90/80% (`FBUILD`). |
| `objetivos.js`, `bot.js` | `floorUntil` usa `rEf(o)` em vez de `o.r`. |
| `cartas.js` | `chrome` 6→10, `slots` 32→44, `prodEach` 500→750, `lvlsum` 36→44, `noLoan` 3000→4000, `clean` 3500→4000, `noites` 3 noites/2000 → **2 noites/4000**, `azar` v2 2500→3500, `mSales` 16→24, `mUnits` 600→1000. |
| `config.js` | Texto do `allLvl` (correção) e regra nova `camposTrava`. |

Com 2 jogadores os valores efetivos das metas de moedas ficam iguais aos da rodada 2 (40%).

## 5. Resultado (vitórias por objetivo, partidas de bots)
Referência justa: 50% com 2 jogadores, 33% com 3, 25% com 4, 17% com 6.

| Jogadores | Mediana da partida | Faixa de vitórias por objetivo | Fora da faixa |
|---|---|---|---|
| 2 | 18 rodadas | 33% a 71% | `lvl3crops` 9% |
| 3 | 16 | 17% a 62% | `lvl3crops` 1% |
| 4 | 16 | 10% a 46% | `lvl3crops` 1% |
| 6 | 13 | 6% a 67% | `lvl3crops` 0%; `mSellTo` 67% e `mAll` 43% |

Isolados (2 jogadores): 18 a 22 rodadas para os objetivos de construção e dinheiro; `lvl3crops` 26 e `lvl3n` 22. Verificação de segurança: 0 erros em 2 a 10 jogadores e textos corretos. `teste_loja.js`: 98 de 98.

## 6. Pendências (decisões do dono)
1. **Mercado (A4):** `mSales` (71%), `mUnits` (69%), `mAll` e `mSellTo` ficam altos porque os bots negociam entre si com facilidade. Só dá para calibrar com humanos. Para desligar: `minJ` 99 na carta.
2. **`lvl3crops` (A3):** 0 a 9%. Continua sendo um objetivo "de partida longa" (mediana isolada 26). Decidir: mantê-lo assim, trocar a regra ou aliviar a carta (`v` 2 → 1 deixa igual ao `lvl3n`).
3. **Partidas de 5 a 6+ jogadores (A5):** os objetivos de construção (`lvlsum`, `prodEach`, `stockN`) têm 5 a 8% com 6 jogadores. A partida acaba em ~13 rodadas; vale medir jogando antes de mexer mais.
4. **Arquivos a trocar juntos:** `cartas.js`, `cartas-visual.js`, `objetivos.js`, `rodada.js`, `bot.js`, `config.js` (e os do item F). **Comece partida nova.**
