// ===== FICHA TÉCNICA =====
// config.js: Guarda os nomes das culturas, os textos dos objetivos, os valores padrão (regras, níveis, preços de campo), os baralhos novos e a função 'migrate' que completa arquivos antigos.
// ========================

// ===== CONFIGURAÇÕES GERAIS =====
const CROPS = {"soja":"Soja","milho":"Milho","cana":"Cana-de-açúcar","cafe":"Café","algodao":"Algodão"};
const K = Object.keys(CROPS);
// Textos dos objetivos. Marcadores: {v} {n} {r} {v2} {floor} (campos da carta) e {c} (nome da cultura)
const T = {
 "lvl3n": "Tenha {v} plantios no nível 3",
 "lvl3crops": "Tenha nível 3 em {v} culturas diferentes",
 "lvlsum": "Some {v} níveis nos seus plantios",
 "prodEach": "Produza {v} de cada uma das 5 culturas",
 "stockN": "Guarde {v} de cada uma de {n} culturas",
 "coins": "Acumule {v} moedas",
 "clean": "Tenha {v} moedas e dívida zero",
 "noLoan": "Tenha {v} moedas sem nunca ter pego empréstimo (pegar um elimina você)",
 "chrome": "Tenha {v} campos cromados",
 "slots": "Tenha {v} vagas no total",
 "mSales": "Feche {v} vendas a outros jogadores",
 "mBuys": "Feche {v} compras de outros jogadores",
 "mProfit": "Lucre {v} moedas só vendendo a jogadores",
 "mAll": "Negocie com todos os adversários",
 "mSellTo": "Venda a {v} jogadores diferentes",
 "mUnits": "Venda {v} unidades no Mercado",
 "azar": "Passe por {v} eventos de azar geral sem ficar abaixo de {floor} moedas (abaixo disso elimina) e tenha {v2} moedas",
 "noites": "Tenha {v} moedas depois de {n} noites",
 "floorUntil": "Nunca fique abaixo de {floor} moedas até a rodada {r} (abaixo disso elimina) e tenha {v} moedas",
 "allLvl": "A partir da rodada {r}, tenha {n}+ plantios, todos acima do nível 1, e {v} moedas"
};


