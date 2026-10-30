// ===== FICHA TÉCNICA =====
// lobby.js: Salas online (Fase 6). Telas "Criar Sala", "Achar Sala" e a sala de espera (Menu.tela = 'criar' | 'achar' | 'sala') e a lógica do lobby, falando só com `Rede` (rede.js).
// Anfitrião: cria a sala (nome + nº de jogadores, de 2 a 10, bots contam), vê o código e o link de convite, vê quem conectou (com bolinha de online), põe bots nas vagas livres (fácil/normal), tira jogadores, muda o nº de vagas, escolhe quem começa (aleatório ou um jogador) e inicia.
// Convidado: digita nome e código (ou abre o link ?sala=CODIGO, que já vem preenchido), vê a lista e espera. Se for removido ou a sala fechar, volta ao menu com um aviso.
// Ao iniciar: o anfitrião grava a ordem final dos jogadores (idx 0, 1, 2...) e põe a sala em 'jogando'. Todos recebem `Lobby.aoIniciar(cfg)` com cfg = { nomes, bots, first, uids, meuIdx, host } (o mesmo formato de A.new). Sem aoIniciar definido, mostra "Partida iniciada" (o jogo online em si é a Fase 7).
// Fase 9: "Fechar sala" põe a sala em 'fim', espera um instante (os convidados são avisados) e APAGA a sala (Rede.removerSala). Quando a partida começa, o online.js desliga os ouvintes do lobby (Lobby.desliga) para o lobby não brigar com ele.
// Segurança: nomes vindos da rede são escapados ao desenhar e limpos (sem < > & " ' `) ao montar cfg.nomes; os botões usam a POSIÇÃO na lista, nunca texto vindo da rede.
// Depende de: Rede (rede.js), Menu, menu, mb, mavs (menu.js). Carrega depois de menu.js e rede.js.
// ========================

