// ===== FICHA TÉCNICA =====
// cartas-visual.js: (rEf(o) = rodada-alvo efetiva do floorUntil, encurta com o nº de jogadores) Cuida da APARÊNCIA e dos TEXTOS das cartas: nome, descrição, preço, nível, imagem (dia/noite) e o desenho (HTML) de cada carta. BALANCEAMENTO: vef(o) é a meta EFETIVA do objetivo: as metas em MOEDAS (coins, clean, noLoan, noites, floorUntil; MOEDAS_ESC) escalam pela tabela FMOEDA (2 jogadores 40%, 3 = 37,5%, 4 ou mais = 35% do `v` do cartas.js); chrome/slots/lvlsum/prodEach pela FBUILD (100% até 3 jogadores, 90% com 4, 80% com 5+) e acompanham as regras de moedas iniciais e cofre do editor; o azar escala só a meta de moedas (vef2); os de mercado (esc:1) e mAll/mSellTo escalam pelo nº de adversários.
// ========================

const fa = c => ASSETS.campo[c.slots] || {};
const price = c => (c.any ? fa(c).precoCromada : fa(c).preco) ?? c.price;
const nm = c => c.slots ? (c.any ? fa(c).nomeCromada : fa(c).nome) || c.id : c.nome || c.id;
const ex = c => (c.night ? ' · plantações de noite' : '') + ({ all: ' · todos veem tudo', self: ' · você revela suas informações', peek: ' · espie um jogador' }[c.reveal] || '');
const MOEDAS_ESC = ['coins', 'clean', 'noLoan', 'noites', 'floorUntil']; // objetivos cuja meta (v) é em MOEDAS: escalam com o total de dinheiro do jogo (1500 por jogador); v = valor para 5+ jogadores
const FMOEDA = { 2: 0.40, 3: 0.375, 4: 0.35, 5: 0.35 }; // fração do `v` por nº de jogadores (5 = 5 ou mais). Medido: o ritmo de ganhar moedas depende da renda de CADA jogador, não do dinheiro total da mesa, então a meta efetiva fica quase igual (~1600 a 2000) em qualquer tamanho de partida
const fMoeda = () => (FMOEDA[Math.min(NJ(), 5)] ?? 0.5) * (REG.moedasIniciais + REG.cofrePorJogador) / 1500; // 1500 = moedas iniciais (500) + cofre por jogador (1000) das regras em que os valores foram calibrados; acompanha o editor se essas regras mudarem
const FBUILD = { 2: 1, 3: 1, 4: 0.9, 5: 0.8 }; // metas de construção (chrome, slots, lvlsum, prodEach): um pouco menores em partidas grandes, onde a partida termina antes (2p ~17 rodadas, 6p ~14)
const FFLOOR = { 2: 0.40, 3: 0.45, 4: 0.50, 5: 0.50 }; // 'floorUntil' tem a própria escala (medido: com a tabela FMOEDA ele ficava fácil demais com 3+ jogadores)
const fFloor = () => (FFLOOR[Math.min(NJ(), 5)] ?? 0.5) * (REG.moedasIniciais + REG.cofrePorJogador) / 1500;
const fBuild = () => FBUILD[Math.min(NJ(), 5)] ?? 0.8;
const vef = o => (o.t === 'mAll' || o.t === 'mSellTo') ? Math.max(1, Math.min(o.v, NJ() - 1)) : MOEDAS_ESC.includes(o.t) ? Math.max(1, Math.round(o.v * (o.t === 'floorUntil' ? fFloor() : fMoeda()))) : ['chrome', 'slots', 'lvlsum', 'prodEach'].includes(o.t) ? Math.max(1, Math.round(o.v * fBuild())) : (o.esc ? Math.max(1, Math.ceil(o.v * Math.min(NJ() - 1, 4) / 4)) : o.v); // meta efetiva (escala com o nº de jogadores)
const rEf = o => Math.max(5, Math.round(o.r * ({ 2: 0.9, 3: 0.8, 4: 0.75, 5: 0.65 }[Math.min(NJ(), 5)] ?? 0.65))); // 'floorUntil': a rodada-alvo encurta com mais jogadores (a partida dura menos: 2p ~17 rodadas, 6p ~13); r no cartas.js = valor para 2 jogadores / 0.9
const vef2 = o => o.t === 'azar' ? Math.max(1, Math.round(o.v2 * fMoeda())) : o.v2; // 'azar': a meta de moedas (v2) também escala (v é a contagem de eventos)
const objTxt = o => (T[o.t] || o.t).replace('{v}', vef(o)).replace('{v2}', vef2(o)).replace('{n}', o.n).replace('{r}', o.r === undefined ? '' : rEf(o)).replace('{floor}', o.floor).replace('{c}', CROPS[o.c]);
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
