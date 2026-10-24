// Teste em Node da Fase 4. Carrega os arquivos REAIS: estado, consultas, acoes-turno/economia/plantio/mercado, comandos, bot.
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
    noturnoPct: 50, eventoIndividualCada: 1000, cartasPrimeiroTurno: 3, cartasPorTurno: 1, camposRefresh: 'rodada', maxJogadores: 6, minJogadores: 2, cofrePorJogador: 500, recursosIniciais: { trigo: 4, soja: 0, milho: 0 }, camposMax: 3, camposMin: 2 } };
var CARDS = { plantacao: [], campo: [], individual: [{ id: 'i1', coins: 0, nm: 'ind' }], objetivo: [{ id: 'ob1', t: 'coins', v: 500, nm: 'ob' }], geral: [] };
for (let i = 0; i < 24; i++) CARDS.plantacao.push({ id: 'p' + i, crop: K[i % 3], nivel: 1, nm: 'planta' + i });
for (let i = 0; i < 14; i++) CARDS.campo.push({ id: 'c' + i, slots: 2 + (i % 3), any: i % 4 === 0, types: ['trigo', 'soja', 'milho'], price: 40 + (i % 5) * 20, nm: 'campo' + i });
const NV = c => ASSETS.niveis[c.nivel || 1], free = f => f.c.slots - f.plots.reduce((a, x) => a + NV(x.c).espacos, 0), price = c => c.price, nm = c => c.nm || c.id, desc = c => '', vef = o => o.v || 0, evDesc = e => '';
const isNight = () => false, done = () => false, violou = () => false, refillCenter = () => {};
const vencedorDaRodada = () => S.round >= 25 ? { n: alive()[0].n, why: 'teste' } : null;
function nextRound() { S.round++; const vivos = S.players.map((p, i) => i).filter(i => !S.players[i].out), f = Math.max(0, vivos.indexOf(S.first || 0)); S.order = vivos.slice(f).concat(vivos.slice(0, f)); S.t = 0; S.hide = true; }
`, 'prelude');
['estado.js', 'consultas.js', 'acoes-turno.js', 'acoes-economia.js', 'acoes-plantio.js', 'acoes-mercado.js', 'comandos.js', 'bot.js'].forEach(f => run(fs.readFileSync(dir + f, 'utf8'), f));

run(`
let falhas = 0, certos = 0; const ok = (c, m) => { if (c) certos++; else { falhas++; console.log('  FALHOU:', m); } };
const dica = (r, rx) => !r.ok && rx.test(r.msg || '');
const novo = (bots = ['', '', '']) => { A.new({ nomes: bots.map((b, i) => 'J' + i), bots, first: 0 }); ALERTS.length = 0; };

// ---------- 1. vez e fase do turno ----------
novo(); let r;
ok(Cmd.nomes.length === 15, 'a lista tem 15 comandos');
r = Cmd.run(1, 'go'); ok(dica(r, /vez/), 'go fora da vez recusado: ' + r.msg);
r = Cmd.run(0, 'end'); ok(dica(r, /Comece/), 'end antes do go recusado: ' + r.msg);
r = Cmd.run(0, 'sell', ['trigo']); ok(dica(r, /Comece/), 'sell antes do go recusado');
r = Cmd.run(0, 'go'); ok(r.ok && S.hide === false, 'go na vez funciona');
const turns0 = S.players[0].turns; r = Cmd.run(0, 'go'); ok(dica(r, /já começou/) && S.players[0].turns === turns0, 'go duas vezes recusado e não produz de novo');
r = Cmd.run(1, 'loan'); ok(dica(r, /vez/) && S.players[1].debt === 0, 'jogador fora da vez não pega empréstimo');
ok(ALERTS.length === 0, 'modo mudo não mostra alert');

