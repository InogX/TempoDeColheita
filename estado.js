// ===== FICHA TÉCNICA =====
// estado.js: Guarda as peças básicas do jogo: o estado da partida (S), o estado de INTERFACE deste aparelho (UI), as regras lidas do editor (REG), o embaralhador e o contador de jogadores. É o primeiro a carregar.
// ========================

const $ = s => document.querySelector(s);
let S = null;
migrate(CARDS, ASSETS); // completa dados antigos (regras, campos, baralhos novos)
const REG = ASSETS.regras; // regras essenciais (editor.html)
Object.assign(CROP_PRICE, REG.precoRecursoGoverno);
const START_COINS = REG.moedasIniciais, LOAN = REG.emprestimo, EXTRA = REG.cartaExtra;

// UI = o que só diz respeito a ESTE aparelho: janela aberta, carta escolhida, jogador sendo visto, "atuar como" do Mercado e ferramentas Dev. Fica FORA de S: não vai para o save nem (no online) para os outros jogadores.
const UI = { modal: null, plantSel: null, viewing: null, viewRes: false, actor: null, devP: null, dv: {} };
const UIreset = () => Object.assign(UI, { modal: null, plantSel: null, viewing: null, viewRes: false, actor: null, devP: null, dv: {} });
// PONTE DE COMPATIBILIDADE (provisória): código antigo que ainda lê/escreve S.modal, S.plantSel, S.actor, S.viewing, S.viewRes, S.devP e S.dv (janelas.js, qa.html) continua funcionando, porque essas propriedades viram atalhos para UI.
// Não são enumeráveis: não entram no save nem em cópias de S. Chame ligaUI() sempre que S for criado ou carregado (A.new, A.cont). Remover quando janelas.js e qa.html usarem UI direto.
const ligaUI = () => { ['plantSel', 'viewing', 'viewRes', 'actor', 'devP', 'dv'].forEach(k => Object.defineProperty(S, k, { get: () => UI[k], set: v => { UI[k] = v; }, enumerable: false, configurable: true }));
  Object.defineProperty(S, 'modal', { get: () => (S.order && peekPend()) ? 'peek' : UI.modal, set: v => { UI.modal = v; }, enumerable: false, configurable: true }); }; // "espiar" pendente aparece como modal 'peek'

const sh = a => { a = [...a]; for (let i = a.length; i > 1;) { const j = Math.random() * i-- | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const NJ = () => (S && S.players ? S.players.length : REG.maxJogadores);
