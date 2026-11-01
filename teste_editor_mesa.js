// Teste do editor.html (seção Mesa): roda o SCRIPT REAL do editor com um DOM simulado, desenha, edita, salva e relê. Uso: node teste_editor_mesa.js
const fs = require('fs'), vm = require('vm'); let ruins = 0; const ok = (c, m) => { console.log((c ? '  ✓ ' : '  ✗ ') + m); if (!c) ruins++; };
const html = fs.readFileSync(__dirname + '/editor.html', 'utf8'), js = html.match(/<script>([\s\S]*)<\/script>/)[1];
const cfg = fs.readFileSync(__dirname + '/config.js', 'utf8'), cartas = fs.readFileSync(__dirname + '/cartas.js', 'utf8');
// carrega como o editor faz (abrir pasta -> migrate)
const o = new Function(cfg + ';' + cartas + ';migrate(CARDS,ASSETS);return{CARDS,ASSETS}')();
const M = o.ASSETS.mesa;
ok(M && M.corFundo === '#2f5a3b' && M.fundo === '' && M.versoMao === '' && Object.keys(M.baralhos).join() === 'plantacao,campo,geral,individual', 'migrate completa a mesa: fundo, cor, verso da mão e os 4 baralhos');
ok(!('objetivo' in M.baralhos), 'o baralho de objetivos NÃO entra (só é dado no início da partida)');
// DOM simulado
const els = {}, get = s => els[s] = els[s] || { innerHTML: '', handlers: {}, addEventListener(t, f) { this.handlers[t] = f; }, set onclick(f) { this.handlers.click = f; }, get onclick() { return this.handlers.click; }, textContent: '', disabled: false };
const sb = { document: { querySelector: get, querySelectorAll: () => [], createElement: () => ({}) }, window: {}, URL: { createObjectURL: () => '' }, alert: m => { throw new Error('alert: ' + m); } }; sb.window = sb; vm.createContext(sb);
vm.runInContext(js, sb);
sb.__d = o.CARDS; sb.__a = JSON.parse(JSON.stringify(o.ASSETS)); vm.runInContext('data = __d; assets = __a;', sb); vm.runInContext('draw()', sb);
const pg = get('#list').innerHTML;
ok(/<h2>Mesa \(visão superior\)<\/h2>/.test(pg), 'a página desenha a seção "Mesa (visão superior)"');
ok(/data-a="mesa\.fundo"/.test(pg) && /data-a="mesa\.corFundo"/.test(pg) && /data-a="mesa\.versoMao"/.test(pg), 'tem fundo da mesa (imagem e cor) e verso das cartas na mão');
ok(['plantacao', 'campo', 'geral', 'individual'].every(k => pg.includes(`data-a="mesa.baralhos.${k}.verso"`) && pg.includes(`data-a="mesa.baralhos.${k}.cor"`)), 'tem imagem de verso e cor para cada um dos 4 baralhos');
ok((pg.match(/type="color"/g) || []).length === 5, '5 seletores de cor (fundo + 4 baralhos)');
ok((pg.match(/data-up/g) || []).length >= 6 + 4, 'os botões 📁 de enviar imagem existem para o fundo, a mão e os 4 versos');
// edita como o usuário: o editor escuta 'input' e 'click' no #list
const ent = get('#list').handlers.input, clk = get('#list').handlers.click;
ent({ target: { dataset: { a: 'mesa.baralhos.geral.cor' }, type: 'color', value: '#112233' } });
ent({ target: { dataset: { a: 'mesa.corFundo' }, type: 'color', value: '#003300' } });
ent({ target: { dataset: { a: 'mesa.baralhos.campo.verso' }, type: 'text', value: 'img/verso-campo.png' } });
const ed = vm.runInContext('assets.mesa', sb);
ok(ed.baralhos.geral.cor === '#112233' && ed.corFundo === '#003300' && ed.baralhos.campo.verso === 'img/verso-campo.png', 'editar cor e caminho de imagem altera os dados certos');
// salvar como o botão Salvar faz e reler como o jogo
const data = vm.runInContext('data', sb), assets = vm.runInContext('assets', sb);
const out = '// ARQUIVO DE DADOS - editado pelo editor.html (ou à mão, se preferir)\nconst CARDS = {\n' + Object.entries(data).map(([k, a]) => ` "${k}": [\n` + a.map(c => '  ' + JSON.stringify(c)).join(',\n') + '\n ]').join(',\n') + '\n};\nconst ASSETS = ' + JSON.stringify(assets, null, 1) + ';\n';
const volta = new Function(cfg + ';' + out + ';migrate(CARDS,ASSETS);return{CARDS,ASSETS}')();
ok(volta.ASSETS.mesa.baralhos.geral.cor === '#112233' && volta.ASSETS.mesa.baralhos.campo.verso === 'img/verso-campo.png' && volta.ASSETS.mesa.baralhos.plantacao.cor === '#e0262f', 'salvar → reabrir: o que foi editado fica e o que não foi editado mantém o padrão');
ok(JSON.stringify(volta.CARDS) === JSON.stringify(o.CARDS), 'as cartas (inclusive objetivos e minJ) continuam idênticas');
// arquivo ANTIGO (sem mesa): o migrate completa sem erro
const antigo = cartas.replace(/ "mesa": \{[\s\S]*?\n \},?\n/, '');
const ant = new Function(cfg + ';' + antigo + ';migrate(CARDS,ASSETS);return{CARDS,ASSETS}')(); ok(ant.ASSETS.mesa.baralhos.individual.cor === '#4752cf', 'cartas.js sem a seção mesa (arquivo antigo): o migrate cria os padrões');
console.log(ruins ? `\n✗ ${ruins} problema(s)` : '\n✓ editor com a seção Mesa funciona (desenho, edição, salvar e reabrir)'); process.exit(ruins ? 1 : 0);
