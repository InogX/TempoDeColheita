// Teste em Node da LOJA DE CAMPOS POR JOGADOR (centro que muda a cada turno + trava). Baseado no teste_fase4.js.
// (Antigo:) Teste em Node da Fase 4. Carrega os arquivos REAIS: estado, consultas, acoes-turno/economia/plantio/mercado, comandos, bot.
// Peças FALSAS (não recebi esses arquivos): cartas.js/config.js (dados), cartas-visual.js (free, NV, nm...), rodada.js (nextRound), objetivos.js (done, violou, vencedorDaRodada).
const vm = require('vm'), fs = require('fs'), dir = __dirname + '/';
const sb = { console, Math, JSON, Object, Array, Number, Set, Infinity, String, Error, Date, setTimeout, clearTimeout };
sb.window = sb; vm.createContext(sb);
const run = (code, name) => vm.runInContext(code, sb, { filename: name });

run(`
const DOM = {}; const ALERTS = []; let RENDERS = 0;
var document = { getElementById: id => DOM[id] || null, querySelector: () => null, querySelectorAll: () => [] };
var localStorage = { setItem() {}, getItem() { return null; }, removeItem() {} };
function alert(m) { ALERTS.push(m); }
function render() { RENDERS++; }
function migrate() {}
var K = ['trigo', 'soja', 'milho'], CROPS = { trigo: 'Trigo', soja: 'Soja', milho: 'Milho' }, CROP_PRICE = {};
var ASSETS = { niveis: { 1: { espacos: 1, producao: 2, manut: 1, evolucao: 4 }, 2: { espacos: 1, producao: 4, manut: 2, evolucao: 8 }, 3: { espacos: 2, producao: 8, manut: 3, evolucao: 0 } },
  regras: { moedasIniciais: 300, emprestimo: 100, cartaExtra: 30, precoRecursoGoverno: { trigo: 2, soja: 3, milho: 4 }, maxCompraCamposPorTurno: 2, maxCamposPorJogador: 0, maxMao: 5, limiteDivida: 600, juros: 5,
    noturnoPct: 50, eventoIndividualCada: 1000, cartasPrimeiroTurno: 3, cartasPorTurno: 1, maxJogadores: 6, minJogadores: 2, cofrePorJogador: 500, recursosIniciais: { trigo: 4, soja: 0, milho: 0 }, camposMax: 3, camposMin: 2 } };
var CARDS = { plantacao: [], campo: [], individual: [{ id: 'i1', coins: 0, nm: 'ind' }], objetivo: [{ id: 'ob1', t: 'coins', v: 500, nm: 'ob' }], geral: [] };
for (let i = 0; i < 24; i++) CARDS.plantacao.push({ id: 'p' + i, crop: K[i % 3], nivel: 1, nm: 'planta' + i });
for (let i = 0; i < 14; i++) CARDS.campo.push({ id: 'c' + i, slots: 2 + (i % 3), any: i % 4 === 0, types: ['trigo', 'soja', 'milho'], price: 40 + (i % 5) * 20, nm: 'campo' + i });
const NV = c => ASSETS.niveis[c.nivel || 1], free = f => f.c.slots - f.plots.reduce((a, x) => a + NV(x.c).espacos, 0), price = c => c.price, nm = c => c.nm || c.id, desc = c => '', vef = o => o.v || 0, evDesc = e => '';
const isNight = () => false, done = () => false, violou = () => false, refillCenter = () => {};
const ator = () => 0, sees = (a, b) => a === b;
const vencedorDaRodada = () => S.round >= 25 ? { n: alive()[0].n, why: 'teste' } : null;
function nextRound() { S.round++; const vivos = S.players.map((p, i) => i).filter(i => !S.players[i].out), f = Math.max(0, vivos.indexOf(S.first || 0)); S.order = vivos.slice(f).concat(vivos.slice(0, f)); S.t = 0; S.hide = true; }
`, 'prelude');
['estado.js', 'consultas.js', 'acoes-turno.js', 'acoes-economia.js', 'comandos.js', 'bot.js', 'visao.js'].forEach(f => run(fs.readFileSync(dir + f, 'utf8'), f));

