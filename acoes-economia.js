// ===== FICHA TÉCNICA =====
// acoes-economia.js: Ações de dinheiro com o Governo: comprar campo, pegar empréstimo, pagar dívida, comprar carta extra e vender recursos ao Governo.
// ========================

Object.assign(A, {
  buyF(i) { const p = cur(), c = S.center[i]; if (!c) return;
    if ((p.compras || 0) >= REG.maxCompraCamposPorTurno) return alert('Limite de compras de campo neste turno');
    if (REG.maxCamposPorJogador > 0 && p.fields.length >= REG.maxCamposPorJogador) return alert('Limite de campos por jogador atingido');
    if (p.coins < price(c)) return alert('Moedas insuficientes');
    p.coins -= price(c); S.gov += price(c); p.fields.push({ c, plots: [] }); S.center.splice(i, 1); p.compras = (p.compras || 0) + 1; after(); },
  loan() { if (S.gov < LOAN) return alert('O governo está sem moedas'); S.gov -= LOAN; cur().coins += LOAN; cur().debt += LOAN; cur().st.loans = (cur().st.loans || 0) + 1; after(); },
  pay() { const p = cur(), a = Math.min(LOAN, p.debt, Math.max(0, p.coins)); if (!a) return; p.coins -= a; p.debt -= a; S.gov += a; after(); },
  extra() { const p = cur(); if (p.hand.length >= REG.maxMao || p.coins < EXTRA) return alert('Mão cheia ou sem moedas');
    p.coins -= EXTRA; S.gov += EXTRA; p.hand.push(pull('plantacao')); after(); },
  sell(k) { const p = cur(), pr = CROP_PRICE[k], u = Math.min(p.res[k] || 0, Math.floor(S.gov / pr)); // venda provisória ao Governo
    if (!u) return alert(p.res[k] ? 'O governo está sem moedas' : 'Sem estoque');
    S.gov -= u * pr; p.coins += u * pr; p.res[k] -= u; p.st.inc += u * pr; log(`${p.n} vendeu ${u} ${CROPS[k]} (+${u * pr})`); after(); },
});
