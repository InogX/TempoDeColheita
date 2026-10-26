// Peças comuns dos testes de dois aparelhos (Fases 7 e 8): Firebase falso, aparelho (arquivos reais + peças falsas), partida e utilitários.
// (Foi o começo do teste da Fase 7.) Teste em Node da Fase 7: DOIS aparelhos (dois contextos independentes, cada um com os arquivos REAIS do jogo) falando pelo rede.js REAL
// sobre um Firebase FALSO em memória. Peças falsas (não tenho esses arquivos): cartas.js/config.js, cartas-visual.js, rodada.js, objetivos.js, dev.js, lobby.js.
// O lobby é simulado: o teste faz o que o lobby faz (criar, entrar, bot, fixar ordem, estado 'jogando') e chama Lobby.aoIniciar(cfg) em cada aparelho.
const vm = require('vm'), fs = require('fs'), dir = __dirname + '/';

const { criarRede, CFG } = require('./rede.js');
const LAT = +(process.env.LAT || 10);
const { criaMotor } = require('./teste_regras_motor.js');
const REGRAS = process.env.REGRAS ? JSON.parse(fs.readFileSync(dir + process.env.REGRAS, 'utf8')) : null; // REGRAS=regras_firebase.json: roda o teste SOB as regras de segurança (interpretador simplificado)
const todosBancos = []; // atraso da PROMESSA de escrita (ms); os ouvintes avisam antes, como no Firebase real

