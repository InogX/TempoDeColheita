// ===== FICHA TÉCNICA =====
// tela.js: Desenha a tela principal do jogo (render): barra de topo, campos à venda, seus campos, sua mão, abas dos jogadores, e ajusta o tamanho das cartas do centro (fit).
// ========================

function render() {
  const m = $('#app');
  if (!S) return menu();
  if (S.win) { localStorage.removeItem('tc_save');
    return m.innerHTML = `<h2>🏆 ${S.win.n} venceu!</h2><p>${S.win.why}</p><button onclick="A.quit()">Voltar ao menu</button>`; }
  localStorage.setItem('tc_save', JSON.stringify(S));
  const p = cur();
  const evb = `<div id="evb"><b>Evento Geral Ativo</b>${S.ev.map(e => `<div>${nm(e.c)}: ${desc(e.c)} (${e.left} rod.)</div>`).join('')}
    <b>Evento Individual Ativo</b><div>${!S.hide && p.ind ? nm(p.ind) + ': ' + desc(p.ind) : '—'}</div></div>`;
  if (S.hide) return m.innerHTML = `<h2>Vez do jogador ${p.n}</h2><p>Rodada ${S.round}. Passe o dispositivo e clique quando estiver pronto.</p>
    <button onclick="A.go()">Estou pronto</button><button onclick="A.modal('mkt')">🤝 Mercado</button>${REG.devAtivo ? '<button onclick="A.modal(\'dev\')">🛠 Dev</button>' : ''}<p class="log">${S.log.join('<br>')}</p>${evb}${modal()}`;
  const ring = S.players.map((q, i) => i).filter(i => !S.players[i].out), ci = ring.indexOf(S.order[S.t]);
  const oth = ring.slice(ci + 1).concat(ring.slice(0, ci)), half = Math.ceil(oth.length / 2);
  const tabs = ids => ids.map(i => sideTab(S.players[i], i, p)).join('');
  const sel = S.plantSel != null ? p.hand[S.plantSel] : null;
  const hud = `<div id="hud">${K.map(k => `<span class="hi">${hudDot(ASSETS.cultura[k], CROPS[k].slice(0, 2), 'big')}<b>${p.res[k] || 0}</b></span>`).join('')}<span class="hi">${hudDot(ASSETS.ouro, '$', 'big')}<b>${p.coins}</b></span></div>`;
  const mine = p.fields.map((f, i) => { const ok = sel && fits(f, sel) && free(f) >= NV(sel).espacos;
    return cardHTML(f.c, '', isNight(p, f), sel ? (ok ? `onclick="A.plantIn(${i})"` : '') : `data-field="${i}"`, sel ? (ok ? 'pick' : 'gray') : '', `${free(f)}/${f.c.slots}`); }).join('');
  const pode = c => p.fields.some(f => fits(f, c) && free(f) >= NV(c).espacos); // a carta só fica colorida se existir campo que a receba
  const hand = p.hand.map((c, h) => cardHTML(c, '', false, `data-plant="${h}" data-ok="${pode(c) ? 1 : 0}"`, (sel === c ? 'pick ' : '') + (pode(c) ? '' : 'gray'))).join('');
  m.innerHTML = `${hud}<div class="top">Rodada ${S.round} · Vez de <b>${p.n}</b> · Dívida ${p.debt}${done(p) ? ' · ✔ objetivo cumprido (vale no fim da rodada)' : ''}${S.ev.some(e => e.c.reveal == 'all') ? ' · Cofre do governo: ' + moeda(S.gov) : ''}
    <button onclick="A.modal('gov')">🏛 Acionar Governo</button><button onclick="A.modal('mkt')">🤝 Mercado</button><button onclick="A.modal('obj')">🎯 Objetivo</button>${REG.devAtivo ? '<button onclick="A.modal(\'dev\')">🛠 Dev</button>' : ''}<button onclick="A.end()">Encerrar turno ➜</button><button onclick="A.quit()">Sair</button>
    ${sel ? `<b class="pickmsg">Escolha o campo para plantar ${CROPS[sel.crop]} <button onclick="A.cancelPick()">Cancelar</button></b>` : ''}</div>
    <div class="center"><h3>Campos sendo vendidos</h3><div class="cards">${S.center.map((c, i) => `<div class="fs">${cardHTML(c)}<button class="${p.coins >= price(c) ? 'ok' : 'no'}" onclick="A.buyF(${i})">${price(c)}</button></div>`).join('') || 'Nenhum'}</div></div>
    <div class="cards mine">${mine || '<i>Você ainda não tem campos</i>'}</div>
    <div class="hand">${hand}</div>
    <div class="side sideL">${tabs(oth.slice(0, half))}</div><div class="side sideR">${tabs(oth.slice(half))}</div>
    <p class="log">${S.log.join('<br>')}</p>${evb}${modal()}`;
  fit();
}

// Ajusta o tamanho das cartas do centro para SEMPRE caberem na área pontilhada (.center)
const CENTER_MAX = 150, CENTER_MIN = 40, GAP = 4, CENTER_BTN = 34; // CENTER_BTN = altura do botão de compra abaixo da carta // largura máx/mín (px) de cada carta no centro
function fit() {
  const c = $('.center'), g = c && c.querySelector('.cards'), n = g ? g.children.length : 0; if (!n) return;
  const cs = getComputedStyle(c), [ra, rb] = (getComputedStyle(document.documentElement).getPropertyValue('--ratio-campo') || '7/5').split('/').map(Number);
  const W = c.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
    H = c.clientHeight - g.offsetTop - parseFloat(cs.paddingBottom) - 4; // altura livre abaixo do título
  let best = CENTER_MIN;
  for (let k = 1; k <= n; k++) { const w = Math.min(CENTER_MAX, Math.floor((W - (k - 1) * GAP) / k) - 1), rows = Math.ceil(n / k);
    if (rows * (w * rb / ra + CENTER_BTN) + (rows - 1) * GAP <= H) best = Math.max(best, w); }
  g.style.gridTemplateColumns = `repeat(auto-fill, ${best}px)`;
}
window.addEventListener('resize', fit);
