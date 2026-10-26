// Teste das REGRAS DE SEGURANÇA do Realtime Database (regras_firebase.json) com o interpretador simplificado (teste_regras_motor.js).
// Cada linha é uma situação do tipo "Rules Playground": quem (uid; null = sem login), o que faz, onde, e se DEVE ser permitido.
// Também roda as regras ANTIGAS (do Apêndice A original) para mostrar o que mudou. Rode: node teste_regras.js
const fs = require('fs'), dir = __dirname + '/';
const { criaMotor } = require('./teste_regras_motor.js');
const novas = JSON.parse(fs.readFileSync(dir + 'regras_firebase.json', 'utf8')), antigas = JSON.parse(fs.readFileSync(dir + 'regras_antigas.json', 'utf8'));
const H = 'uHOST', G = 'uCONV', X = 'uESTRANHO';
const meta = (estado, host = H) => ({ host, estado, vagas: 3, criadaEm: 1700000000000 });
const jog = (nome, idx, bot = '') => ({ nome, idx, online: true, bot });
const raiz = { salas: {
  ABC123: { meta: meta('jogando'), jogadores: { [H]: jog('Ana', 0), [G]: jog('Beto', 1), botX: jog('Bot 1', 2, 'normal') }, acoes: { [G]: { a1: { tipo: 'sell', args: '[]', ts: 1 } } }, visao: { [G]: '{"x":1}', [H]: '{"y":1}' }, estado: '{"s":1}' },
  LOBBY1: { meta: meta('lobby'), jogadores: { [H]: jog('Ana', 0) } } } };
