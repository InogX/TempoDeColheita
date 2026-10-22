// ===== FICHA TÉCNICA =====
// zoom.js: Janelas sobrepostas: ampliar carta, janela do campo, ver carta plantada, animação de melhoria, cliques nas cartas e tecla Esc.
// ========================

// ===== janelas sobrepostas: zoom das cartas, janela do campo, ver carta, melhorar (animação) e tecla Esc =====
const UPGRADE_MS = 2000; // duração da animação de melhoria
const zoomEl = () => document.getElementById('zoom');
const Z = {
  open(inner, extra, data = {}) { const o = zoomEl(); if (o) o.remove(); clearTimeout(Z.t); const d = document.createElement('div'); d.id = 'zoom';
    Object.entries(data).forEach(([k, v]) => d.dataset[k] = v); d.innerHTML = inner + (extra ? `<div class="zp">${extra}</div>` : ''); document.body.appendChild(d); return d; },
  close() { const z = zoomEl(); if (!z) return; const b = z.dataset.back; clearTimeout(Z.t); z.remove(); if (b !== undefined && S && !S.hide && S.order) Z.field(+b); }, // janelas abertas a partir do campo voltam para ele
  field(fi) { const p = cur(), f = p.fields[fi]; if (!f) { const z = zoomEl(); if (z) z.remove(); return; }
    Z.open(cardHTML(f.c, '', isNight(p, f), '', '', `${free(f)}/${f.c.slots}`), `<b>Plantios (vagas livres: ${free(f)}/${f.c.slots})</b>` + (f.plots.map((x, i) => { const L = x.c.nivel || 1, a = ASSETS.niveis[L], nx = ASSETS.niveis[L + 1];
      return `<div class="pr">${rec(x.c.crop, '')} ${CROPS[x.c.crop]} · nível ${L} · +${a.producao}/rodada<br><button onclick="Z.card(${fi},${i})">Ver carta</button>` +
        (nx ? `<button onclick="Z.up(${fi},${i})">Melhorar (${a.evolucao} ${CROPS[x.c.crop]})</button>` : '<button disabled>Nível máximo</button>') + '</div>'; }).join('') || '<div>Nenhum plantio</div>')); },
  card(fi, pi) { const p = cur(), x = p.fields[fi] && p.fields[fi].plots[pi]; if (!x) return; const L = x.c.nivel || 1, a = ASSETS.niveis[L];
    Z.open(cardHTML(x.c), `<b>${nm(x.c)} · ${CROPS[x.c.crop]}</b><div>Nível ${L} · ocupa ${a.espacos} vaga(s)</div><div>Produz +${a.producao}/rodada · manutenção ${a.manut}</div><button onclick="Z.close()">Voltar</button>`, { back: fi }); },
  up(fi, pi) { const p = cur(), x = p.fields[fi] && p.fields[fi].plots[pi]; if (!x) return; const L0 = x.c.nivel || 1, antes = { ...x.c };
    A.up(fi, pi);                                       // aplica a regra na hora (a animação é só visual)
    if ((x.c.nivel || 1) === L0) return Z.field(fi);    // regra recusou (o alerta já avisou)
    if (S.win) return;
    const d = Z.open(`<div class="stk"><div class="o" style="animation-duration:${UPGRADE_MS}ms">${cardHTML(antes)}</div><div class="n" style="animation-duration:${UPGRADE_MS}ms">${cardHTML(x.c)}</div></div>`, '', { anim: 1, back: fi });
    d.classList.add('anim'); Z.fx(d); Z.t = setTimeout(() => { if (zoomEl() === d) Z.close(); }, UPGRADE_MS); },
  fx(el) {} // gancho para efeitos visuais (VFX) da melhoria
};
function zoomExtra(c) {
  if (!S || S.hide || !S.order || c.dataset.plant == null) return '';
  return c.dataset.ok === '0' ? '<button disabled>🌱 Plantar</button><div>Nenhum campo seu aceita esta cultura ou tem vaga livre.</div>' : `<button onclick="A.pick(${c.dataset.plant})">🌱 Plantar</button>`;
}
document.addEventListener('click', e => {
  const z = zoomEl();
  if (z) { if (z.dataset.anim) return; if (!e.target.closest('#zoom .card, #zoom .zp')) Z.close(); return; }
  const c = e.target.closest('.card');
  if (!c || c.classList.contains('pick') || e.target.closest('button,select,input')) return;
  if (c.dataset.field != null && S && !S.hide && S.order) return Z.field(+c.dataset.field);
  const k = c.cloneNode(true); k.classList.remove('gray'); k.querySelectorAll('button,select,input').forEach(x => x.remove());
  const d = document.createElement('div'); d.id = 'zoom'; d.appendChild(k); const x = zoomExtra(c); if (x) d.insertAdjacentHTML('beforeend', `<div class="zp">${x}</div>`);
  document.body.appendChild(d);
});
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; // Esc fecha só a camada de cima
  if (zoomEl()) return Z.close(); if (!S) return;
  if (S.modal === 'view' && S.viewRes) { S.viewRes = false; return render(); }
  if (S.modal && S.modal !== 'peek') return A.modal(null);
  if (S.plantSel != null) A.cancelPick();
});
