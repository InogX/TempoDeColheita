// ===== FICHA TÉCNICA =====
// online.js: JOGO ONLINE (Fase 7). Liga o lobby (lobby.js), a camada de comandos (comandos.js) e a rede (rede.js). Um só nome global: Online (também window.Online).
// ANFITRIÃO (quem criou a sala): roda o jogo de verdade (S completo), os bots e recebe as jogadas dos outros por Rede.aoAcao → Cmd.run(idx, tipo, args). Depois de cada mudança do estado, manda a CADA humano a SUA visão (viewFor(i), visao.js) por Rede.darVisoes, junto com um "recibo" da última jogada dele (ack) e `extra.feito` (objetivo cumprido, que o convidado não consegue calcular).
// CONVIDADO: nunca executa regra do jogo. Cmd.nome(...) confere vez/fase/argumentos na hora e chama Online.pede(nome, args), que envia ao anfitrião (Rede.enviar). A resposta chega na próxima visão (S = visão; ligaUI(); render()). Só uma jogada fica "pendente" de cada vez (evita toque duplo); sem resposta em 8 s, libera e avisa.
// Recibo (ack = { id, tipo, ok, msg }): é como o convidado sabe que a jogada foi aceita ou recusada (e por quê), já que o rede.js não tem canal de resposta. Vai DENTRO da visão (o nó visao/{uid} não tem validação de formato).
// Visão = { ...viewFor(i), sessao, n, extra: { feito }, ack }. `n` cresce a cada envio e `sessao` muda se o anfitrião reiniciar: o convidado ignora visão velha.
// Regras: o online NUNCA lê Menu.cfg (Configurações/Dev) nem grava em localStorage (tc_save é só do jogo local); botão Dev some; "atuar como" do Mercado não vale (o remetente é sempre este aparelho).
// Entrada: Lobby.aoIniciar(cfg) (cfg = { nomes, bots, first, uids, meuIdx, host }, vem do lobby.js). Saída: Online.sair() (chamado por A.quit quando online). Se a sala for encerrada pelo anfitrião, o convidado volta ao menu com aviso.
// Fase 8: a tela é redesenhada a cada visão nova, então Online.campos()/restaura()/desenha() guardam e devolvem o que o jogador estava digitando (quantidade/preço do Mercado, Feira), o campo em foco e a rolagem da janela; depois de uma jogada aceita (listRes, list, buyFeira) os campos dela voltam vazios. O anfitrião faz o mesmo quando um bot ou outro jogador age (comandos.js, Cmd.aplica).
// FASE 9 (robustez): (1) o ANFITRIÃO grava o estado completo (Rede.gravarEstado) a cada mudança e, se voltar (recarregou a página, caiu), RETOMA a partida de onde parou em vez de começar outra; jogadas que ficaram na fila de antes da volta são descartadas (os convidados são avisados). (2) jogador que SAI (avisa o anfitrião com a ação 'saindo') ou fica sem conexão por mais de ESPERA_VAGA_MS tem a vaga assumida por um BOT; quando volta (Rede.entrar com o mesmo uid) recebe a vaga de volta. (3) o CONVIDADO vê uma faixa se perder a conexão ou se o ANFITRIÃO ficar desconectado; passados ESPERA_ANFITRIAO_MS volta ao menu com o código da sala. (4) quando a partida começa o online.js DESLIGA os ouvintes do lobby (Lobby.desliga): o lobby reagia a "sala encerrada" com Rede.sair(), que desligava também os ouvintes do online.js, e o convidado nunca era avisado. (5) o anfitrião que sai APAGA a sala (Rede.removerSala) depois de avisar. Limites: outro navegador/aparelho = outro uid = não volta a uma partida em andamento; se o anfitrião não voltar a partida fica parada (os convidados são avisados).
// Depende de: Rede (rede.js); Cmd (comandos.js); viewFor (visao.js); done (objetivos.js); A, S, EU, UI, ligaUI, UIreset, render, Menu, Bot, Z (podem não existir: usa typeof).
// ========================