// ---------------- Firebase falso (com queda e volta de conexão) ----------------
function criaBanco(opc = {}) {
  const raiz = {}, ouv = [], conn = [], desc = [], escritas = [], negados = [], caido = {}, atual = {}, fila = {}; let devN = 0, idN = 0;
  const regras = opc.regras !== undefined ? opc.regras : REGRAS, motor = regras ? criaMotor(regras, () => raiz) : null;
  const seg = p => String(p).split('/').filter(Boolean), clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
  const pega = p => { let n = raiz; for (const k of seg(p)) { if (n == null || typeof n !== 'object') return undefined; n = n[k]; } return n; };
  const poe = (p, v) => { const ks = seg(p); let n = raiz; for (let i = 0; i < ks.length - 1; i++) { if (n[ks[i]] == null || typeof n[ks[i]] !== 'object') n[ks[i]] = {}; n = n[ks[i]]; }
    const k = ks[ks.length - 1]; if (v === null || v === undefined) delete n[k]; else n[k] = clone(v); };
  const snap = (p, v) => ({ key: seg(p).slice(-1)[0] || null, val: () => (v === undefined ? null : clone(v)) });
  const vivo = o => !o.off && !caido[o.uid] && atual[o.uid] === o.dev; // ouvinte de um aparelho ligado e conectado
  const avisa = () => ouv.forEach(o => setTimeout(() => {
    if (!vivo(o)) return; const v = pega(o.path);
    if (o.tipo === 'valor') { const j = JSON.stringify(v === undefined ? null : v); if (j !== o.ult) { o.ult = j; o.cb(snap(o.path, v)); } }
    else { Object.keys(v || {}).forEach(k => { if (!o.vistos[k]) { o.vistos[k] = 1; o.cb(snap(o.path + '/' + k, v[k])); } }); } }, 0));
  const depois = (val, ms = LAT) => new Promise(r => setTimeout(() => r(val), ms));
  const M = (uid) => { const dev = ++devN; atual[uid] = dev; delete caido[uid];
    const quando = fn => caido[uid] ? new Promise(res => (fila[uid] = fila[uid] || []).push(() => res(fn()))) : fn(); // sem conexão: a escrita espera
    const nega = (op, path, valor) => { if (!motor) return false; const ok1 = op === 'get' || op === 'ler' ? motor.podeLer(uid, path) : motor.podeEscrever(uid, path, valor); if (!ok1) negados.push({ uid, op, path }); return !ok1; };
    const recusa = () => Promise.reject(Object.assign(new Error('PERMISSION_DENIED: Permission denied'), { code: 'PERMISSION_DENIED' }));
    return {
      app: { initializeApp: () => ({}) },
      auth: { getAuth: () => ({ currentUser: null, authStateReady: () => Promise.resolve() }), signInAnonymously: a => { a.currentUser = { uid }; return Promise.resolve(); } },
      db: {
        getDatabase: () => ({}), ref: (_, p) => ({ path: p }),
        set: (r, v) => quando(() => { if (nega('set', r.path, v)) return recusa(); poe(r.path, v); escritas.push({ path: r.path, valor: clone(v) }); avisa(); return depois(); }),
        get: r => quando(() => nega('get', r.path) ? recusa() : depois(snap(r.path, pega(r.path)), 1)),
        update: (r, o) => quando(() => { if (Object.keys(o).some(k => nega('update', r.path + '/' + k, o[k]))) return recusa(); Object.keys(o).forEach(k => poe(r.path + '/' + k, o[k])); escritas.push({ path: r.path, valor: clone(o) }); avisa(); return depois(); }),
        remove: r => quando(() => { if (nega('remove', r.path, null)) return recusa(); poe(r.path, null); avisa(); return depois(); }),
        push: r => { const k = '-id' + (++idN).toString().padStart(6, '0'); return { path: r.path + '/' + k, key: k }; },
        onValue: (r, cb, ecb) => { if (r.path !== '.info/connected' && nega('ler', r.path)) { setTimeout(() => ecb && ecb({ code: 'PERMISSION_DENIED', message: 'permission_denied' }), 0); return () => {}; }
          if (r.path === '.info/connected') { const c = { uid, dev, cb, off: false }; conn.push(c); if (!caido[uid]) setTimeout(() => { if (!c.off) cb({ val: () => true }); }, 0); return () => { c.off = true; }; }
          const o = { path: r.path, tipo: 'valor', cb, ult: undefined, off: false, uid, dev }; ouv.push(o); avisa(); return () => { o.off = true; }; },
        onChildAdded: (r, cb, ecb) => { if (nega('ler', r.path)) { setTimeout(() => ecb && ecb({ code: 'PERMISSION_DENIED', message: 'permission_denied' }), 0); return () => {}; }
          const o = { path: r.path, tipo: 'filho', cb, vistos: {}, off: false, uid, dev }; ouv.push(o); avisa(); return () => { o.off = true; }; },
        onDisconnect: r => ({ set: v => { desc.push({ uid, dev, path: r.path, v }); return Promise.resolve(); },
          cancel: () => { for (let i = desc.length - 1; i >= 0; i--) if (desc[i].uid === uid && desc[i].dev === dev && desc[i].path === r.path) desc.splice(i, 1); return Promise.resolve(); } }),
        runTransaction: (r, fn) => quando(() => { const novo = fn(clone(pega(r.path))); if (novo === undefined) return depois({ committed: false }, 1); if (nega('transacao', r.path, novo)) return recusa(); poe(r.path, novo); avisa(); return depois({ committed: true }); }),
      } }; };
  // a conexão do aparelho `uid` cai: o servidor aplica os onDisconnect e o próprio aparelho vê .info/connected = false
  const cai = uid => { caido[uid] = true;
    for (let i = desc.length - 1; i >= 0; i--) if (desc[i].uid === uid && desc[i].dev === atual[uid]) { const d = desc.splice(i, 1)[0]; if (motor && !motor.podeEscrever(uid, d.path, d.v)) { negados.push({ uid, op: 'onDisconnect', path: d.path }); continue; } poe(d.path, d.v); escritas.push({ path: d.path, valor: clone(d.v) }); }
    avisa(); conn.filter(c => c.uid === uid && c.dev === atual[uid] && !c.off).forEach(c => c.cb({ val: () => false })); };
  // a conexão volta: as escritas que esperavam são enviadas e o aparelho recebe o que perdeu
  const volta = uid => { delete caido[uid]; (fila[uid] || []).splice(0).forEach(f => f()); avisa();
    conn.filter(c => c.uid === uid && c.dev === atual[uid] && !c.off).forEach(c => c.cb({ val: () => true })); };
  const banco = { M, raiz, escritas, negados, pega, cai, volta, motor }; todosBancos.push(banco); return banco;
}

