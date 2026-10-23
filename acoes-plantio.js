// ===== FICHA TÉCNICA =====
// acoes-plantio.js: Ações de lavoura: escolher uma carta para plantar (UI.plantSel), cancelar, plantar no campo (A.plantIn(fi, h): h opcional = carta da mão; sem ele usa a carta escolhida) e evoluir (melhorar) a carta de recurso de nível.
// ========================

Object.assign(A, {
  pick(h) { const z = document.getElementById('zoom'); if (z) z.remove(); UI.plantSel = h; render(); },
  cancelPick() { UI.plantSel = null; render(); },
  plantIn(fi, h = UI.plantSel) { const p = cur(), c = p.hand[h], f = p.fields[fi];
    if (!c || !f || !fits(f, c) || free(f) < NV(c).espacos) return;
    f.plots.push({ c }); p.hand.splice(h, 1); UI.plantSel = null; log(`${p.n} plantou ${CROPS[c.crop]}`); after(); },
  up(fi, pi) { const p = cur(), x = p.fields[fi] && p.fields[fi].plots[pi]; if (!x) return;
    const L = x.c.nivel || 1, a = ASSETS.niveis[L], b = ASSETS.niveis[L + 1];
    if (!b) return alert('Nível máximo');
    if ((p.res[x.c.crop] || 0) < a.evolucao) return alert(`Precisa de ${a.evolucao} de ${CROPS[x.c.crop]}`);
    if (free(p.fields[fi]) < b.espacos - a.espacos) return alert('Sem espaço livre neste campo');
    p.res[x.c.crop] -= a.evolucao; x.c.nivel = L + 1; log(`${p.n} evoluiu ${CROPS[x.c.crop]} para o nível ${L + 1}`);
    const z = document.getElementById('zoom'); if (z) z.remove(); after(); },
});
