# Roteiro de testes — Fase 10 (Tempo de Colheita online)

Marque ✅ ou ❌ em cada item. Se algo falhar, me diga: **o passo, o aparelho e o que apareceu na tela** (print ajuda). Não precisa fazer tudo de uma vez: a ordem abaixo vai do que exige menos aparelhos ao que exige mais.

**Antes de começar (2 min)**
- Abra **Realtime Database › Uso** e anote: *Download*, *Armazenamento* e *Conexões*. Tire um print. Você vai comparar no fim de cada bloco. (A aba pode demorar alguns minutos para atualizar: espere antes de anotar o "depois".)
- Limites gratuitos do plano Spark (conferidos hoje, 26/10/2026, na página de preços do Firebase): **100 conexões simultâneas**, **1 GB armazenado**, **360 MB/dia de download (≈ 10 GB/mês)**. Sem cartão cadastrado, não existe cobrança. **Nunca clique em Upgrade/Blaze.**

---

## BLOCO 1 — Privacidade (só o PC; 10 min) ⭐ o mais importante

Com uma partida em andamento (anfitrião + 1 convidado + 1 bot, algumas jogadas feitas):

**1a. O que está guardado** — *Realtime Database › Dados › `salas/CÓDIGO`*
- [ ] `visao/(uid do convidado)`: abra o texto. Dos OUTROS jogadores, `coins`, `debt` e `res` devem ser `null`; a `hand` deve ter só `{"oculta":true}`; **não pode aparecer** `"obj"` (objetivo) de ninguém nem `"dk"` com cartas (`dk` deve estar `{}`).
- [ ] `visao/(uid do anfitrião)`: mesma conferência, do ponto de vista dele.
- [ ] `estado` tem tudo (mão, objetivos, baralhos). **Isso é esperado**: as regras só deixam o anfitrião ler. (O console mostra tudo porque você é o dono do projeto; quem decide quem lê é o item 1b.)

**1b. Quem pode ler** — *Realtime Database › Regras › Rules Playground* (simulador; **não publique nada**). Marque *Autenticado* e coloque o UID. Os UIDs aparecem em `salas/CÓDIGO/jogadores`.

| # | Quem | Faz | Onde | Esperado |
|---|---|---|---|---|
| 1 | Host | Lê | `/salas/COD/estado` | Permitido |
| 2 | Convidado | Lê | `/salas/COD/estado` | **Negado** |
| 3 | Convidado | Lê | `/salas/COD/visao/(uid dele)` | Permitido |
| 4 | Convidado | Lê | `/salas/COD/visao/(uid do host)` | **Negado** |
| 5 | Estranho (qualquer uid fora da sala) | Lê | `/salas/COD/visao/(uid do convidado)` | **Negado** |
| 6 | Convidado | Grava | `/salas/COD/visao/(uid dele)` | **Negado** |
| 7 | Convidado | Lê | `/salas/COD/acoes/(uid dele)` | **Negado** |
| 8 | Convidado | Grava | `/salas/COD/acoes/(uid do host)/x` `{tipo:"end",args:"[]",ts:1}` | **Negado** |
| 9 | Convidado | Grava | `/salas/COD/acoes/(uid dele)/x` `{tipo:"sell",args:"[]",ts:1}` | Permitido |
| 10 | Convidado | Grava | `/salas/COD/meta/estado` = `"fim"` | **Negado** |
| 11 | Convidado | Grava | `/salas/COD/meta/host` = (uid dele) | **Negado** |
| 12 | Estranho | Grava | `/salas/COD/jogadores/(uid dele)` `{nome:"X",idx:3,online:true,bot:""}` numa sala **jogando** | **Negado** |
| 13 | Host | Apaga | `/salas/COD` | Permitido |
| 14 | Convidado | Apaga | `/salas/COD` | **Negado** |
| 15 | Qualquer | Lê | `/salas` (listar todas) | **Negado** |
| 16 | Sem login | Lê | `/salas/COD/meta` | **Negado** |
| 17 | Estranho | Grava | `/salas/ZZZ999/acoes/(uid dele)/x` (sala que não existe) | **Negado** |

Dica: marque 13 e 14 com **uma sala de teste**, não com a partida que está em uso (o simulador não apaga nada de verdade, mas assim você evita dúvida).

Se qualquer linha der o resultado diferente do esperado: **pare e me avise antes de convidar mais gente** (as regras foram testadas no meu interpretador simplificado, não no Firebase real: o Playground é a prova de verdade).

---

## BLOCO 2 — Pendências menores (Android + PC + 1 bot, uma partida só; 20 min)

