// Teste em Node da Fase 9 (robustez): dois aparelhos (arquivos REAIS, inclusive lobby.js e rede.js) sobre um Firebase falso que SIMULA queda e volta de conexão
// (onDisconnect, .info/connected, escritas que esperam). Peças comuns em teste_comum.js. Os tempos de espera são encurtados.
const { aparelho, criaBanco, matar, ok, espera, ate, partida, avanca, resumo } = require('./teste_comum.js');
const T = { ESPERA_VAGA_MS: 400, ESPERA_ANFITRIAO_MS: 700, SALVA_MS: 30, VIGIA_MS: 40, FIM_MS: 60, DESCARTE_MS: 250 };
const faixa = a => a.v('(document.getElementById("onl-faixa") || {}).textContent || ""'); // faixa vermelha de conexão
const alerta = a => a.v('ALERTS.slice(-1)[0] || ""');

(async () => {
  // ====================== 1. Tela de espera + lobby solto ======================
  console.log('1. tela de espera e lobby');
  let P = await partida({ first: 0, tempos: T }), { host, conv, banco } = P; await ate(() => conv.v('S !== null'), 'convidado iniciou');
  ok(host.v('Lobby.offs.length') === 0 && conv.v('Lobby.offs.length') === 0, 'depois de iniciar, o lobby NÃO está mais ouvindo a sala (nos dois aparelhos)');
  ok(/Ana está jogando/.test(conv.html()) && !/Cmd\.buyF/.test(conv.html()) && !/Encerrar turno/.test(conv.html()) && /🤝 Mercado/.test(conv.html()), 'convidado fora da vez: tela de ESPERA (só o registro, eventos e Mercado), sem loja nem mão');
  host.v('Cmd.go()'); await ate(() => conv.v('S.hide === false'), 'turno começou');
  ok(/Ana está jogando/.test(conv.html()) && /class="log"/.test(conv.html()), 'a espera continua enquanto o outro joga, com o registro');
  ok(await avanca(host, conv, 1), 'vez do convidado'); await ate(() => conv.v('S.order[S.t] === 1'), 'convidado vê a vez'); if (conv.v('S.hide')) { conv.v('Cmd.go()'); await ate(() => conv.v('S.hide === false && Online.pend === null'), 'go'); }
  ok(/Encerrar turno/.test(conv.html()) && /Cmd\.buyF/.test(conv.html()), 'na SUA vez aparece o quadro completo (loja, mão, encerrar)');
  ok(/Beto está jogando/.test(host.html()) && !/Cmd\.buyF/.test(host.html()), 'o ANFITRIÃO fora da vez também vê a espera');

  // ====================== 2. Anfitrião sai (o relato do dono): convidado é avisado e a sala é apagada sem lixo ======================
  console.log('2. anfitrião sai');
  conv.v('ALERTS.length = 0'); host.v('CONFIRMA = true'); host.v('A.quit()');
  await ate(() => conv.v('Online.ativo === false'), 'convidado percebe que o anfitrião saiu');
  ok(/encerrada/.test(alerta(conv)) && conv.v('S === null && Menu.tela === "main"') && conv.v('Rede.naSala === false'), 'convidado é AVISADO e volta ao menu: ' + alerta(conv));
  await ate(() => host.v('Online.ativo === false'), 'anfitrião terminou de sair'); await espera(200);
  ok(banco.pega('salas/' + P.cod) === undefined, 'sala apagada do banco e NADA recriado pelo Rede.sair() dos convidados (sem lixo)');
  ok(host.v('Menu.tela === "main" && S === null'), 'anfitrião volta ao menu');

  // 2b. o convidado estava sem conexão quando o anfitrião apagou a sala e volta depois: não pode recriar lixo
  console.log('2b. convidado volta depois de a sala ser apagada');
  P = await partida({ first: 0, tempos: T }); ({ host, conv, banco } = P); await ate(() => conv.v('S !== null'), 'convidado iniciou');
  banco.cai('uidCONV'); host.v('CONFIRMA = true'); host.v('A.quit()'); await ate(() => host.v('Online.ativo === false'), 'anfitrião saiu'); await espera(150);
  ok(banco.pega('salas/' + P.cod) === undefined, 'sala apagada enquanto o convidado estava fora');
  banco.volta('uidCONV'); await ate(() => conv.v('Online.ativo === false'), 'convidado percebe ao voltar'); await espera(250);
  ok(banco.pega('salas/' + P.cod) === undefined, 'quando o convidado volta, a sala continua apagada: nem o Rede.sair() nem a presença recriam lixo');
  ok(conv.v('Menu.tela === "main" && S === null'), 'o convidado volta ao menu');

  // ====================== 3. Convidado SAI (o relato do dono): um bot assume e a partida não trava ======================
  console.log('3. convidado sai');
  // a presença NÃO pode ser quem faz o bot assumir (espera enorme): só o aviso "saindo"
  P = await partida({ first: 0, tempos: { ...T, ESPERA_VAGA_MS: 600000 } }); ({ host, conv, banco } = P); await ate(() => conv.v('S !== null'), 'convidado iniciou');
  host.v('Bot.delay = 0'); conv.v('CONFIRMA = true'); conv.v('A.quit()');
  await ate(() => host.v('S.players[1].bot') === 'normal', 'bot assume a vaga na hora (sem esperar a conexão cair)', 3000);
  ok(host.v('S.players[1].ex') === 1 && /assumiu o lugar/.test(host.v('S.log.join("|")')), 'a vaga ficou marcada como "assumida" e o registro avisa');
  await ate(() => conv.v('Online.ativo === false'), 'convidado terminou de sair');
  ok(conv.v('Online.ativo === false && Menu.tela === "main"'), 'o convidado que saiu volta ao menu');
  const r0 = host.v('S.round'); let g = 0;
  while (host.v('S.round') < r0 + 2 && g++ < 400) { if (host.v('S.order[S.t]') === 0) { if (host.v('S.hide')) host.v('Cmd.go()'); host.v('Cmd.end()'); } await espera(25); }
  ok(host.v('S.round') >= r0 + 2, 'a partida NÃO trava na vez de quem saiu: passou pelo menos 2 rodadas (rodada ' + host.v('S.round') + ')');
  host.v('Online.recebeAcao({ de: "uidCONV", id: "-x1", tipo: "loan", args: [] })');
  ok(host.v('Online.ack[1].ok') === false && /bot/.test(host.v('Online.ack[1].msg')) && host.v('S.players[1].debt') === 0, 'jogada de quem já saiu é recusada ("um bot está jogando no seu lugar")');

  // ====================== 4. Convidado perde a conexão e VOLTA: bot assume e devolve ======================
  console.log('4. convidado cai e volta');
  P = await partida({ first: 0, tempos: T }); ({ host, conv, banco } = P); await ate(() => conv.v('S !== null'), 'convidado iniciou'); host.v('Bot.delay = 0');
  banco.cai('uidCONV');
  await ate(() => /Sem conexão/.test(faixa(conv)), 'convidado vê a faixa de conexão'); ok(/Sem conexão/.test(faixa(conv)), 'convidado: faixa "Sem conexão" enquanto está fora');
  await ate(() => host.v('Online.fora[1] != null'), 'anfitrião percebe a queda'); ok(host.v('S.players[1].bot') === '', 'logo depois da queda a vaga ainda é do jogador (tem tempo para voltar)');
  ok(/perdeu a conexão/.test(host.v('(document.getElementById("onl-aviso") || {}).textContent || ""')), 'anfitrião é avisado de que o convidado caiu');
  await ate(() => host.v('S.players[1].bot') === 'normal', 'bot assume depois da espera', 3000); ok(host.v('S.players[1].ex') === 1, 'depois de ESPERA_VAGA_MS um bot assume a vaga');
  banco.volta('uidCONV');
  await ate(() => host.v('S.players[1].bot') === '', 'vaga devolvida', 3000);
  ok(host.v('S.players[1].bot') === '' && host.v('S.players[1].ex') === undefined && /voltou à partida/.test(host.v('S.log.join("|")')), 'quando o jogador volta a vaga é DEVOLVIDA e o registro avisa');
  await ate(() => faixa(conv) === '', 'faixa some'); ok(faixa(conv) === '', 'a faixa de conexão some quando a conexão volta');
  await ate(() => conv.v('S.players[1].bot') === '' && conv.v('Online.n') > 0, 'visão nova'); ok(await avanca(host, conv, 1), 'chegou a vez do jogador que voltou'); await ate(() => conv.v('S.order[S.t] === 1'), 'vez dele');
  if (conv.v('S.hide')) { conv.v('Cmd.go()'); await ate(() => conv.v('S.hide === false && Online.pend === null'), 'go depois de voltar'); }
  ok(conv.v('S.hide') === false && host.v('S.players[1].turns') >= 1, 'o jogador que voltou volta a jogar normalmente');

  // ====================== 5. Anfitrião perde a conexão por pouco tempo (sem recarregar) ======================
  console.log('5. anfitrião cai e volta rápido');
  P = await partida({ first: 0, tempos: { ...T, ESPERA_ANFITRIAO_MS: 4000 } }); ({ host, conv, banco } = P); await ate(() => conv.v('S !== null'), 'convidado iniciou');
  banco.cai('uidHOST');
  await ate(() => /anfitrião está desconectado/.test(faixa(conv)), 'convidado vê o aviso'); ok(/anfitrião está desconectado/.test(faixa(conv)) && /\d+ s/.test(faixa(conv)), 'convidado: faixa "anfitrião desconectado" com contagem: ' + faixa(conv));
  ok(/Sem conexão/.test(faixa(host)), 'o anfitrião também vê que está sem conexão');
  banco.volta('uidHOST'); await ate(() => faixa(conv) === '' && faixa(host) === '', 'faixas somem');
  ok(conv.v('Online.ativo') === true && faixa(conv) === '' && faixa(host) === '', 'o anfitrião voltou a tempo: as faixas somem e o convidado continua na partida');
  host.v('Cmd.go()'); await ate(() => conv.v('S.hide === false'), 'jogo segue'); ok(conv.v('S.hide === false'), 'o jogo segue normalmente depois da queda');

  // ====================== 6. Anfitrião some e NÃO volta ======================
  console.log('6. anfitrião não volta');
  P = await partida({ first: 0, tempos: T }); ({ host, conv, banco } = P); await ate(() => conv.v('S !== null'), 'convidado iniciou');
  conv.v('ALERTS.length = 0'); banco.cai('uidHOST');
  await ate(() => conv.v('Online.ativo === false'), 'convidado desiste', 4000);
  ok(/anfitrião ficou desconectado/.test(alerta(conv)) && alerta(conv).includes(P.cod), 'convidado é avisado, com o CÓDIGO para voltar: ' + alerta(conv));
  ok(conv.v('S === null && Menu.tela === "main" && Rede.naSala === false') && faixa(conv) === '', 'e volta ao menu, sem faixa sobrando');
  ok(banco.pega('salas/' + P.cod + '/meta') !== undefined, 'a sala continua no banco (o anfitrião pode retomar)');

  // ====================== 7. Anfitrião RECARREGA a página: retoma a partida ======================
  console.log('7. retomada do anfitrião');
  P = await partida({ first: 0, tempos: { ...T, ESPERA_ANFITRIAO_MS: 8000 } }); ({ host, conv, banco } = P); await ate(() => conv.v('S !== null'), 'convidado iniciou');
  host.v('Cmd.go()'); host.v('S.players[0].coins = 777; S.players[0].res.soja = 5; render()');
  await ate(() => { const e = banco.pega('salas/' + P.cod + '/estado'); return e && JSON.parse(e).players[0].coins === 777; }, 'estado salvo no banco');
  const est = JSON.parse(banco.pega('salas/' + P.cod + '/estado'));
  ok(typeof banco.pega('salas/' + P.cod + '/estado') === 'string' && est.players.length === 3 && est.dk, 'o estado COMPLETO fica gravado como texto (com os baralhos: só o anfitrião lê)');
  const sessaoAntes = host.v('Online.sessao'), rodada = host.v('S.round');
  matar(banco, host);                                                                  // fecha a página do anfitrião
  await P.conv.rede.enviar('listRes', ['trigo', 1, 5]);                                // jogada VÁLIDA que ficou na fila enquanto ele estava fora (teria sucesso se não fosse descartada)
  await ate(() => /anfitrião está desconectado/.test(faixa(conv)), 'convidado percebe');
  const H2 = aparelho('Ana(host recarregado)', banco, 'uidHOST', { armazem: host.armazem, tempos: { ...T, ESPERA_ANFITRIAO_MS: 8000 } }); H2.v('Bot.delay = 0');
  H2.v("Menu.ir('achar')"); H2.v(`__inp.nomeSala.value = "Ana"; __inp.cod.value = "${P.cod}"`); await H2.v('Lobby.entrar()');
  await ate(() => H2.v('S !== null && Online.host && Online.ativo'), 'anfitrião retomou', 4000);
  ok(H2.v('S.players[0].coins') === 777 && H2.v('S.players[0].res.soja') === 5 && H2.v('S.round') === rodada, 'a partida foi RETOMADA do estado salvo (moedas 777, soja 5, mesma rodada) — não uma nova');
  ok(H2.v('Online.sessao') !== sessaoAntes && /voltou/.test(H2.v('S.log.join("|")')), 'nova sessão e o registro avisa que o anfitrião voltou');
  await ate(() => conv.v('Online.sessaoVista') === H2.v('Online.sessao'), 'convidado recebeu a visão da sessão nova');
  ok(conv.v('Online.sessaoVista') === H2.v('Online.sessao') && faixa(conv) === '', 'o convidado recebe a visão nova e a faixa some');
  await espera(300);
  ok(H2.v('S.mk.length') === 0 && H2.v('S.players[1].res.trigo') === 4, 'a jogada que ficou na fila ANTES da volta foi descartada (a oferta do Mercado não foi criada)');
  ok(await avanca(H2, conv, 1), 'chegou a vez do convidado'); await ate(() => conv.v('S.order[S.t] === 1'), 'vez do convidado');
  if (conv.v('S.hide')) { conv.v('Cmd.go()'); await ate(() => conv.v('S.hide === false && Online.pend === null'), 'go'); }
  conv.v('Cmd.loan()'); await ate(() => H2.v('S.players[1].debt') === 100, 'convidado joga e o anfitrião retomado executa', 3000);
  ok(H2.v('S.players[1].debt') === 100, 'depois da retomada o convidado joga normalmente (empréstimo executado)');
  ok(H2.v('LSW.includes("tc_save")') === false, 'retomar não grava o jogo local salvo');

  // ====================== 8. Limpeza de salas antigas ======================
  console.log('8. limpeza de salas antigas');
  const B8 = criaBanco(), h8 = aparelho('Ana', B8, 'uidHOST', { tempos: T }), agora = Date.now();
  B8.raiz.salas = { OLD1: { meta: { host: 'uidHOST', estado: 'jogando', criadaEm: agora - 48 * 3600 * 1000, vagas: 3 }, jogadores: { x: { nome: 'x', idx: 0 } } },
    FIM1: { meta: { host: 'uidHOST', estado: 'fim', criadaEm: agora, vagas: 3 } }, NOVA1: { meta: { host: 'uidHOST', estado: 'jogando', criadaEm: agora - 3600 * 1000, vagas: 3 } },
    ALHEIA: { meta: { host: 'uidOUTRO', estado: 'fim', criadaEm: 0, vagas: 3 } } };
  h8.armazem.setItem('tc_salas', JSON.stringify(['OLD1', 'FIM1', 'NOVA1', 'ALHEIA', 'SUMIU']));
  h8.v("Menu.ir('criar')"); h8.v('__inp.lbNome.value = "Ana"; __inp.lbVagas.value = "3"'); await h8.v('Lobby.criar()'); await espera(250);
  const cod8 = h8.v('Rede.codigo');
  ok(B8.pega('salas/OLD1') === undefined && B8.pega('salas/FIM1') === undefined, 'salas MINHAS com mais de 24 h ou já encerradas foram apagadas');
  ok(B8.pega('salas/NOVA1') !== undefined && B8.pega('salas/ALHEIA') !== undefined && B8.pega('salas/' + cod8) !== undefined, 'sala recente minha, sala de OUTRO anfitrião e a sala nova NÃO foram apagadas');
  const lista8 = JSON.parse(h8.armazem.getItem('tc_salas')); ok(lista8.includes(cod8) && lista8.includes('NOVA1') && !lista8.includes('OLD1') && !lista8.includes('SUMIU') && !lista8.includes('ALHEIA'), 'a lista local guarda só o que ainda é meu e existe: ' + lista8);

  // ====================== 9. Fechar a sala ainda no lobby ======================
  console.log('9. fechar sala no lobby');
  const B9 = criaBanco(), h9 = aparelho('Ana', B9, 'uidHOST', { tempos: T }), c9 = aparelho('Beto', B9, 'uidCONV', { tempos: T });
  h9.v("Menu.ir('criar')"); h9.v('__inp.lbNome.value = "Ana"; __inp.lbVagas.value = "3"'); await h9.v('Lobby.criar()'); const cod9 = h9.v('Rede.codigo');
  c9.v("Menu.ir('achar')"); c9.v(`__inp.nomeSala.value = "Beto"; __inp.cod.value = "${cod9}"`); await c9.v('Lobby.entrar()'); await ate(() => h9.v('Lobby.lista.length') === 2, 'convidado na sala');
  h9.v('CONFIRMA = true'); await h9.v('Lobby.fechar()'); await espera(300);
  ok(B9.pega('salas/' + cod9) === undefined, 'Fechar sala APAGA a sala do banco');
  ok(c9.v('Menu.tela') === 'online' && /encerrada/.test(c9.v('AVISOS.slice(-1)[0]')) && c9.v('Rede.naSala === false'), 'o convidado que estava no lobby é avisado e volta ao menu: ' + c9.v('AVISOS.slice(-1)[0]'));
  ok(B9.pega('salas/' + cod9) === undefined, 'e nada é recriado depois (o Rede.sair dele não recria a sala)');

  const { certos, falhas } = resumo(); console.log(`\n== Fase 9: ${certos} conferências certas, ${falhas} falhas ==`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('ERRO NO TESTE:', e); process.exit(2); });
