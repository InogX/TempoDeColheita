/* =====================================================================
   FICHA TÉCNICA — rede.js (Fase 5)
   Transporte online do "Tempo de Colheita". É o ÚNICO arquivo que conhece
   o Firebase. Para trocar de serviço no futuro, reescreva só este arquivo
   mantendo a interface `Rede.*` (abaixo).

   - Não depende de S, A, Menu etc. Pode ser carregado em qualquer posição
     antes de iniciar.js (sugestão: logo depois de bot.js).
   - O SDK do Firebase só é baixado quando se chama Rede.iniciar()
     (jogo offline não gasta nada e continua igual).
   - Firebase JS SDK 12.19.0 (versão fixa), carregado de gstatic.com via
     import() dinâmico: funciona em site estático (GitHub Pages), sem build.

   ESTRUTURA GRAVADA (as regras do Apêndice A do plano assumem esta):
     /salas/{COD}/meta              { host, estado, vagas, criadaEm }
     /salas/{COD}/jogadores/{uid}   { nome, idx, online, bot }
     /salas/{COD}/acoes/{uid}/{id}  { tipo, args, ts }
     /salas/{COD}/visao/{uid}       texto JSON (visão filtrada; dono lê)
     /salas/{COD}/estado            texto JSON (estado completo; só host)
   `args`, `visao/{uid}` e `estado` são gravados como TEXTO JSON. Motivo: o
   Realtime Database apaga arrays/objetos vazios, converte arrays em objetos
   e recusa chaves com . $ # [ ] / — o texto JSON volta idêntico ao enviado.

   INTERFACE (tudo devolve Promise, exceto onde indicado)
     Rede.iniciar(op)            login anônimo; devolve o uid.
                                 op.persistencia: 'local' (padrão), 'aba'
                                 (uid por aba; serve p/ testar 2 abas no mesmo
                                 navegador) ou 'memoria'.
     Rede.criar(nome, vagas)     cria sala; devolve o CÓDIGO. Quem cria é o host.
     Rede.entrar(codigo, nome)   entra (ou volta) numa sala; devolve {codigo, host, idx}.
     Rede.enviar(tipo, args)     escreve uma ação na caixa do jogador; devolve o id.
     Rede.aoAcao(fn)             (host) fn({de,id,tipo,args,ts}) para cada ação de
                                 cada jogador. Depois que fn retorna sem erro a ação
                                 é apagada do banco. Se fn lançar erro, ela fica e
                                 será entregue de novo (entrega "ao menos uma vez":
                                 quem consome deve ignorar id repetido).
     Rede.aoVisao(fn)            fn(visao) a cada nova visão do PRÓPRIO jogador.
     Rede.aoJogadores(fn)        fn([{uid,nome,idx,online,bot}]) ordenado por idx.
     Rede.aoMeta(fn)             fn(meta) (null se a sala sumiu).
        (os quatro "ao..." devolvem uma função que desliga o ouvinte)
     Rede.darVisao(uid, obj)     (host) grava a visão de um jogador.
     Rede.darVisoes({uid:obj})   (host) várias de uma vez.
     Rede.gravarEstado(obj) / Rede.lerEstado()   (host) estado completo.
     Rede.definirEstado(est)     (host) 'lobby' | 'jogando' | 'fim'.
     Rede.sair()                 desliga ouvintes e sai da sala.
     Rede.lerConvite(busca)      (síncrono) lê ?sala=CODIGO; guarda em Rede.convite.
     Rede.linkConvite(codigo)    (síncrono) monta o link de convite.
     Propriedades: Rede.uid, Rede.codigo, Rede.ehHost, Rede.naSala, Rede.convite.

   FICA PARA AS PRÓXIMAS FASES: bots como jogadores (Fase 6), reatribuir idx
   no início da partida (Fase 6; aqui o idx é provisório), reconexão com uid
   novo e limpeza de salas antigas (Fase 9).
   ===================================================================== */
