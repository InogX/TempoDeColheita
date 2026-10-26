/* Teste da LÓGICA do rede.js em Node. NÃO usa o Firebase de verdade:
   o SDK é substituído por um banco em memória que imita (a) o comportamento
   do Realtime Database (arrays viram objetos, vazios somem, chaves proibidas)
   e (b) a minha transcrição das regras do Apêndice A. Rodar: node teste-rede-node.js */
const { criarRede, CFG, RE_COD } = require('./rede.js');

/* ---------- banco falso ---------- */
function criarFake() {
  let raiz = {}, ouvintes = [], seq = 0;
  const segs = p => p.split('/').filter(Boolean);
  const clone = x => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
  const nav = (r, s) => { let o = r; for (const k of s) { if (o == null || typeof o !== 'object') return null; o = o[k]; } return o === undefined ? null : o; };
  const ler = p => clone(nav(raiz, segs(p)));
  function norm(v) {
    if (v === undefined) throw new Error('set com undefined (o SDK real também recusa)');
    if (v === null || typeof v !== 'object') return v;
    const o = {};
    (Array.isArray(v) ? v.map((x, i) => [i, x]) : Object.entries(v)).forEach(([k, x]) => {
      if (/[.$#\[\]\/]/.test(String(k))) throw new Error('chave proibida: ' + k);
      const n = norm(x); if (n !== null && !(typeof n === 'object' && !Object.keys(n).length)) o[k] = n;
    });
    return Object.keys(o).length ? o : null;
  }
  function aplica(r, s, v) {
    v = norm(v);
    if (!s.length) return v || {};
    const pais = [r]; let o = r;
    for (let i = 0; i < s.length - 1; i++) { if (o[s[i]] == null || typeof o[s[i]] !== 'object') { if (v === null) return r; o[s[i]] = {}; } o = o[s[i]]; pais.push(o); }
    if (v === null) delete o[s[s.length - 1]]; else o[s[s.length - 1]] = v;
    for (let i = s.length - 2; i >= 0; i--) if (!Object.keys(pais[i + 1]).length) delete pais[i][s[i]];
    return r;
  }
  const hostDe = c => { const m = nav(raiz, ['salas', c, 'meta']); return m && m.host != null ? m.host : null; };
  const estadoDe = c => { const m = nav(raiz, ['salas', c, 'meta']); return m ? m.estado : null; };

  /* regras do Apêndice A (minha transcrição) */
  function podeLer(u, s) {
    if (s[0] === '.info') return true;
    if (s[0] !== 'salas' || s.length < 3) return false;
    const k = s[2];
    if (k === 'meta' || k === 'jogadores') return true;
    if (k === 'acoes' || k === 'estado') return hostDe(s[1]) === u;
    if (k === 'visao') return s.length >= 4 && s[3] === u;
    return false;
  }
  function podeEscrever(u, s) {
    if (s[0] !== 'salas' || s.length < 3) return false;
    const c = s[1], k = s[2], host = hostDe(c);
    if (k === 'meta') return RE_COD.test(c) && (host === null || host === u);
    if (k === 'jogadores') {
      if (s.length < 4) return false;
      if (host === u) return true;
      return s[3] === u && (nav(raiz, ['salas', c, 'jogadores', u]) !== null || estadoDe(c) === 'lobby');
    }
    if (k === 'acoes') return s.length >= 4 && (s[3] === u || host === u);
    if (k === 'visao') return s.length >= 4 && host === u;
    if (k === 'estado') return host === u;
    return false;
  }
  const soChaves = (o, ok) => Object.keys(o).every(k => ok.includes(k));
  function valida(r, s) {
    const c = s[1], k = s[2];
    if (k === 'meta') {
      const m = nav(r, ['salas', c, 'meta']); if (!m) return true;
      return m.host !== undefined && typeof m.estado === 'string' && /^(lobby|jogando|fim)$/.test(m.estado)
        && (m.vagas === undefined || (typeof m.vagas === 'number' && m.vagas >= 2 && m.vagas <= 8))
        && (m.criadaEm === undefined || typeof m.criadaEm === 'number') && soChaves(m, ['host', 'estado', 'vagas', 'criadaEm']);
    }
    if (k === 'jogadores' && s.length >= 4) {
      const j = nav(r, ['salas', c, 'jogadores', s[3]]); if (!j) return true;
      return typeof j.nome === 'string' && j.nome.length >= 1 && j.nome.length <= 20
        && (j.idx === undefined || typeof j.idx === 'number') && (j.online === undefined || typeof j.online === 'boolean')
        && (j.bot === undefined || /^(facil|normal)?$/.test(j.bot)) && soChaves(j, ['nome', 'idx', 'online', 'bot']);
    }
    if (k === 'acoes' && s.length >= 4) {
      const caixa = nav(r, ['salas', c, 'acoes', s[3]]); if (!caixa) return true;
      return Object.values(caixa).every(a => a && typeof a.tipo === 'string' && a.tipo.length <= 30 && typeof a.ts === 'number' && soChaves(a, ['tipo', 'args', 'ts']));
    }
    return true;
  }
  const negado = () => { const e = new Error('PERMISSION_DENIED: Permission denied'); e.code = 'PERMISSION_DENIED'; return e; };
  function escreve(cli, path, v) {
    const s = segs(path);
    if (!podeEscrever(cli.uid, s)) throw negado();
    const copia = clone(raiz); const nova = aplica(copia, s, clone(v));
    if (!valida(nova, s)) throw negado();
    raiz = nova; avisa();
  }
  function avisa() {
    ouvintes.slice().forEach(o => {
      if (o.tipo === 'value') {
        const j = JSON.stringify(ler(o.path)); if (j !== o.ult) { o.ult = j; Promise.resolve().then(() => o.vivo && o.cb(snap(o.path))); }
      } else {
        const filhos = Object.keys(ler(o.path) || {}).sort();
        filhos.forEach(k => { if (!o.vistos[k]) { o.vistos[k] = 1; Promise.resolve().then(() => o.vivo && o.cb(snap(o.path + '/' + k))); } });
      }
    });
  }
  const snap = p => ({ key: segs(p).slice(-1)[0], val: () => ler(p), exists: () => ler(p) !== null });

  function sdkPara(uidDoCliente) {
    const cli = { uid: uidDoCliente, discos: [], conectados: [] };
    const R = (db, p) => ({ cli: db.cli, path: segs(p).join('/'), key: segs(p).slice(-1)[0] });
    const db = {
      getDatabase: () => ({ cli }),
      ref: R,
      set: async (r, v) => { escreve(r.cli, r.path, v); },
      update: async (r, o) => { for (const k of Object.keys(o)) escreve(r.cli, r.path + '/' + k, o[k]); },
      remove: async r => { escreve(r.cli, r.path, null); },
      get: async r => { if (!podeLer(r.cli.uid, segs(r.path))) throw negado(); return snap(r.path); },
      push: r => { const k = '-M' + String(++seq).padStart(8, '0'); return R({ cli: r.cli }, r.path + '/' + k); },
      runTransaction: async (r, fn) => {
        if (!podeLer(r.cli.uid, segs(r.path))) throw negado();
        const novo = fn(ler(r.path)); if (novo === undefined) return { committed: false };
        escreve(r.cli, r.path, novo); return { committed: true };
      },
      onDisconnect: r => ({
        set: async v => { r.cli.discos.push({ path: r.path, v }); },
        cancel: async () => { r.cli.discos = r.cli.discos.filter(d => d.path !== r.path); }
      }),
      onValue: (r, cb, err) => {
        if (r.path === '.info/connected') { const o = { cb, vivo: true }; cli.conectados.push(o); Promise.resolve().then(() => cb({ val: () => true })); return () => { o.vivo = false; }; }
        if (!podeLer(r.cli.uid, segs(r.path))) { Promise.resolve().then(() => err && err(negado())); return () => {}; }
        const o = { tipo: 'value', path: r.path, cb, vivo: true, ult: JSON.stringify(ler(r.path)) };
        ouvintes.push(o); Promise.resolve().then(() => o.vivo && cb(snap(r.path)));
        return () => { o.vivo = false; ouvintes = ouvintes.filter(x => x !== o); };
      },
      onChildAdded: (r, cb, err) => {
        if (!podeLer(r.cli.uid, segs(r.path))) { Promise.resolve().then(() => err && err(negado())); return () => {}; }
        const o = { tipo: 'child', path: r.path, cb, vivo: true, vistos: {} };
        ouvintes.push(o); avisa();
        return () => { o.vivo = false; ouvintes = ouvintes.filter(x => x !== o); };
      }
    };
    const auth = { currentUser: null, authStateReady: async () => {} };
    return {
      cli,
      sdk: {
        app: { initializeApp: () => ({}) },
        auth: {
          getAuth: () => auth, initializeAuth: () => auth,
          signInAnonymously: async a => { a.currentUser = { uid: uidDoCliente }; },
          browserSessionPersistence: 'aba', inMemoryPersistence: 'mem'
        },
        db
      }
    };
  }
  /* derruba a conexão do cliente: roda os onDisconnect registrados */
  function cair(cli) { cli.discos.forEach(d => { try { escreve(cli, d.path, d.v); } catch (e) {} }); cli.discos = []; }
  function reconectar(cli) { cli.conectados.forEach(o => o.vivo && o.cb({ val: () => true })); }
  return { sdkPara, ler, cair, reconectar, bruto: () => raiz };
}

/* ---------- mini framework ---------- */
let ok = 0, ko = 0;
function t(nome, cond, extra) { if (cond) { ok++; console.log('  ok  ' + nome); } else { ko++; console.log('  FALHOU  ' + nome + (extra !== undefined ? '  -> ' + JSON.stringify(extra) : '')); } }
async function rejeita(p) { try { await p; return null; } catch (e) { return e.message; } }
const espera = (ms = 15) => new Promise(r => setTimeout(r, ms));

async function main() {
  const fake = criarFake();
  const novo = uid => { const c = fake.sdkPara(uid); const r = criarRede(() => Promise.resolve(c.sdk), CFG); r._cli = c.cli; return r; };

  console.log('1) criar sala');
  const A = novo('uidA'), B = novo('uidB'), C = novo('uidC');
  await A.iniciar(); t('iniciar devolve o uid', A.uid === 'uidA');
  const cod = await A.criar('  Ana  ', 2);
  t('código tem 4-8 caracteres A-Z/0-9', RE_COD.test(cod), cod);
  const meta = fake.ler('salas/' + cod + '/meta');
  t('meta {host, estado:lobby, vagas:2, criadaEm}', meta.host === 'uidA' && meta.estado === 'lobby' && meta.vagas === 2 && typeof meta.criadaEm === 'number', meta);
  const ja = fake.ler('salas/' + cod + '/jogadores/uidA');
  t('anfitrião registrado (idx 0, online, nome sem espaços)', ja.idx === 0 && ja.online === true && ja.nome === 'Ana', ja);
  t('A.ehHost e A.codigo', A.ehHost && A.codigo === cod);

  console.log('2) colisão de código');
  const D = novo('uidD'); let n = 0;
  D._gerarCodigo = () => (n++ < 2 ? cod : 'ZZZZ22');
  const cod2 = await D.criar('Dani', 4);
  t('código repetido é descartado; usa o próximo', cod2 === 'ZZZZ22' && n === 3, { cod2, n });
  t('sala original não foi tomada', fake.ler('salas/' + cod + '/meta').host === 'uidA');

  console.log('3) entrar');
  const info = await B.entrar(' ' + cod.toLowerCase() + ' ', 'Beto');
  t('entra com código em minúsculas/espaços', info.codigo === cod && info.host === false && info.idx === 1, info);
  t('mensagem de sala inexistente', /não encontrada/.test(await rejeita(C.entrar('QQQQ99', 'Cris')) || ''));
  t('código inválido', /inválido/.test(await rejeita(C.entrar('a!', 'Cris')) || ''));
  t('sala cheia (vagas=2)', /cheia/.test(await rejeita(C.entrar(cod, 'Cris')) || ''));
  t('quem recusou não fica "na sala"', C.naSala === false);

  console.log('4) ouvintes de lista e meta');
  let lista = null, metaVista = null;
  A.aoJogadores(l => { lista = l; }); A.aoMeta(m => { metaVista = m; });
  await espera();
  t('host vê 2 jogadores ordenados por idx', lista && lista.length === 2 && lista[0].nome === 'Ana' && lista[1].nome === 'Beto', lista);
  t('aoMeta entrega a meta', metaVista && metaVista.host === 'uidA');

  console.log('5) ação: convidado -> host');
  const recebidas = [];
  A.aoAcao(a => { recebidas.push(a); });
  const args = { texto: 'oi', vazio: [], objVazio: {}, lista: [1, 2, 3], acento: 'ação ç' };
  const id1 = await B.enviar('msg', args);
  await A.enviar('msg', { texto: 'do host' });
  await espera(40);
  t('host recebeu as 2 ações', recebidas.length === 2, recebidas.map(r => r.de));
  const r0 = recebidas.find(r => r.de === 'uidB');
  t('args chegam idênticos (inclui [] e {} vazios)', JSON.stringify(r0.args) === JSON.stringify(args), r0 && r0.args);
  t('id e tipo corretos', r0.id === id1 && r0.tipo === 'msg');
  t('ação processada é apagada do banco', fake.ler('salas/' + cod + '/acoes/uidB') === null);
  const idFim = await B.enviar('fim'); await espera(30); const rf = recebidas.find(r => r.id === idFim); t('args ausente chega como null', rf && rf.tipo === 'fim' && rf.args === null, rf);
  t('tipo longo demais é recusado', /inválido/.test(await rejeita(B.enviar('x'.repeat(31))) || ''));

  console.log('6) visão: host -> convidado (e privacidade)');
  let visaoB = null, visaoA = null;
  B.aoVisao(v => { visaoB = v; }); A.aoVisao(v => { visaoA = v; });
  await A.darVisao('uidB', { mao: ['milho', 'soja'], moedas: 5 });
  await A.darVisoes({ uidA: { mao: [], moedas: 9 } });
  await espera();
  t('B recebeu a visão dele', visaoB && visaoB.moedas === 5 && visaoB.mao.length === 2, visaoB);
  t('A recebeu a própria visão (mão vazia preservada)', visaoA && Array.isArray(visaoA.mao) && visaoA.mao.length === 0, visaoA);
  t('convidado NÃO pode ler a visão do host', /permissão/i.test(await rejeita(B._ler('visao/uidA')) || ''));
  t('convidado lê a própria visão', (await B._ler('visao/uidB')) != null);
  t('convidado não consegue chamar lerEstado (guarda local)', /anfitrião/.test(await rejeita(B.lerEstado()) || ''));
  t('…nem direto no banco (_ler estado)', /permissão/i.test(await rejeita(B._ler('estado')) || ''));
  t('convidado NÃO lê as caixas de ação', /permissão/i.test(await rejeita(B._ler('acoes')) || ''));
  t('convidado não grava visão/estado/meta (guarda local)', /anfitrião/.test(await rejeita(B.darVisao('uidA', {})) || '') && /anfitrião/.test(await rejeita(B.gravarEstado({})) || '') && /anfitrião/.test(await rejeita(B.definirEstado('fim')) || ''));
  const estadoGrande = { rodada: 3, jogadores: [{ mao: [], obj: 'x' }], cofre: 0 };
  await A.gravarEstado(estadoGrande);
  t('host grava e lê o estado completo', JSON.stringify(await A.lerEstado()) === JSON.stringify(estadoGrande));
  t('estado e visão ficam em nós separados', typeof fake.ler('salas/' + cod + '/estado') === 'string' && typeof fake.ler('salas/' + cod + '/visao/uidB') === 'string');

  console.log('7) o servidor (regras emuladas) barra o que o código nem tenta');
  const cliB = B._cli, db = fake.sdkPara('uidB').sdk.db, dbh = db.getDatabase();
  const bruto = async (f) => rejeita(f());
  t('B grava na meta (host)', /PERMISSION/.test(await bruto(() => db.set(db.ref(dbh, 'salas/' + cod + '/meta/estado'), 'fim')) || ''));
  t('B grava na caixa de ação do A', /PERMISSION/.test(await bruto(() => db.set(db.ref(dbh, 'salas/' + cod + '/acoes/uidA/-x'), { tipo: 't', ts: 1 })) || ''));
  t('B grava no jogador do A', /PERMISSION/.test(await bruto(() => db.update(db.ref(dbh, 'salas/' + cod + '/jogadores/uidA'), { nome: 'hack' })) || ''));
  t('B grava fora de /salas', /PERMISSION/.test(await bruto(() => db.set(db.ref(dbh, 'outro/x'), 1)) || ''));
  t('campo extra em jogador é barrado', /PERMISSION/.test(await bruto(() => db.set(db.ref(dbh, 'salas/' + cod + '/jogadores/uidB'), { nome: 'B', idx: 1, online: true, bot: '', extra: 1 })) || ''));
  t('nome com mais de 20 letras é barrado', /PERMISSION/.test(await bruto(() => db.set(db.ref(dbh, 'salas/' + cod + '/jogadores/uidB'), { nome: 'x'.repeat(21), idx: 1, online: true })) || ''));

  console.log('8) início da partida');
  await A.definirEstado('jogando');
  t('meta.estado = jogando', fake.ler('salas/' + cod + '/meta/estado') === 'jogando');
  t('estado inválido recusado', /inválido/.test(await rejeita(A.definirEstado('xx')) || ''));
  const E = novo('uidE');
  t('estranho não entra com a partida em andamento', /começou/.test(await rejeita(E.entrar(cod, 'Eva')) || ''));

  console.log('9) presença e reconexão');
  fake.cair(B._cli); await espera();
  t('queda de conexão marca online=false', fake.ler('salas/' + cod + '/jogadores/uidB/online') === false);
  fake.reconectar(B._cli); await espera();
  t('reconexão marca online=true', fake.ler('salas/' + cod + '/jogadores/uidB/online') === true);
  await B.sair(); t('sair no jogo em andamento só marca offline (mantém a vaga)', fake.ler('salas/' + cod + '/jogadores/uidB/online') === false && B.naSala === false);
  const B2 = novo('uidB'); const back = await B2.entrar(cod, 'Beto');
  t('mesmo uid volta à sala mesmo com jogo em andamento (idx preservado)', back.idx === 1 && fake.ler('salas/' + cod + '/jogadores/uidB/online') === true, back);

  console.log('10) host recarrega a página');
  A.sair && await A.sair();
  await B2.enviar('msg', { n: 1 }); await B2.enviar('msg', { n: 2 });
  const A2 = novo('uidA'); const hb = await A2.entrar(cod, 'Ana');
  t('mesmo uid de novo é reconhecido como host', hb.host === true && A2.ehHost);
  const rep = []; const desliga = A2.aoAcao(a => { rep.push(a.args.n); }); await espera(40);
  t('ações pendentes chegam na ordem e são apagadas', rep.join() === '1,2' && fake.ler('salas/' + cod + '/acoes/uidB') === null, rep);
  desliga();
  const falhando = []; A2.aoAcao(a => { falhando.push(a.args.n); throw new Error('boom'); });
  const origErr = console.error; console.error = () => {};
  await B2.enviar('msg', { n: 3 }); await espera(40); console.error = origErr;
  t('se o consumidor lança erro a ação fica no banco', fake.ler('salas/' + cod + '/acoes/uidB') !== null && falhando.includes(3));

  console.log('11) sair no lobby libera a vaga');
  const F = novo('uidF'), G = novo('uidG');
  const cf = await F.criar('Fer', 2); await G.entrar(cf, 'Gui');
  await G.sair();
  t('convidado que sai do lobby some da lista', fake.ler('salas/' + cf + '/jogadores/uidG') === null);
  const H = novo('uidH'); const h = await H.entrar(cf, 'Hana');
  t('vaga é reaproveitada (idx 1)', h.idx === 1, h);

  console.log('12) convite');
  const L = novo('x');
  t('?sala=abc123 -> ABC123', L.lerConvite('?sala=abc123') === 'ABC123' && L.convite === 'ABC123');
  t('?sala=ab (curto) -> null', L.lerConvite('?sala=ab') === null);
  t('?sala=ABC-12 -> null', L.lerConvite('?sala=ABC-12') === null);
  t('sem parâmetro -> null', L.lerConvite('') === null && L.lerConvite('?x=1') === null);
  t('linkConvite', L.linkConvite('abc123', 'https://u.github.io/jogo/index.html') === 'https://u.github.io/jogo/index.html?sala=ABC123');

  console.log('\nResultado: ' + ok + ' ok, ' + ko + ' falhas');
  process.exit(ko ? 1 : 0);
}
main().catch(e => { console.error('ERRO NO TESTE', e); process.exit(2); });