// ===== Padrões usados para completar o cartas.js (o jogo e o editor aplicam sozinhos) =====
// Preço (moedas por unidade) que o Governo paga pelos recursos: 1 por padrão (o evento "Governo paga +100%" dobra)
const CROP_PRICE = { soja: 1, milho: 1, cana: 1, cafe: 1, algodao: 1 };
// Níveis das cartas de recurso: espaços do campo que ocupa, produção/rodada, custo p/ evoluir (do próprio recurso) e manutenção/rodada (moedas)
const LEVEL_DEFAULTS = {
  1: { espacos: 1, producao: 20, evolucao: 100, manut: 25 },
  2: { espacos: 2, producao: 50, evolucao: 250, manut: 50 },
  3: { espacos: 3, producao: 80, evolucao: 0, manut: 75 }
};
const FIELD_DEFAULTS = {
  1: { nome: 'Campo 1 Vaga', preco: 100, nomeCromada: 'Campo Cromado 1 Vaga', precoCromada: 210 },
  2: { nome: 'Campo 2 Vagas', preco: 140, nomeCromada: 'Campo Cromado 2 Vagas', precoCromada: 270 },
  3: { nome: 'Campo 3 Vagas', preco: 180, nomeCromada: 'Campo Cromado 3 Vagas', precoCromada: 330 }
};
// ===== Regras essenciais (editáveis no editor.html; valem para partidas novas) =====
const DEFAULT_RULES = {
  minJogadores: 2, maxJogadores: 10,
  moedasIniciais: 500, recursosIniciais: { soja: 0, milho: 0, cana: 0, cafe: 0, algodao: 0 },
  maxMao: 5, cartasPrimeiroTurno: 5, cartasPorTurno: 1, cartaExtra: 20,
  cofrePorJogador: 300, emprestimo: 100, juros: 5, limiteDivida: 500,
  precoRecursoGoverno: { ...CROP_PRICE },
  eventoIndividualCada: 5, noturnoPct: 50,
  maxCamposPorJogador: 0, maxCompraCamposPorTurno: 2,       // 0 = sem limite de campos por jogador
  camposMin: 2, camposMax: 2, camposRefresh: 'turno',        // área de compra: repõe até o máximo quando cair abaixo do mínimo ('turno' ou 'rodada')
  devAtivo: 1
};
// ===== Baralhos novos: 10 eventos gerais (5 sorte + 5 azar) e 10 individuais (5 sorte + 5 azar) =====
const D2 = (id, o) => ({ id, nome: id, sprite: '', ...o });
const DECKS_V2 = {
  geral: [
    D2('SorteGeral1', { dur: 2, mult: 1.25, coins: 20 }), D2('AzarGeral1', { dur: 2, mult: 0.8, coins: -20 }),
    D2('SorteGeral2', { dur: 1, mult: 1.5, coins: 0 }), D2('AzarGeral2', { dur: 1, mult: 0.5, coins: 0 }),
    D2('SorteGeral3', { dur: 3, mult: 1.1, coins: 30 }), D2('AzarGeral3', { dur: 2, mult: 1, coins: 0, night: true }),          // CAMPOS NOTURNOS (obrigatório)
    D2('SorteGeral4', { dur: 1, mult: 2, coins: 0 }), D2('AzarGeral4', { dur: 2, mult: 1, coins: 0, reveal: 'all' }),           // todos veem tudo
    D2('SorteGeral5', { dur: 2, mult: 1.2, coins: 50 }), D2('AzarGeral5', { dur: 3, mult: 0.9, coins: -30 })],
  individual: [
    D2('SorteIndividual1', { coins: 100 }), D2('AzarIndividual1', { coins: -50 }),
    D2('SorteIndividual2', { coins: 50 }), D2('AzarIndividual2', { coins: -100 }),
    D2('SorteIndividual3', { coins: 150 }), D2('AzarIndividual3', { dur: 2, coins: 0, night: true }),                            // SEUS CAMPOS NOTURNOS (obrigatório)
    D2('SorteIndividual4', { coins: 0, reveal: 'peek' }), D2('AzarIndividual4', { dur: 2, coins: 0, reveal: 'self' }),           // espiar / revelar-se
    D2('SorteIndividual5', { coins: 75 }), D2('AzarIndividual5', { coins: -75 })]
};
// ===== Objetivos (20). Campos: t=tipo, v=valor, n/r/v2/floor=parâmetros, elim=1 (violar elimina), esc=1 escala pelo nº de jogadores (função vef, em cartas-visual.js; o valor v é o de 5+ jogadores) =====
const DECKS_V4 = {
  objetivo: [
    D2('Objetivo 1', { t: 'lvl3n', v: 4 }), D2('Objetivo 2', { t: 'lvl3crops', v: 3 }), D2('Objetivo 3', { t: 'lvlsum', v: 16 }),
    D2('Objetivo 4', { t: 'prodEach', v: 150 }), D2('Objetivo 5', { t: 'stockN', v: 250, n: 3 }), D2('Objetivo 6', { t: 'coins', v: 6000 }),
    D2('Objetivo 7', { t: 'clean', v: 4000 }), D2('Objetivo 8', { t: 'noLoan', v: 3000, elim: 1 }), D2('Objetivo 9', { t: 'chrome', v: 3 }),
    D2('Objetivo 10', { t: 'slots', v: 14 }), D2('Objetivo 11', { t: 'mSales', v: 10, esc: 1 }), D2('Objetivo 12', { t: 'mBuys', v: 8, esc: 1 }),
    D2('Objetivo 13', { t: 'mProfit', v: 2000, esc: 1 }), D2('Objetivo 14', { t: 'mAll', v: 3 }), D2('Objetivo 15', { t: 'mSellTo', v: 4 }),
    D2('Objetivo 16', { t: 'mUnits', v: 600, esc: 1 }), D2('Objetivo 17', { t: 'azar', v: 5, v2: 1500, floor: 100, elim: 1 }),
    D2('Objetivo 18', { t: 'noites', n: 3, v: 2000 }), D2('Objetivo 19', { t: 'floorUntil', r: 25, floor: 50, v: 2500, elim: 1 }),
    D2('Objetivo 20', { t: 'allLvl', r: 30, n: 4, v: 1000 })]
};
// ===== Eventos gerais: textos das regras (os {campos} vêm da carta; {c} é a cultura sorteada). Editar os números no editor.html muda o texto sozinho =====
const EVT = {
 feira: 'o Governo vende {estoque}×(nº de jogadores) de cada recurso a {preco} moeda cada; cada jogador compra até {limite} de cada',
 demanda: 'no fim da rodada o Governo compra a oferta mais barata de {c} no Mercado por {teto} moedas cada (ou pelo preço pedido, se menor)',
 govPaga: 'o Governo paga {fator}x pelos recursos vendidos a ele',
 incentivo: 'o Governo arca com {pct}% da manutenção; na 1ª rodada, 1 campo de até {campoMax} moedas é grátis (por jogador)',
 isencao: 'sem manutenção dos plantios',
 auxilio: 'os N/3 jogadores com menos moedas ganham {valor} do Governo (1 vez por jogo, a partir da rodada {minRound})',
 mudas: 'todos sacam 1 carta de recurso extra (passa do limite da mão)',
 recessao: 'todos pagam {valor} moedas ao Governo',
 praga: '{c} não produz',
 juros: 'os juros da dívida são multiplicados por {fator}',
 embargo: 'Mercado entre jogadores fechado',
 taxa: '{pct}% de cada venda entre jogadores vai ao Governo',
 imposto: 'o jogador mais rico paga {valor} moedas ao Governo',
 tempestade: 'plantios nível 1 e 2 não produzem',
 greve: 'ninguém produz'
};
// ===== Eventos gerais (20): campo fx = efeito especial tratado em rodada.js / acoes-*.js; mult = multiplicador de produção; night/reveal = como antes =====
const DECKS_V5 = {
  geral: [
    D2('SorteGeral1', { nome: 'Chuva generosa', dur: 2, mult: 1.5, coins: 0 }),
    D2('SorteGeral2', { nome: 'Safra recorde', dur: 1, mult: 2, coins: 0 }),
    D2('SorteGeral3', { nome: 'Clima ameno', dur: 3, mult: 1.25, coins: 0 }),
    D2('SorteGeral4', { nome: 'Feira Regional', dur: 1, coins: 0, fx: 'feira', estoque: 50, limite: 50, preco: 1 }),
    D2('SorteGeral5', { nome: 'Alta demanda', dur: 1, coins: 0, fx: 'demanda', teto: 3 }),
    D2('SorteGeral6', { nome: 'Governo paga +100%', dur: 1, coins: 0, fx: 'govPaga', fator: 2 }),
    D2('SorteGeral7', { nome: 'Incentivo Fiscal', dur: 2, coins: 0, fx: 'incentivo', pct: 50, campoMax: 100 }),
    D2('SorteGeral8', { nome: 'Isenção', dur: 1, coins: 0, fx: 'isencao' }),
    D2('SorteGeral9', { nome: 'Auxílio aos pequenos', dur: 1, coins: 0, fx: 'auxilio', valor: 200, minRound: 10 }),
    D2('SorteGeral10', { nome: 'Entrega de mudas', dur: 1, coins: 0, fx: 'mudas' }),
    D2('AzarGeral1', { nome: 'Campos noturnos', dur: 2, coins: 0, azar: true, night: true }),
    D2('AzarGeral2', { nome: 'Tudo à vista', dur: 2, coins: 0, azar: true, reveal: 'all' }),
    D2('AzarGeral3', { nome: 'Recessão', dur: 1, coins: 0, azar: true, fx: 'recessao', valor: 50 }),
    D2('AzarGeral4', { nome: 'Praga', dur: 1, coins: 0, azar: true, fx: 'praga' }),
    D2('AzarGeral5', { nome: 'Juros em alta', dur: 2, coins: 0, azar: true, fx: 'juros', fator: 2 }),
    D2('AzarGeral6', { nome: 'Embargo', dur: 1, coins: 0, azar: true, fx: 'embargo' }),
    D2('AzarGeral7', { nome: 'Taxa do Mercado', dur: 2, coins: 0, azar: true, fx: 'taxa', pct: 20 }),
    D2('AzarGeral8', { nome: 'Imposto sobre fortunas', dur: 1, coins: 0, azar: true, fx: 'imposto', valor: 100 }),
    D2('AzarGeral9', { nome: 'Tempestade', dur: 1, coins: 0, azar: true, fx: 'tempestade' }),
    D2('AzarGeral10', { nome: 'Greve', dur: 1, coins: 0, azar: true, fx: 'greve' })]
};
function migrate(CARDS, ASSETS) {
  for (const s in FIELD_DEFAULTS) ASSETS.campo[s] = { ...FIELD_DEFAULTS[s], ...ASSETS.campo[s] };
  CARDS.campo.forEach(c => delete c.price); // o preço agora é do modelo de campo
  ASSETS.ouro = ASSETS.ouro || '';
  ASSETS.niveis = ASSETS.niveis || {};
  for (const n in LEVEL_DEFAULTS) ASSETS.niveis[n] = { ...LEVEL_DEFAULTS[n], ...ASSETS.niveis[n] };
  CARDS.plantacao.forEach(c => { // carta de recurso nasce nível 1; níveis 2 e 3 só por evolução
    ['sprite', 'sprite2', 'sprite3'].forEach(k => { if (c[k] === undefined) c[k] = ''; });
    delete c.qtd; delete c.custo; delete c.grow; delete c.yield; // agora vêm da tabela de níveis
  });
  const g = ASSETS.regras = ASSETS.regras || {};
  for (const k in DEFAULT_RULES) g[k] = typeof DEFAULT_RULES[k] === 'object' ? { ...DEFAULT_RULES[k], ...g[k] } : (g[k] === undefined ? DEFAULT_RULES[k] : g[k]);
  if (!(ASSETS.deckVersion >= 2)) { // troca os baralhos uma única vez (mantém nome e sprite de quem já existia com o mesmo id)
    for (const k in DECKS_V2) CARDS[k] = DECKS_V2[k].map(d => { const o = (CARDS[k] || []).find(c => c.id === d.id); return { ...d, nome: (o && o.nome) || d.nome, sprite: (o && o.sprite) || '' }; });
    ASSETS.deckVersion = 2;
  }
  if (!(ASSETS.deckVersion >= 3)) { // cartas de recurso: só 5 tipos, um por cultura (mantém nome e sprites da primeira carta de cada cultura)
    CARDS.plantacao = K.map((k, i) => { const o = CARDS.plantacao.find(c => c.crop === k); return o ? { ...o } : { id: 'Plantação ' + (i + 1), nome: 'Plantação ' + (i + 1), sprite: '', sprite2: '', sprite3: '', crop: k }; });
    ASSETS.deckVersion = 3;
  }
  if (!(ASSETS.deckVersion >= 4)) { // objetivos: lista de 20 (mantém nome e sprite de quem já existia com o mesmo id)
    for (const k in DECKS_V4) CARDS[k] = DECKS_V4[k].map(d => { const o = (CARDS[k] || []).find(c => c.id === d.id); return { ...d, nome: (o && o.nome) || d.nome, sprite: (o && o.sprite) || '' }; });
    ASSETS.deckVersion = 4;
  }
  if (!(ASSETS.deckVersion >= 5)) { // eventos gerais: os 20 novos (10 sorte + 10 azar). Cartas novas, então as sprites antigas não se aplicam
    for (const k in DECKS_V5) CARDS[k] = DECKS_V5[k].map(d => ({ ...d }));
    ASSETS.deckVersion = 5;
  }
}
