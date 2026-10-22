// ===== FICHA TÉCNICA =====
// acoes-mercado.js: Ações do Mercado entre jogadores: ofertar recursos, ofertar cartas, cancelar oferta, comprar de outro jogador e registrar os números das negociações (para os objetivos).
// ========================

const negocio = (s, b, valor, un) => { const si = S.players.indexOf(s), bi = S.players.indexOf(b); // contadores de negociação entre jogadores
  s.st.ms = (s.st.ms || 0) + 1; s.st.mp = (s.st.mp || 0) + valor; s.st.mu = (s.st.mu || 0) + un; b.st.mb = (b.st.mb || 0) + 1;
  s.st.partners = s.st.partners || []; b.st.partners = b.st.partners || []; s.st.buyers = s.st.buyers || [];
  if (!s.st.partners.includes(bi)) s.st.partners.push(bi); if (!b.st.partners.includes(si)) b.st.partners.push(si); if (!s.st.buyers.includes(bi)) s.st.buyers.push(bi); };

Object.assign(A, {
  listRes(k) { const a = S.players[S.actor], qty = Math.floor(+$('#rq' + k).value), price = Math.floor(+$('#rp' + k).value);
    if (!(qty > 0 && price > 0)) return alert('Informe quantidade e preço por unidade');
    if (qty > (a.res[k] || 0)) return alert('Estoque insuficiente');
    if (S.mk.some(l => l.kind == 'res' && l.s == S.actor && l.crop == k)) return alert(`Você já tem uma oferta de ${CROPS[k]} no Mercado. Cancele a anterior antes.`);
    a.res[k] -= qty; S.mk.push({ id: ++S.uid, s: S.actor, kind: 'res', crop: k, qty, price }); render(); },
  list(kind, uid) { const price = +$('#pr' + uid).value;
    if (S.mk.some(l => l.kind == kind && l.uid == uid)) return alert('Este item já está à venda. Cancele a oferta anterior antes.');
    if (price > 0) S.mk.push({ id: ++S.uid, s: S.actor, kind, uid, price }); render(); },
  cancel(id) { const l = S.mk.find(x => x.id == id); if (l && l.kind == 'res') S.players[l.s].res[l.crop] += l.qty; S.mk = S.mk.filter(x => x.id != id); render(); },
  buyM(id) { const l = S.mk.find(x => x.id == id), it = find(l), b = S.players[S.actor], s = S.players[l.s];
    if (l.kind == 'res') { const t = l.qty * l.price; if (b.coins < t) return alert('Moedas insuficientes');
      b.coins -= t; s.coins += t; b.res[l.crop] = (b.res[l.crop] || 0) + l.qty; negocio(s, b, t, l.qty); S.mk = S.mk.filter(x => x != l);
      log(`${b.n} comprou ${l.qty} ${CROPS[l.crop]} de ${s.n} por ${t}`); return after(); }
    if (!it) return render();
    if (b.coins < l.price) return alert('Moedas insuficientes');
    if (l.kind == 'hand') { if (b.hand.length >= REG.maxMao) return alert('Mão cheia'); s.hand = s.hand.filter(c => c != it); b.hand.push(it); }
    else { s.fields = s.fields.filter(f => f != it); b.fields.push(it); }
    b.coins -= l.price; s.coins += l.price; negocio(s, b, l.price, 0); S.mk = S.mk.filter(x => x != l); log(`${b.n} comprou de ${s.n} por ${l.price}`); after(); },
});