(function () {
  const Online = {
    ativo: false, host: false, uids: [], idxDe: {}, offs: [],
    sessao: null, seq: 0, ultimo: '', ack: {}, vistos: new Set(), sujos: new Set(), pubT: null, // anfitrião
    n: 0, sessaoVista: null, pend: null, vistosAck: new Set(), eraMinha: false, // convidado (e eraMinha também no anfitrião)
    fora: {}, on: {}, lista: [], descarteAte: 0, salvaT: null, // anfitrião (Fase 9): quando cada jogador ficou sem conexão, última presença vista, última lista, fila antiga a descartar, gravação do estado
    hostUid: null, hostOff: null, semConexao: false, vigiaT: null, // convidado (Fase 9): uid do anfitrião, desde quando ele está sem conexão, este aparelho sem conexão, relógio
    ESPERA_VAGA_MS: 30000, ESPERA_ANFITRIAO_MS: 120000, SALVA_MS: 800, VIGIA_MS: 1000, FIM_MS: 1200, DESCARTE_MS: 1500, // tempos (os testes encurtam)

    // ---------- entrada ----------
    iniciar(cfg) { // chamado por Lobby.aoIniciar, UMA vez em cada aparelho
      if (this.ativo) return;
      if (!cfg || !Array.isArray(cfg.nomes) || !Array.isArray(cfg.uids) || !Number.isInteger(cfg.meuIdx)) { alert('Não foi possível iniciar a partida online (dados da sala inválidos).'); return; }
      try {
        if (typeof Bot !== 'undefined') Bot.parar();
        if (typeof Lobby !== 'undefined' && Lobby.desliga) Lobby.desliga(); // o lobby para de ouvir a sala: daqui em diante o online.js cuida dela (senão o Rede.sair() do lobby desliga os ouvintes daqui)
        this.limpa(); this.ativo = true; this.host = !!cfg.host; this.uids = cfg.uids.slice(); this.idxDe = {};
        this.uids.forEach((u, i) => { this.idxDe[u] = i; });
        EU = cfg.meuIdx; UIreset();
        this.offs.push(Rede.aoMeta(m => this.meta(m)));
        this.offs.push(Rede.aoJogadores(l => this.jogadores(l)));
        this.offs.push(Rede.aoConexao(on => this.conexao(on)));
        this.vigiaT = setInterval(() => this.vigia(), this.VIGIA_MS);
        if (this.host) this.iniciarHost(cfg); else this.iniciarConvidado();
      } catch (e) { console.error('[online] iniciar', e); const msg = (e && e.message) || e; this.limpa(); S = null; UIreset(); if (typeof Menu !== 'undefined') Menu.tela = 'main'; render(); alert('Não foi possível iniciar a partida online: ' + msg); }
    },
    iniciarHost(cfg) {
      this.sessao = Math.random().toString(36).slice(2, 10); this.seq = 0;
      if (typeof Menu !== 'undefined') Menu.tela = 'espera'; render(); // "Partida iniciando…" enquanto vê se há partida salva
      Rede.lerEstado().then(est => {
        if (!this.ativo || !this.host) return;
        if (est && Array.isArray(est.players) && Array.isArray(est.order) && est.players.length === cfg.nomes.length) this.retoma(est); else this.novo(cfg);
        this.offs.push(Rede.aoAcao(a => this.recebeAcao(a)));
        this.presenca(this.lista); // quem já estava sem conexão quando a partida (re)começou entra na contagem
      }).catch(e => this.falhaInicio(e));
    },
    novo(cfg) { // partida nova
      const n = cfg.nomes.length, first = Number.isInteger(cfg.first) && cfg.first >= 0 && cfg.first < n ? cfg.first : Math.floor(Math.random() * n);
      A.new({ nomes: cfg.nomes, bots: cfg.bots || [], first, online: true }); // online: ignora Configurações/Dev (Menu.cfg) e campos Dev da tela
    },
    retoma(est) { // o anfitrião voltou: continua de onde parou
      S = est; ligaUI(); UIreset();
      if (S.players[EU]) { S.players[EU].bot = ''; delete S.players[EU].ex; }
      this.descarteAte = Date.now() + this.DESCARTE_MS; // o que estava na fila antes da volta é velho: descarta (a fila antiga chega logo que o ouvinte liga)
      log('⚡ O anfitrião voltou: a partida foi retomada.');
      this.ultimo = ''; render();
    },
    falhaInicio(e) { // não conseguiu ler a partida salva: NÃO começa outra por cima
      const msg = (e && e.message) || e; this.limpa(); Rede.sair().catch(() => {}); S = null; UIreset(); if (typeof Menu !== 'undefined') Menu.tela = 'main'; render();
      alert('Não foi possível ler a partida salva: ' + msg + '. Tente entrar de novo na sala.'); },
    iniciarConvidado() {
      S = null; this.n = 0; this.sessaoVista = null;
      if (typeof Menu !== 'undefined') Menu.tela = 'espera'; // "Aguardando o anfitrião..." (menu.js)
      render();
      this.offs.push(Rede.aoVisao(v => this.recebe(v)));
    },

    // ---------- ANFITRIÃO ----------
    recebeAcao(a) { // uma jogada de um humano; NUNCA lança erro (o rede.js entregaria de novo para sempre)
      try {
        if (!this.ativo || !this.host || !S || !a) return;
        const chave = a.de + ':' + a.id; if (this.vistos.has(chave)) return; // entrega "ao menos uma vez": ignora id repetido
        this.vistos.add(chave); if (this.vistos.size > 500) this.vistos.delete(this.vistos.values().next().value);
        const idx = this.idxDe[a.de];
        if (a.tipo === 'saindo') { if (idx != null) this.assume(idx); return; } // o jogador avisou que está saindo: um bot assume a vaga já
        const r = idx == null || S.players[idx] == null ? { ok: false, msg: 'Jogador desconhecido.' }
          : Date.now() < this.descarteAte ? { ok: false, msg: 'O anfitrião acabou de voltar. Tente de novo.' } // fila de antes da volta
          : S.players[idx].bot ? { ok: false, msg: 'Um bot está jogando no seu lugar. Aguarde.' }
          : Cmd.run(idx, a.tipo, a.args); // quem pediu vem do uid (não do que ele escreve)
        if (idx != null && S.players[idx]) { this.ack[idx] = { id: a.id, tipo: String(a.tipo).slice(0, 30), ok: !!r.ok, msg: r.ok ? null : String(r.msg || 'Jogada recusada.').slice(0, 200) }; this.marca(idx); }
      } catch (e) { console.error('[online] erro ao processar a jogada', e); }
    },
    aposRender() { // chamado por render() (tela.js) no anfitrião: se o estado mudou, publica
      if (!this.ativo || !this.host || !S || !S.order) return;
      this.avisaVez();
      const s = JSON.stringify(S); if (s === this.ultimo) return; // só mudança de interface: nada a enviar
      this.ultimo = s; S.players.forEach((_, i) => this.marca(i)); this.agendaSalva();
    },
    marca(i) { const q = S && S.players[i]; if (q && (!q.bot || q.ex) && i !== EU && this.uids[i]) { this.sujos.add(i); if (!this.pubT) this.pubT = setTimeout(() => { this.pubT = null; this.publica(); }, 40); } }, // junta várias mudanças seguidas num envio só
    publica() {
      if (!this.ativo || !this.host || !S || !S.order) return;
      const mapa = {};
      this.sujos.forEach(i => { const q = S.players[i], u = this.uids[i]; if (!q || (q.bot && !q.ex) || !u) return;
        const v = viewFor(i); v.sessao = this.sessao; v.n = ++this.seq; v.extra = { feito: this.feito(q) }; if (this.ack[i]) v.ack = this.ack[i];
        mapa[u] = v; });
      this.sujos.clear();
      if (Object.keys(mapa).length) Rede.darVisoes(mapa).catch(e => { console.warn('[online] visão não enviada', e); this.aviso('⚠ Falha ao enviar o jogo aos outros jogadores.', 4000); });
    },
    feito(q) { try { return !!done(q); } catch (e) { return false; } }, // objetivo cumprido (o convidado não tem os dados para calcular)

    agendaSalva() { if (!this.salvaT) this.salvaT = setTimeout(() => { this.salvaT = null; this.gravaEstado(); }, this.SALVA_MS); }, // junta mudanças seguidas
    gravaEstado() { if (!this.ativo || !this.host || !S) return Promise.resolve(); return Rede.gravarEstado(S).catch(e => console.warn('[online] estado não salvo', e)); }, // estado COMPLETO (só o anfitrião lê, regras do Apêndice A): é o que permite retomar

    // presença dos jogadores (anfitrião): quem ficou sem conexão perde a vaga para um bot depois de ESPERA_VAGA_MS; quem volta recebe a vaga de volta
    presenca(l) {
      if (!S || !S.players) return;
      l.forEach(j => { const i = this.idxDe[j.uid]; if (i == null || i === EU || j.bot || !S.players[i]) return;
        const antes = this.on[i]; this.on[i] = j.online;
        if (j.online) { delete this.fora[i]; if (antes === false) this.volta(i); }
        else if (this.fora[i] == null && !S.players[i].bot && !S.players[i].out && !S.win) { this.fora[i] = Date.now(); this.aviso(`⚠ ${S.players[i].n} perdeu a conexão. Um bot assume em ${Math.round(this.ESPERA_VAGA_MS / 1000)} s.`, 5000); } });
    },
    assume(i) { // um bot assume a vaga do jogador i
      const p = S && S.players[i]; delete this.fora[i];
      if (!p || p.bot || p.out || S.win || i === EU) return false;
      p.bot = 'normal'; p.ex = 1; log(`${p.n} saiu da partida: um bot assumiu o lugar.`); render(); return true; },
    volta(i) { // o jogador i voltou: devolve a vaga (se um bot a tinha) e manda a visão atual
      const p = S && S.players[i]; if (!p) return;
      if (p.ex && !S.win) { p.bot = ''; delete p.ex; log(`${p.n} voltou à partida.`); render(); }
      this.marca(i); },

    // ---------- CONVIDADO ----------
    pede(nome, args) { // chamado por Cmd.local (comandos.js) no convidado; devolve { ok, msg, pendente }
      if (this.pend) { this.aviso('⏳ Aguarde a resposta anterior…', 1500); return { ok: false, msg: null, pendente: true }; }
      const p = this.pend = { nome, args, id: null, ack: null, t: setTimeout(() => this.semResposta(p), 8000) };
      this.aviso('⏳ Enviando…');
      Rede.enviar(nome, args).then(id => { p.id = id; if (p.ack && p.ack.id === id && this.pend === p) { const r = this.fim(p, p.ack); this.desenha(r); this.responde(r); } }, // recibo que chegou antes de o envio terminar
        e => { if (this.pend === p) { clearTimeout(p.t); this.pend = null; } this.aviso(''); this.responde({ ok: false, msg: 'Não foi possível enviar a jogada: ' + ((e && e.message) || e) }); });
      return { ok: true, msg: null, pendente: true };
    },
    recebe(v) { // uma visão nova do anfitrião
      if (!this.ativo || this.host || !v || !Array.isArray(v.players) || !Array.isArray(v.order)) return;
      if (v.sessao !== this.sessaoVista) { this.sessaoVista = v.sessao; this.n = 0; } // anfitrião reiniciou: recomeça a contagem
      if (typeof v.n === 'number') { if (v.n <= this.n) return; this.n = v.n; } // visão velha ou repetida
      let resp = null;
      if (v.ack && !this.vistosAck.has(v.ack.id)) { this.vistosAck.add(v.ack.id); if (this.vistosAck.size > 200) this.vistosAck.delete(this.vistosAck.values().next().value); resp = this.casa(v.ack); }
      S = v; ligaUI();
      this.desenha(resp); this.avisaVez(); this.responde(resp);
    },
    casa(ack) { const p = this.pend; if (!p) return null; if (p.id === null) { p.ack = ack; return null; } return p.id === ack.id ? this.fim(p, ack) : null; }, // o recibo é da jogada pendente?
    fim(p, ack) { // a jogada pendente foi respondida
      if (this.pend !== p) return null;
      clearTimeout(p.t); this.pend = null; this.aviso(''); this.ultArgs = p.args;
      if (ack.ok) { if (ack.tipo === 'plantIn') UI.plantSel = null; if (ack.tipo === 'end') { UI.modal = null; UI.plantSel = null; } if (ack.tipo === 'peek') UI.modal = null; } // o que A.plantIn/A.end/A.peek fazem na interface no jogo local
      return ack; },
    responde(ack) { if (!ack) return; if (typeof Z !== 'undefined' && Z.resposta) Z.resposta(ack); if (!ack.ok && ack.msg) alert(ack.msg); },
    semResposta(p) { if (this.pend !== p) return; this.pend = null; this.aviso(this.semConexao ? '📡 Sem conexão: a jogada vai quando voltar.' : '⚠ O anfitrião não respondeu. Confira a conexão.', 5000); if (typeof Z !== 'undefined' && Z.resposta) Z.resposta({ ok: false }); },
    encerrada() { // o anfitrião fechou a sala
      if (!this.ativo) return; const fim = S && S.win;
      this.limpa(); Rede.sair().catch(() => {}); S = null; UIreset(); if (typeof Menu !== 'undefined') Menu.tela = 'main'; render();
      if (!fim) alert('A sala foi encerrada pelo anfitrião.'); },

    // ---------- sala e conexão ----------
    meta(m) { if (!this.ativo) return; if (m) this.hostUid = m.host; if (!this.host && (!m || m.estado === 'fim')) return this.encerrada(); this.confere(); }, // a sala foi encerrada?
    jogadores(l) { if (!this.ativo) return; this.lista = l; if (this.host) this.presenca(l); else this.confere(); },
    conexao(on) { if (!this.ativo) return; this.semConexao = !on; if (on && this.hostOff) this.hostOff = Date.now(); this.faixaAtualiza(); }, // reconectou: dá ao anfitrião uma janela nova
    confere() { // convidado: o anfitrião está conectado?
      if (this.host) return; const h = this.lista.find(j => j.uid === this.hostUid), off = !!(h && !h.online);
      if (off && !this.hostOff) this.hostOff = Date.now(); if (!off) this.hostOff = null; this.faixaAtualiza(); },
    vigia() { // a cada segundo
      if (!this.ativo) return;
      if (this.host) { const agora = Date.now(); Object.keys(this.fora).forEach(k => { if (agora - this.fora[k] >= this.ESPERA_VAGA_MS) this.assume(+k); }); }
      else if (this.hostOff && !this.semConexao && Date.now() - this.hostOff >= this.ESPERA_ANFITRIAO_MS) return this.anfitriaoSumiu();
      this.faixaAtualiza(); },
    faixaAtualiza() {
      let t = '';
      if (this.semConexao) t = '📡 Sem conexão. Tentando reconectar…';
      else if (!this.host && this.hostOff) t = `⚠ O anfitrião está desconectado. Aguardando a volta dele… (${Math.max(0, Math.ceil((this.ESPERA_ANFITRIAO_MS - (Date.now() - this.hostOff)) / 1000))} s)`;
      this.faixa(t); },
    anfitriaoSumiu() { // o anfitrião não voltou a tempo: sai da tela do jogo, mas a vaga fica (dá para voltar com o código se ele retomar)
      const cod = Rede.codigo; this.limpa(); Rede.sair().catch(() => {}); S = null; UIreset(); if (typeof Menu !== 'undefined') Menu.tela = 'main'; render();
      alert('O anfitrião ficou desconectado e a partida parou. Se ele voltar, entre de novo na sala' + (cod ? ' com o código ' + cod : '') + '.'); },
    faixa(txt) { // faixa vermelha no topo (estado da conexão), sem depender do style.css
      let e = document.getElementById('onl-faixa');
      if (!txt) { if (e) e.remove(); return; }
      if (!e) { e = document.createElement('div'); e.id = 'onl-faixa'; e.setAttribute('role', 'status');
        e.style.cssText = 'position:fixed;top:env(safe-area-inset-top,0px);left:0;right:0;background:#b3261e;color:#fff;padding:6px 10px;font-size:14px;text-align:center;z-index:99998;pointer-events:none';
        document.body.appendChild(e); }
      e.textContent = txt; },

    // ---------- tela: não perder o que está sendo digitado ----------
    campos() { // o que está digitado, o campo em foco e a rolagem da janela (null se algo falhar)
      try { const vals = {}; document.querySelectorAll('#app input[id]').forEach(e => { if (e.type !== 'checkbox') vals[e.id] = e.value; });
        const a = document.activeElement, box = document.querySelector('#modal .box');
        return { vals, foco: a && a.id && vals[a.id] !== undefined ? a.id : null, sel: a && a.selectionStart != null ? [a.selectionStart, a.selectionEnd] : null, rolagem: box ? box.scrollTop : 0 };
      } catch (e) { return null; } },
    restaura(c, limpar) { // devolve o que campos() guardou, menos os campos de `limpar`
      if (!c) return;
      try { Object.keys(c.vals).forEach(id => { if (limpar && limpar.includes(id)) return; const e = document.getElementById(id); if (e && e.value !== c.vals[id]) e.value = c.vals[id]; });
        const box = document.querySelector('#modal .box'); if (box && c.rolagem) box.scrollTop = c.rolagem;
        const f = c.foco && !(limpar && limpar.includes(c.foco)) && document.getElementById(c.foco);
        if (f && f.focus) { f.focus({ preventScroll: true }); if (c.sel && f.setSelectionRange) { try { f.setSelectionRange(c.sel[0], c.sel[1]); } catch (e) {} } }
      } catch (e) {} },
    desenha(resp) { const cp = this.campos(); render(); this.restaura(cp, resp && resp.ok ? this.idsDe(resp.tipo, this.ultArgs) : []); }, // render() sem perder a digitação; jogada aceita limpa os campos dela
    idsDe(tipo, a) { a = a || []; return tipo === 'listRes' ? ['rq' + a[0], 'rp' + a[0]] : tipo === 'list' ? ['pr' + a[1]] : tipo === 'buyFeira' ? ['fq' + a[0]] : []; }, // campos da tela que pertencem a cada jogada

    // ---------- comum ----------
    sair() { // A.quit() chama isto quando o jogo é online
      const terminou = !!(S && S.win);
      if (this.host) { if (!terminou && !confirm('Você é o anfitrião: sair ENCERRA a partida para todos. Sair mesmo?')) return;
        this.aviso('Encerrando a sala…');
        Rede.definirEstado('fim').catch(() => {}).then(() => new Promise(r => setTimeout(r, this.FIM_MS))) // dá tempo de os convidados verem o aviso
          .then(() => Rede.removerSala()).catch(() => Rede.sair().catch(() => {})).then(() => this.sairLocal()); return; }
      if (!terminou && !confirm('Sair da partida?')) return;
      this.aviso('Saindo…');
      if (terminou) return this.sairDaSala();
      Promise.race([Rede.enviar('saindo', []), new Promise(r => setTimeout(r, 1500))]).catch(() => {}).then(() => this.sairDaSala()); }, // avisa o anfitrião: um bot assume a vaga já
    sairDaSala() { this.limpa(); Rede.sair().catch(() => {}); this.sairLocal(false); },
    sairLocal(limpar = true) { if (limpar) this.limpa(); S = null; UIreset(); if (typeof Menu !== 'undefined') Menu.tela = 'main'; render(); },
    limpa() { // desliga tudo e volta ao "jogo local"
      clearTimeout(this.pubT); this.pubT = null; clearTimeout(this.salvaT); this.salvaT = null; clearInterval(this.vigiaT); this.vigiaT = null; this.offs.splice(0).forEach(f => { try { f(); } catch (e) {} });
      if (this.pend) clearTimeout(this.pend.t);
      this.pend = null; this.sujos.clear(); this.ack = {}; this.vistos.clear(); this.vistosAck.clear(); this.ultimo = ''; this.n = 0; this.sessaoVista = null; this.eraMinha = false;
      this.fora = {}; this.on = {}; this.lista = []; this.descarteAte = 0; this.hostUid = null; this.hostOff = null; this.semConexao = false; this.faixa('');
      this.ativo = false; this.host = false; this.uids = []; this.idxDe = {}; EU = null; this.aviso('');
      if (typeof Bot !== 'undefined') Bot.parar();
      try { document.title = 'Tempo de Colheita'; } catch (e) {} },
    avisaVez() { // título e vibração quando chega a SUA vez
      const minha = !!(S && S.order && !S.win && S.order[S.t] === EU);
      if (minha && !this.eraMinha) { try { document.title = '🔔 Sua vez! · Tempo de Colheita'; if (navigator.vibrate) navigator.vibrate(150); } catch (e) {} }
      else if (!minha && this.eraMinha) { try { document.title = 'Tempo de Colheita'; } catch (e) {} }
      this.eraMinha = minha; },
    aviso(txt, ms) { // faixa curta na parte de baixo da tela (sem depender do style.css)
      let e = document.getElementById('onl-aviso'); clearTimeout(this.avT);
      if (!txt) { if (e) e.remove(); return; }
      if (!e) { e = document.createElement('div'); e.id = 'onl-aviso'; e.setAttribute('role', 'status');
        e.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));background:#222;color:#fff;padding:8px 14px;border-radius:18px;font-size:14px;z-index:99999;pointer-events:none;max-width:90vw;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.35)';
        document.body.appendChild(e); }
      e.textContent = txt; if (ms) this.avT = setTimeout(() => this.aviso(''), ms); },
  };
  window.Online = Online;
  window.addEventListener('pagehide', () => { if (Online.ativo && Online.host) Online.gravaEstado(); }); // última chance de salvar quando a página fecha
  if (typeof Lobby !== 'undefined') Lobby.aoIniciar = cfg => Online.iniciar(cfg); // gancho da Fase 6
})();
