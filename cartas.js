// ARQUIVO DE DADOS - editado pelo editor.html (ou à mão, se preferir)
const CARDS = {
 "objetivo": [
  {"id":"Objetivo 1","nome":"Objetivo 1","sprite":"","t":"lvl3n","v":4},
  {"id":"Objetivo 2","nome":"Objetivo 2","sprite":"","t":"lvl3crops","v":3},
  {"id":"Objetivo 3","nome":"Objetivo 3","sprite":"","t":"lvlsum","v":16},
  {"id":"Objetivo 4","nome":"Objetivo 4","sprite":"","t":"prodEach","v":150},
  {"id":"Objetivo 5","nome":"Objetivo 5","sprite":"","t":"stockN","v":250,"n":3},
  {"id":"Objetivo 6","nome":"Objetivo 6","sprite":"","t":"coins","v":6000},
  {"id":"Objetivo 7","nome":"Objetivo 7","sprite":"","t":"clean","v":4000},
  {"id":"Objetivo 8","nome":"Objetivo 8","sprite":"","t":"noLoan","v":3000,"elim":1},
  {"id":"Objetivo 9","nome":"Objetivo 9","sprite":"","t":"chrome","v":3},
  {"id":"Objetivo 10","nome":"Objetivo 10","sprite":"","t":"slots","v":14},
  {"id":"Objetivo 11","nome":"Objetivo 11","sprite":"","t":"mSales","v":10,"esc":1},
  {"id":"Objetivo 12","nome":"Objetivo 12","sprite":"","t":"mBuys","v":8,"esc":1},
  {"id":"Objetivo 13","nome":"Objetivo 13","sprite":"","t":"mProfit","v":2000,"esc":1},
  {"id":"Objetivo 14","nome":"Objetivo 14","sprite":"","t":"mAll","v":3},
  {"id":"Objetivo 15","nome":"Objetivo 15","sprite":"","t":"mSellTo","v":4},
  {"id":"Objetivo 16","nome":"Objetivo 16","sprite":"","t":"mUnits","v":600,"esc":1},
  {"id":"Objetivo 17","nome":"Objetivo 17","sprite":"","t":"azar","v":5,"v2":1500,"floor":100,"elim":1},
  {"id":"Objetivo 18","nome":"Objetivo 18","sprite":"","t":"noites","n":3,"v":2000},
  {"id":"Objetivo 19","nome":"Objetivo 19","sprite":"","t":"floorUntil","r":25,"floor":50,"v":2500,"elim":1},
  {"id":"Objetivo 20","nome":"Objetivo 20","sprite":"","t":"allLvl","r":30,"n":4,"v":1000}
 ],
 "campo": [
  {"id":"Campo 1","nome":"Campo 1","slots":1,"types":["soja","milho"]},
  {"id":"Campo 2","nome":"Campo 2","slots":1,"types":["cana","cafe"]},
  {"id":"Campo 3","nome":"Campo 3","slots":1,"types":["algodao","soja"]},
  {"id":"Campo 4","nome":"Campo 4","slots":2,"types":["milho","cana"]},
  {"id":"Campo 5","nome":"Campo 5","slots":2,"types":["cafe","algodao"]},
  {"id":"Campo 6","nome":"Campo 6","slots":2,"types":["soja","cana"]},
  {"id":"Campo 7","nome":"Campo 7","slots":3,"types":["milho","cafe"]},
  {"id":"Campo 8","nome":"Campo 8","slots":3,"types":["cana","algodao"]},
  {"id":"Campo 9","nome":"Campo 9","slots":3,"types":["cafe","soja"]},
  {"id":"Campo 10","nome":"Campo 10","slots":1,"any":true},
  {"id":"Campo 11","nome":"Campo 11","slots":2,"any":true},
  {"id":"Campo 12","nome":"Campo 12","slots":3,"any":true}
 ],
 "plantacao": [
  {"id":"Plantação 5","nome":"Soja","crop":"soja","sprite":"img/SoyCard1.png","sprite2":"img/SoyCard2.png","sprite3":"img/SoyCard03.png"},
  {"id":"Plantação 3","nome":"Milho","crop":"milho","sprite":"img/CornCard1.png","sprite2":"img/CornCard2.png","sprite3":"img/CornCard3.png"},
  {"id":"Plantação 2","nome":"Cana-de-Açúcar","crop":"cana","sprite":"img/SugarcaneCard1.png","sprite2":"img/SugarcaneCard2.png","sprite3":"img/SugarcaneCard3.png"},
  {"id":"Plantação 1","nome":"Café","crop":"cafe","sprite":"img/CoffeeCard1.png","sprite2":"img/CoffeeCard2.png","sprite3":"img/CoffeeCard3.png"},
  {"id":"Plantação 4","nome":"Algodão","crop":"algodao","sprite":"img/CottonCard1.png","sprite2":"img/CottonCard2.png","sprite3":"img/CottonCard3.png"}
 ],
 "geral": [
  {"id":"SorteGeral1","nome":"Chuva generosa","sprite":"","dur":2,"mult":1.5,"coins":0},
  {"id":"SorteGeral2","nome":"Safra recorde","sprite":"","dur":1,"mult":2,"coins":0},
  {"id":"SorteGeral3","nome":"Clima ameno","sprite":"","dur":3,"mult":1.25,"coins":0},
  {"id":"SorteGeral4","nome":"Feira Regional","sprite":"","dur":1,"coins":0,"fx":"feira","estoque":50,"limite":50,"preco":1},
  {"id":"SorteGeral5","nome":"Alta demanda","sprite":"","dur":1,"coins":0,"fx":"demanda","teto":3},
  {"id":"SorteGeral6","nome":"Governo paga +100%","sprite":"","dur":1,"coins":0,"fx":"govPaga","fator":2},
  {"id":"SorteGeral7","nome":"Incentivo Fiscal","sprite":"","dur":2,"coins":0,"fx":"incentivo","pct":50,"campoMax":100},
  {"id":"SorteGeral8","nome":"Isenção","sprite":"","dur":1,"coins":0,"fx":"isencao"},
  {"id":"SorteGeral9","nome":"Auxílio aos pequenos","sprite":"","dur":1,"coins":0,"fx":"auxilio","valor":200,"minRound":10},
  {"id":"SorteGeral10","nome":"Entrega de mudas","sprite":"","dur":1,"coins":0,"fx":"mudas"},
  {"id":"AzarGeral1","nome":"Campos noturnos","sprite":"","dur":2,"coins":0,"azar":true,"night":true},
  {"id":"AzarGeral2","nome":"Tudo à vista","sprite":"","dur":2,"coins":0,"azar":true,"reveal":"all"},
  {"id":"AzarGeral3","nome":"Recessão","sprite":"","dur":1,"coins":0,"azar":true,"fx":"recessao","valor":50},
  {"id":"AzarGeral4","nome":"Praga","sprite":"","dur":1,"coins":0,"azar":true,"fx":"praga"},
  {"id":"AzarGeral5","nome":"Juros em alta","sprite":"","dur":2,"coins":0,"azar":true,"fx":"juros","fator":2},
  {"id":"AzarGeral6","nome":"Embargo","sprite":"","dur":1,"coins":0,"azar":true,"fx":"embargo"},
  {"id":"AzarGeral7","nome":"Taxa do Mercado","sprite":"","dur":2,"coins":0,"azar":true,"fx":"taxa","pct":20},
  {"id":"AzarGeral8","nome":"Imposto sobre fortunas","sprite":"","dur":1,"coins":0,"azar":true,"fx":"imposto","valor":100},
  {"id":"AzarGeral9","nome":"Tempestade","sprite":"","dur":1,"coins":0,"azar":true,"fx":"tempestade"},
  {"id":"AzarGeral10","nome":"Greve","sprite":"","dur":1,"coins":0,"azar":true,"fx":"greve"}
 ],
 "individual": [
  {"id":"SorteIndividual1","nome":"SorteIndividual1","sprite":"","coins":100},
  {"id":"AzarIndividual1","nome":"AzarIndividual1","sprite":"","coins":-50},
  {"id":"SorteIndividual2","nome":"SorteIndividual2","sprite":"","coins":50},
  {"id":"AzarIndividual2","nome":"AzarIndividual2","sprite":"","coins":-100},
  {"id":"SorteIndividual3","nome":"SorteIndividual3","sprite":"","coins":150},
  {"id":"AzarIndividual3","nome":"AzarIndividual3","sprite":"","dur":2,"coins":0,"night":true},
  {"id":"SorteIndividual4","nome":"SorteIndividual4","sprite":"","coins":0,"reveal":"peek"},
  {"id":"AzarIndividual4","nome":"AzarIndividual4","sprite":"","dur":2,"coins":0,"reveal":"self"},
  {"id":"SorteIndividual5","nome":"SorteIndividual5","sprite":"","coins":75},
  {"id":"AzarIndividual5","nome":"AzarIndividual5","sprite":"","coins":-75}
 ]
};
const ASSETS = {
 "campo": {
  "1": {
   "nome": "Plantação (1)",
   "preco": 50,
   "nomeCromada": "Plantação (1) - Cromo",
   "precoCromada": 100,
   "dia": "img/FieldDay1.png",
   "noite": "img/FieldNight1.png",
   "cromada": "img/Field1Chrome.png"
  },
  "2": {
   "nome": "Plantação (2)",
   "preco": 100,
   "nomeCromada": "Plantação (2) - Cromo",
   "precoCromada": 200,
   "dia": "img/FieldDay2.png",
   "noite": "img/FieldNight2.png",
   "cromada": "img/Field2Chrome.png"
  },
  "3": {
   "nome": "Plantação (3)",
   "preco": 150,
   "nomeCromada": "Plantação (3) - Cromo",
   "precoCromada": 300,
   "dia": "img/FieldDay3.png",
   "noite": "img/FieldNight3.png",
   "cromada": "img/Field3Chrome.png"
  }
 },
 "cultura": {
  "soja": "img/SoySprite.png",
  "milho": "img/CornSprite.png",
  "cana": "img/SugarcaneSprite.png",
  "cafe": "img/CoffeSprite.png",
  "algodao": "img/CottonSprite.png"
 },
 "ouro": "img/Coins.png",
 "niveis": {
  "1": {
   "espacos": 1,
   "producao": 20,
   "evolucao": 100,
   "manut": 10
  },
  "2": {
   "espacos": 2,
   "producao": 50,
   "evolucao": 250,
   "manut": 20
  },
  "3": {
   "espacos": 3,
   "producao": 80,
   "evolucao": 0,
   "manut": 30
  }
 },
 "regras": {
  "minJogadores": 2,
  "maxJogadores": 10,
  "moedasIniciais": 500,
  "recursosIniciais": {
   "soja": 0,
   "milho": 0,
   "cana": 0,
   "cafe": 0,
   "algodao": 0
  },
  "maxMao": 5,
  "cartasPrimeiroTurno": 5,
  "cartasPorTurno": 1,
  "cartaExtra": 20,
  "cofrePorJogador": 300,
  "emprestimo": 100,
  "juros": 5,
  "limiteDivida": 500,
  "precoRecursoGoverno": {
   "soja": 1,
   "milho": 1,
   "cana": 1,
   "cafe": 1,
   "algodao": 1
  },
  "eventoIndividualCada": 5,
  "noturnoPct": 50,
  "maxCamposPorJogador": 0,
  "maxCompraCamposPorTurno": 2,
  "camposMin": 2,
  "camposMax": 2,
  "camposRefresh": "turno",
  "devAtivo": 1
 },
 "deckVersion": 5
};
