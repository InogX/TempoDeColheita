// ===== FICHA TÉCNICA =====
// acoes-turno.js: Ações do fluxo da partida: novo jogo (A.new lê o menu da tela, ou recebe { nomes, bots, first } como parâmetro; cada jogador pode ser humano ou bot; os campos Dev vêm da tela ou de Menu.cfg, a tela Configurações), continuar, sair (volta ao menu principal), abrir janelas (UI.modal), espiar (S.peekPend / S.peek), iniciar o turno (produção, manutenção, evento individual, cartas), abrir janelas, espiar, ver jogador e encerrar o turno.
// ========================

function after() { render(); } // a vitória só é decidida no fim da rodada (A.end)

// A é o conjunto de ações do jogador. As outras acoes-*.js acrescentam mais ações a ele.
const A = {
  new(cfg) { UIreset(); // cfg opcional: { nomes: [...], bots: ['', 'facil', 'normal'...], first: 0 } cria a partida sem a tela do menu (bot, testes)
    const dv = id => { const e = document.getElementById(id); return e ? e.value : (typeof Menu !== 'undefined' && Menu.cfg[id] != null ? String(Menu.cfg[id]) : ''); }; // campos Dev: da tela, ou da tela Configurações (Menu.cfg)
    const nomes = cfg ? cfg.nomes : [...document.querySelectorAll('.nm')].map(e => e.value), bots = cfg ? cfg.bots || [] : [...document.querySelectorAll('.bt')].map(e => e.value);
    const n = cfg ? nomes.length : Math.min(REG.maxJogadores, Math.max(REG.minJogadores, +$('#n').value || REG.minJogadores)), ob = [], pool = CARDS.objetivo.filter(c => !c.minJ || c.minJ <= n); while (ob.length < n) ob.push(...sh(pool.length ? pool : CARDS.objetivo));
    S = { round: 0, t: 0, uid: 0, gov: REG.cofrePorJogador * n, ev: [], center: [], mk: [], log: [], dk: {}, hide: true, win: null, peekPend: null, auxDone: false, mudas: 0,
      players: nomes.map((nome, i) => ({ n: nome || (bots[i] ? 'Bot ' : 'Jogador ') + (i + 1), bot: bots[i] || '', coins: dv('dvCoins') !== '' ? +dv('dvCoins') : START_COINS,
        debt: 0, res: Object.fromEntries(K.map(k => [k, (REG.recursosIniciais[k] || 0) + (+dv('dvRes') || 0)])), fields: [], hand: [], compras: 0, obj: CARDS.objetivo.find(c => c.id === dv('dvObj' + i)) || ob[i], ind: null, turns: 0, out: false, nightUntil: 0, pubUntil: 0,
        st: { inc: 0, hc: Object.fromEntries(K.map(k => [k, 0])), pu: Object.fromEntries(K.map(k => [k, 0])), loans: 0, ms: 0, mb: 0, mp: 0, mu: 0, partners: [], buyers: [], azar: 0, noites: 0 } })) };
    ligaUI(); Object.keys(CARDS).forEach(k => S.dk[k] = sh(CARDS[k]));
    S.devAll = !!(document.getElementById('dvAll') ? document.getElementById('dvAll').checked : typeof Menu !== 'undefined' && Menu.cfg.dvAll);
    S.first = cfg && cfg.first !== undefined ? cfg.first : +$('#f').value; nextRound(); while (S.center.length < Math.max(REG.camposMax, REG.camposMin)) S.center.push(pull('campo')); render();
  },
  cont() { S = JSON.parse(localStorage.getItem('tc_save')); UIreset();
    if (S.modal === 'peek') S.peekPend = S.order[S.t]; ['modal', 'plantSel', 'viewing', 'viewRes', 'actor', 'devP', 'dv'].forEach(k => delete S[k]); // saves antigos: a interface não faz mais parte de S
    ligaUI(); render(); },
  quit() { S = null; UIreset(); localStorage.removeItem('tc_save'); if (typeof Menu !== 'undefined') Menu.tela = 'main'; render(); }, // volta ao menu principal
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
      if (e.reveal == 'peek') S.peekPend = S.order[S.t]; }
    for (let i = p.turns == 1 ? REG.cartasPrimeiroTurno : REG.cartasPorTurno; i > 0 && p.hand.length < REG.maxMao; i--) p.hand.push(pull('plantacao'));
    if (REG.camposRefresh === 'turno') refillCenter();
    S.hide = false; after();
  },
  modal(m) { UI.modal = m; UI.actor = eu(); render(); },
  act(v) { UI.actor = +v; render(); },
  peek(i) { S.peek = { by: S.order[S.t], to: i }; S.peekPend = null; UI.modal = null; render(); },
  view(i) { UI.viewing = i; UI.viewRes = false; UI.modal = 'view'; UI.actor = eu(); render(); },
  end() { const p = cur(), viol = violou(p), falido = p.coins < 0 || p.debt > REG.limiteDivida;
    if (falido || viol) { p.out = true; log(p.n + (falido ? ' FALIU!' : ' violou o objetivo e foi eliminado!'));
      if (alive().length == 1) { S.win = { n: alive()[0].n, why: 'Último sobrevivente' }; return render(); } }
    S.t++;
    if (S.t >= S.order.length) { const w = vencedorDaRodada(); if (w) { S.win = w; return render(); } nextRound(); if (S.win) return render(); } // a partida só acaba no FIM da rodada
    S.hide = true; S.peekPend = null; S.peek = null; UI.modal = null; UI.plantSel = null; render(); }
};
