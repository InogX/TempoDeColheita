// Teste em Node da VERSÃO do jogo (Fase 10): dois aparelhos (arquivos REAIS) pelo rede.js REAL sobre Firebase falso. Peças comuns em teste_comum.js.
// Confere: versão no menu principal; versões iguais = nenhum aviso; versões diferentes = UM aviso (com as duas versões) e a partida continua; anfitrião antigo (sem o campo) = aviso "antiga"; jogo local intacto.
const { aparelho, criaBanco, ok, espera, ate, partida, resumo } = require('./teste_comum.js');
const avisosVersao = a => a.v('ALERTS.filter(t => /versão/.test(t))');
(async () => {
  console.log('1. versão no menu e no jogo local');
  const L = aparelho('local', criaBanco(), 'uidL'); const V = L.v('Online.VERSAO');
  ok(typeof V === 'string' && V.length > 0, 'Online.VERSAO existe: ' + V);
  L.v("Menu.ir('main')"); ok(L.html().includes('Versão ' + V), 'o menu principal mostra "Versão ' + V + '"');
  L.v("Menu.ir('local')"); ok(!/Versão /.test(L.html()), 'as outras telas do menu não mudaram');
  L.v('A.new({ nomes: ["A", "B"], bots: ["", ""], first: 0 })'); L.v('Cmd.go()'); ok(L.v('S.hide') === false && !/versão/i.test(L.v('JSON.stringify(S)')), 'jogo local: funciona e S não ganhou o campo versao');

  console.log('2. versões iguais: sem aviso');
  let P = await partida({ first: 0 }), { host, conv } = P; await ate(() => conv.v('S !== null'), 'convidado iniciou'); conv.v('ALERTS.length = 0');
  host.v('Cmd.go()'); await ate(() => conv.v('S.hide === false'), 'turno começou');
  ok(conv.v('S.versao') === V && host.v('Online.VERSAO') === V, 'a visão do convidado traz a versão do anfitrião (' + conv.v('S.versao') + ')');
  ok(avisosVersao(conv).length === 0 && conv.v('Online.versaoAvisada') === false, 'versões iguais: NENHUM aviso');

  console.log('3. versões diferentes: um aviso só, partida continua');
  host.v('Online.VERSAO = "2099-01-01z"'); host.v('Cmd.loan()'); await ate(() => conv.v('S.versao') === '2099-01-01z', 'visão com a versão nova chegou');
  const av = avisosVersao(conv); ok(av.length === 1 && av[0].includes(V) && av[0].includes('2099-01-01z') && /Recarregue/.test(av[0]), 'convidado recebe UM aviso com as duas versões: ' + av[0]);
  host.v('Cmd.end()'); await ate(() => conv.v('S.order[S.t] !== 0'), 'turno passou'); host.v('S.log.push("x")'); host.v('render()');
  ok(avisosVersao(conv).length === 1, 'o aviso NÃO se repete a cada visão');
  ok(conv.v('Online.ativo') === true && conv.v('S.players[0].debt === null || typeof S.players[0].debt === "number"'), 'o convidado continua na partida (ninguém é expulso)');
  ok(host.v('ALERTS.filter(t => /versão/.test(t)).length') === 0, 'o anfitrião não recebe aviso');

  console.log('4. anfitrião de versão antiga (visão sem o campo)');
  P = await partida({ first: 0 }); ({ host, conv } = P); await ate(() => conv.v('S !== null'), 'convidado iniciou'); conv.v('ALERTS.length = 0');
  host.v('Online.VERSAO = undefined'); host.v('Cmd.go()'); await ate(() => conv.v('S.hide === false'), 'turno começou');
  const av2 = avisosVersao(conv); ok(av2.length === 1 && /antiga/.test(av2[0]), 'sem o campo na visão: aviso dizendo "antiga": ' + av2[0]);

  console.log('5. o aviso volta numa partida nova (estado zerado ao sair)');
  conv.v('CONFIRMA = true'); conv.v('A.quit()'); await ate(() => conv.v('Online.ativo === false'), 'convidado saiu'); ok(conv.v('Online.versaoAvisada') === false, 'ao sair, o "já avisei" é zerado');

  const { certos, falhas } = resumo(); console.log(`\n== Fase 10 (versão): ${certos} conferências certas, ${falhas} falhas ==`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('ERRO NO TESTE:', e); process.exit(2); });