// ---------------- um aparelho ----------------
function criaArmazem() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); } }; }
function aparelho(nome, banco, uid, opc = {}) {
  const armazem = opc.armazem || criaArmazem();
  const sb = { console: { log: (...a) => console.log(`   [${nome}]`, ...a), error: () => {}, warn: () => {} }, Math, JSON, Object, Array, Number, Set, Map, Infinity, String, Error, Date, Promise, setTimeout, clearTimeout, setInterval, clearInterval, URLSearchParams };
  sb.window = sb; sb.addEventListener = () => {}; vm.createContext(sb);
  sb.Rede = criarRede(() => Promise.resolve(banco.M(uid)), CFG, { armazem });
  const run = (code, f) => vm.runInContext(code, sb, { filename: f || nome });
  run(`
const __els = {}; const LSW = [], LSR = [], ALERTS = [], VIB = [], OPENS = []; let CONFIRMA = true;
let FOCUSED = null, __inp = {}, __box = null;
function mkEl(tag) { const e = { tag, id: '', style: {}, dataset: {}, _in: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} },
  setAttribute(k, v) { this[k] = v; }, appendChild(c) { if (c && c.id) __els[c.id] = c; return c; }, remove() { if (this.id && __els[this.id] === this) delete __els[this.id]; }, querySelector() { return null; }, querySelectorAll() { return []; }, cloneNode() { return mkEl(tag); }, closest() { return null; }, insertAdjacentHTML() {} };
  Object.defineProperty(e, 'innerHTML', { get() { return this._in; }, set(v) { this._in = v;
    if (this === APP) { __inp = {}; (String(v).match(/<input\\b[^>]*>/g) || []).forEach(t => { const g = n => { const m = t.match(new RegExp(n + '="([^"]*)"')); return m ? m[1] : ''; }, id = g('id');
      if (id) __inp[id] = { id, type: g('type') || 'text', value: g('value'), selectionStart: null, selectionEnd: null, focus() { FOCUSED = id; }, setSelectionRange() {} }; });
      FOCUSED = null; /* trocar o innerHTML faz o navegador perder o foco */ __box = /id="modal"/.test(String(v)) ? { scrollTop: 0 } : null; } } }); return e; }
const APP = mkEl('main'); __els.app = APP;
var document = { title: 'Tempo de Colheita', body: mkEl('body'), getElementById: id => __els[id] || __inp[id] || null,
  querySelector: s => s === '#app' ? APP : s === '#modal .box' ? __box : null,
  querySelectorAll: s => /input\\[id\\]/.test(s) ? Object.values(__inp) : [], createElement: mkEl, addEventListener() {}, get activeElement() { return FOCUSED ? __inp[FOCUSED] || null : null; } };
var localStorage = { setItem(k) { LSW.push(k); }, getItem() { return null; }, removeItem(k) { LSR.push(k); } };
var navigator = { vibrate() { VIB.push(1); } };
function alert(m) { ALERTS.push(String(m)); }
function confirm() { return CONFIRMA; }
function migrate() {}
var K = ['trigo', 'soja', 'milho'], CROPS = { trigo: 'Trigo', soja: 'Soja', milho: 'Milho' }, CROP_PRICE = {};
var ASSETS = { ouro: null, cultura: { trigo: null, soja: null, milho: null }, niveis: { 1: { espacos: 1, producao: 2, manut: 1, evolucao: 4 }, 2: { espacos: 1, producao: 4, manut: 2, evolucao: 8 }, 3: { espacos: 2, producao: 8, manut: 3, evolucao: 0 } },
  regras: { moedasIniciais: 300, emprestimo: 100, cartaExtra: 30, precoRecursoGoverno: { trigo: 2, soja: 3, milho: 4 }, maxCompraCamposPorTurno: 2, maxCamposPorJogador: 0, maxMao: 5, limiteDivida: 600, juros: 5, noturnoPct: 50,
    eventoIndividualCada: 1000, cartasPrimeiroTurno: 3, cartasPorTurno: 1, camposRefresh: 'rodada', maxJogadores: 6, minJogadores: 2, cofrePorJogador: 500, recursosIniciais: { trigo: 4, soja: 0, milho: 0 }, camposMax: 3, camposMin: 2, devAtivo: true } };
var CARDS = { plantacao: [], campo: [], individual: [{ id: 'i1', coins: 0, nm: 'ind' }], objetivo: [{ id: 'ob1', t: 'coins', v: 500, nm: 'ob' }], geral: [] };
for (let i = 0; i < 24; i++) CARDS.plantacao.push({ id: 'p' + i, crop: K[i % 3], nivel: 1, nm: 'planta' + i });
for (let i = 0; i < 14; i++) CARDS.campo.push({ id: 'c' + i, slots: 2 + (i % 3), any: i % 4 === 0, types: ['trigo', 'soja', 'milho'], price: 40 + (i % 5) * 20, nm: 'campo' + i });
const NV = c => ASSETS.niveis[c.nivel || 1], free = f => f.c.slots - f.plots.reduce((a, x) => a + NV(x.c).espacos, 0), price = c => c.price, nm = c => c.nm || c.id, desc = c => 'desc:' + (c.nm || c.id), vef = o => o.v || 0, evDesc = e => '';
const cardHTML = c => { if (!c) throw new Error('cardHTML(undefined)'); return '<card ' + (c.id || '') + '>'; };
const isNight = () => false, violou = () => false, refillCenter = () => {};
const done = p => { if (S.players.some(q => q.coins == null)) throw new Error('done() chamado com visão filtrada'); return p.coins >= 99999; };
const vencedorDaRodada = () => S.round >= 25 ? { n: alive()[0].n, why: 'teste' } : null;
function nextRound() { S.round++; const vivos = S.players.map((p, i) => i).filter(i => !S.players[i].out), f = Math.max(0, vivos.indexOf(S.first || 0)); S.order = vivos.slice(f).concat(vivos.slice(0, f)); S.t = 0; S.hide = true; }
const D = { i: () => 0 };
const AVISOS = [];
`, 'prelude');
  ['estado.js', 'consultas.js', 'acoes-turno.js', 'acoes-economia.js', 'acoes-plantio.js', 'acoes-mercado.js', 'comandos.js', 'bot.js', 'menu.js', 'lobby.js', 'pecas-tela.js', 'visao.js', 'janelas.js', 'tela.js', 'zoom.js', 'online.js']
    .forEach(f => run(fs.readFileSync(dir + f, 'utf8'), f));
  run('Menu.aviso = m => { AVISOS.push(String(m)); }; Bot.delay = 0; Z.open = (...a) => { OPENS.push(a); return mkEl("div"); };', 'ajustes');
  if (opc.tempos) run('Object.assign(Online, ' + JSON.stringify(opc.tempos) + ')', 'tempos'); // encurta os tempos de espera (Fase 9)
  return { nome, sb, rede: sb.Rede, uid, armazem, v: code => run(code), html: () => run('APP.innerHTML'), alertas: () => run('ALERTS') };
}

