// Teste em Node da MESA (M1 + M2): dois aparelhos (arquivos REAIS do jogo, inclusive mesa.js, visao.js e janelas.js) pelo rede.js REAL sobre Firebase falso. Peças comuns em teste_comum.js.
// Confere: layout de 2 a 10 jogadores (você sempre no assento 1), o que a mesa mostra e ESCONDE, números públicos novos da visão (nMao, usados, dkN), "ver tudo", painel de registro, arte do Editor (e injeção), tela simples, jogo local e a sua vez.
const { aparelho, criaBanco, ok, espera, ate, partida, avanca, resumo } = require('./teste_comum.js');
const cont = (h, re) => (h.match(re) || []).length;

(async () => {
  const P = await partida({ first: 0 }); const { host, conv } = P;
  await ate(() => conv.v('S !== null'), 'convidado iniciou');
  const novaVisao = async (a, f) => { const n0 = a.v('Online.n'); f(); await ate(() => a.v('Online.n') > n0, 'visão nova', 2500); };

  // ====================== 1. Layout de 2 a 10 jogadores ======================
  console.log('1. layout dos assentos');
  const lay = n => conv.v(`Mesa.assentos(${n})`);
  for (let n = 2; n <= 10; n++) {
    const a = lay(n), todos = [...a.base, ...a.esq, ...a.topo, ...a.dir].sort((x, y) => x - y), ids = conv.v(`[...Array(${n})].map((_, s) => Mesa.quem(s + 1, ${n}, ${n - 1}))`);
    ok(JSON.stringify(todos) === JSON.stringify([...Array(n)].map((_, i) => i + 1)) && a.base[0] === 1, `${n} jogadores: todos os assentos aparecem uma vez e o assento 1 (você) é o primeiro da base`);
    ok(new Set(ids).size === n && ids[0] === n - 1 && ids[1] === 0, `${n} jogadores: o assento 2 é o jogador seguinte ao seu na ordem da mesa (sentido horário)`);
  }
  ok(lay(2).topo.length === 1 && lay(2).esq.length === 0 && lay(4).esq.length === 1 && lay(4).dir.length === 1 && lay(6).base.length === 2, 'distribuição do protótipo: 2 = você + 1 em cima; 4 = esquerda, cima, direita; 6 = 2 embaixo');

  // ====================== 2. A mesa na espera (convidado) ======================
  console.log('2. mesa na tela de espera');
  let h = conv.html();
  ok(/sorteada no início do seu turno/.test(h), 'antes do primeiro turno a loja ainda está vazia: a mesa explica que ela é sorteada no início do seu turno');
  await novaVisao(conv, () => host.v('novaLoja(S.players[1]); render()')); h = conv.html();
  ok(/ms-cena/.test(h) && /vez de <b>Ana/.test(h) && cont(h, /class="ms-zona/g) === 3, 'o convidado fora da vez vê a MESA (3 zonas: Ana, Beto, bot) com "vez de Ana"');
  ok(/🎯 Objetivo/.test(h) && /🤝 Mercado/.test(h) && /📜 Registro/.test(h) && />Sair</.test(h) && !/Cmd\.buyF/.test(h) && !/Encerrar turno/.test(h), 'barra com Objetivo, Mercado, Registro e Sair; sem compra de campo nem "Encerrar turno" fora da vez');
  ok(/Sua loja de campos/.test(h) && cont(h, /<card /g) === conv.v('lojaDe(me()).length'), 'a SUA loja aparece no centro (só as suas cartas de campo)');
  ok(/data-i="1"[^>]*ms-eu|ms-eu[^>]*data-i="1"/.test(h), 'a zona do convidado (jogador 1) é marcada como a sua');
  ok(conv.v('document.body') !== null && conv.v('Mesa.visivel') === true, 'a mesa está marcada como visível');

  // ====================== 3. Números públicos novos e o que continua escondido ======================
  console.log('3. visão: números públicos x segredo');
  host.v('Cmd.go()'); await ate(() => conv.v('S.hide === false'), 'turno do anfitrião começou');
  host.v('S.players[0].fields.push({ c: { id: "cx", any: true, slots: 3, types: K, uid: 50 }, plots: [{ c: { id: "px", crop: "trigo", nivel: 1, uid: 51 } }] }); S.players[0].coins = 777; render()');
  await ate(() => conv.v('S.players[0].fields.length >= 1'), 'campo do anfitrião chegou');
  const vw = JSON.parse(host.v('JSON.stringify(viewFor(1))')), q0 = vw.players[0];
  ok(typeof q0.nMao === 'number' && q0.nMao === host.v('S.players[0].hand.length') && q0.nMao > 0, 'a visão traz nMao (nº de cartas na mão do anfitrião) como NÚMERO: ' + q0.nMao);
  ok(q0.fields.every(f => typeof f.usados === 'number') && q0.fields[0].usados === 1 && q0.fields[0].plots.length === 0, 'cada campo do outro traz "usados" (número) e os plantios continuam ocultos');
  ok(q0.coins === null && q0.res === null && q0.debt === null && q0.hand.every(c => !c.id), 'moedas, dívida, estoque e as cartas da mão do outro continuam escondidos');
  ok(!('loja' in q0) && !('obj' in q0) && !('st' in q0), 'a loja, o objetivo e as estatísticas do outro NUNCA vão na visão');
  ok(['plantacao', 'campo', 'geral', 'individual'].every(k => Number.isInteger(vw.dkN[k])) && JSON.stringify(vw.dk) === '{}', 'dkN traz só a QUANTIDADE de cada baralho (4 números) e dk continua vazio');
  await ate(() => conv.v('Mesa.visivel') === true && /1\/3/.test(conv.html()), 'mesa com o campo do anfitrião');
  h = conv.html();
  ok(/1\/3/.test(h), 'na mesa o campo do anfitrião aparece como "usados/vagas" (1/3)');
  ok(!/💰 777/.test(h) && !/T1/.test(h), 'mas as moedas (777) e o plantio (T1) do anfitrião NÃO aparecem');
  ok(new RegExp('<small>' + vw.players[0].nMao + '</small>').test(h), 'a quantidade de cartas na mão do anfitrião aparece (' + vw.players[0].nMao + ')');
  ok(conv.v('S.dk && JSON.stringify(S.dk)') === '{}', 'no aparelho do convidado o baralho (dk) está vazio');

  // "ver tudo": o evento revela tudo
  await novaVisao(conv, () => host.v('S.ev.push({ c: { id: "ev1", nm: "Tudo à vista", reveal: "all" }, left: 2 }); render()'));
  await ate(() => /💰 777/.test(conv.html()), 'com "ver tudo" as moedas aparecem');
  h = conv.html();
  ok(/💰 777/.test(h) && /T1/.test(h), 'com o evento "Tudo à vista": a mesa mostra as moedas E o que está plantado no campo (T1 = trigo nível 1)');
  await novaVisao(conv, () => host.v('S.ev.length = 0; render()'));
  await ate(() => !/💰 777/.test(conv.html()), 'voltou a esconder');
  ok(!/T1/.test(conv.html()), 'ao acabar o evento, os plantios somem de novo');

  // ====================== 4. Eliminado, escape de nomes ======================
  console.log('4. eliminado e nomes');
  await novaVisao(conv, () => host.v('S.players[2].out = true; S.players[1].n = "<img onerror=x>"; render()'));
  await ate(() => /eliminado/.test(conv.html()), 'zona de eliminado');
  h = conv.html();
  ok(/ms-out/.test(h) && /eliminado/.test(h) && /☠/.test(h), 'jogador eliminado: zona apagada com ☠');
  ok(!/<img onerror/.test(h) && /&lt;img/.test(h), 'um nome com HTML aparece ESCAPADO na mesa');
  await novaVisao(conv, () => host.v('S.players[2].out = false; S.players[1].n = "Beto"; render()'));

  // ====================== 5. Painel de registro e opções ======================
  console.log('5. painéis');
  conv.v('Mesa.alterna("reg")'); h = conv.html();
  ok(/ms-painel/.test(h) && /Evento Geral Ativo/.test(h) && /Registro/.test(h) && /ms-log/.test(h), 'o botão 📜 abre o painel com eventos e registro');
  conv.v('Mesa.alterna("reg")'); ok(!/ms-painel/.test(conv.html()), 'tocar de novo fecha o painel');
  conv.v('Mesa.alterna("cfg")'); ok(/Girar a mesa no celular em pé: sim/.test(conv.html()) && /Usar a tela simples/.test(conv.html()), '⚙ mostra "girar" (sim por padrão) e "usar a tela simples"'); conv.v('Mesa.alterna(null)');
  conv.v('A.view(0)'); h = conv.html(); ok(/Ver jogador|Anfitri|<h3>Ana/.test(h) && /Cartas na mão: \d/.test(h) && /🔒/.test(h) && !/null/.test(h.replace(/A\.modal\(null\)/g, '')), 'tocar numa zona abre "Ver jogador": cartas na mão (número) visível, moedas ocultas, nenhum "null"'); conv.v('A.modal(null)');
  conv.v('A.view(1)'); ok(/Sua mão/.test(conv.html()), 'a SUA zona abre a sua mão'); conv.v('A.modal(null)');

  // ====================== 6. Arte do Editor (ASSETS.mesa) ======================
  console.log('6. arte do Editor');
  ok(/background:#2f5a3b/.test(conv.html()), 'sem ASSETS.mesa: usa a cor padrão do fundo (#2f5a3b)');
  conv.v("ASSETS.mesa = { fundo: 'img/fundo.png', corFundo: '#112233', versoMao: 'img/vm.png', baralhos: { plantacao: { verso: 'img/r.png', cor: '#ff0000' }, campo: { cor: '#00ff00' } } }; render()"); h = conv.html();
  ok(/url\('img\/fundo\.png'\)/.test(h) && /#112233/.test(h), 'fundo com imagem e cor vindos do Editor');
  ok(/url\('img\/r\.png'\)/.test(h) && /background:#00ff00/.test(h) && /url\('img\/vm\.png'\)/.test(h), 'verso do baralho de Recursos (imagem), cor do baralho de Campos e verso da mão');
  conv.v("ASSETS.mesa = { fundo: \"x');alert(1);('\", corFundo: 'red;position:fixed', baralhos: { campo: { cor: 'url(javascript:1)', verso: '../../x.png' } } }; render()"); h = conv.html();
  ok(!/alert\(1\)/.test(h) && !/position:fixed;/.test(h.replace(/\.ms-cena[^"]*/g, '')) && !/javascript:/.test(h) && !/\.\.\/\.\./.test(h) && /background:#2f5a3b/.test(h) && /background:#6a4c93/.test(h), 'valores perigosos no ASSETS.mesa são IGNORADOS (volta aos padrões): nada de injeção');
  conv.v('delete ASSETS.mesa; render()');

  // ====================== 7. Tela simples (preferência) ======================
  console.log('7. tela simples');
  conv.v('localStorage.getItem = k => k === "tc_mesa" ? "off" : null; render()'); h = conv.html();
  ok(!/ms-cena/.test(h) && /está jogando/.test(h) && /🪑 Mesa/.test(h) && /🎯 Objetivo/.test(h) && conv.v('Mesa.visivel') === false, 'com a mesa desligada: volta a tela de espera de texto, com o botão "🪑 Mesa" para religar');
  conv.v('localStorage.getItem = () => null; render()'); ok(/ms-cena/.test(conv.html()), 'preferência removida: a mesa volta');

  // ====================== 8. Na sua vez a mesa sai ======================
  console.log('8. a sua vez');
  ok(await avanca(host, conv, 1), 'chegou a vez do convidado'); await ate(() => conv.v('S.order[S.t] === 1'), 'convidado vê a vez');
  if (conv.v('S.hide')) { h = conv.html(); ok(/Começar meu turno/.test(h) && !/ms-cena/.test(h), 'no começo da sua vez: tela "Começar meu turno", sem mesa'); conv.v('Cmd.go()'); await ate(() => conv.v('S.hide === false && Online.pend === null'), 'go'); }
  h = conv.html(); ok(/Encerrar turno/.test(h) && !/ms-cena/.test(h) && conv.v('Mesa.visivel') === false, 'na sua vez: a tela completa (Encerrar turno), sem mesa e a cena é desligada');
  conv.v('Cmd.end()'); await ate(() => conv.v('S.order[S.t] !== 1'), 'turno encerrado'); await ate(() => /ms-cena/.test(conv.html()), 'mesa de volta');

  // ====================== 9. Vez do bot ======================
  console.log('9. vez do bot');
  host.v('Bot.delay = 600'); ok(await avanca(host, conv, 2), 'chegou a vez do bot'); await ate(() => conv.v('S.order[S.t] === 2'), 'convidado vê a vez do bot');
  ok(/ms-cena/.test(host.html()) && /vez de <b>Bot/.test(host.html()) && /Velocidade do bot/.test(host.html()), 'anfitrião na vez do bot: a mesa, com o botão ⏩');
  ok(/ms-cena/.test(conv.html()) && !/Velocidade do bot/.test(conv.html()), 'convidado na vez do bot: a mesa, sem o botão ⏩ (só o anfitrião controla)');
  host.v('Bot.delay = 0'); await ate(() => host.v('S.order[S.t] !== 2'), 'bot terminou', 12000);

  // ====================== 10. Jogo LOCAL não tem mesa; 10 jogadores ======================
  console.log('10. jogo local e 10 jogadores');
  const L = aparelho('local', criaBanco(), 'uidL');
  L.v('A.new({ nomes: ["A", "B"], bots: ["", ""], first: 0 })'); L.v('Cmd.go()'); ok(!/ms-cena/.test(L.html()) && L.v('Mesa.visivel') === false, 'jogo local: a tela é a de sempre (sem mesa)');
  const nomes = ['Ana', 'Beto', 'Caio', 'Duda', 'Edu', 'Fê', 'Gui', 'Hel', 'Ivo', 'Jo'];
  L.v(`A.new({ nomes: ${JSON.stringify(nomes)}, bots: ${JSON.stringify(nomes.map(() => ''))}, first: 0 })`);
  L.v('S.players[3].fields = [...Array(15)].map((_, i) => ({ c: { id: "c" + i, slots: 2, types: K, uid: 100 + i }, plots: [] }))');
  const mesa10 = L.v('Mesa.tela(cur(), me())');
  ok(cont(mesa10, /class="ms-zona/g) === 10 && nomes.every((nm, i) => mesa10.includes(`${i + 1}. ${nm}`) || mesa10.includes(`. ${nm}`)), '10 jogadores: 10 zonas, uma por jogador');
  ok(/\+3/.test(mesa10) && cont(mesa10, /class="ms-ft/g) <= 10 * 12 + 1, 'um jogador com 15 campos: a zona mostra 12 e "+3" (não estoura a mesa)');
  ok(/data-i="0"[^>]*ms-eu|ms-eu[^>]*data-i="0"/.test(mesa10), 'no assento 1 está o jogador 0 (quem está na vez no jogo local de teste)');

  const { certos, falhas } = resumo(); console.log(`\n== Mesa: ${certos} conferências certas, ${falhas} falhas ==`); process.exit(falhas ? 1 : 0);
})().catch(e => { console.log('ERRO NO TESTE:', e); process.exit(2); });
