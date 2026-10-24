// ===== FICHA TÉCNICA =====
// comandos.js: CAMADA DE COMANDOS (Fase 4). É o ÚNICO ponto por onde uma ação de jogo é pedida: botões da tela, janelas, zoom, bots e (no online, Fase 7) mensagens da rede. Antes de executar a ação (A.*), confere: quem pediu, se a partida está rodando, se é a vez dele, em que fase do turno está (começar / jogar / escolher quem espiar) e se os argumentos fazem sentido. Se algo estiver errado, recusa com um motivo e NADA muda.
// Dois jeitos de usar:  Cmd.run(quem, 'sell', ['soja', 5])  → { ok, msg } em silêncio (bots, testes, rede; `quem` = índice do jogador que pediu).   Cmd.sell('soja', 5) etc. → o jogador DESTE aparelho (botões da tela): mostra o alert se recusar, lê os campos da tela (#rq…, #rp…, #pr…, #fq…) e devolve { ok, msg }.
// Comandos de JOGO (passam por aqui): go, end, buyF, loan, pay, extra, sell, buyFeira, plantIn, up, peek, listRes, list, cancel, buyM. Ações de INTERFACE (ficam em A.* e valem só neste aparelho, nunca vão pela rede): modal, act, view, pick, cancelPick, new, cont, quit.
// Regras por tipo (CMD[nome].q):  'inicio' = só na vez dele e antes de "Estou pronto" (go) · 'jogo' = só na vez dele, depois de começar e sem espiar pendente · 'peek' = só quem tem o espiar pendente · 'mercado' = qualquer jogador vivo, a qualquer hora (atua pelo remetente, não pelo "atuar como" do anfitrião).
// Os argumentos são sempre EXPLÍCITOS (a rede não pode ler campos da tela de ninguém). Exceção: no uso local (Cmd.nome(...)) os campos vazios são completados pela tela, como antes.
// Online: quando EU != null e o remetente não é este aparelho, a interface deste aparelho (UI) é guardada e devolvida depois do comando, e a tela é redesenhada (o anfitrião não perde a janela aberta nem vê dados de outro jogador).
// Depende de: A, exec, recusa (acoes-turno.js); eu, EU, cur, evFind, feiraMax (consultas.js); ator (acoes-mercado.js); UI (estado.js); K (config.js); render (tela.js). Carrega depois de acoes-mercado.js e antes de bot.js.
// ========================