// ações que este teste não carrega (plantio e Mercado): recusam em silêncio
run(`['plantIn', 'up', 'listRes', 'list', 'cancel', 'buyM'].forEach(n => { A[n] = () => recusa('(fora deste teste)'); });`, 'stubs');
run(`
let falhas = 0, certos = 0; const ok = (c, m) => { if (c) certos++; else { falhas++; console.log('  FALHOU:', m); } };
const dica = (r, rx) => !r.ok && rx.test(r.msg || '');
const novo = (bots = ['', '', '']) => { A.new({ nomes: bots.map((b, i) => 'J' + i), bots, first: 0 }); ALERTS.length = 0; };
const uids = p => p.loja.map(c => c.uid);
let r;

// ---------- 1. cada jogador tem a SUA loja, sorteada no início do turno dele ----------
novo(); ok(Cmd.nomes.includes('trava') && Cmd.nomes.length === 16, 'a lista tem 16 comandos, com trava');
ok(S.players.every(p => p.loja.length === 0), 'ninguém tem loja antes de começar o turno');
r = Cmd.run(0, 'trava', [0]); ok(dica(r, /Comece/), 'trava antes de começar o turno recusada: ' + r.msg);
Cmd.run(0, 'go'); const P = S.players, L0 = uids(P[0]);
ok(L0.length === 3 && new Set(L0).size === 3, 'J0 ganha 3 campos com ids diferentes');
ok(P[1].loja.length === 0 && P[2].loja.length === 0, 'os outros ainda não têm loja (cada um recebe no seu turno)');
ok(S.center.length === 0, 'o centro compartilhado ficou vazio');
r = Cmd.run(1, 'trava', [0]); ok(dica(r, /vez/), 'trava fora da vez recusada');

// ---------- 2. comprar sai SÓ da loja de quem comprou ----------
P[0].coins = 1000; const nf = P[0].fields.length; r = Cmd.run(0, 'buyF', [0]);
ok(r.ok && P[0].fields.length === nf + 1 && P[0].loja.length === 2 && !uids(P[0]).includes(L0[0]), 'compra campo da própria loja (a carta sai da loja)');
r = Cmd.run(0, 'buyF', [2]); ok(dica(r, /não está mais à venda/), 'índice fora da loja recusado');

// ---------- 3. trava ----------
ok(Cmd.run(0, 'trava', [0]).ok && P[0].loja[0].trava === true, 'trava o campo 0');
r = Cmd.run(0, 'trava', [1]); ok(dica(r, /só pode travar 1/), 'segunda trava recusada (limite 1): ' + r.msg);
ok(Cmd.run(0, 'trava', [0]).ok && !P[0].loja[0].trava, 'travar de novo destrava');
r = Cmd.run(0, 'trava', [9]); ok(dica(r, /não está mais à venda/), 'trava de índice inexistente recusada');
r = Cmd.run(0, 'trava', ['0']); ok(dica(r, /não está mais à venda/), 'trava com índice texto recusada');
ok(Cmd.run(0, 'trava', [1]).ok, 'trava o campo 1 (agora livre)'); const guardado = P[0].loja[1].uid, naoGuardado = P[0].loja[0].uid;
ok(Cmd.run(0, 'end').ok, 'J0 encerra'); ok(uids(P[0]).includes(guardado), 'a loja de J0 não muda enquanto não é a vez dele');

// ---------- 4. a loja do outro é outra; a trava volta no próximo turno ----------
Cmd.run(1, 'go'); ok(P[1].loja.length === 3, 'J1 recebe a loja dele'); ok(!uids(P[1]).some(u => uids(P[0]).includes(u)), 'as lojas de J0 e J1 não repartem cartas');
Cmd.run(1, 'end'); Cmd.run(2, 'go'); Cmd.run(2, 'end'); // nova rodada
ok(S.round === 2 && S.order[S.t] === 0, 'rodada 2, vez de J0'); Cmd.run(0, 'go');
ok(P[0].loja.length === 3, 'J0 volta a ter 3 campos'); ok(uids(P[0]).includes(guardado), 'o campo travado continua na loja de J0');
ok(!uids(P[0]).includes(naoGuardado), 'o campo que não foi travado foi sorteado de novo');
ok(P[0].loja.every(c => !c.trava), 'a trava vale só uma rodada (voltou destravado)');
Cmd.run(0, 'end'); Cmd.run(1, 'go'); Cmd.run(1, 'end'); Cmd.run(2, 'go'); Cmd.run(2, 'end'); Cmd.run(0, 'go');
ok(!uids(P[0]).includes(guardado), 'sem travar de novo, o campo some no turno seguinte');

// ---------- 5. comprar o campo travado tira a trava ----------
novo(); Cmd.run(0, 'go'); S.players[0].coins = 1000; Cmd.run(0, 'trava', [0]); const u = S.players[0].loja[0].uid;
Cmd.run(0, 'buyF', [0]); ok(!uids(S.players[0]).includes(u) && S.players[0].loja.every(c => !c.trava), 'comprado = sai da loja');
Cmd.run(0, 'end'); Cmd.run(1, 'go'); Cmd.run(1, 'end'); Cmd.run(2, 'go'); Cmd.run(2, 'end'); Cmd.run(0, 'go');
ok(S.players[0].loja.length === 3 && !uids(S.players[0]).includes(u), 'loja completa de novo e sem a carta comprada');

// ---------- 6. regras: trava desligada / várias travas ----------
REG.camposTrava = 0; novo(); Cmd.run(0, 'go'); r = Cmd.run(0, 'trava', [0]); ok(dica(r, /desligada/), 'camposTrava = 0 desliga a trava: ' + r.msg);
REG.camposTrava = 2; novo(); Cmd.run(0, 'go'); ok(Cmd.run(0, 'trava', [0]).ok && Cmd.run(0, 'trava', [1]).ok, 'camposTrava = 2 permite duas'); r = Cmd.run(0, 'trava', [2]);
ok(dica(r, /só pode travar 2/), 'terceira recusada: ' + r.msg);
const ant = uids(S.players[0]).slice(0, 2); Cmd.run(0, 'end'); Cmd.run(1, 'go'); Cmd.run(1, 'end'); Cmd.run(2, 'go'); Cmd.run(2, 'end'); Cmd.run(0, 'go');
ok(ant.every(x => uids(S.players[0]).includes(x)) && S.players[0].loja.length === 3, 'as duas travadas voltam e a loja completa 3');
delete REG.camposTrava;

// ---------- 7. privacidade: cada um só recebe a SUA loja ----------
novo(); Cmd.run(0, 'go'); Cmd.run(0, 'trava', [1]); const v1 = viewFor(1), v0 = viewFor(0), vn = viewFor(null);
ok(v0.players[0].loja.length === 3 && v0.players[0].loja[1].trava === true, 'J0 recebe a loja dele, com a trava');
ok(!('loja' in v1.players[0]) && S.players[0].loja.every(c => !new RegExp('"uid":' + c.uid + '[,}]').test(JSON.stringify(v1))), 'J1 não recebe a loja de J0 (nem as cartas dela)');
ok(S.players[0].loja.every(c => new RegExp('"uid":' + c.uid + '[,}]').test(JSON.stringify(v0))), 'J0 recebe as cartas da própria loja');
ok(vn.players.every(p => !('loja' in p)) && v0.center.length === 0, 'espectador não vê loja; centro compartilhado vazio');

// ---------- 8. save antigo (centro compartilhado) vira loja ----------
novo(); Cmd.run(0, 'go'); const sv = JSON.parse(JSON.stringify(S)); sv.center = sv.players[0].loja; sv.players.forEach(p => delete p.loja);
localStorage.getItem = () => JSON.stringify(sv); A.cont();
ok(S.players.every(p => Array.isArray(p.loja)) && S.players[0].loja.length === 3 && S.center.length === 0, 'A.cont converte o centro do save antigo na loja do jogador da vez');

// ---------- 9. bots: jogam 30 partidas curtas pela loja, sem erro ----------
let travas = 0, compras = 0; const aT = A.trava, aB = A.buyF; A.trava = function (i) { const t = aT.call(this, i); if (t !== false && cur().loja[i] && cur().loja[i].trava) travas++; return t; };
A.buyF = function (i) { const r2 = aB.call(this, i); if (r2 !== false) compras++; return r2; };
// metade das partidas começa com pouco dinheiro (aí o bot quer o campo e não pode pagar: trava)
for (let g = 0; g < 30; g++) { novo(['normal', 'normal', 'facil']); S.players.forEach(p => p.coins = g % 2 ? 300 : 70); Bot.erros = 0; let n = 0; while (!S.win && n++ < 4000) { Bot.acao(); }
  ok(S.win && Bot.erros === 0, 'partida de bots ' + g + ' terminou sem erro (' + Bot.erros + ' erros)');
  ok(S.players.every(p => p.loja.filter(c => c.trava).length <= 1 && p.loja.length <= 3), 'bots respeitam tamanho e limite de trava'); }
console.log('bots: ' + compras + ' compras de campo, ' + travas + ' travas');
ok(compras > 0, 'bots compram campos da própria loja'); ok(travas > 0, 'bots usam a trava');
console.log(certos + ' certos, ' + falhas + ' falhas'); globalThis.FALHAS = falhas;
`, 'teste');

if (sb.FALHAS) process.exitCode = 1;
