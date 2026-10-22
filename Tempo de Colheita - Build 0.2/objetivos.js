// ===== FICHA TÉCNICA =====
// objetivos.js: Decide se o objetivo de um jogador foi cumprido, se ele violou uma regra do objetivo (eliminação), e define quem vence no fim da rodada (com desempate).
// ========================

const done = p => { const o = p.obj, v = vef(o), st = p.st, pl = plotsOf(p), g = k => st[k] || 0, op = S.players.filter(q => q !== p && !q.out);
  switch (o.t) {
    case 'lvl3n': return pl.filter(x => lvOf(x) >= 3).length >= v;
    case 'lvl3crops': return new Set(pl.filter(x => lvOf(x) >= 3).map(x => x.c.crop)).size >= v;
    case 'lvlsum': return pl.reduce((a, x) => a + lvOf(x), 0) >= v;
    case 'prodEach': return K.every(k => (st.pu || {})[k] >= v);
    case 'stockN': return K.filter(k => p.res[k] >= v).length >= o.n;
    case 'coins': return p.coins >= v;
    case 'clean': return p.coins >= v && !p.debt;
    case 'noLoan': return p.coins >= v && !g('loans');
    case 'chrome': return p.fields.filter(f => f.c.any).length >= v;
    case 'slots': return p.fields.reduce((a, f) => a + f.c.slots, 0) >= v;
    case 'mSales': return g('ms') >= v;
    case 'mBuys': return g('mb') >= v;
    case 'mProfit': return g('mp') >= v;
    case 'mAll': { const ps = st.partners || []; return op.length > 0 && S.players.every((q, i) => q === p || q.out || ps.includes(i)); } // todos os adversários ainda vivos
    case 'mSellTo': return (st.buyers || []).length >= Math.min(v, Math.max(1, op.length));
    case 'mUnits': return g('mu') >= v;
    case 'azar': return g('azar') >= o.v && p.coins >= o.v2;
    case 'noites': return g('noites') >= o.n && p.coins >= o.v;
    case 'floorUntil': return S.round >= o.r && p.coins >= o.v;
    case 'allLvl': return S.round >= o.r && pl.length >= o.n && pl.every(x => lvOf(x) >= 2) && p.coins >= o.v;
  }
  return false; };
// objetivo com restrição: violar elimina o jogador (como falência) — só se o objetivo tiver elim:1
const violou = p => { const o = p.obj, st = p.st; if (!o || !o.elim) return false;
  if (o.t === 'noLoan') return (st.loans || 0) > 0;
  if (o.t === 'azar') return (st.azar || 0) < o.v && p.coins < o.floor;
  if (o.t === 'floorUntil') return S.round <= o.r && p.coins < o.floor;
  return false; };
// fim da rodada: quem estiver com o objetivo cumprido vence; empate: mais moedas > menos dívida > maior valor do estoque > sorteio
const vencedorDaRodada = () => { const c = alive().filter(done); if (!c.length) return null;
  const val = p => p.coins + K.reduce((a, k) => a + (p.res[k] || 0) * CROP_PRICE[k], 0);
  c.sort((a, b) => b.coins - a.coins || a.debt - b.debt || val(b) - val(a));
  const top = c.filter(p => p.coins === c[0].coins && p.debt === c[0].debt && val(p) === val(c[0])), w = top[Math.floor(Math.random() * top.length)];
  return { n: w.n, why: objTxt(w.obj) + (c.length > 1 ? ` (desempate entre ${c.length} jogadores)` : '') }; };
