// ===== FICHA TÉCNICA =====
// menu.js: Menus iniciais. `Menu.tela` escolhe a tela: 'main' (Jogar Online / Jogar Local), 'online' (Criar Sala, Achar Sala, Buscar Partida), 'local' (Continuar Jogo, Novo Jogo, Tutorial, Configurações),
// 'novo' (monta a partida local: nº de jogadores, nomes, humano ou bot em cada um, quem começa), 'criar' (mesma montagem + código da sala), 'achar' (nome e código para entrar numa sala),
// 'config' (antigo painel Dev: moedas iniciais, recursos, ver tudo, objetivo de cada jogador; os valores ficam em `Menu.cfg`, que A.new lê). O que ainda não está pronto mostra "Essa função encontra-se em implementação ainda" (`Menu.wip`).
// (Celular: tudo fica dentro de <div class="menu">, que o style.css usa para campos em largura total.)
// ========================

const WIP = '🚧 Essa função encontra-se em implementação ainda.';
const Menu = {
  tela: 'main', n: REG.minJogadores, cfg: {}, // n = nº de jogadores do último "Novo Jogo"; cfg = valores da tela Configurações (A.new lê quando não há esses campos na tela)
  ir(t) { this.tela = t; menu(); },
  aviso(m) { const e = document.getElementById('mavs'); if (e) e.textContent = m; },
  wip() { this.aviso(WIP); }
};
const mb = (txt, fn, cls = '') => `<button class="mb ${cls}" onclick="${fn}">${txt}</button>`; // botão grande de menu
const mavs = '<p id="mavs" class="mavs" role="status"></p>'; // linha de aviso do menu
const formJogo = () => `<label>Jogadores (${REG.minJogadores}-${REG.maxJogadores}) <input id="n" type="number" min="${REG.minJogadores}" max="${REG.maxJogadores}" value="${Menu.n}" oninput="names()"></label>
  <div id="nl"></div><label>Quem começa <select id="f"></select></label>`;
const cfgHTML = () => { const c = Menu.cfg;
  if (!REG.devAtivo) return '<p>Nenhuma configuração disponível.</p>';
  return `<div class="cfg"><label>Moedas iniciais (vazio = padrão) <input id="dvCoins" type="number" value="${c.dvCoins ?? ''}" oninput="Menu.cfg.dvCoins=this.value"></label>
    <label>Somar a cada recurso <input id="dvRes" type="number" value="${c.dvRes ?? ''}" oninput="Menu.cfg.dvRes=this.value"></label>
    <label><input id="dvAll" type="checkbox"${c.dvAll ? ' checked' : ''} onchange="Menu.cfg.dvAll=this.checked"> ver tudo</label>
    <h4>Objetivo de cada jogador <small>(jogadores do último Novo Jogo: ${Menu.n})</small></h4>
    ${[...Array(Menu.n)].map((_, i) => `<label>Jogador ${i + 1} <select id="dvObj${i}" onchange="Menu.cfg.dvObj${i}=this.value"><option value="">aleatório</option>${CARDS.objetivo.map(o => `<option value="${o.id}"${c['dvObj' + i] === o.id ? ' selected' : ''}>${nm(o)}</option>`).join('')}</select></label>`).join('')}</div>`; };

function menu() {
  const T = Menu.tela; let h;
  if (T === 'online') h = `<h2>Jogar Online</h2>${mb('Criar Sala', "Menu.ir('criar')")}${mb('Achar Sala', "Menu.ir('achar')")}${mb('Buscar Partida <small>(em breve)</small>', 'Menu.wip()')}${mb('Voltar', "Menu.ir('main')", 'sec')}${mavs}`;
  else if (T === 'local') h = `<h2>Jogar Local</h2>${localStorage.tc_save ? mb('Continuar Jogo', 'A.cont()') : ''}${mb('Novo Jogo', "Menu.ir('novo')")}${mb('Tutorial <small>(em breve)</small>', 'Menu.wip()')}${mb('Configurações', "Menu.ir('config')")}${mb('Voltar', "Menu.ir('main')", 'sec')}${mavs}`;
  else if (T === 'novo') h = `<h2>Novo Jogo</h2>${formJogo()}<br>${mb('Iniciar', 'A.new()')}${mb('Voltar', "Menu.ir('local')", 'sec')}`;
  else if (T === 'criar') h = `<h2>Criar Sala</h2><div class="sala"><b>Código da sala:</b> <span class="cod">— — — —</span><div id="conect">Jogadores conectados: nenhum ainda.</div></div>${formJogo()}<br>${mb('Iniciar', 'Menu.wip()')}${mb('Voltar', "Menu.ir('online')", 'sec')}${mavs}`;
  else if (T === 'achar') h = `<h2>Achar Sala</h2><label>Seu nome <input id="nomeSala" placeholder="Seu nome"></label><label>Código da sala <input id="cod" maxlength="8" placeholder="Código" oninput="this.value=this.value.toUpperCase()"></label>${mb('Conectar', 'Menu.wip()')}${mb('Voltar', "Menu.ir('online')", 'sec')}${mavs}`;
  else if (T === 'config') h = `<h2>Configurações</h2>${cfgHTML()}${mb('Voltar', "Menu.ir('local')", 'sec')}`;
  else h = `<h2>Menu</h2>${mb('Jogar Online', "Menu.ir('online')")}${mb('Jogar Local', "Menu.ir('local')")}`;
  $('#app').innerHTML = `<div class="menu">${h}</div>`;
  if (T === 'novo' || T === 'criar') names();
}

// monta as linhas de jogadores (nome + humano/bot) e a lista "Quem começa"; ao mudar o nº de jogadores, mantém o que já foi digitado
function names() {
  const n = Math.min(REG.maxJogadores, Math.max(REG.minJogadores, +$('#n').value || REG.minJogadores)), r = [...Array(n)];
  const nomes = [...document.querySelectorAll('.nm')].map(e => e.value), bots = [...document.querySelectorAll('.bt')].map(e => e.value), f0 = $('#f').value;
  Menu.n = n;
  $('#nl').innerHTML = r.map((_, i) => `<div class="nmrow"><input class="nm" placeholder="Jogador ${i + 1}"><select class="bt"><option value="">Humano</option><option value="facil">🤖 Bot fácil</option><option value="normal">🤖 Bot normal</option></select></div>`).join('');
  $('#f').innerHTML = r.map((_, i) => `<option value="${i}">Jogador ${i + 1}</option>`).join('');
  document.querySelectorAll('.nm').forEach((e, i) => { e.value = nomes[i] || ''; });
  document.querySelectorAll('.bt').forEach((e, i) => { e.value = bots[i] || ''; });
  if (f0 !== '' && +f0 < n) $('#f').value = f0;
}
