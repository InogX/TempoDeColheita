// ===== FICHA TÉCNICA =====
// rodada.js: Cuida da virada de rodada: sorteia o evento geral (e aplica os efeitos imediatos), cobra juros, define a ordem dos jogadores, elimina quem violou o objetivo, repõe os campos à venda e executa a Alta demanda no fim da rodada.
// ========================

const temNoite = p => p.fields.some(f => !f.c.any && f.plots.length) && (S.ev.some(e => e.c.night) || p.nightUntil >= S.round);
function refillCenter() { const mx = Math.max(REG.camposMax, REG.camposMin); if (S.center.length < REG.camposMin) while (S.center.length < mx) S.center.push(pull('campo')); }

// Auxílio aos pequenos só sai a partir da rodada 10, uma única vez por partida (e só com 3+ jogadores, senão ninguém receberia). Carta barrada volta ao baralho embaralhada.
const geralOk = c => c.fx !== 'auxilio' || (S.round >= (c.minRound || 10) && !S.auxDone && S.players.length >= 3);
function sorteiaGeral() { const fora = []; let c = pull('geral');
  for (let i = 0; i < 60 && !geralOk(c); i++) { fora.push(c); c = pull('geral'); }
  if (fora.length) S.dk.geral = sh([...S.dk.geral, ...fora]);
  return c; }
// item de S.ev para a carta sorteada: guarda a cultura sorteada (Praga, Alta demanda), o estoque da Feira e quem já usou o campo grátis
function novoEvento(c) { const e = { c, left: c.dur };
  if (c.fx === 'praga' || c.fx === 'demanda') e.crop = sh(K)[0];
  if (c.fx === 'feira') { e.stock = Object.fromEntries(K.map(k => [k, c.estoque * S.players.length])); e.bought = {}; }
  if (c.fx === 'incentivo') e.used = [];
  return e; }
// efeitos que acontecem uma única vez, no instante em que a carta é sorteada
function efeitoImediato(e) { const c = e.c, vivos = alive();
  if (c.fx === 'recessao') { vivos.forEach(p => { p.coins -= c.valor; S.gov += c.valor; }); log(`Recessão: todos pagaram ${c.valor} ao Governo`); }
  if (c.fx === 'imposto' && vivos.length) { const r = vivos.reduce((a, b) => b.coins > a.coins ? b : a); r.coins -= c.valor; S.gov += c.valor; log(`${r.n} (o mais rico) pagou ${c.valor} de imposto ao Governo`); }
  if (c.fx === 'auxilio') { S.auxDone = true; const k = Math.floor(S.players.length / 3),
      g = [...vivos].sort((a, b) => a.coins - b.coins || S.players.indexOf(a) - S.players.indexOf(b)).slice(0, k);
    g.forEach(p => { const v = Math.min(c.valor, S.gov); S.gov -= v; p.coins += v; }); log(`Auxílio aos pequenos: ${g.map(p => p.n).join(', ')}`); }
  if (c.fx === 'mudas') { vivos.forEach(p => p.hand.push(pull('plantacao'))); S.mudas = (S.mudas || 0) + 1; log('Entrega de mudas: todos sacaram 1 carta extra'); } }
// fim da rodada: a Alta demanda faz o Governo comprar a oferta mais barata da cultura sorteada que estiver no Mercado
function fimDeRodada() { S.ev.filter(e => e.c.fx === 'demanda').forEach(e => {
  const l = S.mk.filter(x => x.kind == 'res' && x.crop == e.crop).sort((a, b) => a.price - b.price || a.id - b.id)[0]; if (!l) return;
  const pr = Math.min(e.c.teto, l.price), u = Math.min(l.qty, Math.floor(S.gov / pr)); if (!u) return;
  const s = S.players[l.s]; S.gov -= u * pr; s.coins += u * pr; s.st.inc += u * pr; l.qty -= u; if (!l.qty) S.mk = S.mk.filter(x => x !== l);
  log(`Alta demanda: o Governo comprou ${u} ${CROPS[e.crop]} de ${s.n} (${pr} cada)`); }); }

function nextRound() {
  fimDeRodada();
  S.round++;
  S.ev = S.ev.filter(e => --e.left > 0);
  const c = sorteiaGeral(), ev = novoEvento(c); S.ev.push(ev);
  const azar = !!c.azar || /^Azar/.test(c.id); // evento de azar geral
  S.players.forEach(p => { if (!p.out) { if (S.round > 1) p.debt = Math.round(p.debt * (1 + jurosPct() / 100)); p.coins += c.coins || 0; } });
  efeitoImediato(ev);
  // 1º confere a violação (ex.: ficar abaixo do piso de moedas por causa do evento); só quem sobreviveu conta o evento de azar / a noite
  S.players.forEach(p => { if (p.out) return;
    if (violou(p)) { p.out = true; log(`${p.n} violou o objetivo e foi eliminado!`); return; }
    if (azar) p.st.azar = (p.st.azar || 0) + 1; if (temNoite(p)) p.st.noites = (p.st.noites || 0) + 1; });
  const vivos = alive(); if (vivos.length === 1) S.win = { n: vivos[0].n, why: 'Último sobrevivente' }; else if (!vivos.length) S.win = { n: S.players.reduce((a, b) => b.coins > a.coins ? b : a).n, why: 'Todos eliminados: maior saldo' };
  const n = S.players.length;
  S.order = [...Array(n)].map((_, i) => (S.first + i) % n).filter(i => !S.players[i].out);
  if (REG.camposRefresh === 'rodada') refillCenter();
  S.t = 0; S.hide = true; log(`Rodada ${S.round}: evento ${nm(c)}`);
}
