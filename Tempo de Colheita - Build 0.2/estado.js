// ===== FICHA TÉCNICA =====
// estado.js: Guarda as peças básicas do jogo: o estado da partida (S), as regras lidas do editor (REG), o embaralhador e o contador de jogadores. É o primeiro a carregar.
// ========================

const $ = s => document.querySelector(s);
let S = null;
migrate(CARDS, ASSETS); // completa dados antigos (regras, campos, baralhos novos)
const REG = ASSETS.regras; // regras essenciais (editor.html)
Object.assign(CROP_PRICE, REG.precoRecursoGoverno);
const START_COINS = REG.moedasIniciais, LOAN = REG.emprestimo, EXTRA = REG.cartaExtra;

const sh = a => { a = [...a]; for (let i = a.length; i > 1;) { const j = Math.random() * i-- | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const NJ = () => (S && S.players ? S.players.length : REG.maxJogadores);