const livre = { salas: {} };
const grande = 'x'.repeat(3000);
const OK = true, NEG = false;
// [descrição, uid, 'ler'|'escrever', caminho, valor, esperado com as regras NOVAS, (opcional) raiz]
const casos = [
  ['Anfitrião LÊ o estado completo', H, 'ler', 'salas/ABC123/estado', null, OK],
  ['Convidado NÃO lê o estado completo', G, 'ler', 'salas/ABC123/estado', null, NEG],
  ['Convidado lê a PRÓPRIA visão', G, 'ler', 'salas/ABC123/visao/' + G, null, OK],
  ['Convidado NÃO lê a visão de outro jogador', G, 'ler', 'salas/ABC123/visao/' + H, null, NEG],
  ['Estranho (sem estar na sala) NÃO lê visão de ninguém', X, 'ler', 'salas/ABC123/visao/' + G, null, NEG],
  ['Convidado NÃO escreve na própria visão (só o anfitrião)', G, 'escrever', 'salas/ABC123/visao/' + G, '{"hack":1}', NEG],
  ['Anfitrião escreve a visão do convidado', H, 'escrever', 'salas/ABC123/visao/' + G, '{"x":2}', OK],
  ['Anfitrião grava o estado completo', H, 'escrever', 'salas/ABC123/estado', '{"s":2}', OK],
  ['Convidado NÃO grava o estado completo', G, 'escrever', 'salas/ABC123/estado', '{"s":9}', NEG],
  ['Convidado envia ação na PRÓPRIA caixa', G, 'escrever', 'salas/ABC123/acoes/' + G + '/n1', { tipo: 'sell', args: '["soja"]', ts: 5 }, OK],
  ['Convidado NÃO escreve na caixa de OUTRO', G, 'escrever', 'salas/ABC123/acoes/' + H + '/n1', { tipo: 'end', args: '[]', ts: 5 }, NEG],
  ['Convidado NÃO lê as caixas de ação (só o anfitrião)', G, 'ler', 'salas/ABC123/acoes/' + G, null, NEG],
  ['Anfitrião lê a caixa de ações', H, 'ler', 'salas/ABC123/acoes/' + G, null, OK],
  ['Anfitrião apaga a ação que processou', H, 'escrever', 'salas/ABC123/acoes/' + G + '/a1', null, OK],
  ['Ação com args gigante (3000 caracteres) é recusada  [NOVA]', G, 'escrever', 'salas/ABC123/acoes/' + G + '/n2', { tipo: 'sell', args: grande, ts: 5 }, NEG],
  ['Ação em sala que NÃO existe é recusada (sem lixo)  [NOVA]', X, 'escrever', 'salas/ZZZ999/acoes/' + X + '/n1', { tipo: 'sell', args: '[]', ts: 5 }, NEG, raiz],
  ['Estranho NÃO entra numa partida em andamento', X, 'escrever', 'salas/ABC123/jogadores/' + X, jog('Intruso', 3), NEG],
  ['Estranho entra numa sala em LOBBY', X, 'escrever', 'salas/LOBBY1/jogadores/' + X, jog('Novo', 1), OK],
  ['Jogador que já estava VOLTA a uma partida em andamento', G, 'escrever', 'salas/ABC123/jogadores/' + G + '/online', true, OK],
  ['Jogador NÃO mexe na presença de outro', G, 'escrever', 'salas/ABC123/jogadores/' + H + '/online', false, NEG],
  ['Anfitrião cria/ajusta o bot', H, 'escrever', 'salas/ABC123/jogadores/botX/online', true, OK],
  ['Valor inválido em "bot" é recusado', H, 'escrever', 'salas/ABC123/jogadores/' + G, { nome: 'Beto', idx: 1, online: true, bot: 'hacker' }, NEG],
  ['Campo extra em jogadores é recusado', H, 'escrever', 'salas/ABC123/jogadores/' + G, { nome: 'Beto', idx: 1, online: true, bot: '', poder: 99 }, NEG],
  ['Anfitrião tira um jogador (no lobby)', H, 'escrever', 'salas/LOBBY1/jogadores/' + H, null, OK],
  ['Convidado NÃO tira o anfitrião', G, 'escrever', 'salas/ABC123/jogadores/' + H, null, NEG],
  ['Anfitrião muda o estado da sala', H, 'escrever', 'salas/ABC123/meta/estado', 'fim', OK],
  ['Estado inventado é recusado', H, 'escrever', 'salas/ABC123/meta/estado', 'xyz', NEG],
  ['Convidado NÃO muda o estado da sala', G, 'escrever', 'salas/ABC123/meta/estado', 'fim', NEG],
  ['Convidado NÃO vira anfitrião', G, 'escrever', 'salas/ABC123/meta/host', G, NEG],
  ['Criar sala nova com o próprio uid como anfitrião', X, 'escrever', 'salas/NOVA01/meta', meta('lobby', X), OK],
  ['Criar sala dizendo que OUTRO é o anfitrião é recusado', X, 'escrever', 'salas/NOVA02/meta', meta('lobby', H), NEG],
  ['Tomar uma sala que já existe é recusado', X, 'escrever', 'salas/ABC123/meta', meta('lobby', X), NEG],
  ['Código de sala inválido (minúsculas) é recusado', X, 'escrever', 'salas/abc/meta', meta('lobby', X), NEG],
  ['Anfitrião APAGA a sala inteira (Sair / Fechar sala / limpeza)  [NOVA]', H, 'escrever', 'salas/ABC123', null, OK],
  ['Convidado NÃO apaga a sala', G, 'escrever', 'salas/ABC123', null, NEG],
  ['Estranho NÃO apaga a sala', X, 'escrever', 'salas/ABC123', null, NEG],
  ['Jogador atrasado NÃO recria nó em sala apagada (sem lixo)', G, 'escrever', 'salas/ABC123/jogadores/' + G + '/online', true, NEG, livre],
  ['Qualquer um autenticado lê a meta (precisa do código)', G, 'ler', 'salas/ABC123/meta', null, OK],
  ['SEM login não lê nada', null, 'ler', 'salas/ABC123/meta', null, NEG],
  ['NÃO dá para listar todas as salas', G, 'ler', 'salas', null, NEG],
  ['NÃO dá para ler o banco inteiro', G, 'ler', '', null, NEG],
  ['NÃO dá para escrever fora de /salas', G, 'escrever', 'qualquer/coisa', 'x', NEG],
];
const roda = (regras, c) => { const r = c[6] || raiz, m = criaMotor(regras, () => r); return c[2] === 'ler' ? m.podeLer(c[1], c[3]) : m.podeEscrever(c[1], c[3], c[4]); };
let falhas = 0, difs = [];
console.log('\n  situação                                                                         NOVAS   ANTIGAS');
casos.forEach((c, i) => {
  const n = roda(novas, c), a = roda(antigas, c), ok = n === c[5];
  if (!ok) falhas++; if (n !== a) difs.push(c[0]);
  console.log(`${ok ? '  ' : '✗ '}${String(i + 1).padStart(2)}. ${c[0].slice(0, 76).padEnd(76)} ${(n ? 'permite' : 'NEGA').padEnd(8)}${a ? 'permite' : 'NEGA'}${n !== a ? '   ← mudou' : ''}`);
});
console.log(`\n== Regras: ${casos.length - falhas} situações certas, ${falhas} erradas (regras novas). Diferenças para as antigas: ${difs.length} ==`);
difs.forEach(d => console.log('   • ' + d));
process.exit(falhas ? 1 : 0);
