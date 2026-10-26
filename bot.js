// ===== FICHA TÉCNICA =====
// bot.js: Jogador controlado pelo computador (bot), níveis 'facil' e 'normal' (p.bot). Joga SÓ pelos comandos do jogador (Cmd.run, comandos.js: as mesmas regras de vez e de fase de um humano), como um humano: planta, evolui, vende ao Governo, compra campos e cartas, usa Feira, Mercado e empréstimos e persegue o próprio objetivo, sem trapacear (não lê mão nem objetivo dos outros). Também tem a tela "Bot X está jogando..." (Bot.tela) e o teste Bot.simular(), que roda partidas só com bots e confere erros.
// Como entra no jogo: tela.js chama Bot.agenda() quando a vez é de um bot (online, só o anfitrião roda; no convidado agenda() não faz nada); menu.js marca quem é bot (select .bt); A.new (acoes-turno.js) grava p.bot.
// Depende de (em outros arquivos): Cmd (comandos.js), A.quit/A.new, exec, cur, alive, log, plotsOf, lvOf, fits, evFind, evOn, govPreco, jurosPct, manutOf, feiraMax, mercadoFechado, buyPrice (consultas.js); done (objetivos.js); free, NV, vef, nm, evDesc (cartas-visual.js); ASSETS, REG, LOAN, EXTRA, K (cartas.js / config.js / estado.js).
// ========================

