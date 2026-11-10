// ===== FICHA TÉCNICA =====
// mesa.js: MESA (visão superior, etapa M2). Só no ONLINE e só quando você NÃO está jogando (tela de espera e vez de um bot): no lugar do texto "X está jogando…" mostra a mesa: uma zona por jogador em volta, VOCÊ sempre embaixo (assento 1, à esquerda), os assentos em ordem de turno no sentido horário; no centro a SUA loja de campos (só você vê), os baralhos e a barra de botões. Um só nome global: Mesa.
// Protótipo aprovado: "Mesa — protótipo v2 (2 a 10 jogadores)". Layout por nº de jogadores em `Mesa.L` ([base, esquerda, topo, direita] = assentos em cada lado). PALCO de proporção FIXA 2:1 (`.ms-palco`): tudo é medido em `cqw` do palco, que escala por inteiro e fica centralizado (faixas nas sobras) em qualquer janela; abaixo de 640 px de largura ele para de encolher e a tela rola. O CENTRO (`.ms-compra`) é um container próprio e se adapta à altura que sobrar. A cena toda gira 90° no celular em pé (opção ⚙ para desligar).
// Informação: a mesa NÃO cria regra de informação. Para cada jogador mostra só o que `sees()` permite (moedas, dívida, estoque e o que está plantado só se você pode ver) mais os NÚMEROS públicos da visão: cartas na mão (nMao), vagas usadas de cada campo (usados) e cartas em cada baralho (dkN). Nada de HTML vindo da rede sem escapar.
// Arte: ASSETS.mesa (editor.html, seção Mesa): fundo (proporção 2:1, ex.: 1900×950), cor do fundo, verso das cartas na mão e verso/cor de cada baralho (recursos e eventos: 576×1032 vertical; campos: 1248×832 horizontal, igual às cartas de campo). Sem imagem usa a cor; sem ASSETS.mesa usa os padrões de Mesa.DEF.
// Interface: zona = toque abre "Ver jogador" (A.view). Barra: 🎯 Objetivo, 🤝 Mercado, 📜 Registro (eventos e registro), ⚙ (girar a mesa; usar a tela simples), ⏩ (anfitrião, na vez de um bot), Sair. O chat (chat.js) tem o próprio botão 💬 fora do #app.
// Preferências (localStorage, só deste aparelho): tc_mesa = 'off' usa a tela simples de antes; tc_mesa_gira = 'off' não gira a mesa no celular em pé.
// Ganchos em tela.js: Mesa.sai() no começo de render(); Mesa.ativa() e Mesa.tela(vez, p) na espera e na vez do bot. O jogo local (passe o aparelho) não usa a mesa.
// Depende de: S, me, eu, sees, nm, nMao, usados, lojaDe, buyPrice, cardHTML, evDesc, done, A, Online, Bot, UI (outros arquivos); CSS: bloco "12. MESA" do style.css. Carrega depois de zoom.js.
// ========================