// ---------- 2. economia ----------
const p0 = S.players[0]; p0.res.trigo = 10; p0.res.soja = 0; p0.coins = 300;
r = Cmd.run(0, 'sell', ['constructor']); ok(dica(r, /Recurso inválido/), 'recurso inválido (constructor)');
r = Cmd.run(0, 'sell', ['trigo', -3]); ok(dica(r, /quantidade/), 'quantidade negativa');
r = Cmd.run(0, 'sell', ['trigo', 'abc']); ok(dica(r, /quantidade/), 'quantidade texto');
r = Cmd.run(0, 'sell', ['trigo', NaN]); ok(dica(r, /quantidade/), 'quantidade NaN');
r = Cmd.run(0, 'sell', ['trigo', Infinity]); ok(dica(r, /quantidade/), 'quantidade Infinity');
let c0 = p0.coins; r = Cmd.run(0, 'sell', ['trigo', 4]); ok(r.ok && p0.res.trigo === 6 && p0.coins === c0 + 4 * govPreco('trigo'), 'vende 4');
r = Cmd.run(0, 'sell', ['trigo']); ok(r.ok && p0.res.trigo === 0, 'sem quantidade vende tudo');
r = Cmd.run(0, 'sell', ['soja']); ok(dica(r, /Sem estoque/), 'sem estoque recusa com o motivo da própria ação');
r = Cmd.run(0, 'loan'); ok(r.ok && p0.debt === 100, 'empréstimo'); r = Cmd.run(0, 'pay'); ok(r.ok && p0.debt === 0, 'paga');
r = Cmd.run(0, 'pay'); ok(dica(r, /não tem dívida/), 'pagar sem dívida recusa');
const m0 = p0.hand.length; r = Cmd.run(0, 'extra'); ok(r.ok && p0.hand.length === m0 + 1, 'carta extra');
r = Cmd.run(0, 'buyF', [99]); ok(dica(r, /não está mais à venda/), 'campo inexistente');
r = Cmd.run(0, 'buyF', [-1]); ok(dica(r, /não está mais à venda/), 'índice negativo');
r = Cmd.run(0, 'buyF', ['0']); ok(dica(r, /não está mais à venda/), 'índice texto');
p0.coins = 500; const nf = p0.fields.length; r = Cmd.run(0, 'buyF', [0]); ok(r.ok && p0.fields.length === nf + 1, 'compra campo');

// ---------- 3. plantio ----------
p0.hand = [{ id: 'x', crop: 'trigo', nivel: 1, uid: 900 }, { id: 'y', crop: 'soja', nivel: 1, uid: 901 }]; p0.fields[0].c.any = true; p0.fields[0].c.slots = 3; p0.fields[0].plots = [];
r = Cmd.run(0, 'plantIn', [0, null]); ok(dica(r, /Nenhuma carta/), 'plantIn sem carta (null)');
r = Cmd.run(0, 'plantIn', [0]); ok(dica(r, /Nenhuma carta/), 'plantIn sem carta (faltando)');
r = Cmd.run(0, 'plantIn', [0, 'x']); ok(dica(r, /Campo inválido/), 'plantIn com texto');
r = Cmd.run(0, 'plantIn', [5, 0]); ok(dica(r, /Campo inválido/), 'plantIn campo que não existe');
r = Cmd.run(0, 'plantIn', [0, 7]); ok(dica(r, /Nenhuma carta/), 'plantIn carta que não existe');
UI.plantSel = 1; r = Cmd.run(0, 'plantIn', [0, 0]); ok(r.ok && p0.fields[0].plots.length === 1 && p0.hand.length === 1, 'plantIn explícito funciona (a carta da mão)');
ok(UI.plantSel === null, 'jogo local: plantIn limpa a carta escolhida (como antes)');
p0.res.trigo = 20; r = Cmd.run(0, 'up', [0, 0]); ok(r.ok && p0.fields[0].plots[0].c.nivel === 2 && p0.res.trigo === 16, 'evolui');
r = Cmd.run(0, 'up', [0, 9]); ok(dica(r, /não encontrado/), 'evoluir plantio inexistente'); r = Cmd.run(0, 'up', ['a', 0]); ok(dica(r, /não encontrado/), 'evoluir com texto');