const Bot = {
  delay: 700, on: false, timer: null, chave: '', n: 0, erros: 0, negados: new Set(), cancelou: false, // delay = pausa (ms) entre ações; 0 = o mais rápido possível
  // erra = chance de descuido; folga = moedas de sobra que ele quer manter; up/buy/mkt/pay = chance de tentar evoluir/comprar/usar o Mercado/pagar dívida
  PF: { facil: { erra: 0.3, folga: 30, up: 0.6, buy: 0.5, mkt: 0.1, pay: 0.5 }, normal: { erra: 0.03, folga: 60, up: 1, buy: 1, mkt: 1, pay: 1 } },
  MOEDAS: ['coins', 'clean', 'noLoan', 'floorUntil', 'azar', 'noites', 'allLvl'], // objetivos que dependem de ter moedas
  NIVEIS: ['lvl3n', 'lvl3crops', 'lvlsum', 'allLvl'], // objetivos que dependem de evoluir plantios
  MERC: ['mSales', 'mBuys', 'mProfit', 'mAll', 'mSellTo', 'mUnits'], // objetivos de negociar com jogadores

  // ---------- controle: quando e como o bot age ----------
  agenda() { if (window.Online && Online.ativo && !Online.host) return; // online: só o ANFITRIÃO roda os bots
    if (this.on || this.erros > 20) return; this.on = true; this.timer = setTimeout(() => this.passo(), this.delay); }, // chamado pelo render() na vez de um bot; não duplica
  parar() { clearTimeout(this.timer); this.on = false; },
  passo() { this.timer = null;
    if (!S || S.win || !cur() || !cur().bot) { this.on = false; return; }
    this.acao();
    if (!S || S.win || !cur() || !cur().bot) { this.on = false; return; }
    this.timer = setTimeout(() => this.passo(), this.delay); },
  acao() { const p = cur(), k = S.round + ':' + S.t; // UMA ação do bot da vez
    if (k !== this.chave) { this.chave = k; this.n = 0; this.negados = new Set(); this.cancelou = false; } // vez nova: zera os controles
    try {
      if (S.hide) this.cmd(p, 'go');
      else if (S.peekPend != null) { const o = alive().filter(q => q !== p); if (o.length) this.cmd(p, 'peek', [S.players.indexOf(o[Math.floor(Math.random() * o.length)])]); else { S.peekPend = null; } }
      else if (++this.n > 80 || !this.decide(p)) this.cmd(p, 'end'); // limite de ações por turno; sem mais o que fazer: encerra
    } catch (e) { console.error('Bot: erro, encerrando o turno', e); this.erros++; try { S.peekPend = null; UI.modal = null; A.end(); /* emergência: o único A.* direto do bot, para o jogo não travar */ } catch (e2) { console.error('Bot: falha ao encerrar o turno', e2); this.erros += 10; } } },
  tela(p, evb) { return `<h2>🤖 ${p.n} está jogando...</h2><p>Rodada ${S.round}. ${window.Online && Online.ativo && !Online.host ? '' : '<button onclick="Bot.delay = Bot.delay > 300 ? 100 : 700">⏩ Velocidade</button>'}${window.Online && Online.ativo ? '<button onclick="A.modal(\'mkt\')">🤝 Mercado</button>' : ''}<button onclick="A.quit()">Sair</button></p>
    <p class="log">${S.log.join('<br>')}</p>${evb || `<div id="evb"><b>Evento Geral Ativo</b>${S.ev.map(e => `<div>${nm(e.c)}: ${evDesc(e)} (${e.left} rod.)</div>`).join('')}</div>`}`; }, // evb = caixa de eventos que o tela.js já monta (recolhível no celular)

  // ---------- apoio ----------
  pf(p) { return this.PF[p.bot] || this.PF.normal; },
  eu(p) { return S.players.indexOf(p); },
  sig() { const p = cur(); return [p.coins, p.debt, p.hand.length, p.fields.length, plotsOf(p).length, plotsOf(p).reduce((a, x) => a + lvOf(x), 0), K.map(k => p.res[k] || 0).join(), S.mk.length, S.mk.reduce((a, l) => a + (l.qty || 0), 0), S.gov, S.center.length].join('|'); }, // "foto" do que uma ação pode mudar
  // Pede um comando como o jogador p (Cmd.run, em silêncio). Se for recusado, lança erro (acao() trata e destrava o turno).
  cmd(p, nome, args = []) { const r = Cmd.run(this.eu(p), nome, args); if (!r.ok) throw new Error(`comando ${nome} recusado: ${r.msg}`); return r; },
  // Pede um comando em silêncio e confere o resultado. Se foi recusado ou nada mudou, anota a chave em 'negados' e não tenta de novo neste turno.
  tenta(chave, nome, args, txt) { if (this.negados.has(chave)) return false;
    const antes = this.sig(), r = Cmd.run(this.eu(cur()), nome, args);
    if (!r.ok || this.sig() === antes) { this.negados.add(chave); return false; }
    if (txt) log(`${cur().n}: ${txt}`);
    return true; },
  manut(p) { return plotsOf(p).reduce((a, x) => a + manutOf(x), 0); },
  piso(p) { const o = p.obj, st = p.st; if (!o || !o.elim) return 0; // moedas mínimas que o objetivo exige (ficar abaixo elimina)
    if (o.t === 'floorUntil' && S.round <= o.r) return o.floor;
    if (o.t === 'azar' && (st.azar || 0) < o.v) return o.floor;
    return 0; },
  reserva(p) { const piso = this.piso(p); return (piso ? piso + 120 : this.pf(p).folga) + Math.min(this.manut(p), 150); }, // moedas que ele evita gastar
  // evoluções possíveis pelo ESPAÇO do campo (tenha ou não o estoque); 'pode' = já tem estoque
  ups(p) { const r = [];
    p.fields.forEach((f, fi) => f.plots.forEach((x, pi) => { const L = lvOf(x), a = ASSETS.niveis[L], b = ASSETS.niveis[L + 1];
      if (!b || free(f) < b.espacos - a.espacos) return;
      r.push({ fi, pi, k: x.c.crop, L, custo: a.evolucao, pode: (p.res[x.c.crop] || 0) >= a.evolucao, gan: (b.producao - a.producao - (b.manut - a.manut)) / Math.max(1, a.evolucao) }); }));
    return r; },
  keep(p) { const kp = Object.fromEntries(K.map(k => [k, 0])), o = p.obj; // estoque que ele NÃO vende (evoluções e objetivo de estoque)
    this.ups(p).forEach(u => { kp[u.k] = kp[u.k] ? Math.min(kp[u.k], u.custo) : u.custo; });
    if (o.t === 'stockN') K.slice().sort((a, b) => (p.res[b] || 0) - (p.res[a] || 0)).slice(0, o.n).forEach(k => { kp[k] = Math.max(kp[k], vef(o)); });
    return kp; },

  // ---------- escolhas ----------
  plantio(p) { const o = p.obj, lv = this.NIVEIS.includes(o.t), pu = p.st.pu || {}, op = [];
    p.hand.forEach((c, h) => p.fields.forEach((f, fi) => { if (!fits(f, c) || free(f) < NV(c).espacos) return;
      let s = Math.random() * 0.5 - (f.c.any ? 0.4 : 0);
      if (!plotsOf(p).some(x => x.c.crop === c.crop)) s += 1.5; // variedade
      if (o.t === 'prodEach') s += 2 - Math.min(2, (pu[c.crop] || 0) / Math.max(1, vef(o)) * 2);
      if (lv && f.c.slots > 1) s += f.c.slots * 0.6 - f.plots.length * 1.5; // deixa espaço para evoluir
      op.push({ h, fi, s }); }));
    if (!op.length) return null;
    return Math.random() < this.pf(p).erra ? op[Math.floor(Math.random() * op.length)] : op.sort((a, b) => b.s - a.s)[0]; },
  melhorUp(p) { const o = p.obj, lv = this.NIVEIS.includes(o.t), pl = plotsOf(p);
    return this.ups(p).filter(u => u.pode).map(u => ({ ...u, s: Math.random() * 0.3 + (lv ? u.L + (o.t === 'lvl3crops' && !pl.some(x => x.c.crop === u.k && lvOf(x) >= 3) ? 2 : 0) : u.gan * 10) })).sort((a, b) => b.s - a.s)[0]; },
  melhorCampo(p) { const o = p.obj, lv = this.NIVEIS.includes(o.t);
    if ((p.compras || 0) >= REG.maxCompraCamposPorTurno || (REG.maxCamposPorJogador > 0 && p.fields.length >= REG.maxCamposPorJogador)) return null;
    const semCampo = p.hand.filter(c => !p.fields.some(f => fits(f, c) && free(f) >= NV(c).espacos)); let best = null;
    S.center.forEach((c, i) => { const pr = buyPrice(p, c);
      let s = (pr === 0 ? 5 : -pr / 100) + (semCampo.some(h => c.any || c.types.includes(h.crop)) ? 3 : 0) + (p.fields.length < 2 ? 2 : 0);
      if (o.t === 'chrome' && c.any) s += 4; if (o.t === 'slots') s += c.slots * 1.5; if (lv) s += c.slots * 0.8;
      if (p.coins - pr > this.reserva(p) + 250) s += 1.5; // dinheiro parado: cresce
      if (!best || s > best.s) best = { i, s, pr }; });
    return best && best.s >= 1.5 ? best : null; },
  // vende estoque ao Governo até chegar a 'alvo' moedas (uma venda por chamada). todo=false respeita o estoque guardado (evoluções/objetivo)
  vender(p, alvo, todo) { const kp = todo ? {} : this.keep(p);
    const ks = K.map(k => ({ k, q: Math.max(0, (p.res[k] || 0) - (kp[k] || 0)), v: govPreco(k) })).filter(x => x.q > 0).sort((a, b) => b.v - a.v || b.q - a.q);
    for (const x of ks) { if (p.coins >= alvo) break;
      if (this.tenta('sell:' + x.k, 'sell', [x.k, Math.min(x.q, Math.ceil((alvo - p.coins) / x.v))])) return true; }
    return false; },
  emprestar(p) { if (p.obj.t === 'noLoan' || p.debt + LOAN > REG.limiteDivida * 0.6) return false; return this.tenta('loan', 'loan', [], 'pegou um empréstimo'); },
  // vendendo todo o estoque (e pagando a dívida, no 'clean') o objetivo de moedas fecha? Testa em "faz de conta" e devolve o estado.
  fecharia(p) { const o = p.obj; if (!this.MOEDAS.includes(o.t)) return false;
    const val = K.reduce((a, k) => a + (p.res[k] || 0) * govPreco(k), 0), c0 = p.coins, d0 = p.debt, limpa = o.t === 'clean'; let r = false;
    try { p.coins = c0 + val - (limpa ? d0 : 0); if (limpa) p.debt = 0; r = done(p); } finally { p.coins = c0; p.debt = d0; }
    return r; },

  // ---------- Mercado entre jogadores ----------
  mercado(p) { const o = p.obj, id = this.eu(p), kp = this.keep(p), mk = this.MERC.includes(o.t), R = this.reserva(p);
    for (const l of S.mk) { if (l.kind !== 'res' || l.s === id || !S.players[l.s] || S.players[l.s].out) continue; // compra: só o que lhe serve e não é caro
      const t = l.qty * l.price, serve = (kp[l.crop] || 0) > (p.res[l.crop] || 0) || o.t === 'mBuys' || o.t === 'mAll';
      if (serve && l.price <= govPreco(l.crop) + (mk ? 1 : 0) && t <= (mk ? 150 : 1e9) && p.coins - t >= R && this.tenta('buyM:' + l.id, 'buyM', [l.id])) return true; }
    const de = evFind('demanda');
    for (const k of K) { if (S.mk.some(l => l.s === id && l.kind === 'res' && l.crop === k)) continue; // vende: 1 oferta por cultura
      const sobra = Math.max(0, (p.res[k] || 0) - (kp[k] || 0)); if (sobra < 5) continue;
      let pr = 0, q = sobra;
      if (de && de.crop === k) pr = de.c.teto; // Alta demanda: o Governo compra a oferta mais barata até o teto
      else if (mk) { pr = o.t === 'mProfit' ? govPreco(k) + 1 : govPreco(k); if (o.t === 'mSales') q = Math.min(sobra, 10); }
      if (pr > 0 && this.tenta('listRes:' + k, 'listRes', [k, q, pr], `ofereceu ${q} ${CROPS[k]} no Mercado a ${pr}`)) return true; }
    return false; },

  // ---------- a decisão: devolve true se fez UMA ação, false se não há mais o que fazer (aí o turno encerra) ----------
  decide(p) { const pf = this.pf(p), o = p.obj, id = this.eu(p), R = this.reserva(p), min = this.piso(p) + 5, rnd = Math.random; // (o Mercado atua pelo remetente do comando: Cmd.run cuida disso)
    // 1. recolhe as próprias ofertas antigas do Mercado (devolve o estoque), uma vez por turno
    if (!this.cancelou) { const l = S.mk.find(x => x.s === id); if (l && this.tenta('cancel:' + l.id, 'cancel', [l.id])) return true; this.cancelou = true; }
    // 2. sobreviver: abaixo do mínimo, vende tudo e, se preciso, pega empréstimo
    if (p.coins < min && (this.vender(p, min + 20, true) || this.emprestar(p))) return true;
    // 3. objetivo já cumprido: só vende a sobra (desempate por moedas) e encerra, sem arriscar nada
    if (done(p)) return this.vender(p, Infinity);
    if (rnd() < pf.erra * 0.15) return false; // descuido do nível fácil: encerra o turno cedo
    // 4. objetivo de moedas: se vendendo tudo ele fecha, vende e quita
    if (this.fecharia(p)) { if (this.vender(p, Infinity, true)) return true; if (o.t === 'clean' && p.debt && p.coins > 0 && this.tenta('pay', 'pay', [], 'pagou da dívida')) return true; }
    // 5. planta
    const B = this.plantio(p);
    if (B) { if (this.tenta(`plant:${B.h}:${B.fi}`, 'plantIn', [B.fi, B.h])) return true; }
    // 6. evolui
    const U = this.melhorUp(p);
    if (U && p.coins >= min + 20 && (pf.up === 1 || rnd() < pf.up) && this.tenta(`up:${U.fi}:${U.pi}:${U.L}`, 'up', [U.fi, U.pi])) return true;
    // 7. Feira Regional: compra o que falta para evoluir / para o objetivo de estoque
    const fe = evFind('feira');
    if (fe) { const kp = this.keep(p);
      for (const k of K) { const q = Math.min(Math.max(0, (kp[k] || 0) - (p.res[k] || 0)), feiraMax(fe, p, k));
        if (q > 0 && p.coins - q * fe.c.preco >= R && this.tenta('feira:' + k, 'buyFeira', [k, q])) return true; } }
    // 8. Mercado entre jogadores (fechado no Embargo)
    if (!mercadoFechado() && (pf.mkt === 1 || rnd() < pf.mkt) && this.mercado(p)) return true;
    // 9. converte a sobra do estoque em moedas (objetivo de moedas, pouco caixa ou Governo pagando o dobro)
    if ((this.MOEDAS.includes(o.t) || p.coins < R + 150 || evOn('govPaga')) && this.vender(p, Infinity)) return true;
    // 10. compra campo
    const C = this.melhorCampo(p);
    if (C && (pf.buy === 1 || rnd() < pf.buy)) { const c = S.center[C.i];
      if (C.pr === 0 || p.coins - C.pr >= R) { if (this.tenta('buyF:' + c.uid, 'buyF', [C.i], `comprou o campo ${nm(c)}${C.pr ? ' por ' + C.pr : ' (grátis)'}`)) return true; }
      else if (this.vender(p, C.pr + R)) return true; }
    // 11. carta extra (só se há vaga para plantar)
    const vagas = p.fields.reduce((a, f) => a + free(f), 0);
    if (p.hand.length < REG.maxMao && p.hand.length < Math.min(3, vagas) && p.coins - EXTRA >= R && (pf.buy === 1 || rnd() < pf.buy) && this.tenta('extra:' + p.hand.length, 'extra', [], 'comprou uma carta extra')) return true;
    // 12. paga dívida (com pressa se está perto do limite, os juros subiram ou o objetivo exige dívida zero)
    if (p.debt > 0) { const a = Math.min(LOAN, p.debt), urg = p.debt >= REG.limiteDivida * 0.7 || o.t === 'clean' || jurosPct() >= 10;
      if (p.coins >= R + a + (urg ? 0 : 100) && (pf.pay === 1 || rnd() < pf.pay)) { if (this.tenta('pay', 'pay', [], 'pagou da dívida')) return true; }
      else if (urg && this.vender(p, R + a)) return true; }
    return false; },

  // ---------- teste: roda N partidas só com bots (sem tela) e informa erros, quantas terminaram e quem vence ----------
  // Uso no console:  Bot.simular(20, 3, ['normal'])   ou   Bot.simular(10, 4, ['normal', 'facil'])   (jogadores usam os níveis em rodízio)
  simular(N = 10, jogadores = 3, niveis = ['normal'], maxRodadas = 150) {
    const salvo = S, r0 = window.render, al = window.alert, ce = console.error, d0 = this.delay, rel = { jogos: N, terminaram: 0, semFim: 0, eliminados: 0, rodadasMedia: 0, vitoriasPorNivel: {}, vitoriasPorObjetivo: {}, erros: {} };
    const erro = m => { rel.erros[m] = (rel.erros[m] || 0) + 1; }, rod = [];
    this.parar(); this.erros = 0; window.render = () => {}; console.error = (...a) => erro(a.map(x => (x && x.stack) || String(x)).join(' ').slice(0, 160));
    try {
      for (let g = 0; g < N; g++) {
        const bots = Array.from({ length: jogadores }, (_, i) => niveis[i % niveis.length]);
        A.new({ nomes: bots.map((b, i) => `Bot${i + 1}(${b})`), bots, first: g % jogadores }); this.chave = ''; let passos = 0;
        while (S && !S.win && S.round <= maxRodadas && passos++ < 300000) { this.acao(); this.confere(erro); }
        rel.eliminados += S.players.filter(p => p.out).length;
        if (S.win) { rel.terminaram++; rod.push(S.round); const w = S.players.find(p => p.n === S.win.n);
          if (w) { rel.vitoriasPorNivel[w.bot] = (rel.vitoriasPorNivel[w.bot] || 0) + 1; rel.vitoriasPorObjetivo[w.obj.t] = (rel.vitoriasPorObjetivo[w.obj.t] || 0) + 1; } } else rel.semFim++;
      }
    } finally { console.error = ce; window.render = r0; window.alert = al; this.delay = d0; S = salvo; this.chave = ''; if (S) render(); }
    rel.rodadasMedia = rod.length ? Math.round(rod.reduce((a, b) => a + b, 0) / rod.length) : 0;
    console.log('Bot.simular:', JSON.stringify(rel, null, 1)); return rel; },
  confere(erro) { S.players.forEach(p => { if (!Number.isFinite(p.coins) || !Number.isFinite(p.debt)) erro('moedas ou dívida inválidas');
      K.forEach(k => { if (!(p.res[k] >= 0)) erro('estoque negativo ou inválido: ' + k); });
      p.fields.forEach(f => { if (free(f) < 0) erro('campo com espaço negativo'); });
      if (p.hand.length > REG.maxMao + (S.mudas || 0)) erro('mão acima do limite'); });
    if (!Number.isFinite(S.gov) || S.gov < 0) erro('cofre do Governo inválido'); },
};