(function (raiz) {
  'use strict';

  var VERSAO_SDK = '12.19.0';

  var CFG = {
    apiKey: 'AIzaSyDH_9pyOM6Czj50EziAW0GTWPsDKuYuRMY',
    authDomain: 'tempodecolheita.firebaseapp.com',
    databaseURL: 'https://tempodecolheita-default-rtdb.firebaseio.com',
    projectId: 'tempodecolheita',
    storageBucket: 'tempodecolheita.firebasestorage.app',
    messagingSenderId: '913427944483',
    appId: '1:913427944483:web:d38959695793cede670d96'
  };

  var ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sem 0/O/1/I/L (evita confusão)
  var TAM_COD = 6;
  var RE_COD = /^[A-Z0-9]{4,8}$/;

  function carregarSDK() {
    var base = 'https://www.gstatic.com/firebasejs/' + VERSAO_SDK + '/';
    return Promise.all([
      import(base + 'firebase-app.js'),
      import(base + 'firebase-auth.js'),
      import(base + 'firebase-database.js')
    ]).then(function (m) { return { app: m[0], auth: m[1], db: m[2] }; });
  }

  function falha(msg) { var e = new Error(msg); e.proprio = true; return e; }

  function traduz(e) {
    if (e && e.proprio) return e;
    var c = String((e && e.code) || '');
    var m = String((e && e.message) || e || '');
    var t = m;
    if (/unauthorized-domain/.test(c + m)) t = 'Este endereço não está autorizado no Firebase (Authentication > Configurações > Domínios autorizados).';
    else if (/operation-not-allowed|admin-restricted/.test(c + m)) t = 'O login anônimo não está ativado no Firebase.';
    else if (/network-request-failed/.test(c + m)) t = 'Sem conexão com a internet.';
    else if (/permission[_-]denied/i.test(c + m)) t = 'Sem permissão no banco (confira as regras do Realtime Database).';
    else if (/offline/i.test(m)) t = 'Sem conexão com o banco de dados.';
    var er = new Error(t); er.original = e; er.proprio = true;
    return er;
  }

  function envolve(fn) {
    return function () {
      var self = this, args = arguments;
      return Promise.resolve().then(function () { return fn.apply(self, args); })
        .catch(function (e) { throw traduz(e); });
    };
  }

  function normaliza(c) {
    c = String(c == null ? '' : c).trim().toUpperCase();
    return RE_COD.test(c) ? c : null;
  }
  function limpaNome(n) {
    n = String(n == null ? '' : n).trim().slice(0, 20);
    return n || 'Jogador';
  }
  function gerarCodigo() {
    var r = new Uint8Array(TAM_COD), s = '', i;
    if (raiz.crypto && raiz.crypto.getRandomValues) raiz.crypto.getRandomValues(r);
    else for (i = 0; i < TAM_COD; i++) r[i] = Math.floor(Math.random() * 256);
    for (i = 0; i < TAM_COD; i++) s += ALFABETO.charAt(r[i] % ALFABETO.length);
    return s;
  }
  function ser(x) { return JSON.stringify(x === undefined ? null : x); }
  function le(t) { try { return JSON.parse(t); } catch (e) { return null; } }

  /* Cada chamada cria uma "conexão" independente (útil nos testes: uma por aba). */
  function criarRede(carregar, cfg) {
    var M = null, db = null, auth = null, uid = null, app = null;
    var sala = null;       // { cod, host }
    var offs = [];         // funções que desligam ouvintes
    var preso = null;      // ref de jogadores/{uid}/online (para cancelar onDisconnect)
    var inicio = null;
    var Rede = { convite: null };

    function ref(caminho) { return M.db.ref(db, caminho); }
    function rs(sub) { return ref('salas/' + sala.cod + (sub ? '/' + sub : '')); }
    function exigeSala() { if (!sala) throw falha('Você não está em uma sala.'); }
    function exigeHost() { exigeSala(); if (!sala.host) throw falha('Só o anfitrião pode fazer isso.'); }
    function erroOuvinte(e) {
      var t = traduz(e);
      if (typeof Rede.aoErro === 'function') Rede.aoErro(t); else console.warn('[rede]', t.message);
    }
    function guarda(off) { offs.push(off); return off; }

    Object.defineProperty(Rede, 'uid', { get: function () { return uid; } });
    Object.defineProperty(Rede, 'codigo', { get: function () { return sala ? sala.cod : null; } });
    Object.defineProperty(Rede, 'ehHost', { get: function () { return !!(sala && sala.host); } });
    Object.defineProperty(Rede, 'naSala', { get: function () { return !!sala; } });

    Rede.iniciar = function (op) {
      op = op || {};
      if (inicio) return inicio;
      inicio = Promise.resolve().then(function () { return carregar(); }).then(function (mod) {
        M = mod;
        app = M.app.initializeApp(cfg);
        var pers = op.persistencia === 'aba' ? M.auth.browserSessionPersistence
                 : op.persistencia === 'memoria' ? M.auth.inMemoryPersistence : null;
        auth = pers ? M.auth.initializeAuth(app, { persistence: pers }) : M.auth.getAuth(app);
        return (auth.authStateReady ? auth.authStateReady() : Promise.resolve());
      }).then(function () {
        return auth.currentUser ? null : M.auth.signInAnonymously(auth);
      }).then(function () {
        uid = auth.currentUser.uid;
        db = M.db.getDatabase(app);
        return uid;
      }).catch(function (e) { inicio = null; throw traduz(e); });
      return inicio;
    };

    /* presença: online=true ao conectar; false se a conexão cair */
    function presenca() {
      var online = ref('salas/' + sala.cod + '/jogadores/' + uid + '/online');
      preso = online;
      guarda(M.db.onValue(ref('.info/connected'), function (s) {
        if (s.val() === true) {
          M.db.onDisconnect(online).set(false).catch(function () {});
          M.db.set(online, true).catch(function () {});
        }
      }));
    }

    Rede.criar = envolve(function (nome, vagas) {
      return Rede.iniciar().then(function () {
        vagas = Math.max(2, Math.min(8, parseInt(vagas, 10) || 4));
        nome = limpaNome(nome);
        return sala ? Rede.sair() : null;
      }).then(function () {
        var tentativas = 0;
        function tenta() {
          if (tentativas++ >= 8) throw falha('Não foi possível criar a sala. Tente de novo.');
          var c = (Rede._gerarCodigo || gerarCodigo)();
          return M.db.runTransaction(ref('salas/' + c + '/meta'), function (atual) {
            if (atual) return;                       // código já usado: aborta
            return { host: uid, estado: 'lobby', vagas: vagas, criadaEm: Date.now() };
          }).then(function (r) { return r.committed ? c : tenta(); });
        }
        return tenta();
      }).then(function (cod) {
        sala = { cod: cod, host: true };
        return M.db.set(rs('jogadores/' + uid), { nome: limpaNome(nome), idx: 0, online: true, bot: '' })
          .then(function () { presenca(); return cod; })
          .catch(function (e) { sala = null; throw e; });
      });
    });

    Rede.entrar = envolve(function (codigo, nome) {
      var cod = normaliza(codigo);
      if (!cod) throw falha('Código inválido (use de 4 a 8 letras ou números).');
      nome = limpaNome(nome);
      var meta, js;
      return Rede.iniciar().then(function () {
        return sala ? Rede.sair() : null;
      }).then(function () {
        return M.db.get(ref('salas/' + cod + '/meta'));
      }).then(function (s) {
        meta = s.val();
        if (!meta) throw falha('Sala não encontrada.');
        return M.db.get(ref('salas/' + cod + '/jogadores'));
      }).then(function (s) {
        js = s.val() || {};
        var ehHost = meta.host === uid;
        var eu = js[uid];
        var ref_eu = ref('salas/' + cod + '/jogadores/' + uid);
        sala = { cod: cod, host: ehHost };
        function fim(idx) { presenca(); return { codigo: cod, host: ehHost, idx: idx }; }
        function desfaz(e) { sala = null; throw e; }
        if (eu) {                                       // volta à sala (mesmo uid)
          return M.db.update(ref_eu, { online: true }).then(function () { return fim(eu.idx); }, desfaz);
        }
        if (meta.estado !== 'lobby') desfaz(falha('A partida já começou.'));
        var usados = {}, n = 0, k;
        for (k in js) { n++; usados[js[k].idx] = true; }
        if (n >= (meta.vagas || 8)) desfaz(falha('Sala cheia.'));
        var idx = 0; while (usados[idx]) idx++;
        return M.db.set(ref_eu, { nome: nome, idx: idx, online: true, bot: '' })
          .then(function () { return fim(idx); }, desfaz);
      });
    });

    Rede.enviar = envolve(function (tipo, args) {
      return Promise.resolve().then(function () {
        exigeSala();
        tipo = String(tipo == null ? '' : tipo);
        if (!tipo || tipo.length > 30) throw falha('Tipo de ação inválido.');
        var r = M.db.push(rs('acoes/' + uid));
        return M.db.set(r, { tipo: tipo, args: ser(args), ts: Date.now() }).then(function () { return r.key; });
      });
    });

    /* HOST: ouve a caixa de ação de cada jogador (menos bots) */
    Rede.aoAcao = function (fn) {
      exigeHost();
      var cod = sala.cod, vistos = {}, fila = Promise.resolve(), meus = [], ligado = true;
      var offExterno = M.db.onChildAdded(rs('jogadores'), function (js) {
        var de = js.key, j = js.val() || {};
        if (vistos[de] || j.bot) return;
        vistos[de] = true;
        var offInterno = M.db.onChildAdded(ref('salas/' + cod + '/acoes/' + de), function (as) {
          var id = as.key, v = as.val();
          fila = fila.then(function () {
            if (!ligado) return;
            var ok = v && typeof v.tipo === 'string';
            var p = ok ? Promise.resolve().then(function () {
              return fn({ de: de, id: id, tipo: v.tipo, args: le(v.args), ts: v.ts });
            }) : Promise.resolve();
            return p.then(function () {
              return M.db.remove(ref('salas/' + cod + '/acoes/' + de + '/' + id));
            }, function (e) { console.error('[rede] ação não processada (fica no banco):', e); });
          }).catch(function (e) { console.warn('[rede]', e); });
        }, erroOuvinte);
        meus.push(offInterno); guarda(offInterno);
      }, erroOuvinte);
      guarda(offExterno);
      return function () {                       // desliga o ouvinte externo e todos os internos
        ligado = false;
        offExterno(); meus.splice(0).forEach(function (f) { f(); });
      };
    };

    Rede.aoVisao = function (fn) {
      exigeSala();
      return guarda(M.db.onValue(rs('visao/' + uid), function (s) {
        var v = s.val(); if (v == null) return; fn(le(v));
      }, erroOuvinte));
    };
    Rede.aoJogadores = function (fn) {
      exigeSala();
      return guarda(M.db.onValue(rs('jogadores'), function (s) {
        var o = s.val() || {}, l = [];
        Object.keys(o).forEach(function (k) {
          var j = o[k] || {};
          l.push({ uid: k, nome: j.nome, idx: j.idx, online: !!j.online, bot: j.bot || '' });
        });
        l.sort(function (a, b) { return (a.idx - b.idx) || String(a.uid).localeCompare(b.uid); });
        fn(l);
      }, erroOuvinte));
    };
    Rede.aoMeta = function (fn) {
      exigeSala();
      return guarda(M.db.onValue(rs('meta'), function (s) { fn(s.val() || null); }, erroOuvinte));
    };

    Rede.darVisao = envolve(function (dest, obj) {
      return Promise.resolve().then(function () {
        exigeHost();
        return M.db.set(rs('visao/' + dest), ser(obj));
      });
    });
    Rede.darVisoes = envolve(function (mapa) {
      return Promise.resolve().then(function () {
        exigeHost();
        return Promise.all(Object.keys(mapa).map(function (u) {
          return M.db.set(rs('visao/' + u), ser(mapa[u]));
        }));
      });
    });
    Rede.gravarEstado = envolve(function (obj) {
      return Promise.resolve().then(function () { exigeHost(); return M.db.set(rs('estado'), ser(obj)); });
    });
    Rede.lerEstado = envolve(function () {
      return Promise.resolve().then(function () {
        exigeHost();
        return M.db.get(rs('estado')).then(function (s) { return s.val() == null ? null : le(s.val()); });
      });
    });
    Rede.definirEstado = envolve(function (est) {
      return Promise.resolve().then(function () {
        exigeHost();
        if (est !== 'lobby' && est !== 'jogando' && est !== 'fim') throw falha('Estado de sala inválido.');
        return M.db.update(rs('meta'), { estado: est });
      });
    });

    /* Só para testes de privacidade: tenta ler um caminho DENTRO da sala. */
    Rede._ler = envolve(function (sub) {
      return Promise.resolve().then(function () {
        exigeSala();
        return M.db.get(rs(sub)).then(function (s) { return s.val(); });
      });
    });

    Rede.sair = envolve(function () {
      if (!sala) return null;
      var s = sala; sala = null;
      offs.splice(0).forEach(function (f) { try { f(); } catch (e) {} });
      var eu = ref('salas/' + s.cod + '/jogadores/' + uid);
      var p = Promise.resolve();
      if (preso) { var o = preso; preso = null; p = M.db.onDisconnect(o).cancel(); }
      return p.then(function () { return M.db.get(ref('salas/' + s.cod + '/meta')); }).then(function (ms) {
        var meta = ms.val();
        if (meta && meta.estado === 'lobby' && !s.host) return M.db.remove(eu);   // libera a vaga
        return M.db.update(eu, { online: false });
      }).catch(function (e) { console.warn('[rede] sair:', e && e.message); });
    });

    Rede.lerConvite = function (busca) {
      var c = null;
      try {
        var b = busca !== undefined ? busca : (raiz.location ? raiz.location.search : '');
        c = normaliza(new URLSearchParams(b).get('sala'));
      } catch (e) { c = null; }
      Rede.convite = c;
      return c;
    };
    Rede.linkConvite = function (codigo, base) {
      var b = base || (raiz.location ? raiz.location.href.split('#')[0].split('?')[0] : '');
      return b + '?sala=' + encodeURIComponent(normaliza(codigo) || '');
    };

    return Rede;
  }

  raiz.criarRede = criarRede;
  raiz.Rede = criarRede(carregarSDK, CFG);
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { criarRede: criarRede, CFG: CFG, VERSAO_SDK: VERSAO_SDK, RE_COD: RE_COD };
  }
})(typeof window !== 'undefined' ? window : globalThis);
