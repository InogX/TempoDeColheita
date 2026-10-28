# Balanceamento com 2 jogadores — relatório

Medido com o **jogo real** (cartas.js, config.js, objetivos.js, rodada.js, bot.js, comandos.js, acoes-*.js...) rodando em Node, só com bots, sorteio reprodutível. **Importante:** bot não é humano. Onde o resultado depende de como o bot joga, está dito.

## 1. Diagnóstico (o que as medidas mostraram)

**1.1 O dinheiro total do jogo é fixo.** Cada jogador começa com 500 moedas e o cofre do Governo começa com 1000 por jogador, então o total é **1500 × nº de jogadores**. Com 2 jogadores são **3000 moedas** (sobe só para ~3300 na rodada 60, por causa dos eventos individuais). Logo:
- `coins` 6000 e `clean` 4000 eram **impossíveis** com 2 jogadores (fechavam 0–4% das vezes). Com 3 jogadores, `clean` já fechava 100%; `coins` só fechava com 4–5 jogadores (26% e 98%). Os valores foram pensados para **5 jogadores**.
- A hipótese do plano ("cofre finito") está **confirmada**. Quando o cofre zera, quem não vendeu ao Governo a tempo fica sem renda, e o dinheiro se concentra num jogador só (visto em várias partidas).

**1.2 Os objetivos tinham velocidades muito diferentes.** Medindo cada um sozinho (o adversário com um objetivo que nunca fecha), a mediana de rodadas para cumprir ia de **5–6** (`mAll`, `mSellTo`) a **70+** (`noLoan`) ou **nunca**. A partida natural dura em média 13 rodadas, então os lentos quase nunca ganhavam: não por serem impossíveis, mas porque o adversário fechava o dele antes.

**1.3 Três objetivos dependem do bot ou do parceiro, não do número:**
- `allLvl`: o bot põe 3 plantios de nível 1 num campo de 3 vagas, e aí nenhum deles consegue subir (evoluir exige vaga livre); campo de 1 vaga também nunca comporta nível 2. Um jogador que planeja (um plantio por campo de 2+ vagas) consegue. Mesmo com um bot ajustado só no teste, só 30% fechava, então é um problema de estratégia do bot.
- `mBuys`: com um parceiro que vende, fecha **100% em 3 rodadas**; com um adversário que não põe oferta no Mercado, **0%**. Depende totalmente do outro jogador.
- `mProfit`: é difícil mesmo com parceiro (o bot só vende a 2 moedas por unidade); a taxa de sucesso sobe de 7% para 64% se a meta cair de 500 para 150 (valores efetivos com 2 jogadores).

**1.4 Em 2 jogadores, `mAll` e `mSellTo` viram "uma negociação"** (a meta é limitada a nº de adversários − 1 = 1). Fecham em 6 rodadas e ganham 77–92% das partidas. Isso **não** se corrige só com números.

## 2. O que foi mudado

### 2.1 Código (pequeno)
- **`cartas-visual.js`:** `vef(o)` passa a escalar as metas **em moedas** (`coins`, `clean`, `noLoan`, `noites`, `floorUntil`, `allLvl`) com o total de dinheiro: meta efetiva = `v × min(nº de jogadores, 5) / 5`. Ou seja, **`v` no `cartas.js` passa a ser o valor para 5+ jogadores** (2 jogadores = 40%; 3 = 60%; 4 = 80%). Novo `vef2` faz o mesmo com a meta de moedas do `azar` (`v2`). A escala é **por tipo de objetivo**, não por uma flag nova nos dados, para o `editor.html` não perdê-la ao salvar.
- **`objetivos.js`:** `azar`, `noites`, `floorUntil` e `allLvl` usam a meta efetiva (antes usavam `o.v`/`o.v2` direto, e o texto da carta já mostrava a meta escalada: ficavam inconsistentes).
- O `bot.js` **não foi alterado**. As regras da economia (cofre, evolução, produção, manutenção) **não foram alteradas**.

### 2.2 Números (`cartas.js`, valores para 5+ jogadores; entre parênteses o valor efetivo com 2 jogadores)
| Objetivo | Antes | Depois |
|---|---|---|
| `coins` | 6000 | **4000** (1600) |
| `clean` | 4000 | **3500** (1400) |
| `noLoan` | 3000 | 3000 (**1200**, só pela escala) |
| `noites` | 2000, 3 noites | 2000 (**800**), 3 noites |
| `floorUntil` | rodada 25, 2500 | **rodada 20, 2000** (800) |
| `allLvl` | rodada 30, 1000 | **rodada 20**, 1000 (400) |
| `azar` | 5 eventos, 1500 | 5 eventos, **2500** (1000) |
| `slots` | 14 | **32** |
| `chrome` | 3 | **6** |
| `lvlsum` | 16 | **36** |
| `prodEach` | 150 | **500** |
| `stockN` | 250 | **350** |
| `mSales` | 10 (meta 3) | **16** (meta 4) |
| `mProfit` | 2000 (meta 500) | **600** (meta 150) |
| `lvl3n` | 4 | **3** |
| `lvl3crops` | 3 | **2** |
| `mBuys`, `mAll`, `mSellTo`, `mUnits` | — | **sem mudança** |