// ---------- 4. Feira ----------
r = Cmd.run(0, 'buyFeira', ['trigo', 1]); ok(dica(r, /Feira/), 'sem Feira ativa');
S.ev.push({ c: { fx: 'feira', preco: 2, limite: 5 }, stock: { trigo: 10, soja: 10, milho: 10 }, left: 1 }); p0.coins = 100; c0 = p0.coins;
r = Cmd.run(0, 'buyFeira', ['trigo', 3]); ok(r.ok && p0.coins === c0 - 6, 'compra 3 na Feira');
r = Cmd.run(0, 'buyFeira', ['trigo']); ok(r.ok && ((S.ev[0].bought || {})[0] || {}).trigo === 5, 'sem quantidade compra o máximo (limite 5): ' + JSON.stringify(S.ev[0].bought));
r = Cmd.run(0, 'buyFeira', ['trigo', 1]); ok(!r.ok, 'além do limite recusa'); r = Cmd.run(0, 'buyFeira', ['trigo', 'x']); ok(dica(r, /quantidade/), 'quantidade texto na Feira');
S.ev = [];

// ---------- 5. Mercado (qualquer hora, atua pelo remetente) ----------
p0.res.trigo = 9; S.players[1].coins = 200; S.players[1].res.soja = 5; UI.actor = null; ALERTS.length = 0;
r = Cmd.run(0, 'listRes', ['trigo', 3, 5]); ok(r.ok && S.mk.length === 1 && S.mk[0].s === 0 && p0.res.trigo === 6, 'oferta de recurso (remetente 0)');
r = Cmd.run(0, 'listRes', ['trigo', 3, 5]); ok(dica(r, /já tem uma oferta/), 'oferta duplicada');
r = Cmd.run(0, 'listRes', ['trigo', 0, 5]); ok(dica(r, /quantidade e preço/), 'quantidade 0'); r = Cmd.run(0, 'listRes', ['trigo', 2, -1]); ok(dica(r, /quantidade e preço/), 'preço negativo');
r = Cmd.run(0, 'listRes', ['constructor', 2, 5]); ok(dica(r, /Recurso inválido/), 'recurso inválido no mercado');
r = Cmd.run(0, 'listRes', ['soja', 99, 5]); ok(dica(r, /Estoque insuficiente/), 'estoque insuficiente');
const idO = S.mk[0].id, cv0 = p0.coins; r = Cmd.run(1, 'buyM', [idO]); ok(r.ok && S.players[1].coins === 185 && p0.coins === cv0 + 15 && S.players[1].res.trigo === 7 && S.mk.length === 0, 'jogador 1 compra FORA da vez dele (Mercado)');
ok(UI.actor === null, 'o "atuar como" do aparelho volta como estava (null)');
r = Cmd.run(0, 'listRes', ['trigo', 2, 4]); const id2 = S.mk[0].id;
r = Cmd.run(1, 'cancel', [id2]); ok(dica(r, /não é sua/), 'não cancela oferta alheia'); r = Cmd.run(0, 'buyM', [id2]); ok(dica(r, /própria oferta/), 'não compra a própria oferta');
r = Cmd.run(0, 'cancel', [id2]); ok(r.ok && S.mk.length === 0, 'cancela a própria');
r = Cmd.run(0, 'buyM', ['abc']); ok(!r.ok, 'id texto'); r = Cmd.run(0, 'buyM', [12345]); ok(dica(r, /não existe/), 'oferta inexistente');
p0.hand = [{ id: 'z', crop: 'soja', nivel: 1, uid: 777 }];
r = Cmd.run(1, 'list', ['hand', 777, 10]); ok(dica(r, /não é seu/), 'não oferta carta de outro');
r = Cmd.run(0, 'list', ['hand', 777]); ok(dica(r, /Informe o preço/), 'oferta sem preço'); r = Cmd.run(0, 'list', ['coisa', 777, 10]); ok(dica(r, /Tipo/), 'tipo inválido');
r = Cmd.run(0, 'list', ['hand', 777, 10]); ok(r.ok && S.mk.length === 1, 'oferta de carta'); r = Cmd.run(1, 'buyM', [S.mk[0].id]); ok(r.ok && S.players[1].hand.some(c => c.uid === 777), 'compra a carta');
S.ev.push({ c: { fx: 'embargo' }, left: 1 }); r = Cmd.run(0, 'listRes', ['trigo', 1, 1]); ok(dica(r, /Embargo/), 'Embargo fecha o Mercado'); S.ev = [];
S.players[2].out = true; r = Cmd.run(2, 'listRes', ['trigo', 1, 1]); ok(dica(r, /fora da partida/), 'eliminado não age'); S.players[2].out = false;

