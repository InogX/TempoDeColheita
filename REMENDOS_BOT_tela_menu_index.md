# Tempo de Colheita — Bot (Parte 2): remendos para aplicar depois da Parte 1

O bot está pronto e testado. Falta só ligar 3 arquivos que a Parte 1 (visual mobile) também mexe: `tela.js`, `menu.js` e `index.html`. São remendos pequenos do tipo "procure isto, acrescente/troque por aquilo". **Aplique-os na versão que a Parte 1 entregar**, sem sobrescrever o trabalho dela.

## Arquivos entregues agora (já finais)
| Arquivo | O que mudou |
|---|---|
| **bot.js** (novo) | O bot: decisões, tela "Bot X está jogando...", teste `Bot.simular()`. |
| **acoes-turno.js** | `A.new(cfg)` aceita `{ nomes, bots, first }` (sem cfg lê o menu como sempre); guarda `p.bot` de cada jogador. |
| **acoes-economia.js** | `A.sell(k, qtd)` e `A.buyFeira(k, qtd)` aceitam quantidade opcional. |
| **acoes-mercado.js** | `A.listRes(k, qtd, preco)` e `A.list(kind, uid, preco)` aceitam valores opcionais. |

Sem os parâmetros, tudo funciona como antes. Por isso **`janelas.js` não precisa mudar**: os `onclick` e os ids `#rq…`, `#rp…`, `#pr…`, `#fq…` continuam valendo (a Parte 1 só precisa mantê-los).

## Remendo 1 — tela.js (1 linha)
Dentro de `render()`, logo depois da definição de `const evb = ...` e **antes** do `if (S.hide) ...`, acrescente:
```js
  if (p.bot) { Bot.agenda(); return m.innerHTML = Bot.tela(p, evb); } // vez de um bot (bot.js): ele joga sozinho; nada de "Passe o dispositivo"
```
Precisa ficar **depois** do `localStorage.setItem('tc_save', ...)` (assim "Continuar" funciona). É esse gancho que faz o bot jogar sozinho. A tela do bot reaproveita o `evb` (caixa de eventos recolhível) que o próprio `tela.js` monta.

## Remendo 2 — menu.js (1 linha em `names()`)
Troque a linha que monta `#nl`:
```js
$('#nl').innerHTML = r.map((_, i) => `<input class="nm" placeholder="Jogador ${i + 1}">`).join('');
```
por:
```js
$('#nl').innerHTML = r.map((_, i) => `<div class="nmrow"><input class="nm" placeholder="Jogador ${i + 1}"><select class="bt"><option value="">Humano</option><option value="facil">🤖 Bot fácil</option><option value="normal">🤖 Bot normal</option></select></div>`).join('');
```
Se a Parte 1 reorganizou essa linha, o que importa é: cada jogador continua com um `input.nm` e ganha um `select.bt` (valores `""`, `"facil"`, `"normal"`). O `A.new()` lê esses dois, na ordem, pela posição.

## Remendo 3 — index.html (1 linha)
Depois de `<script src="acoes-mercado.js"></script>` (qualquer ponto antes de `iniciar.js` serve), acrescente:
```html
<script src="bot.js"></script>
```

## CSS opcional (style.css)
Só para a linha "nome + escolha humano/bot" ficar bonita (a Parte 1 pode adaptar ao tema dela):
```css
.nmrow { display: flex; gap: 6px; margin: 4px 0; }
.nmrow .nm { flex: 1; min-width: 0; }
.nmrow .bt { min-height: 44px; } /* alvo de toque no celular */
```
Se o `style.css` da Parte 1 estica `select` ou `input` do `.menu` a 100% de largura, acrescente também `.nmrow .bt { width: auto; flex: none; }`.
O `#evb` e o `.log` são reaproveitados pela tela do bot, então herdam o visual da Parte 1.

## Como testar
Teste de partidas só com bots (console do navegador, F12):
```js
Bot.simular(20, 3, ['normal'])              // 20 partidas, 3 bots normais
Bot.simular(20, 4, ['normal', 'facil'])     // 4 jogadores, níveis em rodízio
```
Devolve: quantas terminaram, quantas ficaram sem fim, eliminados, vitórias por nível e por objetivo, e erros de estado (moedas inválidas, estoque negativo, campo com espaço negativo etc.). Não mexe na sua partida salva.
Velocidade ao vivo: `Bot.delay = 100` (padrão 700 ms; também há o botão ⏩ na tela do bot).

## O que o bot assume de `cartas-visual.js` (não recebi esse arquivo)
O bot usa estas funções de lá: `free(f)`, `NV(c)`, `vef(o)`, `nm(c)`, `evDesc(e)`. Se a Parte 1 mexer em `cartas-visual.js`, ela **não pode renomear nem mudar o que essas funções devolvem**.

## Resultados dos testes (simulados, sem erros de estado)
- 5 configurações (2 a 6 jogadores, fácil e normal), 190 partidas: **0 erros**.
- Normal vence o Fácil com folga (com 6 jogadores: 38 a 2).
- Caminho real (`render` → `Bot.agenda()` → temporizador), humano + bots alternando, "Continuar" no meio do turno e menu antigo sem `.bt`: tudo OK.
- Objetivos difíceis de fechar com 2 jogadores (ficaram sem fim em 150 rodadas): `noLoan`, `allLvl`, `clean`, `mUnits`, `mProfit`, `noites`, `floorUntil`. São objetivos de muitas moedas ou de Mercado; vale olhar o balanceamento. Observação: os valores das cartas usados no teste são os do `cartas.js` enviado, e as funções visuais foram simuladas.

## Trechos para a Ficha Técnica (FICHAS_TECNICAS.md)
Acrescente na lista do motor, depois de `acoes-mercado.js`:
> **bot.js** — Jogador controlado pelo computador (níveis fácil e normal). Joga só pelas ações `A.*`, sem ver o que um humano não veria. Tem a tela "Bot X está jogando..." e o teste `Bot.simular()`. Carrega antes de `iniciar.js`.

E na tabela "Onde mexer":
| Quero mudar... | Arquivo |
|---|---|
| Como o bot decide, níveis fácil/normal (`Bot.PF`), velocidade (`Bot.delay`) | bot.js |
| Testar o bot jogando sozinho | console: `Bot.simular(...)` |
| Quem é bot (select no menu) | menu.js (`.bt`) e acoes-turno.js (`A.new`) |

Na descrição de `acoes-turno.js`: "A.new lê o menu ou recebe `{ nomes, bots, first }`; cada jogador tem `p.bot` ('', 'facil' ou 'normal')". Em `acoes-economia.js` e `acoes-mercado.js`: "as ações aceitam quantidade/preço como parâmetros opcionais (o bot usa); sem eles, leem a tela".
