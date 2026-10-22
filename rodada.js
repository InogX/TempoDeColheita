// ===== FICHA TÉCNICA =====
// rodada.js: Cuida da virada de rodada: sorteia o evento geral, cobra juros, define a ordem dos jogadores, elimina quem violou o objetivo e repõe os campos à venda.
// ========================

const temNoite = p => p.fields.some(f => !f.c.any && f.plots.length) && (S.ev.some(e => e.c.night) || p.nightUntil >= S.round);
function refillCenter() { const mx = Math.max(REG.camposMax, REG.camposMin); if (S.center.length < REG.camposMin) while (S.center.length < mx) S.center.push(pull('campo')); }
function nextRound() {
  S.round++;
  S.ev = S.ev.filter(e => --e.left > 0);
  const c = pull('geral'); S.ev.push({ c, left: c.dur });
  const azar = !!c.azar || /^Azar/.test(c.id); // evento de azar geral (a Lista 2 passa a usar a marca c.azar)
  S.players.forEach(p => { if (!p.out) { if (S.round > 1) p.debt = Math.round(p.debt * (1 + REG.juros / 100)); p.coins += c.coins; } });
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
