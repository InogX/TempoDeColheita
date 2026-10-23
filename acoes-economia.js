// ===== FICHA TÉCNICA =====
// acoes-economia.js: Ações de dinheiro com o Governo: comprar campo (com Incentivo Fiscal), pegar empréstimo, pagar dívida, comprar carta extra, vender recursos ao Governo e comprar na Feira Regional. A.sell(k, qtd) e A.buyFeira(k, qtd) aceitam a quantidade como parâmetro opcional (o bot usa); sem ela, funcionam como sempre (vende tudo / lê o campo da tela).
// ========================

Object.assign(A, {
  buyF(i) { const p = cur(), c = S.center[i]; if (!c) return;
    if ((p.compras || 0) >= REG.maxCompraCamposPorTurno) return alert('Limite de compras de campo neste turno');
    if (REG.maxCamposPorJogador > 0 && p.fields.length >= REG.maxCamposPorJogador) return alert('Limite de campos por jogador atingido');
    const e = campoGratis(p, c), pr = e ? 0 : price(c); // Incentivo Fiscal: o 1º campo de até 100 moedas sai de graça
    if (p.coins < pr) return alert('Moedas insuficientes');
    if (e) { (e.used = e.used || []).push(S.players.indexOf(p)); log(`${p.n} levou o campo de graça (Incentivo Fiscal)`); }
    p.coins -= pr; S.gov += pr; p.fields.push({ c, plots: [] }); S.center.splice(i, 1); p.compras = (p.compras || 0) + 1; after(); },
  loan() { if (S.gov < LOAN) return alert('O governo está sem moedas'); S.gov -= LOAN; cur().coins += LOAN; cur().debt += LOAN; cur().st.loans = (cur().st.loans || 0) + 1; after(); },
  pay() { const p = cur(), a = Math.min(LOAN, p.debt, Math.max(0, p.coins)); if (!a) return; p.coins -= a; p.debt -= a; S.gov += a; after(); },
  extra() { const p = cur(); if (p.hand.length >= REG.maxMao || p.coins < EXTRA) return alert('Mão cheia ou sem moedas');
    p.coins -= EXTRA; S.gov += EXTRA; p.hand.push(pull('plantacao')); after(); },
  buyFeira(k, qtd) { const p = cur(), e = evFind('feira'); if (!e) return alert('Não há Feira Regional ativa'); // o Governo vende a preço fixo; cada jogador tem um limite por recurso
    const inp = document.getElementById('fq' + k), mx = feiraMax(e, p, k), q = Math.floor(qtd !== undefined ? qtd : inp && inp.value !== '' ? +inp.value : mx);
    if (!(q > 0)) return alert(mx ? 'Informe uma quantidade' : 'Você não pode comprar mais ' + CROPS[k] + ' na Feira (limite, estoque ou moedas)');
    if (q > mx) return alert(`Você só pode comprar ${mx} de ${CROPS[k]}`);
    const t = q * e.c.preco, i = S.players.indexOf(p); p.coins -= t; S.gov += t; p.res[k] = (p.res[k] || 0) + q; e.stock[k] -= q;
    (e.bought = e.bought || {})[i] = e.bought[i] || {}; e.bought[i][k] = feiraComprado(e, p, k) + q; log(`${p.n} comprou ${q} ${CROPS[k]} na Feira Regional (-${t})`); after(); },
  sell(k, qtd) { const p = cur(), pr = govPreco(k), u = Math.min(qtd === undefined ? Infinity : Math.floor(qtd), p.res[k] || 0, Math.floor(S.gov / pr)); // venda provisória ao Governo
    if (!u) return alert(p.res[k] ? 'O governo está sem moedas' : 'Sem estoque');
    S.gov -= u * pr; p.coins += u * pr; p.res[k] -= u; p.st.inc += u * pr; log(`${p.n} vendeu ${u} ${CROPS[k]} (+${u * pr})`); after(); },
});