// ---------- 6. espiar ----------
const vez = S.order[S.t]; S.peekPend = vez;
r = Cmd.run(vez, 'sell', ['trigo']); ok(dica(r, /espiar primeiro/), 'espiar pendente bloqueia as outras ações do turno');
r = Cmd.run(vez, 'end'); ok(dica(r, /espiar primeiro/), 'end bloqueado com espiar pendente');
[vez, 99, -1, '1', 1.5, null].forEach(i => { r = Cmd.run(vez, 'peek', [i]); ok(dica(r, /inválido/), 'peek alvo inválido: ' + i); });
S.players[2].out = true; r = Cmd.run(vez, 'peek', [2]); ok(dica(r, /inválido/), 'peek em jogador eliminado'); S.players[2].out = false;
r = Cmd.run((vez + 1) % 3, 'peek', [vez]); ok(dica(r, /vez/), 'peek de quem não está na vez');
r = Cmd.run(vez, 'peek', [(vez + 1) % 3]); ok(r.ok && S.peek.to === (vez + 1) % 3 && S.peekPend === null, 'peek válido');
r = Cmd.run(vez, 'peek', [(vez + 1) % 3]); ok(dica(r, /ninguém para espiar/), 'peek sem pendência');

// ---------- 7. entradas estranhas ----------
['constructor', '__proto__', 'tentar', 'new', 'quit', 'cont', 'modal', 'act', 'pick', 'toString', '', null, 5, {}].forEach(n => { r = Cmd.run(0, n, []); ok(dica(r, /desconhecido/), 'nome estranho recusado: ' + String(n)); });
[null, 'abc', {}, 7, undefined].forEach(a => { try { r = Cmd.run(0, 'sell', a); ok(true, ''); } catch (e) { ok(false, 'args estranho lançou: ' + a); } });
['x', null, -1, 99, 1.5, {}].forEach(q => { r = Cmd.run(q, 'loan'); ok(dica(r, /inválido|vez/), 'remetente estranho recusado: ' + String(q)); });
const sv = S; S = null; r = Cmd.run(0, 'loan'); ok(dica(r, /andamento/), 'sem partida'); S = sv;
S.win = { n: 'x' }; r = Cmd.run(vez, 'end'); ok(dica(r, /andamento/), 'partida acabada: nada vale'); S.win = null;

// ---------- 8. encerrar turno e passar a vez ----------
const v1 = S.order[S.t]; r = Cmd.run(v1, 'end'); ok(r.ok && S.order[S.t] !== v1 && S.hide === true, 'end passa a vez e volta para a tela de "pronto"');
r = Cmd.run(v1, 'go'); ok(dica(r, /vez/), 'quem acabou de jogar não começa de novo');

