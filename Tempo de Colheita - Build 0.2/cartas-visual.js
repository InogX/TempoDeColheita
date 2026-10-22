// ===== FICHA TÉCNICA =====
// cartas-visual.js: Cuida da APARÊNCIA e dos TEXTOS das cartas: nome, descrição, preço, nível, imagem (dia/noite) e o desenho (HTML) de cada carta.
// ========================

const fa = c => ASSETS.campo[c.slots] || {};
const price = c => (c.any ? fa(c).precoCromada : fa(c).preco) ?? c.price;
const nm = c => c.slots ? (c.any ? fa(c).nomeCromada : fa(c).nome) || c.id : c.nome || c.id;
const ex = c => (c.night ? ' · plantações de noite' : '') + ({ all: ' · todos veem tudo', self: ' · você revela suas informações', peek: ' · espie um jogador' }[c.reveal] || '');
const vef = o => (o.t === 'mAll' || o.t === 'mSellTo') ? Math.max(1, Math.min(o.v, NJ() - 1)) : (o.esc ? Math.max(1, Math.ceil(o.v * Math.min(NJ() - 1, 4) / 4)) : o.v); // meta efetiva (escala com o nº de jogadores)
const objTxt = o => (T[o.t] || o.t).replace('{v}', vef(o)).replace('{v2}', o.v2).replace('{n}', o.n).replace('{r}', o.r).replace('{floor}', o.floor).replace('{c}', CROPS[o.c]);
const desc = c => c.t ? objTxt(c)
  : c.slots ? `${c.any ? 'Aceita qualquer cultura' : 'Aceita: ' + c.types.map(k => CROPS[k]).join(' / ')} · ${c.slots} vagas · ${price(c)} moedas`
  : c.crop ? `${CROPS[c.crop]} · nível ${c.nivel || 1} · ${NV(c).espacos} vaga(s) · +${NV(c).producao}/rodada · manut. ${NV(c).manut}`
  : `${c.dur ? c.dur + ' rod. · ' : ''}${c.mult ? 'produção x' + c.mult.toFixed(2) + ' · ' : ''}${c.coins} moedas${ex(c)}`;
const NV = c => ASSETS.niveis[c.nivel || 1];
const free = f => f.c.slots - f.plots.reduce((a, x) => a + NV(x.c).espacos, 0);
const isNight = (p, f) => !f.c.any && (S.ev.some(e => e.c.night) || p.nightUntil >= S.round);
const spr = (c, nt) => c.slots ? (c.any ? fa(c).cromada : (nt && fa(c).noite) || fa(c).dia) : c.crop ? (c['sprite' + (c.nivel > 1 ? c.nivel : '')] || c.sprite) : c.sprite;
const cardHTML = (c, x = '', nt = false, at = '', xc = '', fv = '') => { const s = spr(c, nt), f = c.slots;
  const cls = ['card', f ? 'campo' : '', s ? 'sp' : '', f && c.any && !s ? 'chrome' : '', f && nt && !fa(c).noite ? 'night' : '', xc].join(' ');
  const dots = f && !c.any ? `<div class="circ">${c.types.map(k => { const u = ASSETS.cultura[k];
    return `<span class="dot${u ? ' s' : ''}" title="${CROPS[k]}"${u ? ` style="background-image:url('${u}')"` : ''}>${u ? '' : CROPS[k].slice(0, 2)}</span>`; }).join('')}</div>` : '';
  return `<div class="${cls}" ${at}${s ? ` style="background-image:url('${s}')"` : ''}>${s ? '' : `<b>${nm(c)}</b><small>${desc(c)}</small>`}${dots}${fv ? `<span class="fv">${fv}</span>` : ''}${x ? `<div class="ex">${x}</div>` : ''}</div>`; };
