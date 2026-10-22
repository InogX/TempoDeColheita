// ===== FICHA TÉCNICA =====
// dev.js: Ferramentas de teste (painel Dev): dar moedas, recursos, cartas, campos, trocar objetivo, forçar eventos, avançar rodada. Só aparece se 'Painel Dev' estiver ligado no editor.
// ========================

const D = { // ferramentas Dev (só aparecem com a regra "Painel Dev" ligada)
  i() { return S.devP != null ? S.devP : S.order[S.t]; }, p() { return S.players[+document.getElementById('dvP').value]; },
  n() { return +document.getElementById('dvN').value || 0; }, v(id) { return document.getElementById(id).value; },
  coins(soma) { const p = D.p(); p.coins = soma ? p.coins + D.n() : D.n(); after(); },
  debt() { D.p().debt = Math.max(0, D.n()); after(); },
  gov() { S.gov = Math.max(0, D.n()); render(); },
  res(k) { const p = D.p(); p.res[k] = Math.max(0, (p.res[k] || 0) + D.n()); after(); },
  card() { const x = CARDS.plantacao.find(c => c.id == D.v('dvCard')), lv = +D.v('dvLv'); return { ...x, uid: ++S.uid, ...(lv > 1 ? { nivel: lv } : {}) }; },
  hand() { const p = D.p(); if (!document.getElementById('dvFree').checked && p.hand.length >= REG.maxMao) return alert('Mão cheia (marque "ignorar limite")'); p.hand.push(D.card()); render(); },
  field() { const p = D.p(), f = CARDS.campo.find(c => c.id == D.v('dvField')); p.fields.push({ c: { ...f, uid: ++S.uid }, plots: [] }); after(); },
  sale() { S.center.push({ ...CARDS.campo.find(c => c.id == D.v('dvField')), uid: ++S.uid }); render(); },
  plant() { const p = D.p(), f = p.fields[+D.v('dvFi')], c = D.card(); if (!f) return alert('O jogador não tem campos');
    if (!fits(f, c) || free(f) < NV(c).espacos) return alert('Não cabe: cultura não aceita ou sem vagas'); f.plots.push({ c }); after(); },
  level() { const p = D.p(), [fi, pi] = D.v('dvPl').split(':').map(Number), x = p.fields[fi] && p.fields[fi].plots[pi], lv = +D.v('dvLv'); if (!x) return;
    if (free(p.fields[fi]) + NV(x.c).espacos < ASSETS.niveis[lv].espacos) return alert('Sem vagas para esse nível'); if (lv > 1) x.c.nivel = lv; else delete x.c.nivel; after(); },
  obj() { D.p().obj = { ...CARDS.objetivo.find(c => c.id == D.v('dvObj')) }; after(); },
  gEvent() { const c = { ...CARDS.geral.find(x => x.id == D.v('dvGe')), uid: ++S.uid }, e = novoEvento(c); S.ev.push(e); alive().forEach(p => { p.coins += c.coins || 0; }); efeitoImediato(e); log(`DEV: evento ${nm(c)}`); after(); },
  iEvent() { const p = D.p(), e = { ...CARDS.individual.find(x => x.id == D.v('dvIe')), uid: ++S.uid }; p.ind = e; p.coins += e.coins;
    if (e.night) p.nightUntil = S.round + (e.dur || 1) - 1; if (e.reveal == 'self') p.pubUntil = S.round + (e.dur || 1) - 1; if (e.reveal == 'peek') S.modal = 'peek'; log(`DEV: ${p.n} recebeu ${nm(e)}`); after(); },
  round() { S.round = Math.max(1, D.n()); render(); }, next() { nextRound(); render(); }, all() { S.devAll = !S.devAll; render(); },
  clearSale() { S.center = []; render(); }, rebuy() { D.p().compras = 0; render(); },
  clearMk() { S.mk.forEach(l => { if (l.kind == 'res') S.players[l.s].res[l.crop] += l.qty; }); S.mk = []; render(); },
  win() { S.win = { n: D.p().n, why: 'Dev' }; render(); }
};
