// Teste em Node da Fase 8 (janelas online): DOIS aparelhos (arquivos REAIS do jogo) pelo rede.js REAL sobre um Firebase falso. Peças comuns em teste_comum.js.
// O DOM de teste entende <input id=...>, foco e rolagem da janela (.box), para conferir que o que o jogador digita sobrevive aos redesenhos.
const { aparelho, ok, espera, ate, partida, avanca, resumo } = require('./teste_comum.js');

(async () => {
  const P = await partida({ first: 0 }); const { host, conv } = P;
  await ate(() => conv.v('S !== null'), 'convidado iniciou');
  const agiu = async (a, f) => { const n0 = a.v('Online.n'); f(); await ate(() => a.v('Online.n') > n0, 'visão nova', 2500); }; // espera a próxima visão chegar ao convidado

  // ====================== A. Mercado sem "atuar como" ======================
  console.log('A. Mercado online: sempre pelo jogador deste aparelho');
  host.v('A.modal("mkt")'); conv.v('A.modal("mkt")');
  ok(/Jogando como: <b>Ana/.test(host.html()) && /Jogando como: <b>Beto/.test(conv.html()), 'cada aparelho mostra "Jogando como: ele mesmo"');
  ok(!/Atuar como/.test(host.html()) && !/Atuar como/.test(conv.html()) && !/A\.act\(/.test(conv.html()), 'sem o seletor "Atuar como"');
  host.v('A.act(1)'); ok(host.v('UI.actor') === 0, 'A.act() não troca o jogador online (anfitrião continua sendo ele)');
  conv.v('UI.actor = 0; render()'); ok(/Jogando como: <b>Beto/.test(conv.html()), 'mesmo se UI.actor for mexido à força, o Mercado continua sendo do convidado');
  conv.v('UI.actor = 1'); host.v('A.modal(null)'); conv.v('A.modal(null)');

  // ====================== B. Mercado fora da vez, com campos que sobrevivem e se limpam ======================
  console.log('B. oferta feita fora da vez; campos');
  host.v('Cmd.go()'); await ate(() => conv.v('S.hide === false'), 'turno do anfitrião começou');
  host.v('S.players[1].res.trigo = 8; S.players[1].res.soja = 5; render()'); await ate(() => conv.v('S.players[1].res.trigo === 8'), 'estoque do convidado');
  conv.v('A.modal("mkt")'); ok(/id="rqtrigo"/.test(conv.html()), 'campos de quantidade e preço existem na janela');
  conv.v('__inp.rqtrigo.value = "3"; __inp.rptrigo.value = "5"; __inp.rqsoja.value = "2"');
  await agiu(conv, () => conv.v('Cmd.listRes("trigo")'));
  await ate(() => conv.v('Online.pend === null') && host.v('S.mk.length') === 1, 'oferta chegou ao anfitrião');
  const o = host.v('S.mk[0]'); ok(o.s === 1 && o.crop === 'trigo' && o.qty === 3 && o.price === 5, 'anfitrião registrou a oferta do convidado (fora da vez dele): ' + JSON.stringify(o));
  ok(conv.v('__inp.rqtrigo.value') === '' && conv.v('__inp.rptrigo.value') === '', 'depois da jogada aceita, os campos DELA voltam vazios');
  ok(conv.v('__inp.rqsoja.value') === '2', 'o campo de OUTRO recurso, que ele estava digitando, continua com o valor');
  host.v('A.modal("mkt")'); const cH = host.v('S.players[0].coins'), cC = conv.v('S.players[1].coins');
  host.v(`Cmd.buyM(${o.id})`); await ate(() => conv.v('S.players[1].coins') === cC + 15, 'convidado recebeu o pagamento');
  ok(host.v('S.players[0].coins') === cH - 15 && host.v('S.players[0].res.trigo') === 7, 'anfitrião comprou do convidado (moedas -15, +3 de trigo)');
  host.v('A.modal(null)'); conv.v('A.modal(null)');

  // ====================== C. Digitação, foco e rolagem sobrevivem à chegada de visões ======================
  console.log('C. digitação/foco/rolagem');
  conv.v('A.modal("mkt")'); conv.v('__inp.rqmilho.value = "9"; __inp.rqmilho.focus(); __box.scrollTop = 140');
  await agiu(conv, () => host.v('Cmd.loan()'));
  ok(conv.v('__inp.rqmilho.value') === '9', 'convidado: o que ele digitava sobreviveu à visão nova');
  ok(conv.v('FOCUSED') === 'rqmilho', 'convidado: o campo continua em foco');
  ok(conv.v('__box.scrollTop') === 140, 'convidado: a janela não voltou ao topo');
  host.v('A.modal("mkt")'); host.v('__inp.rqtrigo.value = "4"; __box.scrollTop = 77');
  conv.v('Cmd.listRes("soja", 1, 9)'); await ate(() => host.v('S.mk.length') === 1, 'oferta do convidado chegou ao anfitrião');
  ok(host.v('__inp.rqtrigo.value') === '4' && host.v('__box.scrollTop') === 77, 'anfitrião: digitação e rolagem sobrevivem à jogada de outro jogador');
  conv.v('A.modal(null)'); host.v('A.modal(null)');

  // ====================== D. Botões que só valem na vez ficam desativados fora dela ======================
  console.log('D. fora da vez');
  conv.v('A.modal("gov")');
  ok(/<button disabled onclick="Cmd\.loan\(\)"/.test(conv.html()) && /<button disabled onclick="Cmd\.sell\(/.test(conv.html()) && /Aguarde a sua vez/.test(conv.html()), 'Governo fora da vez: botões desativados e aviso');
  conv.v('A.modal("mkt")'); ok(/<button onclick="Cmd\.listRes\('trigo'\)">/.test(conv.html()), 'Mercado fora da vez continua ativo'); conv.v('A.modal(null)');
  ok(/Ana está jogando/.test(conv.html()) && !/Cmd\.buyF/.test(conv.html()) && !/Encerrar turno/.test(conv.html()) && /Cmd\.listRes|🤝 Mercado/.test(conv.html()), 'fora da vez a tela é a de ESPERA: sem campos à venda, sem mão, sem "Encerrar turno", com o botão Mercado');
  ok(/Aguarde a sua vez para plantar/.test(conv.v('zoomExtra({ dataset: { plant: "0", ok: "1" } })')), 'zoom da carta: "Plantar" indisponível fora da vez');
  host.v('S.players[1].fields.push({ c: { id: "cx", any: true, slots: 3, types: K, uid: 50 }, plots: [{ c: { id: "px", crop: "trigo", nivel: 1, uid: 51 } }] }); render()'); await ate(() => conv.v('S.players[1].fields.length >= 1'), 'campo chegou');
  const fi = conv.v('S.players[1].fields.length - 1'); conv.v('OPENS.length = 0'); conv.v(`Z.field(${fi})`);
  ok(/<button disabled onclick="Z\.up\(/.test(conv.v('OPENS.slice(-1)[0][1]')), 'janela do campo: "Melhorar" desativado fora da vez');

  // ====================== E. Ver jogador, Objetivo, Espiar (nos dois papéis) ======================
  console.log('E. ver jogador, objetivo, espiar');
  host.v('A.view(1)'); conv.v('A.view(0)');
  ok(/🔒/.test(host.html()) && /🔒/.test(conv.html()), 'cada um vê o outro como "ocultos" (🔒)');
  ok(!/null/.test(conv.html().replace(/A\.modal\(null\)/g, '')), 'Ver jogador: nenhum "null" aparece no lugar de valores');
  host.v('A.modal(null)'); conv.v('A.modal(null)');
  host.v('A.modal("obj")'); conv.v('A.modal("obj")'); ok(/<card ob1>/.test(host.html()) && /<card ob1>/.test(conv.html()), 'Objetivo abre nos dois (cada um o SEU)'); host.v('A.modal(null)'); conv.v('A.modal(null)');
  ok(await avanca(host, conv, 1), 'chegou a vez do convidado'); await ate(() => conv.v('S.order[S.t] === 1'), 'conv vê a vez');
  if (conv.v('S.hide')) { conv.v('Cmd.go()'); await ate(() => conv.v('S.hide === false && Online.pend === null'), 'go'); }
  conv.v('A.modal("gov")'); ok(!/disabled onclick="Cmd\.loan/.test(conv.html()) && !/Aguarde a sua vez/.test(conv.html()), 'na SUA vez o Governo fica ativo'); conv.v('A.modal(null)');
  ok(!/disabled onclick="Cmd\.buyF\(0\)"/.test(conv.html()) && /Encerrar turno/.test(conv.html()), 'na SUA vez: comprar campo ativo e "Encerrar turno" aparece');
  conv.v('OPENS.length = 0'); conv.v(`Z.field(${fi})`); ok(/<button onclick="Z\.up\(/.test(conv.v('OPENS.slice(-1)[0][1]')) && /A\.pick/.test(conv.v('zoomExtra({ dataset: { plant: "0", ok: "1" } })')), 'na SUA vez: "Melhorar" e "Plantar" ativos');
  // espiar: o evento individual "espiar" mostra a janela e, depois, o que foi espiado (e só isso)
  host.v('S.peekPend = 1; render()'); await ate(() => conv.v('S.peekPend === 1'), 'espiar pendente chegou');
  ok(/Escolha quem espiar/.test(conv.html()) && !/Escolha quem espiar/.test(host.html()), 'só quem tem o evento vê "Escolha quem espiar"');
  ok(conv.v('S.players[0].coins === null'), 'antes de espiar, as moedas do anfitrião estão escondidas');
  conv.v('Cmd.peek(0)'); await ate(() => conv.v('S.peek !== null && Online.pend === null'), 'espiada aceita');
  ok(conv.v('typeof S.players[0].coins') === 'number' && conv.v('S.players[2].coins === null'), 'depois de espiar, vê o espiado (anfitrião) e continua sem ver o bot');
  ok(conv.v('UI.modal') === null && !/Escolha quem espiar/.test(conv.html()), 'a janela de espiar fecha');
  conv.v('Cmd.end()'); await ate(() => conv.v('S.order[S.t] !== 1'), 'turno encerrado'); await ate(() => conv.v('S.players[0].coins === null'), 'espionagem some no fim do turno');
  ok(conv.v('S.players[0].coins === null'), 'no fim do turno a espionagem acaba (moedas escondidas de novo)');

  // ====================== F. Mercado na vez do bot ======================
  console.log('F. vez do bot');
  host.v('Bot.delay = 400'); ok(await avanca(host, conv, 2), 'chegou a vez do bot'); await ate(() => conv.v('S.order[S.t] === 2'), 'convidado vê a vez do bot');
  ok(/está jogando/.test(conv.html()) && /🤝 Mercado/.test(conv.html()) && /🤝 Mercado/.test(host.html()), 'na vez do bot os dois têm o botão Mercado');
  conv.v('A.modal("mkt")'); ok(/Mercado entre jogadores/.test(conv.html()) && /está jogando/.test(conv.html()), 'a janela do Mercado abre por cima da tela do bot');
  conv.v('__inp.rqtrigo.value = "2"; __inp.rqtrigo.focus()'); const n0 = conv.v('Online.n'); await ate(() => conv.v('Online.n') > n0 + 1, 'o bot agiu e a visão mudou', 6000);
  ok(conv.v('__inp.rqtrigo.value') === '2' && conv.v('S.order[S.t] === 2 || true'), 'enquanto o bot joga, o que o convidado digita no Mercado não é apagado');
  conv.v('A.modal(null)'); host.v('Bot.delay = 0'); await ate(() => host.v('S.order[S.t] !== 2'), 'bot terminou', 12000);

  // ====================== G. Painel Dev não existe online ======================
  console.log('G. Dev');
  host.v('A.modal("dev")'); ok(host.v('UI.modal') === null, 'A.modal("dev") não abre online');
  host.v('UI.modal = "dev"; render()'); ok(host.v('UI.modal') === null && !/🛠 Dev<\/h3>/.test(host.html()), 'mesmo se for forçado, o painel Dev não é desenhado e a janela fecha');

  // ====================== H. Jogo LOCAL intacto ======================
  console.log('H. jogo local');
  const L = aparelho('local', require('./teste_comum.js').criaBanco(), 'uidL');
  L.v('A.new({ nomes: ["A", "B", "C"], bots: ["", "", ""], first: 0 })'); L.v('Cmd.go()');
  L.v('A.modal("mkt")'); ok(/Atuar como: <select/.test(L.html()), 'local: o seletor "Atuar como" continua');
  L.v('A.act(1)'); ok(L.v('UI.actor') === 1, 'local: "atuar como" funciona'); L.v('A.modal(null)');
  L.v('A.modal("gov")'); ok(!/ disabled/.test(L.html()) && !/Aguarde/.test(L.html()), 'local: Governo sem botões desativados'); L.v('A.modal(null)');
  ok(!/disabled onclick="Cmd\.buyF/.test(L.html()) && /Encerrar turno/.test(L.html()), 'local: comprar campo ativo');
  L.v('A.modal("dev")'); ok(L.v('UI.modal') === 'dev', 'local: o painel Dev continua abrindo'); L.v('A.modal(null)');
  L.v('A.new({ nomes: ["Bot", "Humano"], bots: ["normal", ""], first: 0 })');
  ok(/está jogando/.test(L.html()) && !/🤝 Mercado/.test(L.html()), 'local: na vez do bot a tela NÃO ganhou o botão Mercado (só online)');
  L.v('Bot.parar()');

  const { certos, falhas } = resumo(); console.log(`\n== Fase 8: ${certos} conferências certas, ${falhas} falhas ==`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('ERRO NO TESTE:', e); process.exit(2); });
