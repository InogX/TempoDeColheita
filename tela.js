// ===== FICHA TÉCNICA =====
// tela.js: Desenha a tela principal do jogo (render; mostra o jogador deste aparelho, me(), e quem está na vez, cur(); na vez de um bot mostra a tela do bot e chama Bot.agenda()): barra de topo, campos à venda, seus campos, sua mão, abas dos jogadores, e ajusta o tamanho das cartas do centro (fit).
// Celular: .top = .st (texto) + .acts (botões); .seats agrupa as abas; .board agrupa campos à venda + seus campos; #evb é recolhível (EVB_OPEN). No PC esses grupos não mudam nada (display:contents).
// ========================

let EVB_OPEN = false; // #evb aberto/fechado no celular (fora de S, para não ir ao save)
function render() {
  const m = $('#app');
  if (!S) return menu();
  if (S.win) { localStorage.removeItem('tc_save');
    return m.innerHTML = `<h2>🏆 ${S.win.n} venceu!</h2><p>${S.win.why}</p><button onclick="A.quit()">Voltar ao menu</button>`; }
  localStorage.setItem('tc_save', JSON.stringify(S));
  const vez = cur(), p = me(); // vez = quem joga agora; p = quem sou eu (no jogo local é o mesmo jogador)
  const evb = `<div id="evb"${EVB_OPEN ? ' class="open"' : ''}><div class="evh" onclick="EVB_OPEN=!EVB_OPEN;this.parentNode.classList.toggle('open',EVB_OPEN)"><span>📅 ${S.ev.map(e => nm(e.c)).join(' · ') || 'Sem evento geral ativo'}</span><span class="car">▾</span></div>
    <div class="evc"><b>Evento Geral Ativo</b>${S.ev.map(e => `<div>${nm(e.c)}: ${evDesc(e)} (${e.left} rod.)</div>`).join('')}
    <b>Evento Individual Ativo</b><div>${!S.hide && p.ind ? nm(p.ind) + ': ' + desc(p.ind) : '—'}</div></div></div>`;
  if (vez.bot) { Bot.agenda(); return m.innerHTML = Bot.tela(vez, evb); } // vez de um bot (bot.js): ele joga sozinho; nada de "Passe o dispositivo"
  if (S.hide) return m.innerHTML = `<h2>Vez do jogador ${vez.n}</h2><p>Rodada ${S.round}. Passe o dispositivo e clique quando estiver pronto.</p>
    <button onclick="A.go()">Estou pronto</button><button onclick="A.modal('mkt')">🤝 Mercado</button>${REG.devAtivo ? '<button onclick="A.modal(\'dev\')">🛠 Dev</button>' : ''}<p class="log">${S.log.join('<br>')}</p>${evb}${modal()}`;
  const ring = S.players.map((q, i) => i).filter(i => !S.players[i].out), ci = ring.indexOf(eu());
  const oth = ring.slice(ci + 1).concat(ring.slice(0, ci)), half = Math.ceil(oth.length / 2);
  const tabs = ids => ids.map(i => sideTab(S.players[i], i, p)).join('');
  const sel = UI.plantSel != null ? p.hand[UI.plantSel] : null;
  const hud = `<div id="hud">${K.map(k => `<span class="hi">${hudDot(ASSETS.cultura[k], CROPS[k].slice(0, 2), 'big')}<b>${p.res[k] || 0}</b></span>`).join('')}<span class="hi">${hudDot(ASSETS.ouro, '$', 'big')}<b>${p.coins}</b></span></div>`;
  const mine = p.fields.map((f, i) => { const ok = sel && fits(f, sel) && free(f) >= NV(sel).espacos;
    return cardHTML(f.c, '', isNight(p, f), sel ? (ok ? `onclick="A.plantIn(${i})"` : '') : `data-field="${i}"`, sel ? (ok ? 'pick' : 'gray') : '', `${free(f)}/${f.c.slots}`); }).join('');
  const pode = c => p.fields.some(f => fits(f, c) && free(f) >= NV(c).espacos); // a carta só fica colorida se existir campo que a receba
  const hand = p.hand.map((c, h) => cardHTML(c, '', false, `data-plant="${h}" data-ok="${pode(c) ? 1 : 0}"`, (sel === c ? 'pick ' : '') + (pode(c) ? '' : 'gray'))).join('');
  m.innerHTML = `${hud}<div class="top"><span class="st">Rodada ${S.round} · Vez de <b>${vez.n}</b> · Dívida ${p.debt}${done(p) ? ' · ✔ objetivo cumprido (vale no fim da rodada)' : ''}${S.ev.some(e => e.c.reveal == 'all') ? ' · Cofre do governo: ' + moeda(S.gov) : ''}</span>
    <span class="acts"><button onclick="A.modal('gov')">🏛 Acionar Governo</button><button onclick="A.modal('mkt')">🤝 Mercado</button><button onclick="A.modal('obj')">🎯 Objetivo</button>${REG.devAtivo ? '<button class="dev" onclick="A.modal(\'dev\')">🛠 Dev</button>' : ''}<button class="end" onclick="A.end()">Encerrar turno ➜</button><button class="quit" onclick="A.quit()">Sair</button></span>
    ${sel ? `<b class="pickmsg">Escolha o campo para plantar ${CROPS[sel.crop]} <button onclick="A.cancelPick()">Cancelar</button></b>` : ''}</div>
    <div class="seats"><div class="side sideL">${tabs(oth.slice(0, half))}</div><div class="side sideR">${tabs(oth.slice(half))}</div></div>
    ${evb}
    <div class="board"><div class="center"><h3>Campos sendo vendidos</h3><div class="cards">${S.center.map((c, i) => `<div class="fs">${cardHTML(c)}<button class="${p.coins >= buyPrice(p, c) ? 'ok' : 'no'}" onclick="A.buyF(${i})">${buyPrice(p, c) || 'Grátis'}</button></div>`).join('') || 'Nenhum'}</div></div>
    <div class="cards mine">${mine || '<i>Você ainda não tem campos</i>'}</div></div>
    <div class="hand">${hand}</div>
    <p class="log">${S.log.join('<br>')}</p>${modal()}`;
  fit();
}

