// ===== FICHA TÉCNICA =====
// pecas-tela.js: Peças pequenas da tela: quem pode ver as informações de quem, ícones de moeda e recursos, caixinha de informações e as abas laterais dos jogadores.
// ========================

const sees = (v, t) => S.devAll || v == t || S.ev.some(e => e.c.reveal == 'all') || t.pubUntil >= S.round
  || (S.peek && S.peek.by == S.players.indexOf(v) && S.peek.to == S.players.indexOf(t));
const hudDot = (u, t, c = '') => `<span class="dot ${c}${u ? ' s' : ''}"${u ? ` style="background-image:url('${u}')"` : ''}>${u ? '' : t}</span>`;
const moeda = n => `<span class="mo">${hudDot(ASSETS.ouro, '$', 'ic')}${n}</span>`;                                    // sprite do ouro + valor
const rec = (k, n) => `<span class="mo">${hudDot(ASSETS.cultura[k], CROPS[k].slice(0, 2), 'ic')}${n}</span>`;                // sprite do recurso + valor
const infoHTML = q => `<div class="inf"><div>${moeda(q.coins)}<span class="sep">-</span>Dívida ${q.debt}</div><div>${K.map(k => rec(k, (q.res || {})[k] || 0)).join('<span class="sep">-</span>')}</div></div>`;
const sideTab = (q, i, p) => { const v = sees(p, q); return `<div class="tab${v ? ' vis' : ''}" onclick="A.view(${i})"><b>${q.n}</b>${v ? infoHTML(q) : ''}</div>`; };
