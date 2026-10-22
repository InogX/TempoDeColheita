// ===== FICHA TÉCNICA =====
// acoes-turno.js: Ações do fluxo da partida: novo jogo, continuar, sair, iniciar o turno (produção, manutenção, evento individual, cartas), abrir janelas, espiar, ver jogador e encerrar o turno.
// ========================

function after() { render(); } // a vitória só é decidida no fim da rodada (A.end)

// A é o conjunto de ações do jogador. As outras acoes-*.js acrescentam mais ações a ele.
const A = {
  new() {
    const dv = id => { const e = document.getElementById(id); return e ? e.value : ''; };
    const n = Math.min(REG.maxJogadores, Math.max(REG.minJogadores, +$('#n').value || REG.minJogadores)), ob = [], pool = CARDS.objetivo.filter(c => !c.minJ || c.minJ <= n); while (ob.length < n) ob.push(...sh(pool.length ? pool : CARDS.objetivo));
    S = { round: 0, t: 0, uid: 0, gov: REG.cofrePorJogador * n, ev: [], center: [], mk: [], log: [], dk: {}, hide: true, win: null, modal: null, auxDone: false, mudas: 0,
      players: [...document.querySelectorAll('.nm')].map((e, i) => ({ n: e.value || 'Jogador ' + (i + 1), coins: dv('dvCoins') !== '' ? +dv('dvCoins') : START_COINS,
        debt: 0, res: Object.fromEntries(K.map(k => [k, (REG.recursosIniciais[k] || 0) + (+dv('dvRes') || 0)])), fields: [], hand: [], compras: 0, obj: CARDS.objetivo.find(c => c.id === dv('dvObj' + i)) || ob[i], ind: null, turns: 0, out: false, nightUntil: 0, pubUntil: 0,
        st: { inc: 0, hc: Object.fromEntries(K.map(k => [k, 0])), pu: Object.fromEntries(K.map(k => [k, 0])), loans: 0, ms: 0, mb: 0, mp: 0, mu: 0, partners: [], buyers: [], azar: 0, noites: 0 } })) };
    Object.keys(CARDS).forEach(k => S.dk[k] = sh(CARDS[k]));
    S.devAll = !!(document.getElementById('dvAll') && document.getElementById('dvAll').checked);
    S.first = +$('#f').value; nextRound(); while (S.center.length < Math.max(REG.camposMax, REG.camposMin)) S.center.push(pull('campo')); render();
  },
  cont() { S = JSON.parse(localStorage.getItem('tc_save')); render(); },
  quit() { S = null; localStorage.removeItem('tc_save'); render(); },
  go() {
    const p = cur(); p.turns++; p.compras = 0;
    p.res = p.res || {};
    p.fields.forEach(f => f.plots.forEach(x => { // cada carta plantada produz do recurso (multiplicadores, noite, Greve/Praga/Tempestade) e cobra a manutenção (Isenção/Incentivo Fiscal)
      const bl = prodBloqueada(x), mn = manutOf(x),
        q = bl ? 0 : Math.round(NV(x.c).producao * S.ev.reduce((a, e) => a * (e.c.mult || 1), 1) * (isNight(p, f) ? REG.noturnoPct / 100 : 1));
      p.res[x.c.crop] = (p.res[x.c.crop] || 0) + q; p.st.hc[x.c.crop]++; p.st.pu = p.st.pu || {}; p.st.pu[x.c.crop] = (p.st.pu[x.c.crop] || 0) + q; p.coins -= mn; S.gov += mn;
      log(`${p.n}: ${CROPS[x.c.crop]} +${q}${bl ? ' (sem produzir por evento)' : ''} (manutenção -${mn})`); }));
    if (S.round % REG.eventoIndividualCada == 0) { const e = p.ind = pull('individual'); p.coins += e.coins; log(`${p.n}: ${nm(e)}`);
      if (e.night) p.nightUntil = S.round + (e.dur || 1) - 1;
      if (e.reveal == 'self') p.pubUntil = S.round + (e.dur || 1) - 1;
      if (e.reveal == 'peek') S.modal = 'peek'; }
    for (let i = p.turns == 1 ? REG.cartasPrimeiroTurno : REG.cartasPorTurno; i > 0 && p.hand.length < REG.maxMao; i--) p.hand.push(pull('plantacao'));
    if (REG.camposRefresh === 'turno') refillCenter();
    S.hide = false; after();
  },
  modal(m) { S.modal = m; S.actor = S.order[S.t]; render(); },
  act(v) { S.actor = +v; render(); },
  peek(i) { S.peek = { by: S.order[S.t], to: i }; S.modal = null; render(); },
  view(i) { S.viewing = i; S.viewRes = false; S.modal = 'view'; S.actor = S.order[S.t]; render(); },
  end() { const p = cur(), viol = violou(p), falido = p.coins < 0 || p.debt > REG.limiteDivida;
    if (falido || viol) { p.out = true; log(p.n + (falido ? ' FALIU!' : ' violou o objetivo e foi eliminado!'));
      if (alive().length == 1) { S.win = { n: alive()[0].n, why: 'Último sobrevivente' }; return render(); } }
    S.t++;
    if (S.t >= S.order.length) { const w = vencedorDaRodada(); if (w) { S.win = w; return render(); } nextRound(); if (S.win) return render(); } // a partida só acaba no FIM da rodada
    S.hide = true; S.modal = null; S.peek = null; S.plantSel = null; render(); }
};
