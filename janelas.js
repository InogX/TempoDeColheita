// ===== FICHA TÉCNICA =====
// janelas.js: Monta as janelas (modais): Governo, Mercado, Objetivo secreto, Espiar, Ver jogador e painel Dev.
// (Celular: o botão redondo ✕ (.mx) fica no fim do HTML para não mudar a ordem dos botões; o CSS o fixa no canto da tela.)
// ========================

function modal() {
  if (!S.modal) return ''; let h;
  if (S.modal == 'peek') h = `<h3>👁 Escolha quem espiar</h3>${alive().filter(q => q != cur()).map(q => `<button onclick="A.peek(${S.players.indexOf(q)})">${q.n}</button>`).join('')}`;
  else if (S.modal == 'obj') h = `<h3>🎯 Seu objetivo (secreto)</h3>${cardHTML(cur().obj)}`;
  else if (S.modal == 'view') { const q = S.players[S.viewing], v = sees(cur(), q), plantados = q.fields.flatMap(f => f.plots.map(x => x.c));
    if (S.viewRes && v) h = `<h3>${q.n} — recursos plantados</h3><div class="gal">${plantados.map(c => cardHTML(c)).join('') || 'Nenhum plantio'}</div><br><button onclick="S.viewRes=false;render()">Voltar às fazendas</button>`;
    else h = `<h3>${q.n}</h3>${v ? infoHTML(q) + `<small>Cartas na mão: ${q.hand.length}</small>` : '<small>🔒 Moedas, dívida, mão e estoque ocultos</small>'}
    <h4>Fazendas</h4><div class="cards vw">${q.fields.map(f => cardHTML(f.c, '', isNight(q, f), '', '', v ? `${free(f)}/${f.c.slots}` : '')).join('') || 'Nenhuma'}</div>${v ? '<br><button onclick="S.viewRes=true;render()">Ver recursos</button>' : ''}`;
  } else if (S.modal == 'dev') { const p = S.players[D.i()], dv = S.dv = S.dv || {};
    const sel = (id, items) => `<select id="${id}" onchange="S.dv.${id}=this.value">${items.map(([v, t]) => `<option value="${v}"${dv[id] == v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
    const row = (t, x) => `<div class="dvr"><b>${t}</b> ${x}</div>`;
    const plots = p.fields.flatMap((f, fi) => f.plots.map((x, pi) => [`${fi}:${pi}`, `${nm(f.c)} #${fi + 1}: ${CROPS[x.c.crop]} nv${x.c.nivel || 1}`]));
    h = `<h3>🛠 Dev</h3>Jogador alvo: <select id="dvP" onchange="S.devP=+this.value;render()">${S.players.map((q, i) => `<option value="${i}"${q === p ? ' selected' : ''}>${q.n}${q.out ? ' (faliu)' : ''}</option>`).join('')}</select>
    · Valor: <input id="dvN" type="number" value="${dv.dvN ?? 100}" style="width:90px" oninput="S.dv.dvN=this.value">
    ${row('Moedas', `${p.coins} <button onclick="D.coins(0)">Definir</button><button onclick="D.coins(1)">Somar</button>`)}
    ${row('Dívida', `${p.debt} <button onclick="D.debt()">Definir</button>`)}${row('Cofre do governo', `${S.gov} <button onclick="D.gov()">Definir</button>`)}
    ${row('Recursos (somar o valor)', K.map(k => `<button onclick="D.res('${k}')">${CROPS[k]} ${p.res[k] || 0}</button>`).join(''))}
    ${row('Carta de recurso e nível', `${sel('dvCard', CARDS.plantacao.map(c => [c.id, `${nm(c)} (${CROPS[c.crop]})`]))} nível ${sel('dvLv', [[1, 1], [2, 2], [3, 3]])}
      <label><input id="dvFree" type="checkbox"> ignorar limite da mão</label><br><button onclick="D.hand()">Dar à mão</button>
      ${sel('dvFi', p.fields.map((f, i) => [i, `${nm(f.c)} #${i + 1}`]))}<button onclick="D.plant()">Plantar direto neste campo</button>
      ${sel('dvPl', plots)}<button onclick="D.level()">Definir nível do plantio</button>`)}
    ${row('Campo', `${sel('dvField', CARDS.campo.map(c => [c.id, nm(c) + ' · ' + c.id]))}<button onclick="D.field()">Dar ao jogador</button><button onclick="D.sale()">Pôr à venda</button><button onclick="D.clearSale()">Limpar área de compra</button>`)}
    ${row('Objetivo', `${p.obj.id} ${sel('dvObj', CARDS.objetivo.map(c => [c.id, `${nm(c)}: ${desc(c)}`]))}<button onclick="D.obj()">Trocar</button>`)}
    ${row('Eventos', `${sel('dvGe', CARDS.geral.map(c => [c.id, `${nm(c)}: ${desc(c)}`]))}<button onclick="D.gEvent()">Ativar evento geral</button><br>${sel('dvIe', CARDS.individual.map(c => [c.id, `${nm(c)}: ${desc(c)}`]))}<button onclick="D.iEvent()">Aplicar ao jogador</button>`)}
    ${row('Partida', `Rodada ${S.round} <button onclick="D.round()">Definir rodada</button><button onclick="D.next()">Avançar rodada</button><button onclick="D.rebuy()">Zerar compras de campo do turno</button><button onclick="D.clearMk()">Limpar Mercado</button><button onclick="D.all()">Ver tudo: ${S.devAll ? 'ligado' : 'desligado'}</button><button onclick="D.win()">Declarar vitória</button>`)}`;
  } else if (S.modal == 'gov') { const p = cur();
    h = `<h3>🏛 Governo</h3>Suas moedas: ${moeda(p.coins)} · Dívida: ${p.debt} <small>(+${jurosPct()}% por rodada)</small><br>
    <button onclick="A.loan()">Pegar empréstimo (${LOAN})</button><button onclick="A.pay()">Pagar (${LOAN})</button><br>
    <button onclick="A.extra()">Comprar carta de recurso nível 1 (${EXTRA}) — mão ${p.hand.length}/5</button>
    <h4>Vender recursos ao Governo <small>(${evOn('govPaga') ? 'Governo paga +100% nesta rodada' : 'preço fixo por unidade'})</small></h4>${K.map(k => `<button onclick="A.sell('${k}')">${CROPS[k]}: ${p.res[k] || 0} un. × ${govPreco(k)}</button>`).join('')}
    ${(fe => fe ? `<h4>🎪 Feira Regional <small>(${moeda(fe.c.preco)} por unidade · até ${fe.c.limite} de cada por jogador)</small></h4>${K.map(k => `<div class="rl f"><span>${rec(k, p.res[k] || 0)} ${CROPS[k]}</span><span class="rt">estoque do Governo: ${fe.stock[k]} · você pode comprar: ${feiraMax(fe, p, k)}</span>
      <input id="fq${k}" type="number" min="1" placeholder="qtd"><button onclick="A.buyFeira('${k}')">Comprar</button></div>`).join('')}` : '')(evFind('feira'))}`;
  } else { const a = S.players[S.actor]; S.mk = S.mk.filter(find);
    const opts = S.players.map((q, i) => q.out ? '' : `<option value="${i}"${i == S.actor ? ' selected' : ''}>${q.n}</option>`).join('');
    const nmv = l => S.players[l.s].n, btn = l => l.s == S.actor ? `<button onclick="A.cancel(${l.id})">Cancelar</button>` : `<button onclick="A.buyM(${l.id})">Comprar</button>`;
    const oferta = l => { if (l.kind == 'res') return `<div class="of rv"><div class="oh"><span class="ot">Vendedor: ${nmv(l)} · ${moeda(l.price)} cada · total ${moeda(l.qty * l.price)}</span>${btn(l)}</div><div class="rbox"><b>${rec(l.crop, l.qty)} ${CROPS[l.crop]}</b></div></div>`;
      const c = l.kind == 'hand' ? find(l) : find(l).c; return `<div class="of ${c.slots ? 'h' : 'v'}"><div class="oh"><span class="ot">Vendedor: ${nmv(l)} · ${moeda(l.price)}</span>${btn(l)}</div>${cardHTML(c)}</div>`; };
    const lancar = (k, c) => `<div class="of ${k == 'field' ? 'h' : 'v'}"><div class="oh"><input id="pr${c.uid}" type="number" min="1" placeholder="preço"><button onclick="A.list('${k}',${c.uid})">Ofertar</button></div>${cardHTML(c)}</div>`;
    h = mercadoFechado() ? '<h3>🤝 Mercado entre jogadores</h3><b>🚫 Mercado fechado pelo Embargo.</b> Volte na próxima rodada.' : `<h3>🤝 Mercado entre jogadores</h3>Atuar como: <select onchange="A.act(this.value)">${opts}</select> · ${moeda(a.coins)}
    <div class="mk"><section><h4>Terrenos à venda</h4><div class="mkc">${S.mk.filter(l => l.kind == 'field').map(oferta).join('') || 'Nenhum'}</div></section>
    <section><h4>Recursos à venda</h4><div class="mkc">${S.mk.filter(l => l.kind != 'field').map(oferta).join('') || 'Nenhum'}</div></section>
    <section><h4>Vender recursos (${a.n}) <small>quantidade e preço por unidade</small></h4>${K.map(k => `<div class="rl"><span>${rec(k, a.res[k] || 0)} ${CROPS[k]}</span>
      <input id="rq${k}" type="number" min="1" placeholder="qtd"><input id="rp${k}" type="number" min="1" placeholder="preço/un."><button onclick="A.listRes('${k}')">Ofertar</button></div>`).join('')}</section>
    <section><h4>Lançar oferta de carta (${a.n})</h4><b>Terrenos</b><div class="mkc">${a.fields.map(f => lancar('field', f.c)).join('') || 'Sem terrenos'}</div>
      <br><b>Recursos</b><div class="mkc">${a.hand.map(c => lancar('hand', c)).join('') || 'Sem cartas'}</div></section></div>`;
  }
  return `<div id="modal"><div class="box${S.modal == 'mkt' ? ' wide' : ''}">${h}<br><br><button onclick="A.modal(null)">Fechar</button><div class="mx" role="button" aria-label="Fechar" onclick="A.modal(null)">✕</div></div></div>`;
}

