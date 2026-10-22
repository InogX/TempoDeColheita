// ARQUIVO DE DADOS - editado pelo editor.html (ou à mão, se preferir)
const CARDS = {
 "objetivo": [
  {"id":"Objetivo 1","nome":"Objetivo 1","sprite":"","t":"coins","v":1500},
  {"id":"Objetivo 2","nome":"Objetivo 2","sprite":"","t":"fields","v":4},
  {"id":"Objetivo 3","nome":"Objetivo 3","sprite":"","t":"income","v":1200},
  {"id":"Objetivo 4","nome":"Objetivo 4","sprite":"","t":"variety","v":5},
  {"id":"Objetivo 5","nome":"Objetivo 5","sprite":"","t":"clean","v":900}
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
  {"id":"SorteGeral1","nome":"SorteGeral1","sprite":"","dur":2,"mult":1.25,"coins":20},
  {"id":"AzarGeral1","nome":"AzarGeral1","sprite":"","dur":2,"mult":0.8,"coins":-20},
  {"id":"SorteGeral2","nome":"SorteGeral2","sprite":"","dur":1,"mult":1.5,"coins":0},
  {"id":"AzarGeral2","nome":"AzarGeral2","sprite":"","dur":1,"mult":0.5,"coins":0},
  {"id":"SorteGeral3","nome":"SorteGeral3","sprite":"","dur":3,"mult":1.1,"coins":30},
  {"id":"AzarGeral3","nome":"AzarGeral3","sprite":"","dur":2,"mult":1,"coins":0,"night":true},
  {"id":"SorteGeral4","nome":"SorteGeral4","sprite":"","dur":1,"mult":2,"coins":0},
  {"id":"AzarGeral4","nome":"AzarGeral4","sprite":"","dur":2,"mult":1,"coins":0,"reveal":"all"},
  {"id":"SorteGeral5","nome":"SorteGeral5","sprite":"","dur":2,"mult":1.2,"coins":50},
  {"id":"AzarGeral5","nome":"AzarGeral5","sprite":"","dur":3,"mult":0.9,"coins":-30}
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
   "soja": 3,
   "milho": 2,
   "cana": 2,
   "cafe": 5,
   "algodao": 4
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
 "deckVersion": 3
};
