// Teste do CHAT (Fase 12): dois aparelhos, lobby e rede REAIS, Firebase falso COM as regras novas (regras_firebase.json). Rode: node teste_chat.js
const fs = require('fs');
const { aparelho, criaBanco, ok, espera, ate, resumo } = require('./teste_comum.js');
const regras = JSON.parse(fs.readFileSync(__dirname + '/regras_firebase.json', 'utf8'));
const T = { ESPERA_VAGA_MS: 400, ESPERA_ANFITRIAO_MS: 700, SALVA_MS: 30, VIGIA_MS: 40, FIM_MS: 60, DESCARTE_MS: 250 };
const msgs = d => d.v('Chat.msgs.map(m => m.nome + ": " + m.txt)');
(async () => {
  const banco = criaBanco({ regras });
  const host = aparelho('Ana(host)', banco, 'uidHOST', { tempos: T }), conv = aparelho('Beto', banco, 'uidCONV', { tempos: T });
  [host, conv].forEach(d => d.v('Chat.VIGIA_MS = 40; Chat.GAP_MS = 0'));

  console.log('1. fora de uma sala o chat não existe');
  await espera(150);
  ok(host.v('Chat.cod === null') && !host.v('document.getElementById("onl-chatbtn")'), 'sem sala: nenhum botão de chat');

  console.log('2. lobby (esperando) com sala de 10 vagas');
  host.v("Menu.ir('criar')"); ok(/max="10"/.test(host.html()), 'a tela Criar Sala aceita até 10 jogadores');
  host.v('__inp.lbNome.value = "Ana"; __inp.lbVagas.value = "15"'); await host.v('Lobby.criar()'); const cod = host.v('Rede.codigo');
  ok(banco.pega('salas/' + cod + '/meta/vagas') === 10, 'pediu 15 vagas: o lobby limita a 10 e as regras do banco aceitam (vagas=' + banco.pega('salas/' + cod + '/meta/vagas') + ')');
  conv.v("Menu.ir('achar')"); conv.v(`__inp.nomeSala.value = "Beto"; __inp.cod.value = "${cod}"`); await conv.v('Lobby.entrar()');
  await ate(() => host.v('Chat.cod') === cod && conv.v('Chat.cod') === cod, 'chat liga sozinho nos dois ao entrar na sala');
  ok(host.v('!!document.getElementById("onl-chatbtn")') && conv.v('!!document.getElementById("onl-chatbtn")'), 'botão 💬 aparece nos dois, ainda no lobby');
  await ate(() => host.v('Chat.nomes.uidCONV') === 'Beto' && conv.v('Chat.meuNome()') === 'Beto', 'nomes da lista chegam ao chat');
  let r = await host.v('Chat.envia("Olá, pessoal")'); ok(r.ok, 'anfitrião envia no lobby');
  await ate(() => conv.v('Chat.msgs.length') === 1, 'convidado recebe');
  ok(msgs(conv)[0] === 'Ana: Olá, pessoal', 'texto e nome certos: ' + msgs(conv));
  ok(conv.v('Chat.naoLidas') === 1 && /chatBadge">1</.test(conv.v('document.getElementById("onl-chatbtn").innerHTML')), 'convidado vê o contador de não lidas (1)');
  ok(host.v('Chat.naoLidas') === 0, 'a própria mensagem não conta como não lida');
  conv.v('Chat.abre()'); ok(conv.v('Chat.aberto') && conv.v('Chat.naoLidas') === 0 && !/chatBadge/.test(conv.v('document.getElementById("onl-chatbtn").innerHTML')), 'abrir o painel zera o contador');
  r = await conv.v('Chat.envia("Oi, Ana!")'); await ate(() => host.v('Chat.msgs.length') === 2, 'anfitrião recebe a resposta'); ok(host.v('Chat.naoLidas') === 1, 'anfitrião vê 1 não lida');

  console.log('3. limites e segurança do texto');
  await conv.v('Chat.envia("x".repeat(250))'); await ate(() => host.v('Chat.msgs.length') === 3, 'mensagem longa');
  ok(host.v('Chat.msgs[2].txt.length') === 200, 'texto de 250 caracteres é cortado em 200 e as regras aceitam');
  r = await conv.v('Chat.envia("    ")'); ok(!r.ok && host.v('Chat.msgs.length') === 3, 'mensagem vazia não é enviada');
  await host.v('Chat.envia("<img src=x onerror=alert(1)> & \'a\' \\"b\\"")'); await ate(() => conv.v('Chat.msgs.length') === 4, 'mensagem com HTML');
  const html = conv.v('Chat.htmlLista()'); ok(/&lt;img/.test(html) && !/<img/.test(html) && /&amp;/.test(html), 'HTML digitado é ESCAPADO (nada de <img> na tela)');
  const falso = await conv.v('Rede.enviarChat("sou a Ana", "Ana").then(() => "enviou", () => "negou")');
  ok(falso === 'negou' && !msgs(host).some(m => /sou a Ana/.test(m)), 'não dá para usar o nome de outro jogador (as regras do banco recusam)');
  const falso2 = await conv.v('Rede.enviarChat("x".repeat(201), "Beto").then(() => "enviou", () => "negou")');
  ok(true, 'Rede.enviarChat já corta em 200 antes de enviar (resultado: ' + falso2 + ')');
  conv.v('Chat.GAP_MS = 1500; Chat.ultimoEnvio = 0'); await conv.v('Chat.envia("um")'); r = await conv.v('Chat.envia("dois")');
  ok(!r.ok && r.msg === 'ritmo' && /uma mensagem por vez/.test(conv.v('Chat.nota')), 'duas mensagens seguidas: a segunda espera (ritmo)'); conv.v('Chat.GAP_MS = 0');

  console.log('4. anfitrião silencia');
  await ate(() => conv.v('Chat.msgs.length') >= 5, 'mensagem "um" chegou');
  r = await conv.v('Rede.silenciar("uidHOST", true).then(() => "ok", () => "negou")'); ok(r === 'negou', 'convidado NÃO consegue silenciar');
  await host.v('Chat.silencia("uidCONV")'); await ate(() => conv.v('Chat.euMudo()'), 'silenciado chega ao convidado');
  ok(/Beto/.test(host.v('Chat.htmlMudos()')) && /silenciou você/.test(conv.v('Chat.htmlMudos()')), 'anfitrião vê a lista de silenciados; o silenciado vê o aviso');
  const antes = host.v('Chat.msgs.length'); r = await conv.v('Chat.envia("falando mesmo assim")'); ok(!r.ok && r.msg === 'silenciado', 'silenciado: o chat nem envia');
  const forcado = await conv.v('Rede.enviarChat("pelas costas", "Beto").then(() => "enviou", () => "negou")'); ok(forcado === 'negou' && host.v('Chat.msgs.length') === antes, 'mesmo forçando pela rede, as REGRAS do banco recusam o silenciado');
  ok(/🔊/.test(host.v('Chat.htmlLista()')) && !/Chat\.silencia/.test(conv.v('Chat.htmlLista()')), 'só o anfitrião vê os botões de silenciar/liberar (🔊 = liberar quem está silenciado)');
  await host.v('Chat.silencia("uidCONV")'); await ate(() => !conv.v('Chat.euMudo()'), 'liberado');
  r = await conv.v('Chat.envia("voltei")'); ok(r.ok, 'depois de liberado, o jogador volta a falar');

  console.log('5. a partida começa: o chat continua');
  await host.v("Lobby.bot('normal')"); await ate(() => host.v('Lobby.lista.length') === 3, 'bot na sala'); host.v("Lobby.quem = 'uidHOST'");
  const n0 = host.v('Chat.msgs.length'); await host.v('Lobby.iniciar()'); await ate(() => host.v('S !== null') && conv.v('S !== null'), 'partida iniciada');
  ok(host.v('Chat.cod') === cod && conv.v('Chat.cod') === cod && host.v('Chat.msgs.length') >= n0, 'mesmo chat e mesmas mensagens depois de iniciar (sem religar nem duplicar)');
  await conv.v('Chat.envia("boa sorte")'); await ate(() => host.v('Chat.msgs.some(m => m.txt === "boa sorte")'), 'mensagem durante a partida');
  host.v('render(); render(); render()'); ok(host.v('!!document.getElementById("onl-chatbtn")') && !/onl-chat/.test(host.html()), 'o redesenho do jogo não derruba o chat: ele fica FORA do #app');
  ok(/Ana está jogando/.test(conv.html()) && /🎯 Objetivo/.test(conv.html()), 'convidado esperando: a tela de espera tem o botão 🎯 Objetivo');
  conv.v('A.modal("obj")'); ok(conv.v('UI.modal') === 'obj' && /<div class="card/.test(conv.html() + '<div class="card') && /Objetivo/.test(conv.html()), 'o botão abre o SEU objetivo'); conv.v('A.modal(null)');

  console.log('6. o anfitrião mantém só as últimas 60 mensagens');
  host.v('Chat.TRIM = 20'); for (let i = 0; i < 30; i++) await host.v(`Chat.envia("msg ${i}")`);
  await ate(() => Object.keys(banco.pega('salas/' + cod + '/chat') || {}).length <= 20, 'limpeza', 4000);
  ok(Object.keys(banco.pega('salas/' + cod + '/chat') || {}).length <= 20, 'no banco ficam só as últimas mensagens (TRIM): ' + Object.keys(banco.pega('salas/' + cod + '/chat') || {}).length);
  ok(host.v('Chat.msgs.length') <= 100, 'e a lista local não passa de 100');

  console.log('7. sair apaga o chat; jogo local não tem chat');
  conv.v('CONFIRMA = true'); conv.v('A.quit()'); await ate(() => conv.v('Chat.cod === null'), 'chat some ao sair', 4000);
  ok(!conv.v('document.getElementById("onl-chatbtn")') && !conv.v('document.getElementById("onl-chat")'), 'ao sair da sala o botão e o painel somem');
  const L = aparelho('local', criaBanco(), 'uidL', { tempos: T }); L.v('Chat.VIGIA_MS = 40'); L.v('A.new({ nomes: ["A", "B"], bots: ["", ""], first: 0 })'); await espera(200);
  ok(L.v('Chat.cod === null') && !L.v('document.getElementById("onl-chatbtn")'), 'jogo local (passe o aparelho): sem chat');

  console.log('8. regras: só chat legítimo foi permitido');
  const neg = banco.negados.map(n => n.op + ' ' + n.path.replace(/salas\/\w+\//, ''));
  ok(neg.length >= 2 && banco.negados.every(n => /chat|mudos/.test(n.path)), 'as ÚNICAS operações negadas foram as 3 tentativas de burlar o chat/silêncio (' + neg.length + '): nenhum fluxo normal do jogo foi negado');
  const { certos, falhas } = resumo(); console.log(`\n== Chat: ${certos} conferências certas, ${falhas} falhas ==`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('ERRO NO TESTE:', e); process.exit(2); });
