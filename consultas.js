// ===== FICHA TÉCNICA =====
// consultas.js: Pequenas perguntas rápidas sobre a partida: quem joga agora, quem ainda está vivo, comprar carta do baralho, a carta cabe no campo, registro (log) e achar item do mercado.
// ========================

const cur = () => S.players[S.order[S.t]];
const alive = () => S.players.filter(p => !p.out);
const log = t => { S.log.push(t); S.log = S.log.slice(-6); };
const pull = k => { if (!S.dk[k].length) S.dk[k] = sh(CARDS[k]); return { ...S.dk[k].pop(), uid: ++S.uid }; };
const fits = (f, c) => f.c.any || f.c.types.includes(c.crop);
const plotsOf = p => p.fields.flatMap(f => f.plots), lvOf = x => x.c.nivel || 1;
const find = l => { if (l.kind == 'res') return l; const q = S.players[l.s]; return l.kind == 'hand' ? q.hand.find(c => c.uid == l.uid) : q.fields.find(f => f.c.uid == l.uid); };