// Ajusta o tamanho das cartas do centro.
// PC: SEMPRE cabem na área pontilhada (.center, de altura fixa). Celular/tela baixa (COMPACT_Q): a área cresce com o conteúdo, então só se calcula quantas colunas cabem na largura.
const CENTER_MAX = 150, CENTER_MIN = 40, GAP = 4, CENTER_BTN = 34; // CENTER_BTN = altura do botão de compra abaixo da carta // largura máx/mín (px) de cada carta no centro
const COMPACT_Q = '(max-width:700px),(max-height:520px)', COMPACT_MIN = 110, COMPACT_MAX = 170; // mesmo critério do bloco "9" do style.css
function fit() {
  const c = $('.center'), g = c && c.querySelector('.cards'), n = g ? g.children.length : 0; if (!n) return;
  const cs = getComputedStyle(c);
  if (matchMedia(COMPACT_Q).matches) { const W = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
      k = Math.max(1, Math.min(n, Math.floor((W + GAP) / (COMPACT_MIN + GAP)))), w = Math.min(COMPACT_MAX, Math.floor((W - (k - 1) * GAP) / k) - 1);
    g.style.gridTemplateColumns = `repeat(auto-fill, ${Math.max(w, 60)}px)`; return; }
  const [ra, rb] = (getComputedStyle(document.documentElement).getPropertyValue('--ratio-campo') || '7/5').split('/').map(Number);
  const W = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
    H = c.clientHeight - g.offsetTop - parseFloat(cs.paddingBottom) - 4; // altura livre abaixo do título
  let best = CENTER_MIN;
  for (let k = 1; k <= n; k++) { const w = Math.min(CENTER_MAX, Math.floor((W - (k - 1) * GAP) / k) - 1), rows = Math.ceil(n / k);
    if (rows * (w * rb / ra + CENTER_BTN) + (rows - 1) * GAP <= H) best = Math.max(best, w); }
  g.style.gridTemplateColumns = `repeat(auto-fill, ${best}px)`;
}
window.addEventListener('resize', fit);