Anfitrião no PC, convidado no Android, 1 bot.
- [ ] **Tela de espera fora da vez:** quando não é a sua vez, aparecem só o registro, os eventos e os botões 🤝 Mercado e Sair. Loja de campos, mão e "Encerrar turno" só na sua vez.
- [ ] **Toque duplo (convidado):** na sua vez, dois toques rápidos em "Comprar campo" → compra **um** só (moedas descontadas uma vez).
- [ ] **Recusa que só o anfitrião sabe (convidado):** Mercado › Vender recursos: ofereça **mais** do que tem. Deve aparecer o motivo ("Estoque insuficiente") e **nada** mudar. Depois tente comprar uma oferta mais cara do que suas moedas: motivo "Moedas insuficientes", nada muda.
- [ ] **Melhorar um plantio (convidado):** na sua vez, abra um campo, "Melhorar". A animação só toca **depois** da resposta; se for recusado, o campo reabre com o aviso.
- [ ] **Mercado — digitação e teclado (celular):** fora da sua vez, abra o Mercado, digite quantidade e preço e **espere o outro jogar**: o texto não some, a janela não volta ao topo e o **teclado não fecha**. Repita com o Mercado aberto durante a vez do bot.
- [ ] **Espiar:** se o seu evento individual for "espiar", só você vê "Escolha quem espiar"; depois vê as moedas do espiado e isso some no fim do turno. *Se o evento não sair em ~5 rodadas, marque "não saiu": o caso já está coberto no teste de Node (`teste_fase8.js`, seção E).*
- [ ] **Aviso de eliminado:** quebre o convidado de propósito (pegue empréstimos até a dívida passar do limite). Ele deve ver o aviso "☠ Você foi eliminado: acompanhe a partida", seguir vendo o registro e o jogo continuar para os outros.
- [ ] **Retomada do anfitrião por F5:** no PC, aperte **F5** no meio da partida. Depois: Jogar Online › Achar Sala, **o mesmo nome e o mesmo código**. A partida volta com **as mesmas moedas e a mesma rodada** (não uma nova), e o convidado volta a jogar.
- [ ] **Limpeza de salas:** crie e feche 2 salas de teste; crie uma terceira. No console só devem sobrar as salas vivas. Quando o anfitrião usa **Sair**, a sala deve **sumir** do console.

---

## BLOCO 3 — 4G/5G (2 aparelhos; 10 min)

Convidado no celular **com Wi-Fi desligado (dados móveis)**; anfitrião no PC (Wi-Fi).
- [ ] Criar sala, entrar **pelo link de convite**, iniciar com 1 bot.
- [ ] Cada um joga **um turno completo** (comprar, plantar, Mercado, encerrar).
- [ ] A resposta aparece em tempo aceitável (referência: o que você vê no Wi-Fi). Anote se houver demora perceptível.
- [ ] Desligue os dados por ~10 s e ligue: aparece a faixa "Sem conexão" e some ao voltar; o jogo continua.
- [ ] Sair pelo botão.

---

## BLOCO 4 — iPhone online (nunca testado)

- [ ] Entrar na sala pelo **link de convite**, jogar um turno completo, abrir o Mercado, **digitar com o teclado** e sair.
- [ ] Ao tocar nos campos de número do Mercado, a página **não dá zoom** estranho e não "foge" (se der zoom, me avise: é um caso comum do Safari e a correção é pequena).
- [ ] Título/tela "Sua vez" aparece. **A vibração não existe no iPhone** (limitação do Safari): isso é esperado.
- [ ] Bloqueie a tela do iPhone por ~40 s e desbloqueie: o iPhone pode perder a conexão. O esperado é voltar à partida e a vaga ser devolvida (se um bot assumiu, ele devolve). Anote o que acontecer.

---

## BLOCO 5 — Sala lotada (8) e consumo

**Como medir o consumo (vale para os blocos 5 e 6):**
1. Anote *Download* e *Armazenamento* na aba **Uso**.
2. Jogue um número **exato** de rodadas completas (ex.: 3).
3. Espere a aba atualizar, anote de novo. **(Depois − Antes) ÷ nº de rodadas = download por rodada.** Divida pelo nº de aparelhos humanos que **não** são o anfitrião para ter o consumo **por jogador**.

Teste:
- [ ] Sala de **8 vagas**: o máximo de aparelhos que conseguir (você + 1 ou 2 já ajuda; o resto bots, que contam como vaga). Iniciar e jogar **3 rodadas**.
- [ ] Ninguém trava na vez de outro; o jogo segue; a tela de espera fica fluida.
- [ ] Anote o consumo por rodada e por jogador (método acima) e o nº de aparelhos humanos.

**Para você ter uma ideia (estimativa minha, a confirmar com a sua medida):** no meu teste em Node com 8 jogadores (1 convidado + 6 bots), **cada convidado recebeu cerca de 23 visões completas por rodada** (cada ação, inclusive de bot, faz o anfitrião reenviar a visão inteira a todos os humanos). As cartas do teste são simplificadas, então o **tamanho** da visão real é desconhecido (no teste: ≈ 2,6 KB). Conta: `download por rodada ≈ nº de convidados × ~23 × tamanho da visão`. *Exemplo hipotético, só para dimensionar:* se a visão real tiver 10 KB, são ≈ 230 KB por convidado por rodada; com 7 convidados e 25 rodadas, ≈ 40 MB por partida, ou seja, uns 9 partidas cheias por dia dentro dos 360 MB/dia. Com 2 ou 3 jogadores o consumo é bem menor. **A sua medida real manda**; me passe os números.

---

## BLOCO 6 — Partida longa

- [ ] Jogue uma partida **até o fim** (ou 20+ rodadas) com 2 humanos + 1 bot. Anote a duração.
- [ ] Antes/depois na aba **Uso** (método acima): download total e por rodada.
- [ ] Ao terminar e sair, o **Armazenamento volta a quase zero** (a sala é apagada) e a sala **some** do console.
- [ ] Nenhuma mensagem "Sem permissão no banco" apareceu durante a partida.

---

### O que me mandar ao terminar
Uma lista curta por bloco: ✅/❌, e para cada ❌ o passo + aparelho + o que apareceu. Também os números da aba *Uso* (antes/depois, nº de rodadas, nº de aparelhos).
