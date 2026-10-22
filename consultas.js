// ===== FICHA TÉCNICA =====
// consultas.js: Pequenas perguntas rápidas sobre a partida: quem joga agora, quem ainda está vivo, comprar carta do baralho, a carta cabe no campo, registro (log), achar item do mercado e as consultas dos eventos gerais ativos (manutenção, produção bloqueada, preço do Governo, juros, taxa, campo grátis, Feira).
// ========================

const cur = () => S.players[S.order[S.t]];
const alive = () => S.players.filter(p => !p.out);
const log = t => { S.log.push(t); S.log = S.log.slice(-6); };
const pull = k => { if (!S.dk[k].length) S.dk[k] = sh(CARDS[k]); return { ...S.dk[k].pop(), uid: ++S.uid }; };
const fits = (f, c) => f.c.any || f.c.types.includes(c.crop);
const plotsOf = p => p.fields.flatMap(f => f.plots), lvOf = x => x.c.nivel || 1;
const find = l => { if (l.kind == 'res') return l; const q = S.players[l.s]; return l.kind == 'hand' ? q.hand.find(c => c.uid == l.uid) : q.fields.find(f => f.c.uid == l.uid); };

// ----- eventos gerais ativos (S.ev): cada item é { c: carta, left: rodadas restantes, crop?: cultura sorteada, ... } -----
const evOn = fx => S.ev.some(e => e.c.fx === fx);
const evFind = fx => S.ev.find(e => e.c.fx === fx);
const evMul = (fx, def) => S.ev.reduce((a, e) => a * (e.c.fx === fx ? (e.c.fator || def) : 1), 1);
const prodBloqueada = x => S.ev.some(e => e.c.fx === 'greve' || (e.c.fx === 'praga' && e.crop === x.c.crop) || (e.c.fx === 'tempestade' && lvOf(x) <= 2)); // Greve, Praga (cultura sorteada) e Tempestade (níveis 1 e 2)
const manutOf = x => { const m = NV(x.c).manut, e = evFind('incentivo'); return evOn('isencao') ? 0 : e ? Math.ceil(m * (100 - e.c.pct) / 100) : m; }; // Isenção: 0; Incentivo Fiscal: o Governo arca com pct%
const govPreco = k => CROP_PRICE[k] * evMul('govPaga', 2); // quanto o Governo paga por unidade (Governo paga +100%)
const jurosPct = () => REG.juros * evMul('juros', 2); // Juros em alta
const taxaMercado = v => { const e = evFind('taxa'); return e ? Math.floor(v * e.c.pct / 100) : 0; }; // parte de uma venda entre jogadores que vai ao Governo
const mercadoFechado = () => evOn('embargo');
const campoGratis = (p, c) => S.ev.find(e => e.c.fx === 'incentivo' && e.left === e.c.dur && price(c) <= e.c.campoMax && !(e.used || []).includes(S.players.indexOf(p))); // Incentivo Fiscal: 1 campo de até campoMax grátis por jogador, só na 1ª rodada do evento
const buyPrice = (p, c) => campoGratis(p, c) ? 0 : price(c);
const feiraComprado = (e, p, k) => ((e.bought || {})[S.players.indexOf(p)] || {})[k] || 0;
const feiraMax = (e, p, k) => Math.max(0, Math.min(e.c.limite - feiraComprado(e, p, k), (e.stock || {})[k] || 0, Math.floor(Math.max(0, p.coins) / e.c.preco)));
