// ===== FICHA TÉCNICA =====
// chat.js: CHAT da sala (Fase 12). Texto curto entre os jogadores, no lobby e durante a partida (na sua vez, esperando, em qualquer tela). Um só nome global: Chat.
// Liga e desliga SOZINHO: a cada segundo confere se este aparelho está numa sala (Rede.naSala/Rede.codigo); ao entrar liga os ouvintes (mensagens, nomes dos jogadores, silenciados) e mostra o botão 💬; ao sair apaga tudo. Por isso não depende de gancho no lobby.js nem no online.js. Fora de uma sala (jogo local) não aparece.
// Não passa pelo anfitrião nem pelo Cmd: cada jogador grava a própria mensagem (Rede.enviarChat) e todos recebem (Rede.aoChat); funciona mesmo com o anfitrião fora.
// Limites: 200 caracteres (cortado no cliente e conferido pelas regras do banco); uma mensagem a cada GAP_MS (1,5 s, só no cliente); o nome da mensagem tem de ser o seu nome na lista de jogadores (as regras conferem); o texto é sempre escapado (nada de HTML).
// Anfitrião: botão 🔇 ao lado das mensagens dos outros para SILENCIAR (e uma faixa com os silenciados, onde ✕ libera); mantém só as últimas TRIM (60) mensagens no banco. Silenciado: o campo de texto desliga e as regras do banco recusam a mensagem.
// Tela: o botão 💬 (com contador de não lidas) e o painel ficam FORA do #app, então o redesenho do jogo não fecha o teclado nem apaga o que está sendo digitado. O que muda fora do navegador: nada (CSS injetado por aqui).
// Dados no banco: salas/CODIGO/chat/{id} = { de, nome, txt, ts }; salas/CODIGO/mudos/{uid} = true (só o anfitrião escreve). Regras: regras_firebase.json.
// Depende de: Rede (rede.js: enviarChat, aoChat, aoJogadores, aoMudos, silenciar, apagarChat, naSala, codigo, uid, ehHost).
// ========================

