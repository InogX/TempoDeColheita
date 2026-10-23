// ===== FICHA TÉCNICA =====
// menu.js: Tela inicial (Novo jogo): escolher número de jogadores, nomes, humano ou bot (select .bt), quem começa e o painel Dev da próxima partida.
// (Celular: o bloco fica dentro de <div class="menu">, que o style.css usa para campos em largura total.)
// ========================

function menu() {
  const dev = REG.devAtivo ? `<details><summary>🛠 Dev da próxima partida</summary>
    <p>Moedas iniciais (vazio = padrão): <input id="dvCoins" type="number" style="width:90px"> · Somar a cada recurso: <input id="dvRes" type="number" style="width:70px"> · <label><input id="dvAll" type="checkbox"> ver tudo</label></p><div id="dvObjs"></div></details>` : '';
  $('#app').innerHTML = `<div class="menu"><h2>Novo jogo</h2>${localStorage.tc_save ? '<button onclick="A.cont()">Continuar jogo salvo</button><hr>' : ''}
  <label>Jogadores (${REG.minJogadores}-${REG.maxJogadores}) <input id="n" type="number" min="${REG.minJogadores}" max="${REG.maxJogadores}" value="${REG.minJogadores}" oninput="names()"></label>
  <div id="nl"></div><label>Quem começa <select id="f"></select></label><br>${dev}<br><button onclick="A.new()">Iniciar</button></div>`; names();
}
function names() {
  const n = Math.min(REG.maxJogadores, Math.max(REG.minJogadores, +$('#n').value || REG.minJogadores)), r = [...Array(n)];
  $('#nl').innerHTML = r.map((_, i) => `<div class="nmrow"><input class="nm" placeholder="Jogador ${i + 1}"><select class="bt"><option value="">Humano</option><option value="facil">🤖 Bot fácil</option><option value="normal">🤖 Bot normal</option></select></div>`).join('');
  $('#f').innerHTML = r.map((_, i) => `<option value="${i}">Jogador ${i + 1}</option>`).join('');
  if ($('#dvObjs')) $('#dvObjs').innerHTML = r.map((_, i) => `Objetivo do Jogador ${i + 1}: <select id="dvObj${i}"><option value="">aleatório</option>${CARDS.objetivo.map(c => `<option value="${c.id}">${nm(c)}</option>`).join('')}</select><br>`).join('');
}

