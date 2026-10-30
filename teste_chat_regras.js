// Regras do CHAT e de SILENCIAR (regras_firebase.json) + 10 vagas, com o interpretador simplificado. Rode: node teste_chat_regras.js
const fs = require('fs'); const { criaMotor } = require('./teste_regras_motor.js');
const regras = JSON.parse(fs.readFileSync(__dirname + '/regras_firebase.json', 'utf8'));
const H = 'uHOST', G = 'uCONV', G2 = 'uTERC', X = 'uESTRANHO';
const jog = (nome, idx) => ({ nome, idx, online: true, bot: '' });
const base = () => ({ salas: { ABC123: { meta: { host: H, estado: 'jogando', vagas: 3, criadaEm: 1 },
  jogadores: { [H]: jog('Ana', 0), [G]: jog('Beto', 1), [G2]: jog('Caio', 2) }, chat: { m1: { de: G, nome: 'Beto', txt: 'oi', ts: 1 } }, mudos: { [G2]: true } } } });
const msg = (de, nome, txt) => ({ de, nome, txt, ts: 5 });
const P = 'salas/ABC123/';
const casos = [
  ['Jogador da sala LÊ o chat', G, 'ler', P + 'chat', null, true],
  ['Estranho NÃO lê o chat', X, 'ler', P + 'chat', null, false],
  ['Sem login NÃO lê o chat', null, 'ler', P + 'chat', null, false],
  ['Jogador escreve mensagem normal', G, 'escrever', P + 'chat/n1', msg(G, 'Beto', 'tudo bem?'), true],
  ['Anfitrião também escreve', H, 'escrever', P + 'chat/n1', msg(H, 'Ana', 'bora'), true],
  ['Estranho NÃO escreve no chat', X, 'escrever', P + 'chat/n1', msg(X, 'Intruso', 'oi'), false],
  ['NÃO escreve em nome de outro jogador (de falso)', G, 'escrever', P + 'chat/n1', msg(H, 'Ana', 'sou a Ana'), false],
  ['NÃO usa nome diferente do da lista', G, 'escrever', P + 'chat/n1', msg(G, 'Ana', 'sou a Ana'), false],
  ['Texto de 200 caracteres passa', G, 'escrever', P + 'chat/n1', msg(G, 'Beto', 'x'.repeat(200)), true],
  ['Texto de 201 caracteres é recusado', G, 'escrever', P + 'chat/n1', msg(G, 'Beto', 'x'.repeat(201)), false],
  ['Texto vazio é recusado', G, 'escrever', P + 'chat/n1', msg(G, 'Beto', ''), false],
  ['Campo extra na mensagem é recusado', G, 'escrever', P + 'chat/n1', { ...msg(G, 'Beto', 'oi'), poder: 1 }, false],
  ['Jogador SILENCIADO não escreve', G2, 'escrever', P + 'chat/n1', msg(G2, 'Caio', 'oi'), false],
  ['NÃO edita mensagem já enviada', G, 'escrever', P + 'chat/m1', msg(G, 'Beto', 'editei'), false],
  ['Jogador NÃO apaga a própria mensagem (só o anfitrião)', G, 'escrever', P + 'chat/m1', null, false],
  ['Anfitrião apaga mensagem (limpar as antigas)', H, 'escrever', P + 'chat/m1', null, true],
  ['Anfitrião SILENCIA um jogador', H, 'escrever', P + 'mudos/' + G, true, true],
  ['Convidado NÃO silencia ninguém', G, 'escrever', P + 'mudos/' + G2, true, false],
  ['Silenciado NÃO tira o próprio silêncio', G2, 'escrever', P + 'mudos/' + G2, null, false],
  ['Anfitrião tira o silêncio', H, 'escrever', P + 'mudos/' + G2, null, true],
  ['Silêncio só aceita o valor true', H, 'escrever', P + 'mudos/' + G, 'sim', false],
  ['Jogador da sala lê a lista de silenciados', G, 'ler', P + 'mudos', null, true],
  ['Estranho NÃO lê os silenciados', X, 'ler', P + 'mudos', null, false],
  ['Silenciado NÃO se livra reescrevendo a própria entrada', G2, 'escrever', P + 'jogadores/' + G2, jog('Caio', 2), true], // (o silêncio mora em /mudos, não em jogadores: reescrever não adianta)
  ['Sala de 10 vagas é aceita', H, 'escrever', P + 'meta/vagas', 10, true],
  ['Sala de 11 vagas é recusada', H, 'escrever', P + 'meta/vagas', 11, false],
  ['Sala de 1 vaga é recusada', H, 'escrever', P + 'meta/vagas', 1, false],
];
let falhas = 0;
casos.forEach((c, i) => { const m = criaMotor(regras, () => base()); const r = c[2] === 'ler' ? m.podeLer(c[1], c[3]) : m.podeEscrever(c[1], c[3], c[4]); const ok = r === c[5]; if (!ok) falhas++;
  console.log(`${ok ? '  ' : '✗ '}${String(i + 1).padStart(2)}. ${c[0].padEnd(68)} ${r ? 'permite' : 'NEGA'}`); });
// o silêncio precisa valer na prática: depois de o anfitrião silenciar, o jogador NÃO escreve mais
const raiz = base(); const m2 = criaMotor(regras, () => raiz);
const antes = m2.podeEscrever(G, P + 'chat/n9', msg(G, 'Beto', 'oi')); raiz.salas.ABC123.mudos[G] = true; const depois = m2.podeEscrever(G, P + 'chat/n9', msg(G, 'Beto', 'oi'));
console.log(`\n  Antes de silenciar: ${antes ? 'escreve' : 'NEGA'} · Depois de silenciar: ${depois ? 'escreve' : 'NEGA'}`); if (!(antes && !depois)) falhas++;
console.log(`\n== Regras do chat: ${casos.length + 1 - falhas} situações certas, ${falhas} erradas ==`); process.exit(falhas ? 1 : 0);
