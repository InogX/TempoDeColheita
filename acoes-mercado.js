// ===== FICHA TÉCNICA =====
// acoes-mercado.js: Ações do Mercado entre jogadores: ofertar recursos, ofertar cartas, cancelar oferta, comprar de outro jogador (com a Taxa do Mercado e o Embargo) e registrar os números das negociações (para os objetivos). Quem atua é ator(): `UI.actor` ("atuar como" da janela do Mercado) ou, se não houver, eu(). (Recusas via recusa(): devolvem false e dizem o motivo; só se pode ofertar o que é seu e cancelar o que é seu.) A.listRes(k, qtd, preco) e A.list(kind, uid, preco) aceitam os valores como parâmetros opcionais (o bot usa); sem eles, leem os campos da tela como sempre.
// ========================

const negocio = (s, b, valor, un) => { const si = S.players.indexOf(s), bi = S.players.indexOf(b); // contadores de negociação entre jogadores
  s.st.ms = (s.st.ms || 0) + 1; s.st.mp = (s.st.mp || 0) + valor; s.st.mu = (s.st.mu || 0) + un; b.st.mb = (b.st.mb || 0) + 1;
  s.st.partners = s.st.partners || []; b.st.partners = b.st.partners || []; s.st.buyers = s.st.buyers || [];
  if (!s.st.partners.includes(bi)) s.st.partners.push(bi); if (!b.st.partners.includes(si)) b.st.partners.push(si); if (!s.st.buyers.includes(bi)) s.st.buyers.push(bi); };

const ator = () => UI.actor != null ? UI.actor : eu(); // quem está atuando no Mercado

Object.assign(A, {
  listRes(k, q, pr) { if (mercadoFechado()) return recusa('Mercado fechado (Embargo)'); if (!CROPS[k]) return recusa('Recurso inválido'); const a = S.players[ator()], qty = Math.floor(q !== undefined ? +q : +$('#rq' + k).value), price = Math.floor(pr !== undefined ? +pr : +$('#rp' + k).value);
    if (!(qty > 0 && price > 0)) return recusa('Informe quantidade e preço por unidade');
    if (qty > (a.res[k] || 0)) return recusa('Estoque insuficiente');
    if (S.mk.some(l => l.kind == 'res' && l.s == ator() && l.crop == k)) return recusa(`Você já tem uma oferta de ${CROPS[k]} no Mercado. Cancele a anterior antes.`);
    a.res[k] -= qty; S.mk.push({ id: ++S.uid, s: ator(), kind: 'res', crop: k, qty, price }); render(); },
  list(kind, uid, pr) { if (mercadoFechado()) return recusa('Mercado fechado (Embargo)'); const price = pr !== undefined ? +pr : +$('#pr' + uid).value, a = S.players[ator()];
    if (kind !== 'hand' && kind !== 'field') return recusa('Tipo de oferta inválido');
    if (!(price > 0)) return recusa('Informe o preço');
    if (!(kind == 'hand' ? a.hand.some(c => c.uid == uid) : a.fields.some(f => f.c.uid == uid))) return recusa('Esse item não é seu');
    if (S.mk.some(l => l.kind == kind && l.uid == uid)) return recusa('Este item já está à venda. Cancele a oferta anterior antes.');
    S.mk.push({ id: ++S.uid, s: ator(), kind, uid, price }); render(); },
  cancel(id) { const l = S.mk.find(x => x.id == id); if (!l) return recusa('Oferta não encontrada'); if (l.s != ator()) return recusa('Essa oferta não é sua');
    if (l.kind == 'res') S.players[l.s].res[l.crop] += l.qty; S.mk = S.mk.filter(x => x.id != id); render(); },
  buyM(id) { if (mercadoFechado()) return recusa('Mercado fechado (Embargo)'); const l = S.mk.find(x => x.id == id); if (!l) return recusa('Essa oferta não existe mais');
    const it = find(l), b = S.players[ator()], s = S.players[l.s]; if (l.s == ator()) return recusa('Você não pode comprar a própria oferta');
    if (l.kind == 'res') { const t = l.qty * l.price, fee = taxaMercado(t); if (b.coins < t) return recusa('Moedas insuficientes');
      b.coins -= t; s.coins += t - fee; S.gov += fee; b.res[l.crop] = (b.res[l.crop] || 0) + l.qty; negocio(s, b, t - fee, l.qty); S.mk = S.mk.filter(x => x != l);
      log(`${b.n} comprou ${l.qty} ${CROPS[l.crop]} de ${s.n} por ${t}${fee ? ` (taxa de ${fee} ao Governo)` : ''}`); return after(); }
    if (!it) { render(); return recusa('Essa oferta não existe mais'); }
    if (b.coins < l.price) return recusa('Moedas insuficientes');
    if (l.kind == 'hand') { if (b.hand.length >= REG.maxMao) return recusa('Mão cheia'); s.hand = s.hand.filter(c => c != it); b.hand.push(it); }
    else { s.fields = s.fields.filter(f => f != it); b.fields.push(it); }
    const fee = taxaMercado(l.price); b.coins -= l.price; s.coins += l.price - fee; S.gov += fee; negocio(s, b, l.price - fee, 0); S.mk = S.mk.filter(x => x != l); log(`${b.n} comprou de ${s.n} por ${l.price}${fee ? ` (taxa de ${fee} ao Governo)` : ''}`); after(); },
});