// ---------- 9. uso local (botões) ----------
novo(); Cmd.go(); S.players[0].res.trigo = 3; ALERTS.length = 0;
r = Cmd.sell('soja'); ok(!r.ok && ALERTS.length === 1 && /Sem estoque/.test(ALERTS[0]), 'botão: recusa mostra o alert: ' + ALERTS);
r = Cmd.sell('trigo'); ok(r.ok && ALERTS.length === 1, 'botão: sucesso sem alert');
ALERTS.length = 0; r = Cmd.list('field', 999); ok(!r.ok && /Informe o preço/.test(ALERTS[0]), 'botão: list sem preço pede o preço');
S.players[0].res.soja = 6; DOM.rqsoja = { value: '2' }; DOM.rpsoja = { value: '7' }; r = Cmd.listRes('soja'); ok(r.ok && S.mk[0].qty === 2 && S.mk[0].price === 7, 'botão: listRes lê os campos da tela');
DOM.rqsoja = { value: '' }; ALERTS.length = 0; r = Cmd.listRes('soja'); ok(!r.ok && /quantidade e preço/.test(ALERTS[0]), 'botão: campo vazio avisa');
S.players[0].res.milho = 4; S.ev.push({ c: { fx: 'feira', preco: 1, limite: 3 }, stock: { trigo: 9, soja: 9, milho: 9 }, left: 1 }); DOM.fqtrigo = { value: '2' }; r = Cmd.buyFeira('trigo'); ok(r.ok && S.ev[0].bought[0].trigo === 2, 'botão: Feira lê a quantidade da tela'); S.ev = [];
S.players[1].res.trigo = 5; UI.actor = 1; r = Cmd.listRes('trigo'); ok(true, ''); DOM.rqtrigo = { value: '3' }; DOM.rptrigo = { value: '2' }; r = Cmd.listRes('trigo');
ok(r.ok && S.mk.some(l => l.s === 1 && l.crop === 'trigo') && S.players[1].res.trigo === 2, 'botão: "atuar como" oferta pelo jogador escolhido (1), mesmo na vez do 0'); UI.actor = null;
const jogou = S.players[0].hand.length; S.players[0].hand.push({ id: 'q', crop: 'trigo', nivel: 1, uid: 4242 }); S.players[0].fields.push({ c: { any: true, slots: 3, types: K, uid: 5 }, plots: [] }); UI.plantSel = S.players[0].hand.length - 1;
r = Cmd.plantIn(S.players[0].fields.length - 1); ok(r.ok, 'botão: plantIn usa a carta escolhida (UI.plantSel)'); UI.plantSel = null; ALERTS.length = 0; r = Cmd.plantIn(0); ok(!r.ok && /Nenhuma carta/.test(ALERTS[0]), 'botão: plantIn sem carta escolhida avisa');

// ---------- 10. pedido de OUTRO aparelho (online): a interface do anfitrião não muda ----------
novo(); Cmd.run(0, 'go'); EU = 2; UI.modal = 'mkt'; UI.plantSel = 3; UI.actor = 2; UI.viewing = 1; RENDERS = 0; S.players[0].res.trigo = 5;
r = Cmd.run(0, 'sell', ['trigo']); ok(r.ok && UI.modal === 'mkt' && UI.plantSel === 3 && UI.actor === 2 && UI.viewing === 1 && RENDERS >= 2, 'online: pedido remoto não mexe na UI do anfitrião e redesenha (renders=' + RENDERS + ')');
r = Cmd.run(0, 'end'); ok(r.ok && UI.modal === 'mkt' && UI.plantSel === 3, 'online: end remoto não fecha a janela do anfitrião');
r = Cmd.run(1, 'listRes', ['trigo', 1, 1]); ok(UI.actor === 2 && UI.modal === 'mkt', 'online: Mercado remoto não troca o "atuar como" do anfitrião');
EU = null; UIreset();

// ---------- 11. bots: o jogador bot passa pela camada, e as recusas são motivo, não validação ----------
const motivos = {}, runOrig = Cmd.run; Cmd.run = (q, n, a, m) => { const x = runOrig(q, n, a, m); if (!x.ok) motivos[n + ': ' + x.msg] = (motivos[n + ': ' + x.msg] || 0) + 1; return x; };
const rel = Bot.simular(12, 3, ['normal', 'facil']); Cmd.run = runOrig;
ok(rel.terminaram === 12 && Object.keys(rel.erros).length === 0, 'Bot.simular (12 partidas, peças falsas): terminaram=' + rel.terminaram + ' erros=' + JSON.stringify(rel.erros));
const ruins = Object.keys(motivos).filter(k => /inválid|Informe|desconhecido|Comece|Não é a sua vez|já começou|espiar primeiro|andamento|fora da partida|ninguém/.test(k));
ok(ruins.length === 0, 'o bot nunca é barrado pela validação da camada: ' + JSON.stringify(ruins.map(k => k + ' x' + motivos[k])));
console.log('  recusas normais das ações (bot tenta e a regra nega):', JSON.stringify(motivos));
console.log('\\n== Fase 4: ' + certos + ' conferências certas, ' + falhas + ' falhas ==');
`, 'testes');