const Mesa = (() => {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"'`]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
  const lerPref = (k, pad) => { try { const v = localStorage.getItem(k); return v == null ? pad : v; } catch (e) { return pad; } };
  const gravaPref = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sem importância */ } };
  const okImg = u => typeof u === 'string' && /^(?!.*\.\.)[\w\-][\w./\-]{0,159}$/.test(u);  // caminho de imagem seguro (vem do cartas.js): relativo, sem ".." e sem começar por /
  const okCor = c => typeof c === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(c);          // cor segura
  const DEF = { // padrões (MESA_DEFAULTS do config.js, para quando ASSETS.mesa não existir)
    corFundo: '#2f5a3b',
    baralhos: { plantacao: { nome: 'Recursos', cor: '#e0262f' }, campo: { nome: 'Terrenos', cor: '#6a4c93' }, geral: { nome: 'Eventos gerais', cor: '#1da1e6' }, individual: { nome: 'Eventos individuais', cor: '#4752cf' } } };
  const LETRA = { plantacao: 'R', campo: 'T', geral: 'G', individual: 'I' };
  // quantos campos cada zona desenha (o resto vira "+N"): depende do nº de jogadores porque a zona encolhe quando há mais gente
  const maxFt = (lado, n) => lado === 'lado' ? (n <= 4 ? 12 : n <= 8 ? 8 : 0) : (n <= 4 ? 11 : n <= 6 ? 7 : 5); // 0 = zona pequena (mesa de 9 ou 10): só o resumo
  const largura = n => n <= 4 ? ['26cqw', '16cqw'] : n <= 6 ? ['21cqw', '14cqw'] : ['17.5cqw', '12.5cqw']; // [topo/base, lados]

  const M = {
    // [base, esquerda, topo, direita]: quantos assentos em cada lado. Assento 1 = você, embaixo à esquerda; numeração no sentido horário.
    L: { 2: [1, 0, 1, 0], 3: [1, 1, 1, 0], 4: [1, 1, 1, 1], 5: [1, 1, 2, 1], 6: [2, 1, 2, 1], 7: [2, 1, 3, 1], 8: [3, 1, 3, 1], 9: [3, 2, 3, 1], 10: [3, 2, 3, 2] },
    DEF, painel: null, visivel: false,

    // ---------- preferências ----------
    usar: () => lerPref('tc_mesa', 'on') !== 'off',
    giraOn: () => lerPref('tc_mesa_gira', 'on') !== 'off',
    ativa: () => M.usar() && !!(window.Online && Online.ativo),

    // ---------- assentos ----------
    assentos(n) { // números de assento (1 = você) em cada lado
      const l = M.L[Math.max(2, Math.min(10, n))] || M.L[10], [b, e, t, d] = l; let k = 2; const esq = [], topo = [], dir = [], res = [];
      for (let i = 0; i < e; i++) esq.push(k++); for (let i = 0; i < t; i++) topo.push(k++);
      for (let i = 0; i < d; i++) dir.push(k++); for (let i = 0; i < b - 1; i++) res.push(k++);
      return { base: [1, ...res.reverse()], esq, topo, dir };
    },
    quem: (seat, n, eu0) => (eu0 + seat - 1) % n, // índice do jogador que ocupa o assento

    // ---------- arte (ASSETS.mesa, com padrões) ----------
    arte() { const A = (typeof ASSETS !== 'undefined' && ASSETS && ASSETS.mesa) || {}; return A; },
    baralhoArte(k) { const B = (M.arte().baralhos || {})[k] || {}, d = DEF.baralhos[k];
      const cor = okCor(B.cor) ? B.cor : d.cor, img = okImg(B.verso) ? B.verso : '';
      return { nome: B.nome || d.nome, cor, img, st: img ? `background:${cor} url('${img}') center/cover` : `background:${cor}` }; },
    versoMao() { const A = M.arte(), r = M.baralhoArte('plantacao'), img = okImg(A.versoMao) ? A.versoMao : r.img;
      return img ? `background:${r.cor} url('${img}') center/cover` : `background:${r.cor}`; },
    fundo() { const A = M.arte(); return okImg(A.fundo) ? `background:${okCor(A.corFundo) ? A.corFundo : DEF.corFundo} url('${A.fundo}') center/cover` : `background:${okCor(A.corFundo) ? A.corFundo : DEF.corFundo}`; },
    dkN: k => (S.dkN ? S.dkN[k] : (S.dk && S.dk[k] || []).length), // convidado: vem na visão; anfitrião: do baralho

    // ---------- peças ----------
    baralho(k) { const a = M.baralhoArte(k), n = M.dkN(k);
      return `<div class="ms-baralho${k === 'campo' ? ' h' : ''}" style="${a.st}" title="${esc(a.nome)}: ${n == null ? '?' : n} carta(s)">${a.img ? '' : LETRA[k]}<small>${n == null ? '?' : n}</small></div>`; },
    comArte() { const A = M.arte(), r = M.baralhoArte('plantacao'); return okImg(A.versoMao) || !!r.img; }, // há imagem de verso para a mão?
    mao(cnt, compacto) { if (compacto) return `<div class="ms-mao c"><small>🃏 ${cnt}</small></div>`; // zona pequena (mesa de 9 ou 10): só o número
      const n = Math.min(cnt, M.comArte() ? 5 : 8), st = M.versoMao();
      return `<div class="ms-mao${M.comArte() ? ' art' : ''}"><div class="ms-mcs">${[...Array(n)].map(() => `<i class="ms-mc" style="${st}"></i>`).join('')}</div><small>${cnt}</small></div>`; },
    zona(seat, c, lado) {
      const { n, eu0, p } = c, i = M.quem(seat, n, eu0), q = S.players[i], eh = i === eu0, vis = eh || sees(p, q), vez = S.order && S.order[S.t] === i && !q.out;
      const nome = `${seat}. ${esc(q.n)}${q.bot ? ' 🤖' : ''}${q.out ? ' ☠' : ''}${!eh && vis && !q.out ? ' 👁' : ''}${vez ? ' ▶' : ''}`;
      if (q.out) return `<div class="ms-zona ms-out" data-i="${i}" onclick="A.view(${i})"><b>${nome}</b><div class="ms-eli">eliminado</div></div>`;
      const cnt = nMao(q), lim = maxFt(lado, n), fs = q.fields || [], resumo = lim === 0, mais = !resumo && fs.length > lim ? fs.length - lim + 1 : 0, mostra = resumo ? [] : fs.slice(0, mais ? lim - 1 : lim);
      const tiles = mostra.map(f => { const u = usados(f), pl = vis && f.plots && f.plots.length ? `<small>${f.plots.map(x => esc(CROPS[x.c.crop] ? CROPS[x.c.crop].slice(0, 1) : '?') + (x.c.nivel || 1)).join(' ')}</small>` : '';
        return `<span class="ms-ft${u >= f.c.slots ? ' cheio' : ''}" title="${esc(nm(f.c))}: ${u} de ${f.c.slots} vagas usadas">${u}/${f.c.slots}${pl}</span>`; }).join('') + (mais > 0 ? `<span class="ms-ft ms-mais">+${mais}</span>` : '') + (resumo ? `<span class="ms-ft ms-sum" title="${fs.length} campo(s): ${fs.reduce((a, f) => a + usados(f), 0)} de ${fs.reduce((a, f) => a + f.c.slots, 0)} vagas usadas">${fs.length} 🌾 ${fs.reduce((a, f) => a + usados(f), 0)}/${fs.reduce((a, f) => a + f.c.slots, 0)}</span>` : '');
      const din = vis && q.coins != null ? `<div class="ms-din">💰 ${q.coins}${q.debt ? ' · dív. ' + q.debt : ''}</div>` : '';
      const est = vis && q.res ? K.filter(k => (q.res[k] || 0) > 0).map(k => esc(CROPS[k].slice(0, 2)) + ' ' + q.res[k]).join(' · ') : '';
      return `<div class="ms-zona${vez ? ' vez' : ''}${eh ? ' ms-eu' : ''}" data-i="${i}" onclick="A.view(${i})"><b>${nome}</b>
        <div class="ms-lin">${M.mao(cnt, resumo)}<div class="ms-fts">${tiles || '<small>sem campos</small>'}</div></div>${din}${est ? `<div class="ms-est">${est}</div>` : ''}</div>`; },

    painelHTML(vez, p) {
      if (M.painel === 'reg') { const ie = vez.bot ? vez : p;
        return `<div class="ms-ph"><b>📜 Registro</b><button onclick="Mesa.alterna(null)" aria-label="Fechar">✕</button></div>
          <b>Evento Geral Ativo</b>${S.ev.map(e => `<div>${esc(nm(e.c))}: ${evDesc(e)} (${e.left} rod.)</div>`).join('') || '<div>—</div>'}
          <b>Evento Individual Ativo${vez.bot ? ' (' + esc(vez.n) + ')' : ''}</b><div>${!S.hide && ie.ind ? esc(nm(ie.ind)) + ': ' + desc(ie.ind) : '—'}</div>
          <b>Registro</b><div class="ms-log">${S.log.map(esc).join('<br>')}</div>`; }
      if (M.painel === 'cfg') return `<div class="ms-ph"><b>⚙ Mesa</b><button onclick="Mesa.alterna(null)" aria-label="Fechar">✕</button></div>
          <p><button onclick="Mesa.opcao('gira')">Girar a mesa no celular em pé: ${M.giraOn() ? 'sim' : 'não'}</button></p>
          <p><button onclick="Mesa.opcao('mesa')">Usar a tela simples (sem mesa)</button></p><small>Só vale neste aparelho.</small>`;
      return '';
    },

    // ---------- a tela ----------
    tela(vez, p) {
      const n = S.players.length, eu0 = eu(), a = M.assentos(n), c = { n, eu0, p }, host = !!(window.Online && Online.host);
      const feito = (!host ? S.extra && S.extra.feito : done(p));
      const portrait = typeof matchMedia === 'function' && matchMedia('(orientation: portrait)').matches;
      M.visivel = true; try { document.body.classList.add('ms-on'); document.body.classList.toggle('ms-gira', !!(portrait && M.giraOn())); } catch (e) { /* sem importância */ }
      const loja = p.out ? '' : (lojaDe(p) || []).map(k => `<div class="ms-cp">${cardHTML(k)}<b>${k.trava ? '🔒 ' : ''}${buyPrice(p, k) || 'Grátis'}</b></div>`).join('');
      const evs = S.ev.map(e => `<div class="ms-ev">${esc(nm(e.c))} · ${e.left} rod.</div>`).join('');
      const pn = M.painelHTML(vez, p);
      const [zw, sw] = largura(n);
      return `<div class="ms-cena"><div class="ms-palco"><div class="ms-mesa" style="${M.fundo()};--zw:${zw};--sw:${sw}">
        <div class="ms-topo">${a.topo.map(s => M.zona(s, c, 'topo')).join('')}</div>
        <div class="ms-meio"><div class="ms-lado ms-esq">${a.esq.map(s => M.zona(s, c, 'lado')).join('')}</div>
          <div class="ms-centro">${M.baralho('campo')}<div class="ms-compra"><div class="ms-ci">
            <div class="ms-topc"><div class="ms-st">Rodada ${S.round} · vez de <b>${esc(vez.n)}</b>${p.out ? ' · ☠ você foi eliminado: acompanhe a partida' : ''}${feito ? ' · ✔ seu objetivo está cumprido' : ''}</div>
            ${loja ? '<div class="ms-t">Sua loja de campos (só você vê)</div>' : (p.out ? '' : '<div class="ms-t">Sua loja de campos é sorteada no início do seu turno</div>')}</div>
            <div class="ms-fila" style="--nc:${Math.max(1, (lojaDe(p) || []).length)}">${loja}</div>
            <div class="ms-barra"><button onclick="A.modal('obj')">🎯 Objetivo${feito ? ' ✔' : ''}</button><button onclick="A.modal('mkt')">🤝 Mercado</button><button onclick="Mesa.alterna('reg')">📜 Registro</button><button onclick="Mesa.alterna('cfg')" aria-label="Opções da mesa">⚙</button>${vez.bot && host ? '<button onclick="Bot.delay = Bot.delay > 300 ? 100 : 700" aria-label="Velocidade do bot">⏩</button>' : ''}<button onclick="A.quit()">Sair</button></div>
          </div></div></div>
          <div class="ms-lado ms-dir">${a.dir.map(s => M.zona(s, c, 'lado')).join('')}</div></div>
        <div class="ms-base"><div class="ms-canto">${M.baralho('plantacao')}</div>${a.base.map(s => M.zona(s, c, 'base')).join('')}<div class="ms-canto">${evs}${M.baralho('geral')}${M.baralho('individual')}</div></div>
        </div>${pn ? `<div class="ms-painel">${pn}</div>` : ''}</div></div>`;
    },
    sai() { if (!M.visivel) return; M.visivel = false; try { document.body.classList.remove('ms-on'); document.body.classList.remove('ms-gira'); } catch (e) { /* sem importância */ } },

    // ---------- ações da interface (valem só neste aparelho) ----------
    alterna(x) { M.painel = M.painel === x ? null : x; render(); },
    opcao(k) { if (k === 'gira') gravaPref('tc_mesa_gira', M.giraOn() ? 'off' : 'on'); if (k === 'mesa') gravaPref('tc_mesa', M.usar() ? 'off' : 'on'); M.painel = null; render(); },
  };
  try { if (typeof matchMedia === 'function') matchMedia('(orientation: portrait)').addEventListener('change', () => { if (M.visivel) render(); }); } catch (e) { /* navegador sem matchMedia */ }
  return M;
})();
