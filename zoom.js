// ===== FICHA TÉCNICA =====
// zoom.js: (mostra sempre as cartas do jogador deste aparelho, me(); Z.up pede a melhoria por Cmd.up: no jogo local a resposta vem na hora e a animação toca; online (convidado) a resposta vem depois e Z.resposta() toca a animação ou reabre o campo) Janelas sobrepostas: ampliar carta, janela do campo, ver carta plantada, animação de melhoria, cliques nas cartas e tecla Esc.
// ========================

// ===== janelas sobrepostas: zoom das cartas, janela do campo, ver carta, melhorar (animação) e tecla Esc =====
const UPGRADE_MS = 2000; // duração da animação de melhoria
const zoomEl = () => document.getElementById('zoom');
const Z = {
  open(inner, extra, data = {}) { const o = zoomEl(); if (o) o.remove(); clearTimeout(Z.t); const d = document.createElement('div'); d.id = 'zoom';
    Object.entries(data).forEach(([k, v]) => d.dataset[k] = v); d.innerHTML = inner + (extra ? `<div class="zp">${extra}</div>` : ''); document.body.appendChild(d); return d; },
  close() { const z = zoomEl(); if (!z) return; const b = z.dataset.back; clearTimeout(Z.t); z.remove(); if (b !== undefined && S && !S.hide && S.order) Z.field(+b); }, // janelas abertas a partir do campo voltam para ele
  field(fi) { const p = me(), f = p.fields[fi], vm = !!(S.order && S.order[S.t] === eu() && !S.hide); if (!f) { const z = zoomEl(); if (z) z.remove(); return; } // vm = é a minha vez
    Z.open(cardHTML(f.c, '', isNight(p, f), '', '', `${free(f)}/${f.c.slots}`), `<b>Plantios (vagas livres: ${free(f)}/${f.c.slots})</b>` + (f.plots.map((x, i) => { const L = x.c.nivel || 1, a = ASSETS.niveis[L], nx = ASSETS.niveis[L + 1];
      return `<div class="pr">${rec(x.c.crop, '')} ${CROPS[x.c.crop]} · nível ${L} · +${a.producao}/rodada<br><button onclick="Z.card(${fi},${i})">Ver carta</button>` +
        (nx ? `<button${vm ? '' : ' disabled'} onclick="Z.up(${fi},${i})">Melhorar (${a.evolucao} ${CROPS[x.c.crop]})</button>` : '<button disabled>Nível máximo</button>') + '</div>'; }).join('') || '<div>Nenhum plantio</div>')); },
  card(fi, pi) { const p = me(), x = p.fields[fi] && p.fields[fi].plots[pi]; if (!x) return; const L = x.c.nivel || 1, a = ASSETS.niveis[L];
    Z.open(cardHTML(x.c), `<b>${nm(x.c)} · ${CROPS[x.c.crop]}</b><div>Nível ${L} · ocupa ${a.espacos} vaga(s)</div><div>Produz +${a.producao}/rodada · manutenção ${a.manut}</div><button onclick="Z.close()">Voltar</button>`, { back: fi }); },
  up(fi, pi) { const p = me(), x = p.fields[fi] && p.fields[fi].plots[pi]; if (!x) return; const antes = { ...x.c }, L0 = x.c.nivel || 1;
    const r = Cmd.up(fi, pi);                           // pede ao ponto único de comandos
    if (!r.ok) return r.pendente ? undefined : Z.field(fi); // recusado (o alerta já avisou); "pendente" sem ok = há outra jogada esperando resposta: ignora o toque
    if (r.pendente) { Z.aguarda = { fi, pi, antes, L0 }; return; } // online (convidado): a animação toca quando a resposta chegar (Z.resposta)
    Z.anima(fi, antes, x); },
  resposta(ack) { const w = Z.aguarda; if (!w) return; Z.aguarda = null; // chamado por online.js quando a resposta da melhoria chega (ou falha)
    const q = me(), x = q && q.fields[w.fi] && q.fields[w.fi].plots[w.pi];
    if (ack && ack.ok && x && (x.c.nivel || 1) > w.L0) Z.anima(w.fi, w.antes, x); else Z.field(w.fi); },
  anima(fi, antes, x) {
    if (S.win) return;
    const d = Z.open(`<div class="stk"><div class="o" style="animation-duration:${UPGRADE_MS}ms">${cardHTML(antes)}</div><div class="n" style="animation-duration:${UPGRADE_MS}ms">${cardHTML(x.c)}</div></div>`, '', { anim: 1, back: fi });
    d.classList.add('anim'); Z.fx(d); Z.t = setTimeout(() => { if (zoomEl() === d) Z.close(); }, UPGRADE_MS); },
  fx(el) {} // gancho para efeitos visuais (VFX) da melhoria
};
function zoomExtra(c) {
  if (!S || S.hide || !S.order || c.dataset.plant == null) return '';
  if (S.order[S.t] !== eu()) return '<button disabled>🌱 Plantar</button><div>Aguarde a sua vez para plantar.</div>'; // online: só planta na sua vez
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
  if (UI.modal === 'view' && UI.viewRes) { UI.viewRes = false; return render(); }
  if (UI.modal) return A.modal(null);
  if (UI.plantSel != null) A.cancelPick();
});