## 3. Resultados (2 jogadores, 3000 partidas de bots normais, objetivos sorteados)
Partidas: mediana de **13 → 17** rodadas; sem final em 150 rodadas: **170 → 74** (de 3000).

| Objetivo | Venceu antes | Venceu depois | Mediana de rodadas (isolado) antes → depois |
|---|---|---|---|
| `mAll` | 86% | **92%** | 6 → 6 |
| `mSellTo` | 78% | 77% | 7 → 6 |
| `prodEach` | 82% | 68% | 11 → 21 |
| `mSales` | 67% | 68% | 15 → 16 |
| `azar` | 49% | 64% | 24 → 19 |
| `noLoan` | 23% | **63%** | 70 → 19 |
| `slots` | 88% | 63% | 10 → 18 |
| `mUnits` | 53% | 61% | 18 → 19 |
| `stockN` | 65% | 57% | 16 → 20 |
| `clean` | 10% | **56%** | nunca → 21 |
| `coins` | 12% | **53%** | nunca → 22 |
| `chrome` | 83% | 51% | 11 → 18 |
| `floorUntil` | 40% | 51% | 29 → 20 |
| `lvlsum` | 77% | 44% | 11 → 20 |
| `noites` | 41% | 44% | 28 → 22 |
| `lvl3n` | 37% | **20%** | 32 → 29 |
| `lvl3crops` | 33% | **19%** | 31 → 27 |
| `mBuys` | 19% | 14% | nunca → nunca (depende do parceiro) |
| `mProfit` | 8% | 8% | 24 → 20 (mas só 16% fecham) |
| `allLvl` | 1% | 2% | nunca → nunca (bot) |

Leitura: o número de objetivos entre 40% e 65% de vitórias passou de 5 para **11**; os de dinheiro, que eram os mais impossíveis, agora fecham em 19–22 rodadas e 99–100% das vezes quando isolados.

## 4. O que NÃO ficou resolvido (decisões suas)
1. **`mAll` (92%) e `mSellTo` (77%)**: em 2 jogadores é uma única negociação. Resolver exige uma mudança de regra/código (por exemplo, exigir mais de uma negociação), não de número.
2. **`lvl3n` e `lvl3crops` (~20%)** ficaram **mais** raros: a partida ficou um pouco mais longa, mas eles continuam tendo um piso de ~27 rodadas. Testei reduzir o custo de evolução de 250 para 150 e quase não ajudou (27 contra 30 rodadas), então não mexi nessa regra global. Ou ficam como objetivos "de fim de partida", ou se pensa numa regra específica para eles.
3. **`mBuys` e `mProfit` (14% e 8%)** dependem do outro jogador e do preço. Contra um humano que vende e compra, devem se comportar melhor do que contra bots. Só um teste com pessoas diz.
4. **`allLvl`** precisa de uma melhoria **no bot** (plantar um por campo de 2+ vagas e priorizar a evolução dos plantios mais baixos). Está listado como item à parte; o número já foi ajustado.
5. **3 a 5 jogadores:** melhoraram (por exemplo, `coins` de 0% para 10% com 3 jogadores; `mUnits` de 19% para 54% com 5) mas **não ficaram equilibrados**: com 5 jogadores `coins`, `clean` e `noLoan` continuam perto de 0%, porque o valor base (5+) ainda é lento (~35–55 rodadas). Equilibrar isso é uma segunda rodada de medição (por tamanho de partida).
6. **Concentração de dinheiro** (o cofre do Governo zera e um jogador fica com quase tudo): é uma característica da economia fechada, observada nas medidas. Não mexi, mas é provavelmente a próxima coisa a olhar se as partidas de 2 jogadores parecerem "decididas cedo".

## 5. Cuidados ao usar
- **São 3 arquivos para trocar juntos:** `cartas.js`, `cartas-visual.js`, `objetivos.js`. Para voltar atrás, volte com os 3 antigos.
- **Texto das cartas:** a carta mostra a meta **efetiva** (com 2 jogadores, "Acumule 1600 moedas"), não o `v` do arquivo.
- **`editor.html`:** ele reescreve o `cartas.js`. Depois de trocar os arquivos, abra o editor, confira que os números novos aparecem e só então salve (eu não vi o `editor.html`; não sei se ele preserva tudo).
- **Jogos já em andamento** (salvos no aparelho ou salas online): usam o objetivo guardado, mas a meta passa a ser calculada com a regra nova.
- **Para publicar:** mude o `VERSAO` em `online.js` (ver `PUBLICACAO_FASE11.md`) e não publique com partida em andamento.
- **Testes:** a bateria em Node (`rodar_todos.js`) usa cartas e objetivos falsos, então não cobre esta mudança. Rodei uma verificação própria com os arquivos reais: 900 partidas de bots (2, 3, 4, 6 e 10 jogadores, níveis fácil e normal), **0 erros**, e os textos de todos os 20 objetivos conferidos de 2 a 10 jogadores. Falta o teste **jogando** (você).

## 6. Como reproduzir as medidas
O pacote `balanceamento_medicao.zip` tem os scripts (veja o `LEIA-ME.md` dentro). Exemplo: `node medir.js natural 300` (partidas naturais), `node medir.js solo 100` (cada objetivo isolado), `node ajuste.js "Objetivo 6" v 2 "1000,1500,2000"` (curva de dificuldade de um número).