const Chat = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
  const limpa = t => String(t == null ? '' : t).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  const CSS = `#onl-chatbtn{position:fixed;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:99990;width:46px;height:46px;border-radius:50%;border:2px solid #222;background:#fff;color:#222;font-size:22px;line-height:1;padding:0;box-shadow:0 2px 6px rgba(0,0,0,.4)}
#onl-chatbtn .chatBadge{position:absolute;top:-7px;right:-7px;min-width:20px;height:20px;border-radius:10px;background:#d32f2f;color:#fff;font-size:12px;line-height:20px;padding:0 5px;font-weight:700}
#onl-chat{position:fixed;left:0;right:0;bottom:0;z-index:99991;max-height:60vh;max-height:60dvh;flex-direction:column;background:#fff;color:#222;border-top:2px solid #222;box-shadow:0 -4px 12px rgba(0,0,0,.35);padding-bottom:env(safe-area-inset-bottom,0px)}
#onl-chat .chTopo{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid #8884}
#onl-chat #chatLista{flex:1;min-height:90px;overflow-y:auto;padding:4px 10px;-webkit-overflow-scrolling:touch}
#onl-chat .cm{margin:4px 0;font-size:15px;word-break:break-word}#onl-chat .cm b{margin-right:6px}#onl-chat .cm.eu b{opacity:.7}
#onl-chat .cs{font-size:14px;padding:0 6px;margin:0 4px}
#onl-chat #chatMudos,#onl-chat #chatNota{padding:2px 10px;font-size:13px;opacity:.85}
#onl-chat .chForm{display:flex;gap:6px;padding:6px 10px}#onl-chat .chForm input{flex:1;min-width:0;font-size:16px;padding:8px}#onl-chat .chForm button{font-size:16px;padding:8px 14px}
@media(prefers-color-scheme:dark){#onl-chatbtn{background:#2a2b27;color:#eee;border-color:#000}#onl-chat{background:#2a2b27;color:#eee;border-color:#000}}`;

  const C = {
    MAX: 200, GUARDA: 100, TRIM: 60, GAP_MS: 1500, VIGIA_MS: 1000, // (os testes encurtam)
    cod: null, msgs: [], vistos: new Set(), apagadas: new Set(), nomes: {}, mudos: {}, naoLidas: 0, aberto: false, ultimoEnvio: 0, nota: '', offs: [], notaT: null, vv: null,

    // ---------- ligar e desligar sozinho ----------
    vigia() {
      const na = typeof Rede !== 'undefined' && Rede.naSala && Rede.codigo ? Rede.codigo : null;
      if (na && C.cod !== na) C.liga(); else if (!na && C.cod) C.desliga();
      if (C.cod && C.aberto) C.pinta();
    },
    liga() {
      C.desliga(); C.cod = Rede.codigo;
      C.offs = [Rede.aoChat(m => C.recebe(m)), Rede.aoJogadores(l => { C.nomes = {}; l.forEach(j => { C.nomes[j.uid] = j.nome; }); C.pinta(); }), Rede.aoMudos(mm => { C.mudos = mm || {}; C.pinta(); })];
      C.cria(); C.pinta();
    },
    desliga() {
      C.offs.splice(0).forEach(f => { try { f(); } catch (e) { /* já desligado */ } });
      clearTimeout(C.notaT); C.fecha(); ['onl-chatbtn', 'onl-chat'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });
      Object.assign(C, { cod: null, msgs: [], nomes: {}, mudos: {}, naoLidas: 0, nota: '' }); C.vistos.clear(); C.apagadas.clear();
    },

    // ---------- dados ----------
    souHost: () => !!(typeof Rede !== 'undefined' && Rede.ehHost),
    meuNome: () => C.nomes[Rede.uid] || '',
    euMudo: () => !!C.mudos[Rede.uid],
    recebe(m) {
      if (!m || !m.id || C.vistos.has(m.id)) return; C.vistos.add(m.id);
      C.msgs.push({ id: m.id, de: String(m.de || ''), nome: String(m.nome || '?'), txt: String(m.txt || '').slice(0, C.MAX), ts: m.ts || 0 });
      if (C.msgs.length > C.GUARDA) C.msgs.splice(0, C.msgs.length - C.GUARDA);
      if (!C.aberto && m.de !== Rede.uid) C.naoLidas++;
      C.apara(); C.pinta();
    },
    apara() { // anfitrião: mantém só as últimas TRIM mensagens no banco
      if (!C.souHost()) return;
      const vivas = C.msgs.filter(x => !C.apagadas.has(x.id));
      if (vivas.length <= C.TRIM) return;
      const ids = vivas.slice(0, vivas.length - C.TRIM).map(x => x.id); ids.forEach(id => C.apagadas.add(id));
      Rede.apagarChat(ids).catch(() => {});
    },

    // ---------- ações ----------
    envia(t) { // t opcional (testes); sem ele lê o campo de texto
      const campo = document.getElementById('chatTxt'), txt = limpa(t !== undefined ? t : campo ? campo.value : '').slice(0, C.MAX);
      if (!txt) return Promise.resolve({ ok: false, msg: 'vazio' });
      if (C.euMudo()) { C.avisa('O anfitrião silenciou você.'); return Promise.resolve({ ok: false, msg: 'silenciado' }); }
      const agora = Date.now(); if (agora - C.ultimoEnvio < C.GAP_MS) { C.avisa('Calma: uma mensagem por vez.'); return Promise.resolve({ ok: false, msg: 'ritmo' }); }
      C.ultimoEnvio = agora;
      return Rede.enviarChat(txt, C.meuNome()).then(() => { if (campo && t === undefined) campo.value = ''; return { ok: true }; }, e => { C.avisa((e && e.message) || 'Não foi possível enviar.'); return { ok: false, msg: (e && e.message) || String(e) }; });
    },
    silencia(uid) { // anfitrião: silencia ou libera
      if (!C.souHost() || !uid || uid === Rede.uid) return Promise.resolve();
      return Rede.silenciar(uid, !C.mudos[uid]).catch(e => C.avisa((e && e.message) || 'Não foi possível silenciar.'));
    },
    avisa(txt) { C.nota = txt; C.pinta(); clearTimeout(C.notaT); C.notaT = setTimeout(() => { C.nota = ''; C.pinta(); }, 3000); },

    // ---------- tela ----------
    cria() {
      if (!document.getElementById('onl-chat-css')) { const st = document.createElement('style'); st.id = 'onl-chat-css'; st.textContent = CSS; (document.head || document.body).appendChild(st); }
      if (!document.getElementById('onl-chatbtn')) { const b = document.createElement('button'); b.id = 'onl-chatbtn'; b.setAttribute('aria-label', 'Chat da sala'); b.onclick = () => C.alterna(); document.body.appendChild(b); }
      if (!document.getElementById('onl-chat')) { const p = document.createElement('div'); p.id = 'onl-chat'; p.style.display = 'none'; document.body.appendChild(p); }
    },
    alterna() { if (C.aberto) C.fecha(); else C.abre(); },
    abre() {
      const p = document.getElementById('onl-chat'); if (!p) return; C.aberto = true; C.naoLidas = 0;
      p.innerHTML = `<div class="chTopo"><b>💬 Chat da sala</b><button onclick="Chat.fecha()" aria-label="Fechar o chat">✕</button></div><div id="chatMudos"></div><div id="chatLista"></div><div id="chatNota"></div>
        <div class="chForm"><input id="chatTxt" maxlength="${C.MAX}" autocomplete="off" enterkeyhint="send" onkeydown="if(event.key==='Enter')Chat.envia()"><button onclick="Chat.envia()">Enviar</button></div>`;
      p.style.display = 'flex'; C.teclado(p); C.pinta(); const l = document.getElementById('chatLista'); if (l) l.scrollTop = l.scrollHeight;
    },
    fecha() {
      C.aberto = false; const p = document.getElementById('onl-chat'); if (p) { p.style.display = 'none'; p.innerHTML = ''; p.style.bottom = ''; }
      if (C.vv && window.visualViewport) { try { visualViewport.removeEventListener('resize', C.vv); visualViewport.removeEventListener('scroll', C.vv); } catch (e) { /* sem importância */ } } C.vv = null; C.pinta();
    },
    teclado(p) { // iPhone: o painel sobe junto com o teclado
      try { if (!window.visualViewport) return; C.vv = () => { p.style.bottom = Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop) + 'px'; };
        visualViewport.addEventListener('resize', C.vv); visualViewport.addEventListener('scroll', C.vv); C.vv(); } catch (e) { C.vv = null; }
    },
    htmlLista() {
      if (!C.msgs.length) return '<i>Nenhuma mensagem ainda.</i>';
      const host = C.souHost();
      return C.msgs.map(m => `<div class="cm${m.de === Rede.uid ? ' eu' : ''}"><b>${esc(m.nome)}</b>${host && m.de !== Rede.uid ? `<button class="cs" onclick="Chat.silencia('${esc(m.de)}')" title="Silenciar ${esc(m.nome)}" aria-label="Silenciar ${esc(m.nome)}">${C.mudos[m.de] ? '🔊' : '🔇'}</button>` : ''}<span>${esc(m.txt)}</span></div>`).join('');
    },
    htmlMudos() {
      const ids = Object.keys(C.mudos);
      if (C.euMudo()) return '🔇 O anfitrião silenciou você.';
      if (!C.souHost() || !ids.length) return '';
      return '🔇 Silenciados: ' + ids.map(u => `${esc(C.nomes[u] || '?')} <button class="cs" onclick="Chat.silencia('${esc(u)}')" aria-label="Liberar ${esc(C.nomes[u] || '')}">✕</button>`).join(' ');
    },
    pinta() {
      const b = document.getElementById('onl-chatbtn'); if (b) b.innerHTML = '💬' + (C.naoLidas ? `<span class="chatBadge">${C.naoLidas > 99 ? '99+' : C.naoLidas}</span>` : '');
      if (!C.aberto) return;
      const l = document.getElementById('chatLista'); if (l) { const fim = l.scrollHeight - l.scrollTop - l.clientHeight < 40; l.innerHTML = C.htmlLista(); if (fim) l.scrollTop = l.scrollHeight; }
      const m = document.getElementById('chatMudos'); if (m) m.innerHTML = C.htmlMudos();
      const n = document.getElementById('chatNota'); if (n) n.textContent = C.nota;
      const t = document.getElementById('chatTxt'); if (t) { t.disabled = C.euMudo(); t.placeholder = C.euMudo() ? 'Você foi silenciado' : 'Mensagem (até ' + C.MAX + ' caracteres)'; }
    },
  };
  const tick = () => { try { C.vigia(); } catch (e) { /* tenta de novo no próximo ciclo */ } setTimeout(tick, C.VIGIA_MS); };
  setTimeout(tick, 0);
  return C;
})();
