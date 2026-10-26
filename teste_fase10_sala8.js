// Teste em Node da Fase 10: SALA LOTADA (8 vagas) pelo lobby REAL: anfitrião + 1 convidado + 6 bots, rede.js REAL sobre Firebase falso.
// Confere: lobby aceita 8, partida inicia, bots jogam rodadas, privacidade entre os dois humanos, e mede o tamanho do que trafega. Peças falsas: cartas.js/config.js/rodada.js/objetivos.js (cartas simplificadas: os tamanhos são um PISO).
const { aparelho, criaBanco, ok, espera, ate, avanca, resumo } = require('./teste_comum.js');
(async () => {
  const banco = criaBanco(), host = aparelho('Ana(host)', banco, 'uidHOST'), conv = aparelho('Beto(conv)', banco, 'uidCONV');
  host.v("Menu.ir('criar')"); host.v('__inp.lbNome.value = "Ana"; __inp.lbVagas.value = "8"'); await host.v('Lobby.criar()');
  const cod = host.v('Rede.codigo'); await ate(() => host.v('Lobby.meta && Lobby.meta.vagas === 8'), 'meta da sala com 8 vagas'); ok(host.v('Lobby.meta.vagas') === 8, 'sala criada com 8 vagas');
  conv.v("Menu.ir('achar')"); conv.v(`__inp.nomeSala.value = "Beto"; __inp.cod.value = "${cod}"`); await conv.v('Lobby.entrar()');
  await ate(() => host.v('Lobby.lista.length') === 2, 'convidado na sala');
  for (let i = 0; i < 6; i++) await host.v(`Lobby.bot('${i % 2 ? 'normal' : 'facil'}')`);
  await ate(() => host.v('Lobby.lista.length') === 8, 'sala lotada (8)'); ok(host.v('Lobby.lista.length') === 8, 'lobby com 8 jogadores');
  await host.v('Lobby.bot("facil")'); ok(host.v('Lobby.lista.length') === 8, 'um 9º jogador/bot NÃO entra (limite da sala)');
  host.v('Lobby.quem = "uidCONV"'); await host.v('Lobby.iniciar()');
  await ate(() => host.v('S !== null') && conv.v('S !== null'), 'partida de 8 iniciou nos dois humanos');
  ok(host.v('S.players.length') === 8 && conv.v('S.players.length') === 8, 'partida com 8 jogadores nos dois aparelhos');
  host.v('Bot.delay = 60'); // acima dos 40 ms de junção do online.js: cada ação de bot vira uma publicação, como no jogo real (700 ms)
  // privacidade: o convidado não vê dados dos outros 7
  ok(conv.v('S.players.every((q, i) => i === 1 || q.coins === null || q.bot === "" && false || q.coins === null)'), 'convidado vê moedas escondidas dos outros');
  ok(conv.v('S.players.every((q, i) => i === 1 || !q.obj)') && conv.v('S.players.every((q, i) => i === 1 || q.hand.every(c => c.oculta))'), 'convidado não vê objetivo nem cartas da mão dos outros');
  // joga 3 rodadas completas (humanos passam o turno, bots jogam sozinhos). Espera a visão do convidado ficar em dia com o anfitrião antes de agir (um toque humano nunca é tão rápido quanto o teste).
  const r0 = host.v('S.round'); let g = 0; const n0 = conv.v('Online.n');
  while (host.v('S.round') < r0 + 3 && g++ < 800) {
    const i = host.v('S.order[S.t]'), rod = host.v('S.round');
    if (i === 0) { if (host.v('S.hide')) host.v('Cmd.go()'); host.v('Cmd.end()'); }
    else if (i === 1) {
      await ate(() => conv.v(`S.round === ${rod} && S.order[S.t] === 1 && S.hide === true && Online.pend === null`), 'convidado vê o início do SEU turno', 4000);
      const rg = conv.v('Cmd.go()'); await ate(() => conv.v('S.hide === false && Online.pend === null'), 'convidado começou o turno', 4000);
      const re = conv.v('Cmd.end()'); ok(re.ok, 'convidado encerrou o turno (rodada ' + rod + '): ' + JSON.stringify(re));
      await ate(() => host.v('S.order[S.t] !== 1 || S.round !== ' + rod), 'turno do convidado terminou', 4000); await ate(() => conv.v('Online.pend === null'), 'recibo do end', 4000); }
    await espera(15);
  }
  ok(host.v('S.round') >= r0 + 3, '8 jogadores: 3 rodadas completas sem travar (rodada ' + host.v('S.round') + ')');
  console.log('   FINAL rodada', host.v('S.round'), 'win', JSON.stringify(host.v('S.win')), 'out', host.v('JSON.stringify(S.players.map(q => q.out))'), 'moedas', host.v('JSON.stringify(S.players.map(q => q.coins))'), 'Online.ativo', host.v('Online.ativo'), 'g', g);
  await espera(300); const nv = conv.v('Online.n') - n0, rr = host.v('S.round') - r0;
  console.log(`   visões completas recebidas pelo convidado: ${nv} em ${rr} rodadas = ${(nv / rr).toFixed(0)} por rodada (8 jogadores, 6 bots)`);
  await espera(900); // o anfitrião grava o estado completo com um pequeno atraso (SALVA_MS)
  const est = banco.pega('salas/' + cod + '/estado'), vis = banco.pega('salas/' + cod + '/visao/uidCONV');
  console.log(`   tamanhos (cartas simplificadas = piso): estado=${String(est).length} B, visão do convidado=${String(vis).length} B`);
  ok(est && vis, 'estado e visão gravados no banco');
  const { certos, falhas } = resumo(); console.log(`\n== Fase 10 (sala de 8): ${certos} conferências certas, ${falhas} falhas ==`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('ERRO NO TESTE:', e); process.exit(2); });
