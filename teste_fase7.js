// Teste em Node da Fase 7: DOIS aparelhos (arquivos REAIS do jogo) falando pelo rede.js REAL sobre um Firebase FALSO em memória. As peças comuns estão em teste_comum.js.
const { LAT, aparelho, criaBanco, ok, espera, ate, partida, avanca, resumo } = require('./teste_comum.js');
(async () => {
  // ====================== 1. Início: anfitrião cria o jogo, convidado recebe a SUA visão ======================
  console.log('1. início da partida');
  const P = await partida({ cfgDev: { dvCoins: 9999, dvAll: true } }); const { host, conv, banco } = P;
  ok(host.v('Online.ativo && Online.host && EU === 0 && S.players.length === 3'), 'anfitrião: online ativo, EU=0, 3 jogadores');
  ok(host.v('S.devAll === false && S.players[0].coins === 300'), 'online ignora Configurações/Dev (Menu.cfg com ver tudo e 9999 moedas)');
  ok(conv.v('S === null') && /Partida iniciando/.test(conv.html()), 'convidado: antes da 1ª visão mostra "Partida iniciando" (menu.js real): ' + conv.html().slice(0, 80));
  await ate(() => conv.v('S !== null && Array.isArray(S.players)'), 'convidado recebeu a 1ª visão');
  ok(conv.v('EU === 1 && Online.ativo && !Online.host'), 'convidado: EU=1');
  ok(conv.v('S.players[0].coins === null && S.players[2].coins === null && S.players[1].coins === 300'), 'convidado vê as PRÓPRIAS moedas e as dos outros ficam escondidas (null)');
  ok(conv.v('Bot.on === false && Bot.timer === null'), 'convidado NÃO roda bot');
  ok(host.v('LSW.length === 0') && conv.v('LSW.length === 0'), 'online não grava tc_save em nenhum dos dois: host=' + host.v('LSW.length') + ' conv=' + conv.v('LSW.length'));
  ok(!/Dev/.test(host.html()) && !/Dev/.test(conv.html()), 'sem botão Dev online (REG.devAtivo=true)');
  ok(/Ana está jogando/.test(conv.html()) && !/Começar meu turno/.test(conv.html()) && !/Cmd\.buyF/.test(conv.html()), 'convidado na vez da Ana: tela de ESPERA ("Ana está jogando..."), sem campos à venda. HTML: ' + conv.html().slice(0, 140));
  ok(/Estou pronto|Começar meu turno/.test(host.html()), 'anfitrião (vez dele): botão de começar');

  // ====================== 2. Privacidade no transporte ======================
  console.log('2. privacidade');
  host.v('S.players[0].coins = 4321; S.players[0].hand = [{ id: "SEGREDO_MAO", crop: "trigo", nivel: 1, uid: 777 }]; S.players[0].ind = { id: "SEGREDO_IND", nm: "x", coins: 0 }; S.players[0].obj = { id: "SEGREDO_OBJ", t: "coins", v: 1 }; render();');
  await ate(() => conv.v('S.n === undefined') || true, 'folga'); await espera(120);
  const vis = banco.escritas.filter(e => e.path === 'salas/' + P.cod + '/visao/uidCONV').map(e => e.valor).join('\n');
  ok(vis.length > 100, 'houve visões gravadas para o convidado (' + vis.length + ' bytes)');
  ok(!/4321/.test(vis) && !/SEGREDO_MAO/.test(vis) && !/SEGREDO_IND/.test(vis) && !/SEGREDO_OBJ/.test(vis), 'NADA do anfitrião vaza para a visão do convidado (moedas, mão, evento individual, objetivo)');
  ok(banco.escritas.every(e => !/visao\/uidHOST/.test(e.path)), 'o anfitrião não recebe visão (ele tem o estado completo)');
  ok(!/"dk"/.test(vis.replace(/"dk":\{\}/g, '')) , 'baralhos nunca vão (dk vazio)');

  // ====================== 3. Vez do anfitrião; o convidado não consegue agir fora da vez ======================
  console.log('3. fora da vez');
  const antes = banco.escritas.filter(e => /acoes\//.test(e.path)).length;
  conv.v('ALERTS.length = 0'); let r = conv.v('Cmd.loan()');
  ok(!r.ok && /vez/.test(conv.alertas()[0] || ''), 'convidado fora da vez: recusa NA HORA com alerta: ' + conv.alertas());
  ok(banco.escritas.filter(e => /acoes\//.test(e.path)).length === antes && conv.v('Online.pend === null'), 'nada foi enviado ao anfitrião');
  conv.v('A.modal("obj")'); ok(!/Erro|undefined/.test(conv.html()) && conv.v('UI.modal') === 'obj', 'convidado fora da vez abre a janela Objetivo sem quebrar (usa me(), não cur())'); conv.v('A.modal(null)');
  conv.v('A.modal("gov")'); ok(conv.v('UI.modal') === 'gov' && /Suas moedas: <span class="mo"><span class="dot ic">\$<\/span>300/.test(conv.html()) && !/<\/span>null/.test(conv.html()), 'janela Governo fora da vez mostra os dados DELE (300 moedas), sem "null" no lugar de valores'); conv.v('A.modal(null)');

  // ====================== 4. Anfitrião joga; a visão do convidado acompanha ======================
  console.log('4. turno do anfitrião');
  host.v('S.players[0].hand = []; S.players[0].ind = null; S.players[0].obj = CARDS.objetivo[0]; S.players[0].coins = 300;');
  host.v('Cmd.go()'); await ate(() => conv.v('S.hide === false'), 'convidado vê o turno começado');
  ok(/Ana está jogando/.test(conv.html()) && /class="log"/.test(conv.html()), 'convidado vê a espera com o registro da jogada da Ana');
  // o convidado tenta se passar pelo anfitrião durante a vez DELE: o remetente vem do uid, nunca do que o jogador escreve
  host.v(`Online.recebeAcao({ de: 'uidCONV', id: '-idSP', tipo: 'end', args: { eu: 0, quem: 0, idx: 0 } })`);
  ok(host.v('S.order[S.t] === 0 && S.hide === false') && host.v('Online.ack[1].ok') === false && /vez/.test(host.v('Online.ack[1].msg')), 'convidado se passando pelo anfitrião: recusado ("Não é a sua vez"), a vez do anfitrião continua: ' + host.v('JSON.stringify(Online.ack[1])'));
  host.v('S.players[0].res.trigo = 6; S.players[0].coins = 300; render()'); host.v('Cmd.sell("trigo", 2)');
  await ate(() => /vendeu 2/.test(conv.v('S.log.join("|")')), 'o log público chega ao convidado');
  host.v('Cmd.end()');
  await ate(() => conv.v('S.order[S.t] === 1 && S.hide === true'), 'vez passa ao convidado');
  ok(/Sua vez, Beto/.test(conv.html()) && /Começar meu turno/.test(conv.html()), 'convidado vê "Sua vez" e o botão. HTML: ' + conv.html().slice(0, 120));
  ok(/Sua vez/.test(conv.v('document.title')) && conv.v('VIB.length') >= 1, 'título e vibração avisam a vez: ' + conv.v('document.title'));
  ok(!/Encerrar turno/.test(host.html()), 'anfitrião (não é a vez dele) não vê "Encerrar turno"');

  // ====================== 5. Convidado joga: envio, recibo, recusa e toque duplo ======================
  console.log('5. turno do convidado');
  conv.v('ALERTS.length = 0'); conv.v('Cmd.go()'); ok(conv.v('Online.pend !== null'), 'convidado: jogada pendente depois do toque');
  r = conv.v('Cmd.go()'); ok(!r.ok && r.pendente && conv.v('ALERTS.length') === 0, 'segundo toque enquanto espera: ignorado, sem alerta');
  await ate(() => conv.v('S.hide === false && Online.pend === null'), 'recibo do "go" chegou e liberou');
  ok(host.v('S.players[1].turns') === 1 && host.v('S.hide') === false, 'o anfitrião executou o go UMA vez (turns=1)');
  conv.v('S.players[1].res.soja'); host.v('S.players[1].res.trigo = 10; S.players[1].res.soja = 0; render()'); await ate(() => conv.v('S.players[1].res.trigo === 10'), 'estoque do convidado atualizado na visão dele');
  const c0 = conv.v('S.players[1].coins'); conv.v('Cmd.sell("trigo", 4)'); await ate(() => conv.v('S.players[1].coins') === c0 + 8, 'venda aceita: moedas + 8 (4 x 2)');
  ok(host.v('S.players[1].coins') === c0 + 8 && host.v('S.players[1].res.trigo') === 6, 'anfitrião e convidado concordam');
  conv.v('ALERTS.length = 0'); conv.v('Cmd.sell("soja")'); await ate(() => conv.v('ALERTS.length') >= 1, 'recusa vinda do anfitrião chega');
  ok(/Sem estoque/.test(conv.alertas()[0]) && conv.v('Online.pend === null'), 'recusa do anfitrião vira alerta no convidado ("Sem estoque") e libera: ' + conv.alertas());
  ok(conv.v('S.players[1].res.trigo') === 6, 'recusa não muda o estado');
  conv.v('ALERTS.length = 0'); conv.v('Cmd.buyF(99)'); await ate(() => conv.v('ALERTS.length') >= 1 || conv.v('Online.pend === null'), 'buyF inválido');
  conv.v('A.modal("gov"); A.modal(null)');
  // feira com quantidade omitida: vem do anfitrião (feiraMax)
  host.v('S.ev.push({ c: { fx: "feira", preco: 1, limite: 3, nm: "Feira" }, stock: { trigo: 9, soja: 9, milho: 9 }, left: 2 }); S.players[1].coins = 50; render()'); await ate(() => conv.v('S.ev.length === 1'), 'evento chegou');
  conv.v('Cmd.buyFeira("trigo")'); await ate(() => conv.v('S.players[1].res.trigo') === 9, 'Feira sem quantidade: comprou o máximo (3), calculado no convidado e validado no anfitrião');
  host.v('S.ev = []; render()');

  // ====================== 6. Idempotência e remetente falso ======================
  console.log('6. entrega repetida e remetente falso');
  const d0 = host.v('S.players[1].debt'); const acao = { de: 'uidCONV', id: '-idXX', tipo: 'loan', args: [] };
  host.v(`Online.recebeAcao(${JSON.stringify(acao)}); Online.recebeAcao(${JSON.stringify(acao)});`);
  ok(host.v('S.players[1].debt') === d0 + 100, 'mesma ação entregue 2x: executada 1x (dívida +100)');
  host.v(`Online.recebeAcao({ de: 'uidINTRUSO', id: '-idYY', tipo: 'loan', args: [] })`); ok(host.v('S.players[1].debt') === d0 + 100 && host.v('S.players[0].debt') === 0, 'uid desconhecido: ignorado');
  host.v(`Online.recebeAcao({ de: 'uidCONV', id: '-idZZ', tipo: 'new', args: [{ nomes: ['x','y'] }] })`); ok(host.v('S !== null && S.players.length === 3'), 'tipo fora da lista (new) é recusado, não executado');
  host.v(`Online.recebeAcao({ de: 'uidCONV', id: '-idWW', tipo: 'constructor', args: null })`); ok(host.v('S.players.length === 3'), 'tipo "constructor" recusado');
  host.v(`Online.recebeAcao({ de: 'uidCONV', id: '-idVV', tipo: 'end', args: [] })`); // é a vez dele, então passa (confere que o idx vem do uid)
  await ate(() => host.v('S.order[S.t] === 2 || S.order[S.t] === 0'), 'turno avançou'); 

  // ====================== 7. Bot só no anfitrião; evento individual do bot é público ======================
  console.log('7. bot');
  host.v('Bot.delay = 150; S.players[2].ind = { id: "IND_BOT", nm: "EVENTO_BOT", coins: 0 }; render()');
  ok(await avanca(host, conv, 2), 'chegou a vez do bot');
  await ate(() => conv.v('S.order[S.t] === 2'), 'convidado vê a vez do bot');
  ok(/está jogando/.test(conv.html()), 'convidado vê a tela "Bot X está jogando": ' + conv.html().slice(0, 100));
  ok(!/Velocidade/.test(conv.html()) && /Velocidade/.test(host.html()), 'botão ⏩ só no anfitrião');
  ok(conv.v('Bot.on === false && Bot.timer === null'), 'convidado continua sem rodar bot');
  ok(conv.v('S.players[2].ind && S.players[2].ind.id') === 'IND_BOT' && /EVENTO_BOT/.test(conv.html()), 'evento individual do BOT é público: chega ao convidado e aparece na caixa de eventos');
  await ate(() => host.v('S.order[S.t] !== 2'), 'bot terminou o turno sozinho', 10000);
  ok(host.v('S.order[S.t] !== 2'), 'bot jogou e passou a vez (rodada ' + host.v('S.round') + ')');
  await ate(() => conv.v('S.order[S.t]') === host.v('S.order[S.t]'), 'convidado acompanha a vez depois do bot'); host.v('Bot.delay = 0');

  // ====================== 8. Z.up assíncrono (animação só quando a resposta chega) ======================
  console.log('8. melhoria (Z.up)');
  ok(await avanca(host, conv, 1), 'chegou a vez do convidado'); await ate(() => conv.v('S.order[S.t] === 1'), 'convidado na vez');
  if (conv.v('S.hide')) { conv.v('Cmd.go()'); await ate(() => conv.v('S.hide === false && Online.pend === null'), 'go'); }
  host.v('S.players[1].fields.push({ c: { id: "cx", any: true, slots: 3, types: K, uid: 50 }, plots: [{ c: { id: "px", crop: "trigo", nivel: 1, uid: 51 } }] }); S.players[1].res.trigo = 20; render()');
  await ate(() => conv.v('S.players[1].fields.length >= 1 && S.players[1].res.trigo === 20'), 'campo com plantio chegou ao convidado');
  const fi = conv.v('S.players[1].fields.length - 1'); conv.v('OPENS.length = 0');
  conv.v(`Z.up(${fi}, 0)`); ok(conv.v('Z.aguarda !== null') && conv.v('OPENS.length') === 0, 'animação NÃO toca antes da resposta (Z.aguarda pendente)');
  await ate(() => conv.v('Z.aguarda === null'), 'resposta da melhoria chegou');
  ok(conv.v('OPENS.length') >= 1 && conv.v(`S.players[1].fields[${fi}].plots[0].c.nivel`) === 2, 'animação tocou DEPOIS da resposta e o nível subiu para 2');
  conv.v('OPENS.length = 0; S.players[1].res.trigo = 0');
  host.v('S.players[1].res.trigo = 0; render()'); await ate(() => conv.v('S.players[1].res.trigo === 0'), 'zerou estoque');
  conv.v('ALERTS.length = 0'); conv.v(`Z.up(${fi}, 0)`); await ate(() => conv.v('Z.aguarda === null') && conv.v('ALERTS.length') >= 1, 'recusa da melhoria');
  ok(/Precisa de/.test(conv.alertas()[0] || '') && conv.v('OPENS.length') >= 1, 'melhoria recusada: alerta do motivo e a janela do campo reabre (sem animação): ' + conv.alertas());

  // ====================== 9. Eliminado, vitória e saída ======================
  console.log('9. eliminado, vitória, saída');
  host.v('S.players[1].out = true; render()'); await ate(() => conv.v('S.players[1].out === true'), 'eliminação chegou');
  const tabs = (conv.html().match(/class="tab/g) || []).length; ok(tabs <= 2, 'eliminado: sem abas duplicadas (tabs=' + tabs + ')');
  ok(/eliminado/.test(conv.html()) || conv.v('S.order[S.t]') !== 1, 'eliminado vê o aviso de que segue assistindo');
  host.v('S.players[1].out = false; S.win = { n: "Ana", why: "teste" }; render()'); await ate(() => conv.v('S.win !== null'), 'vitória chegou');
  ok(/Ana venceu/.test(conv.html()) && /Ana venceu/.test(host.html()), 'ambos veem a tela de vitória');
  conv.v('LSR.length = 0'); host.v('LSR.length = 0'); conv.v('CONFIRMA = false'); conv.v('A.quit()');
  ok(conv.v('Online.ativo === false && EU === null && S === null'), 'convidado sai depois da vitória (sem confirmação)');
  ok(conv.v('LSR.length === 0') && host.v('LSR.length === 0'), 'sair/vitória online NÃO apaga o jogo salvo local (tc_save)');
  host.v('CONFIRMA = false'); host.v('A.quit()'); await ate(() => host.v('Online.ativo === false && S === null'), 'anfitrião sai', 4000);
  ok(host.v('Online.ativo === false && S === null'), 'anfitrião também sai (depois da vitória, sem confirmar)');
  ok(banco.pega('salas/' + P.cod) === undefined, 'a sala foi APAGADA do banco pelo anfitrião (Fase 9), sem deixar lixo');

  // ====================== 10. Sala encerrada pelo anfitrião no meio do jogo ======================
  console.log('10. anfitrião encerra no meio');
  const Q = await partida(); await ate(() => Q.conv.v('S !== null'), 'conv iniciou');
  Q.host.v('CONFIRMA = true'); Q.conv.v('ALERTS.length = 0'); Q.host.v('A.quit()');
  await ate(() => Q.conv.v('Online.ativo === false'), 'convidado percebe o fim da sala');
  ok(/encerrada/.test(Q.conv.alertas()[0] || '') && Q.conv.v('S === null && Menu.tela === "main"'), 'convidado volta ao menu com aviso: ' + Q.conv.alertas());
  const Q2 = await partida(); await ate(() => Q2.conv.v('S !== null'), 'conv2');
  Q2.host.v('CONFIRMA = false'); Q2.host.v('A.quit()'); ok(Q2.host.v('Online.ativo === true'), 'anfitrião que cancela a confirmação continua na partida');

  // ====================== 11. Recibo antes de o envio terminar (corrida) ======================
  console.log('11. corrida: recibo antes da promessa');
  const R = await partida({ first: 1 }); await ate(() => R.conv.v('S !== null && S.order[S.t] === 1'), 'conv na vez');
  R.conv.v('ALERTS.length = 0'); R.conv.v('Cmd.loan()'); // fora de fase (hide): recusa local
  ok(/Comece/.test(R.conv.alertas()[0] || ''), 'antes do go, "loan" é recusado localmente: ' + R.conv.alertas());
  R.conv.v('Cmd.go()'); await ate(() => R.conv.v('Online.pend === null && S.hide === false'), 'go com LAT=' + LAT);
  R.conv.v('Cmd.sell("soja")'); await ate(() => R.conv.v('Online.pend === null'), 'sell recusado');
  ok(/Sem estoque/.test(R.conv.alertas().slice(-1)[0] || ''), 'o alerta de recusa aparece mesmo com latência de ' + LAT + ' ms: ' + R.conv.alertas());

  // ====================== 12. Regressão: jogo LOCAL (offline) continua igual ======================
  console.log('12. jogo local intacto');
  const L = aparelho('local', criaBanco(), 'uidL');
  L.v('A.new({ nomes: ["A", "B", "C"], bots: ["", "", ""], first: 0 })');
  ok(L.v('LSW.includes("tc_save")'), 'local grava tc_save');
  ok(/Passe o dispositivo/.test(L.html()) && /Estou pronto/.test(L.html()) && /Dev/.test(L.html()), 'local: tela "Passe o dispositivo" e botão Dev (REG.devAtivo)');
  L.v('Cmd.go()'); ok(/Encerrar turno/.test(L.html()) && /Dev/.test(L.html()), 'local: "Encerrar turno" e Dev aparecem');
  L.v('Menu.cfg = { dvCoins: 777 }; A.new({ nomes: ["A","B"], bots: ["",""], first: 0 })'); ok(L.v('S.players[0].coins') === 777, 'local: Configurações (Menu.cfg) continuam valendo');
  L.v('A.act(1)'); ok(L.v('UI.actor') === 1, 'local: "atuar como" continua funcionando');

  const { certos, falhas } = resumo(); console.log(`\n== Fase 7: ${certos} conferências certas, ${falhas} falhas ==`);
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('ERRO NO TESTE:', e); process.exit(2); });