// (Tudo fica dentro de uma função: o único nome global que este arquivo cria é Cmd, para não colidir com nomes de outros arquivos.)
const Cmd = (() => {
  const CULT = k => typeof k === 'string' && K.includes(k); // nome de recurso válido
  const POS = v => typeof v === 'number' && Number.isFinite(v) && Math.floor(v) > 0 && Math.floor(v) <= 1e9 ? Math.floor(v) : 0; // inteiro positivo (quantidade/preço); 0 = inválido
  const INT = v => Number.isInteger(v) && v >= 0; // índice ou id

  // Tabela dos comandos. q = quando vale; a(args, jogador, índice) devolve os argumentos já limpos (array) ou um TEXTO com o motivo da recusa.
  const CMD = {
    go:       { q: 'inicio',  a: () => [] },
    end:      { q: 'jogo',    a: () => [] },
    buyF:     { q: 'jogo',    a: ([i]) => INT(i) ? [i] : 'Esse campo não está mais à venda' },
    loan:     { q: 'jogo',    a: () => [] },
    pay:      { q: 'jogo',    a: () => [] },
    extra:    { q: 'jogo',    a: () => [] },
    sell:     { q: 'jogo',    a: ([k, n]) => !CULT(k) ? 'Recurso inválido' : n == null ? [k] : POS(n) ? [k, POS(n)] : 'Informe uma quantidade' }, // sem quantidade = vende tudo
    buyFeira: { q: 'jogo',    a: ([k, n], p) => { if (!CULT(k)) return 'Recurso inválido'; // sem quantidade = o máximo que pode
        if (n != null) return typeof n === 'number' && Number.isFinite(n) ? [k, Math.max(0, Math.min(1e9, Math.floor(n)))] : 'Informe uma quantidade';
        const e = evFind('feira'); return [k, e ? feiraMax(e, p, k) : 0]; } },
    plantIn:  { q: 'jogo',    a: ([fi, h]) => INT(fi) && INT(h) ? [fi, h] : h == null ? 'Nenhuma carta escolhida' : 'Campo inválido' }, // h = posição da carta na mão (sempre explícita)
    up:       { q: 'jogo',    a: ([fi, pi]) => INT(fi) && INT(pi) ? [fi, pi] : 'Plantio não encontrado' },
    peek:     { q: 'peek',    a: ([i], p, quem) => INT(i) && S.players[i] && !S.players[i].out && i !== quem ? [i] : 'Jogador inválido para espiar' },
    listRes:  { q: 'mercado', a: ([k, q, pr]) => !CULT(k) ? 'Recurso inválido' : POS(q) && POS(pr) ? [k, POS(q), POS(pr)] : 'Informe quantidade e preço por unidade' },
    list:     { q: 'mercado', a: ([kind, uid, pr]) => kind !== 'hand' && kind !== 'field' ? 'Tipo de oferta inválido' : !POS(pr) ? 'Informe o preço' : Number.isInteger(uid) ? [kind, uid, POS(pr)] : 'Esse item não é seu' },
    cancel:   { q: 'mercado', a: ([id]) => Number.isInteger(id) ? [id] : 'Oferta não encontrada' },
    buyM:     { q: 'mercado', a: ([id]) => Number.isInteger(id) ? [id] : 'Essa oferta não existe mais' },
  };

  const Cmd = {
    nomes: Object.keys(CMD), // a lista permitida (a rede só aceita estes)

    // Confere tudo. Devolve os argumentos limpos (array) ou o TEXTO da recusa.
    valida(quem, nome, args) {
      if (typeof nome !== 'string' || !Object.prototype.hasOwnProperty.call(CMD, nome)) return 'Comando desconhecido';
      const d = CMD[nome];
      if (!S || !S.order || S.win) return 'Não há partida em andamento';
      if (!Number.isInteger(quem) || !S.players[quem]) return 'Jogador inválido';
      if (S.players[quem].out) return 'Você está fora da partida';
      if (d.q !== 'mercado') {
        if (S.order[S.t] !== quem) return 'Não é a sua vez';
        if (d.q === 'inicio' && !S.hide) return 'O turno já começou';
        if (d.q !== 'inicio' && S.hide) return 'Comece o turno primeiro';
        if (d.q === 'jogo' && S.peekPend != null) return 'Escolha quem espiar primeiro';
        if (d.q === 'peek' && S.peekPend !== quem) return 'Você não tem ninguém para espiar agora';
      }
      return d.a(Array.isArray(args) ? args : [], S.players[quem], quem);
    },

    // Executa a ação como o jogador `quem`. O Mercado atua pelo remetente (UI.actor é trocado só durante o comando).
    aplica(quem, nome, args) {
      const d = CMD[nome], remoto = EU != null && quem !== EU, ui = remoto ? { ...UI } : null, ator0 = UI.actor; // remoto = pedido de outro jogador (online)
      if (d.q === 'mercado') UI.actor = quem;
      try { return A[nome](...args); }
      finally { if (d.q === 'mercado') UI.actor = ator0; if (ui) { Object.assign(UI, ui); render(); } } // a interface DESTE aparelho volta como estava
    },

    // Ponto de entrada. mudo=true (padrão): sem alert (bots, testes, rede). mudo=false: mostra o alert da recusa (botões da tela). Devolve { ok, msg }.
    run(quem, nome, args = [], mudo = true) {
      const rodar = () => { const v = Cmd.valida(quem, nome, args); return typeof v === 'string' ? recusa(v) : Cmd.aplica(quem, nome, v); };
      if (mudo) return exec(rodar);
      RESP.msg = null; const r = rodar(); return { ok: RESP.msg === null && r !== false, msg: RESP.msg };
    },

    // Uso pelos botões da tela: quem pede é o jogador DESTE aparelho (no Mercado, quem está em "atuar como"). Completa o que a tela sabe (carta escolhida, campos de quantidade e preço).
    local(nome, ...a) {
      const campo = id => { const e = document.getElementById(id); return e && e.value !== '' ? +e.value : undefined; };
      if (nome === 'plantIn' && a[1] === undefined) a[1] = UI.plantSel; // carta escolhida
      if (nome === 'buyFeira' && a[1] === undefined) a[1] = campo('fq' + a[0]);
      if (nome === 'listRes') { if (a[1] === undefined) a[1] = campo('rq' + a[0]); if (a[2] === undefined) a[2] = campo('rp' + a[0]); }
      if (nome === 'list' && a[2] === undefined) a[2] = campo('pr' + a[1]);
      const quem = S && S.order ? (CMD[nome] && CMD[nome].q === 'mercado' ? ator() : eu()) : -1;
      return Cmd.run(quem, nome, a, false);
    },
  };
  Cmd.nomes.forEach(n => { Cmd[n] = (...a) => Cmd.local(n, ...a); }); // Cmd.sell('soja'), Cmd.buyF(0), Cmd.end()... = atalhos para os botões
  return Cmd;
})();