const Lobby = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
  const limpa = n => String(n == null ? '' : n).replace(/[<>&"'`\u0000-\u001f]/g, '').trim().slice(0, 20); // nome seguro (pode ficar vazio)
  const val = id => { const e = document.getElementById(id); return e && e.value != null ? String(e.value) : ''; };
  const el = id => document.getElementById(id);
  const ordena = l => l.slice().sort((a, b) => (a.idx - b.idx) || String(a.uid).localeCompare(String(b.uid)));

  const L = {
    papel: null,        // 'host' | 'convidado' | null (fora de sala)
    lista: [], meta: null, metaVisto: false, vi: false, // vi = já me vi na lista
    iniciada: false, saindo: false, ocupado: false,
    quem: 'aleatorio',  // "Quem começa": 'aleatorio' ou o uid de um jogador (anfitrião)
    primeiro: null, ordem: null, offs: [],
    aoIniciar: null,    // função(cfg): a Fase 7 define aqui o que fazer quando a partida inicia

    // ---------- telas ----------
    telaCriar() { return `<h2>Criar Sala</h2><label>Seu nome <input id="lbNome" maxlength="20" placeholder="Seu nome"></label>
      <label>Jogadores na sala (2 a 10, contando bots) <input id="lbVagas" type="number" min="2" max="10" value="4"></label>${mb('Criar sala', 'Lobby.criar()')}${mb('Voltar', "Menu.ir('online')", 'sec')}${mavs}`; },
    telaAchar() { const c = (typeof Rede !== 'undefined' && Rede.convite) || '';
      return `<h2>Achar Sala</h2>${c ? `<p>Convite para a sala <b>${esc(c)}</b></p>` : ''}<label>Seu nome <input id="nomeSala" maxlength="20" placeholder="Seu nome"></label>
      <label>Código da sala <input id="cod" maxlength="8" placeholder="Código" value="${esc(c)}" oninput="this.value=this.value.toUpperCase()"></label>${mb('Conectar', 'Lobby.entrar()')}${mb('Voltar', "Menu.ir('online')", 'sec')}${mavs}`; },
    telaSala() { const host = L.papel === 'host', partilha = typeof navigator !== 'undefined' && navigator.share;
      return `<h2>Sala <span class="cod" id="lbCod"></span></h2><div class="sala"><div id="lbInfo"></div>${mb('Copiar código', "Lobby.copiar('cod')", 'sec')}${mb('Copiar link de convite', "Lobby.copiar('link')", 'sec')}${partilha ? mb('Compartilhar convite', 'Lobby.compartilha()', 'sec') : ''}</div>
      <div id="lbLista"></div>
      ${host ? `<div id="lbCtl"><label>Jogadores na sala (2 a 10, contando bots) <input id="lbVagas" type="number" min="2" max="10" onchange="Lobby.vagas(this.value)"></label>
        <label>Quem começa <select id="lbQuem" onchange="Lobby.quem=this.value"></select></label>
        <button class="mb" id="lbIniciar" onclick="Lobby.iniciar()">Iniciar partida</button>${mb('Fechar sala', 'Lobby.fechar()', 'sec')}</div>`
        : `<p id="lbEspera">Aguardando o anfitrião iniciar a partida…</p><div id="lbSair">${mb('Sair da sala', 'Lobby.sair()', 'sec')}</div>`}
      <p id="lbFim" class="mavs"></p>${mavs}`; },

    // ---------- desenho dinâmico (só o que muda; os campos de digitar não são refeitos) ----------
    pinta() {
      if (typeof Menu === 'undefined' || Menu.tela !== 'sala') return;
      const host = L.papel === 'host', vagas = L.meta ? L.meta.vagas : 0, lista = ordena(L.lista), livres = Math.max(0, vagas - lista.length);
      if (el('lbCod')) el('lbCod').textContent = (typeof Rede !== 'undefined' && Rede.codigo) || '';
      if (el('lbInfo')) el('lbInfo').textContent = `Jogadores: ${lista.length}/${vagas || '?'}`;
      const linhas = lista.map((j, i) => `<div class="lbj"><span class="pt ${j.bot || j.online ? 'on' : 'off'}" title="${j.bot || j.online ? 'online' : 'offline'}"></span><b>${esc(j.nome)}</b><small>${j.uid === (L.meta && L.meta.host) ? 'anfitrião' : j.bot ? (j.bot === 'facil' ? '🤖 bot fácil' : '🤖 bot normal') : ''}${j.uid === Rede.uid ? ' · você' : ''}${!j.bot && !j.online ? ' · offline' : ''}</small>${host && !L.iniciada && j.uid !== Rede.uid ? `<button class="sec" onclick="Lobby.tira(${i})" aria-label="Tirar ${esc(j.nome)}">✕</button>` : ''}</div>`);
      for (let k = 0; k < livres; k++) linhas.push(`<div class="lbj vazio"><span class="pt off"></span><b>Aguardando jogador…</b>${host && !L.iniciada ? `<button onclick="Lobby.bot('facil')">🤖 Fácil</button><button onclick="Lobby.bot('normal')">🤖 Normal</button>` : ''}</div>`);
      if (el('lbLista')) el('lbLista').innerHTML = linhas.join('');
      if (host) {
        const v = el('lbVagas'); if (v && (typeof document === 'undefined' || document.activeElement !== v)) v.value = vagas;
        const q = el('lbQuem'); if (q) { if (L.quem !== 'aleatorio' && !lista.some(j => j.uid === L.quem)) L.quem = 'aleatorio';
          q.innerHTML = `<option value="aleatorio">Aleatório</option>` + lista.map(j => `<option value="${esc(j.uid)}">${esc(j.nome)}</option>`).join(''); q.value = L.quem; }
        const b = el('lbIniciar'); if (b) b.disabled = L.ocupado || L.iniciada || lista.length < 2;
        const c = el('lbCtl'); if (c) c.style.display = L.iniciada ? 'none' : '';
      }
      if (el('lbEspera') && L.iniciada) el('lbEspera').textContent = '';
    },

    // ---------- ligação com a rede ----------
    ligar() {
      L.lista = []; L.meta = null; L.metaVisto = false; L.vi = false; L.iniciada = false; L.saindo = false; L.quem = 'aleatorio'; L.primeiro = null; L.ordem = null;
      L.offs = [Rede.aoJogadores(l => { L.lista = l; L.confere(); L.pinta(); }), Rede.aoMeta(m => { L.meta = m; if (m) L.metaVisto = true; L.confere(); L.pinta(); })];
    },
    desliga() { L.offs.splice(0).forEach(f => { try { f(); } catch (e) { /* já desligado */ } }); },
    confere() {
      if (L.saindo || !Rede.naSala) return;
      const eu = L.lista.find(j => j.uid === Rede.uid); if (eu) L.vi = true;
      if (L.metaVisto && !L.meta) return L.encerra('A sala foi encerrada.');
      if (L.meta && L.meta.estado === 'fim') return L.encerra('A sala foi encerrada pelo anfitrião.');
      if (L.papel === 'convidado' && L.vi && !eu && L.lista.length) return L.encerra('Você foi removido da sala pelo anfitrião.');
      if (L.meta && L.meta.estado === 'jogando' && !L.iniciada && eu) { L.iniciada = true; L.chamaIniciar(); }
    },
    async encerra(msg) { if (L.saindo) return; L.saindo = true; L.desliga(); try { await Rede.sair(); } catch (e) { /* sem importância */ } L.papel = null; Menu.ir('online'); Menu.aviso(msg); },
    ocupa(fn) { if (L.ocupado) return Promise.resolve(); L.ocupado = true;
      return Promise.resolve().then(fn).catch(e => Menu.aviso((e && e.message) || String(e))).then(() => { L.ocupado = false; L.pinta(); }); },

    // ---------- ações do anfitrião ----------
    criar() { return L.ocupa(async () => { const nome = limpa(val('lbNome')), vagas = Math.max(2, Math.min(10, parseInt(val('lbVagas'), 10) || 4));
      if (!nome) throw new Error('Digite o seu nome.');
      Menu.aviso('Conectando…'); await Rede.iniciar(); await Rede.criar(nome, vagas); L.papel = 'host'; L.ligar(); Menu.ir('sala'); }); },
    bot(nivel) { return L.ocupa(() => Rede.adicionarBot(nivel)); },
    tira(i) { const j = ordena(L.lista)[i]; if (!j || j.uid === Rede.uid) return Promise.resolve(); return L.ocupa(() => Rede.removerJogador(j.uid)); },
    vagas(v) { return L.ocupa(() => Rede.definirVagas(parseInt(v, 10))); },
    iniciar() { return L.ocupa(async () => {
      const l = ordena(L.lista);
      if (l.length < 2) throw new Error('São necessários pelo menos 2 jogadores (bots contam).');
      const off = l.find(j => !j.bot && !j.online); if (off) throw new Error(`${off.nome} está offline. Espere reconectar ou tire o jogador.`);
      const q = L.quem === 'aleatorio' ? -1 : l.findIndex(j => j.uid === L.quem);
      await Rede.fixarJogadores(l.map(j => j.uid));            // idx final: 0, 1, 2... na ordem da lista
      L.primeiro = q >= 0 ? q : Math.floor(Math.random() * l.length); L.ordem = l;
      await Rede.definirEstado('jogando');
      if (!L.iniciada) { L.iniciada = true; L.chamaIniciar(); } }); }, // (o aoMeta pode já ter chamado: não repetir)
    async fechar() { if (typeof confirm === 'function' && !confirm('Fechar a sala? Todos serão desconectados.')) return;
      L.saindo = true; L.desliga();
      try { await Rede.definirEstado('fim'); await new Promise(r => setTimeout(r, 1200)); await Rede.removerSala(); } // avisa, espera um instante e apaga a sala
      catch (e) { Menu.aviso(e.message); try { await Rede.sair(); } catch (e2) { /* sem importância */ } }
      L.papel = null; Menu.ir('online'); },

    // ---------- ações do convidado ----------
    entrar() { return L.ocupa(async () => { const nome = limpa(val('nomeSala')), cod = val('cod').trim().toUpperCase();
      if (!nome) throw new Error('Digite o seu nome.'); if (!cod) throw new Error('Digite o código da sala.');
      Menu.aviso('Conectando…'); await Rede.iniciar(); const r = await Rede.entrar(cod, nome); L.papel = r && r.host ? 'host' : 'convidado'; L.ligar(); Menu.ir('sala'); }); }, // (o anfitrião que volta à própria sala continua anfitrião)
    async sair() { L.saindo = true; L.desliga(); try { await Rede.sair(); } catch (e) { /* sem importância */ } L.papel = null; Menu.ir('online'); },

    // ---------- início da partida ----------
    // cfg no formato de A.new (nomes/bots/first) + uids (o uid de cada idx), meuIdx (o idx deste aparelho) e host
    cfgPartida() { const l = L.ordem && L.ordem.length ? L.ordem : ordena(L.lista);
      return { nomes: l.map(j => limpa(j.nome) || 'Jogador'), bots: l.map(j => j.bot || ''), first: L.primeiro == null ? 0 : L.primeiro, uids: l.map(j => j.uid), meuIdx: l.findIndex(j => j.uid === Rede.uid), host: L.papel === 'host' }; },
    chamaIniciar() { const cfg = L.cfgPartida(); if (typeof L.aoIniciar === 'function') return L.aoIniciar(cfg); L.mostraIniciada(cfg); },
    mostraIniciada(cfg) { cfg = cfg || L.cfgPartida(); const fim = el('lbFim');
      if (fim) fim.textContent = `✅ Partida iniciada com ${cfg.nomes.length} jogadores. (O jogo online em si será ligado na próxima etapa.)`;
      L.pinta(); },

    // ---------- convite ----------
    async copiar(o) { const t = o === 'link' ? Rede.linkConvite(Rede.codigo) : Rede.codigo || '';
      try { await navigator.clipboard.writeText(t); Menu.aviso(o === 'link' ? 'Link copiado.' : 'Código copiado.'); } catch (e) { Menu.aviso('Copie manualmente: ' + t); } },
    async compartilha() { try { await navigator.share({ title: 'Tempo de Colheita', text: `Entre na minha sala (${Rede.codigo})`, url: Rede.linkConvite(Rede.codigo) }); } catch (e) { /* cancelado */ } },
    reset() { L.desliga(); Object.assign(L, { papel: null, lista: [], meta: null, metaVisto: false, vi: false, iniciada: false, saindo: false, ocupado: false, quem: 'aleatorio', primeiro: null, ordem: null }); },
  };
  return L;
})();
