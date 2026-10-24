// ===== FICHA TÉCNICA =====
// visao.js: Visão filtrada do jogo (Fase 3). `viewFor(i)` devolve uma CÓPIA do estado S como o jogador i pode vê-lo (i = null: espectador, só o que é público). É o que o anfitrião envia a cada jogador no online: segredo nunca sai daqui.
// Regras (as mesmas do jogo local, via `sees()` de pecas-tela.js):
//  • Sempre público: nomes, bot/humano, quem saiu, campos de cada jogador (as cartas de campo, sem os plantios), noite/revelação (nightUntil, pubUntil), rodada, ordem, eventos gerais ativos, campos à venda, ofertas do Mercado, registro (log), vencedor.
//  • Só para quem `sees()` permite (o próprio jogador, "Tudo à vista", "Revelar-se", "Espiar"): moedas, dívida, estoque, plantios (cartas plantadas) e quantas cartas há na mão (cartas ocultas viram `{ oculta: true }`).
//  • Só do próprio jogador: mão (as cartas), objetivo, evento individual, estatísticas (st), compras do turno. Das cartas da mão de OUTRO jogador, só as que ele pôs à venda no Mercado.
//  • Nunca vai: baralhos (dk), contador de ids (uid) e modo Dev (devAll). O cofre do Governo (gov) só vai com "Tudo à vista". `peek` só vai para quem espiou e `peekPend` só para quem deve escolher. Dos eventos, `bought` e `used` levam só a parte do próprio jogador.
// Valores escondidos aparecem como `null` (coins, debt, res) para a tela nunca mostrar um número falso. A cópia é profunda e só tem dados simples (cabe em JSON).
// ========================

function viewFor(i) {
  const eu = i == null ? null : i, quem = eu == null ? {} : S.players[eu]; // quem = o jogador que vai olhar ({} = espectador)
  const players = S.players.map((q, j) => {
    if (j === eu) return { ...q }; // o próprio: tudo
    const vis = sees(quem, q), pub = { n: q.n, bot: q.bot, out: q.out, turns: q.turns, nightUntil: q.nightUntil, pubUntil: q.pubUntil };
    const ofertadas = S.mk.filter(l => l.kind == 'hand' && l.s === j).map(l => l.uid), vistas = q.hand.filter(c => ofertadas.includes(c.uid)); // cartas da mão que foram à venda: todos veem
    const fields = q.fields.map(f => ({ c: f.c, plots: vis ? f.plots : [] }));
    if (!vis) return { ...pub, fields, coins: null, debt: null, res: null, hand: vistas };
    return { ...pub, fields, coins: q.coins, debt: q.debt, res: q.res, hand: [...vistas, ...Array(Math.max(0, q.hand.length - vistas.length)).fill({ oculta: true })] };
  });
  const ev = S.ev.map(e => { const o = { ...e }; // da Feira e do Incentivo Fiscal, só o que é do próprio jogador
    if (o.bought) o.bought = eu != null && e.bought[eu] ? { [eu]: e.bought[eu] } : {};
    if (o.used) o.used = (e.used || []).filter(x => x === eu);
    return o; });
  const v = { round: S.round, t: S.t, first: S.first, order: S.order, hide: S.hide, win: S.win, auxDone: S.auxDone, mudas: S.mudas, ev, center: S.center, mk: S.mk, log: S.log, players,
    gov: S.ev.some(e => e.c.reveal == 'all') ? S.gov : null, // o cofre só aparece com "Tudo à vista"
    peek: S.peek && eu != null && S.peek.by === eu ? S.peek : null, peekPend: eu != null && S.peekPend === eu ? eu : null,
    uid: 0, dk: {}, devAll: false };
  return JSON.parse(JSON.stringify(v)); // cópia profunda: não divide nenhum objeto com S
}
