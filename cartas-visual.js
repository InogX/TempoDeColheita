// ===== FICHA TÉCNICA =====
// cartas-visual.js: Cuida da APARÊNCIA e dos TEXTOS das cartas: nome, descrição, preço, nível, imagem (dia/noite) e o desenho (HTML) de cada carta. BALANCEAMENTO: vef(o) é a meta EFETIVA do objetivo: as metas em MOEDAS (coins, clean, noLoan, noites, floorUntil; MOEDAS_ESC) escalam com o total de dinheiro do jogo (moedas iniciais + cofre por jogador; hoje 1500 por jogador), então `v` no cartas.js é o valor para 5+ jogadores (2 jogadores = 40%); o azar escala só a meta de moedas (vef2); os de mercado (esc:1) e mAll/mSellTo escalam pelo nº de adversários.
// ========================

const fa = c => ASSETS.campo[c.slots] || {};
const price = c => (c.any ? fa(c).precoCromada : fa(c).preco) ?? c.price;
const nm = c => c.slots ? (c.any ? fa(c).nomeCromada : fa(c).nome) || c.id : c.nome || c.id;
const ex = c => (c.night ? ' · plantações de noite' : '') + ({ all: ' · todos veem tudo', self: ' · você revela suas informações', peek: ' · espie um jogador' }[c.reveal] || '');
const MOEDAS_ESC = ['coins', 'clean', 'noLoan', 'noites', 'floorUntil']; // objetivos cuja meta (v) é em MOEDAS: escalam com o total de dinheiro do jogo (1500 por jogador); v = valor para 5+ jogadores
const fMoeda = () => Math.min(NJ(), 5) / 5 * (REG.moedasIniciais + REG.cofrePorJogador) / 1500; // 1500 = moedas iniciais (500) + cofre por jogador (1000) das regras em que os valores foram calibrados; acompanha o editor se essas regras mudarem
const vef = o => (o.t === 'mAll' || o.t === 'mSellTo') ? Math.max(1, Math.min(o.v, NJ() - 1)) : MOEDAS_ESC.includes(o.t) ? Math.max(1, Math.round(o.v * fMoeda())) : (o.esc ? Math.max(1, Math.ceil(o.v * Math.min(NJ() - 1, 4) / 4)) : o.v); // meta efetiva (escala com o nº de jogadores)
const vef2 = o => o.t === 'azar' ? Math.max(1, Math.round(o.v2 * fMoeda())) : o.v2; // 'azar': a meta de moedas (v2) também escala (v é a contagem de eventos)
const objTxt = o => (T[o.t] || o.t).replace('{v}', vef(o)).replace('{v2}', vef2(o)).replace('{n}', o.n).replace('{r}', o.r).replace('{floor}', o.floor).replace('{c}', CROPS[o.c]);
const evTxt = (c, crop) => (EVT[c.fx] || '').replace(/\{(\w+)\}/g, (_, k) => k === 'c' ? (crop ? CROPS[crop] : 'uma cultura sorteada') : (c[k] ?? '')); // texto da regra do evento (a cultura sorteada vem do item de S.ev)
const desc = c => c.t ? objTxt(c)
  : c.slots ? `${c.any ? 'Aceita qualquer cultura' : 'Aceita: ' + c.types.map(k => CROPS[k]).join(' / ')} · ${c.slots} vagas · ${price(c)} moedas`
  : c.crop ? `${CROPS[c.crop]} · nível ${c.nivel || 1} · ${NV(c).espacos} vaga(s) · +${NV(c).producao}/rodada · manut. ${NV(c).manut}`
  : [c.dur ? c.dur + ' rod.' : '', c.mult ? 'produção x' + c.mult.toFixed(2) : '', c.fx ? evTxt(c) : '', c.coins ? c.coins + ' moedas' : (c.fx || c.mult || c.night || c.reveal ? '' : '0 moedas'), ex(c).replace(/^ · /, '')].filter(Boolean).join(' · ');
const evDesc = e => e.c.fx ? evTxt(e.c, e.crop) : desc(e.c); // descrição de um evento ATIVO (mostra a cultura sorteada)
const NV = c => ASSETS.niveis[c.nivel || 1];
const free = f => f.c.slots - f.plots.reduce((a, x) => a + NV(x.c).espacos, 0);
const isNight = (p, f) => !f.c.any && (S.ev.some(e => e.c.night) || p.nightUntil >= S.round);
const spr = (c, nt) => c.slots ? (c.any ? fa(c).cromada : (nt && fa(c).noite) || fa(c).dia) : c.crop ? (c['sprite' + (c.nivel > 1 ? c.nivel : '')] || c.sprite) : c.sprite;
const cardHTML = (c, x = '', nt = false, at = '', xc = '', fv = '') => { const s = spr(c, nt), f = c.slots;
  const cls = ['card', f ? 'campo' : '', s ? 'sp' : '', f && c.any && !s ? 'chrome' : '', f && nt && !fa(c).noite ? 'night' : '', xc].join(' ');
  const dots = f && !c.any ? `<div class="circ">${c.types.map(k => { const u = ASSETS.cultura[k];
    return `<span class="dot${u ? ' s' : ''}" title="${CROPS[k]}"${u ? ` style="background-image:url('${u}')"` : ''}>${u ? '' : CROPS[k].slice(0, 2)}</span>`; }).join('')}</div>` : '';
  return `<div class="${cls}" ${at}${s ? ` style="background-image:url('${s}')"` : ''}>${s ? '' : `<b>${nm(c)}</b><small>${desc(c)}</small>`}${dots}${fv ? `<span class="fv">${fv}</span>` : ''}${x ? `<div class="ex">${x}</div>` : ''}</div>`; };