// ---------------- utilitários ----------------
let certos = 0, falhas = 0;
const ok = (c, m) => { if (c) certos++; else { falhas++; console.log('  FALHOU:', m); } };
const espera = ms => new Promise(r => setTimeout(r, ms));
async function ate(cond, m, ms = 4000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (cond()) return true; } catch (e) {} await espera(5); } ok(false, 'tempo esgotado: ' + m); return false; }

// monta sala + dois aparelhos + partida iniciada, conduzindo as telas do LOBBY REAL (lobby.js): Criar Sala, Achar Sala, bot e Iniciar
async function partida(opc = {}) {
  const banco = opc.banco || criaBanco(), host = aparelho('Ana(host)', banco, 'uidHOST', { tempos: opc.tempos }), conv = aparelho('Beto(conv)', banco, 'uidCONV', { tempos: opc.tempos });
  if (opc.cfgDev) host.v('Menu.cfg = ' + JSON.stringify(opc.cfgDev));
  host.v("Menu.ir('criar')"); host.v('__inp.lbNome.value = "Ana"; __inp.lbVagas.value = "3"'); await host.v('Lobby.criar()');
  const cod = host.v('Rede.codigo');
  conv.v("Menu.ir('achar')"); conv.v(`__inp.nomeSala.value = "Beto"; __inp.cod.value = "${cod}"`); await conv.v('Lobby.entrar()');
  await ate(() => host.v('Lobby.lista.length') === 2, 'anfitrião vê o convidado na sala');
  await host.v("Lobby.bot('normal')"); await ate(() => host.v('Lobby.lista.length') === 3, 'bot na sala');
  const chaveBot = host.v('Lobby.lista.find(j => j.bot).uid');
  host.v(`Lobby.quem = ${opc.first === 1 ? "'uidCONV'" : "'uidHOST'"}`);
  await host.v('Lobby.iniciar()');
  await ate(() => host.v('S !== null'), 'anfitrião montou (ou retomou) a partida'); // o início do anfitrião é assíncrono: primeiro vê se há partida salva
  const erros = [...host.v('AVISOS'), ...conv.v('AVISOS')].filter(m => !/Conectando/.test(m)); ok(erros.length === 0, 'lobby real: nenhum aviso de erro ao montar a sala: ' + erros);
  return { banco, host, conv, cod, chaveBot };
}

// avança os turnos (humano do anfitrião, humano convidado, bot) até chegar a vez de `alvo`
async function avanca(host, conv, alvo, max = 60) {
  for (let g = 0; g < max; g++) {
    const i = host.v('S.order[S.t]'); if (i === alvo) return true;
    if (i === 0) { if (host.v('S.hide')) host.v('Cmd.go()'); host.v('Cmd.end()'); }
    else if (i === 1) { await ate(() => conv.v('S.order[S.t] === 1'), 'convidado enxerga a vez', 1500); if (conv.v('S.hide')) { conv.v('Cmd.go()'); await ate(() => conv.v('Online.pend === null'), 'go', 1500); } conv.v('Cmd.end()'); await ate(() => conv.v('Online.pend === null'), 'end', 1500); }
    else await ate(() => host.v('S.order[S.t]') !== 2, 'bot termina', 8000);
    await espera(25);
  }
  return false;
}

// simula FECHAR a página de um aparelho: a conexão cai (o servidor aplica os onDisconnect) e nada mais roda nele
function matar(banco, d) { banco.cai(d.uid); d.v('Online.limpa(); Bot.parar()'); }
module.exports = { REGRAS, todosBancos, LAT, criaBanco, criaArmazem, matar, aparelho, ok, espera, ate, partida, avanca, resumo: () => { if (REGRAS) ok(todosBancos.every(b => b.negados.length === 0), 'SOB AS REGRAS: nenhuma operação do jogo foi negada: ' + JSON.stringify(todosBancos.flatMap(b => b.negados).slice(0, 4))); return { certos, falhas }; } };
