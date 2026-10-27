# Tempo de Colheita — Plano (versão 10): o que falta

**Como usar numa conversa nova:** envie este arquivo + o `FICHAS_TECNICAS.md` atualizado + os arquivos da lista da etapa. **Uma etapa por conversa.** Sempre envie a versão mais recente dos arquivos.

**Legenda de status:** ✅ confirmado · 🔄 em andamento (sendo feito em outra conversa, **ainda não entregue/confirmado**) · ⬜ não iniciado · ❓ a conferir

---

## Onde estamos

| Parte | Situação |
|---|---|
| **1. Mobile (visual)** | ✅ Testado pelo dono em **iOS e Android**: o jogo roda tranquilo até a fase atual. O `janelas.js` atual já desenha o ✕ `.mx` (a dúvida antiga está resolvida). Ficam para a Fase 8 só as janelas passarem a usar `me()`. |
| **2. Bot** | ✅ Pronto, ligado e **testado no navegador pelo dono**. Desde a Fase 4 ele pede tudo pelos comandos (`Cmd`). |
| **2,5. Menus** | ✅ Conferidos no celular pelo dono. Criar Sala e Achar Sala são do `lobby.js` (Fase 6), **testadas pelo dono com dois celulares conectados**. |
| **3. Online** | **Fases 0 a 9 ✅ confirmadas pelo dono** (Fases 7 e 8 no essencial; ficam pendências menores, listadas em "Testes", que não travam a Fase 10). Regras de segurança **publicadas** e jogo funcionando sob elas. Testado até aqui só com **Android + PC (Windows) + 1 bot**. **Fase 10 ✅ aceita com pendências:** a bateria em Node passou, o dono jogou partidas online (funcionaram) e confirmou o retorno por código e o F5; ficam para o dono, quando puder, os testes do `ROTEIRO_FASE10.md` (privacidade no Rules Playground primeiro, depois 4G/5G, iPhone, sala lotada e partida longa). **Número de versão do jogo** adicionado (`Online.VERSAO`). Fase 11 🔄 parcialmente pronta. |

> **Conferido nos arquivos (23/10/2026):** a Fase 1 está no código (`UI`, `UIreset`, `ligaUI` em `estado.js`; `EU`/`eu()`/`me()` em `consultas.js`; `A.plantIn(fi, h)`); a Fase 2 também (`recusa`, `exec`, `A.tentar` em `acoes-turno.js`; as quatro `acoes-*.js` recusando com motivo); da Fase 3, o `index.html` carrega o `visao.js` (o arquivo não veio nesta rodada: vale a confirmação do dono de que o jogo abre normal e a conferência feita antes).

---

## Quadro de status do Online

### Infraestrutura (feita pelo dono, fora do código)
| Item | Status |
|---|---|
| Projeto Firebase criado (plano **Spark**, sem cartão) | ✅ |
| **Autenticação anônima ativa** | ✅ (confirmado pelo dono) |
| **Jogo publicado no GitHub Pages, online e funcionando** | ✅ (confirmado pelo dono) |
| Realtime Database criado + app Web registrado + `firebaseConfig` em mãos | ✅ o dono tem o `firebaseConfig` e vai colá-lo direto na conversa da Fase 5 (não vai neste arquivo) |
| Domínio do GitHub Pages (`usuario.github.io`) adicionado em *Authentication › Configurações › Domínios autorizados* | ✅ confirmado por captura de tela: `inogx.github.io` está em Domínios autorizados (tipo Custom) |
| Regras do banco trocadas do modo de teste (o modo de teste **expira**, em geral em 30 dias) | ✅ **regras restritivas publicadas** (dono, 26/10/2026; o jogo funcionou sob elas). Ficam para a Fase 10 só a conferência de privacidade no console e, se ainda não feitas, as simulações do Rules Playground (Apêndice A). |

### Fases do código
| Fase | Status |
|---|---|
| 0 — Decisões e inventário | ✅ |
| 1 — Identidade local e estado de interface | ✅ entregue (9 arquivos), testada em Node, conferida no navegador e **confirmada nos arquivos** |
| 2 — Resultado das ações | ✅ entregue (5 arquivos), testada em Node, conferida no navegador e **confirmada nos arquivos** (o `qa.html` ainda não foi conferido com ela: adiado pelo dono) |
| 3 — Visão filtrada | ✅ `visao.js` + `index.html`; o dono confirmou que o jogo local abre normal. Ainda não é usada pelo jogo (a Fase 7 liga). |
| 4 — Camada de comandos | ✅ entregue (`comandos.js` novo + `bot.js`, `tela.js`, `janelas.js`, `zoom.js`, `index.html`), testada em Node (115 conferências, 5 defeitos plantados detectados) e **confirmada pelo dono** (24/10/2026: o jogo roda certo). |
| 5 — Rede (`rede.js`) | ✅ entregue e testada no Firebase real pelo dono: duas abas de `teste-rede.html` no GitHub Pages criaram/entraram na sala e trocaram mensagem, e a aba *Uso* do Realtime Database mostrou as duas conexões. (Não foi testado ainda: dois aparelhos diferentes, 4G/5G, nem a parte de privacidade, que só vale após a Fase 9.) |
| 6 — Lobby | ✅ entregue (`lobby.js` novo + `rede.js`, `menu.js`, `iniciar.js`, `style.css`, `index.html`), testada em Node e **confirmada pelo dono: dois celulares conectaram na mesma sala** (24/10/2026) |
| 7 — Sincronização e vez | ✅ **confirmada pelo dono** (Android + PC + bot): sincroniza, vez, transações, título da aba "🔔 Sua vez", eliminado segue assistindo. Pendências menores (espiar, recusa só do anfitrião, toque duplo) na seção "Testes". |
| 8 — Janelas | ✅ **confirmada no essencial**: Mercado (vender, comprar, nomes corretos na tela) conferido. **Ainda não confirmados:** digitação preservada e teclado do celular no Mercado, Mercado na vez do bot, espiar, "Melhorar" como convidado (ver "Testes"). |
| 9 — Robustez + regras de segurança | ✅ **confirmada pelo dono** (26/10/2026): convidado e anfitrião saindo pelo botão **e** perdendo a conexão, bot assumindo a vaga após ~30 s, reconexão devolvendo a vaga, convidado recarregando a página e voltando pelo código, link de convite, regras restritivas publicadas. Pendentes menores: retomada do anfitrião por F5, limpeza de salas antigas, conferência no console (ver "Testes"). |
| 10 — Testes | ✅ **aceita com pendências.** Bateria em Node ✅ (26/10/2026); **roteiro do dono entregue** (`ROTEIRO_FASE10.md`). O dono já confirmou: partidas online jogadas e funcionando; **voltar à partida digitando o código funciona (mesmo sem o mesmo link, desde que seja o mesmo navegador)** e atualizar a página sem querer também. **Não testado pelo dono:** outro navegador/aparelho (a expectativa é só entrar em sala nova, pois o login anônimo fica guardado no navegador). Mudança de código: **número de versão** (`Online.VERSAO`, mostrado no menu e conferido pelo convidado). (O que segue em "Agenda" ainda está pendente.) Agenda: **4G/5G** (dono não pôde testar ainda), **sala lotada** (consumo), **iPhone online** (nunca testado), privacidade no console com as regras publicadas, partida longa, e as pendências menores da seção "Testes". |
| 11 — Publicação | ✅ **documentação entregue** (`PUBLICACAO_FASE11.md`: convite `?sala=CODIGO`, domínio autorizado ✅, restrição da chave de API por referenciador, o que publicar, como atualizar sem quebrar salas, lista final). **Falta o dono:** restringir a chave (e testar em aba anônima) e fazer os testes manuais da Fase 10 (Bloco 1 antes de divulgar). **Versão do jogo:** `Online.VERSAO` (online.js) deve ser mudada a cada publicação; o convidado é avisado se a do anfitrião for diferente. |

> Atualize este quadro quando cada fase for **entregue e testada**. Fases marcadas 🔄 só passam a ✅ depois que o arquivo novo for conferido.

---

### Testes com o dono: o que já foi confirmado e o que ainda falta
> **Atualizado em 26/10/2026.** Ambiente de todos os testes até agora: **Android + PC (Windows) + 1 bot**. **Nada foi testado ainda com iPhone online nem com 4G/5G.** Marque ✅ quando conferir. A Fase 10 repete o essencial com 4G/5G e cobre o que está ⬜.

**✅ Confirmado pelo dono**
| | O que | Observação |
|---|---|---|
| ✅ | Os aparelhos se encontram, conectam, jogam e as mesmas coisas acontecem nos dois | |
| ✅ | Não existe botão Dev online | |
| ✅ | Transações (vender, empréstimo etc.) funcionam entre os dois | |
| ✅ | A vez do bot aparece como deveria | |
| ✅ | "Continuar Jogo" do modo local não é afetado pela partida online | |
| ✅ | Vibração na sua vez: Android vibrou | iPhone não vibra (limitação do Safari, já prevista). |
| ✅ | Título da aba muda para "🔔 Sua vez" | |
| ✅ | **Regras restritivas publicadas**; o jogo funciona sob elas | O dono relatou que "arrumou as regras" e jogou depois. Não relatou as simulações do Rules Playground. |
| ✅ | **Convidado sai** pelo botão Sair | O bot assume a vaga e a partida segue. |
| ✅ | **Convidado perde a conexão** (desconexão acidental) | O bot assumiu após ~30 s. |
| ✅ | **Reconexão** | A vaga volta ao jogador que retornou. |
| ✅ | **Anfitrião sai** pelo botão Sair e **anfitrião some** (desconexão acidental) | Funcionou nos dois casos. Não relatado: a sala sumir do console. |
| ✅ | **Convidado recarrega a página** | É desconectado da sala, mas volta sem problemas pelo código. |
| ✅ | **Link de convite** (`?sala=CODIGO`) | Funciona. |
| ✅ | **Mercado**: vender e comprar entre os dois; nomes na tela corretos | Digitação preservada e teclado ainda não confirmados (abaixo). |
| ✅ | **Eliminação**: o eliminado segue assistindo a partida | Viu só o registro (log), como na tela de espera. Não relatado: o aviso "eliminado". |
| ✅ | **Consumo no Firebase** | **957 KB** de Download e **11 KB** de Armazenamento depois de alguns testes curtos. Limite gratuito: ~360 MB/dia de download e 1 GB de armazenamento. Muito abaixo. |

**⬜ Pendente, mais importante (entra na Fase 10)**
| | O que | Como |
|---|---|---|
| ⬜ | **4G/5G** (dono pediu para deixar pendente) | Um aparelho fora do Wi-Fi (dados móveis), outro no Wi-Fi. Criar sala, entrar, jogar um turno cada, sair. Conferir se conecta e se a latência é aceitável. |
| ⬜ | **Sala lotada** (consumo) | Sala com 8 jogadores (bots contam; vários aparelhos se der). Jogar algumas rodadas e olhar a aba *Uso* do Realtime Database antes e depois. O dono quer entender o consumo por jogador. |
| ⬜ | **iPhone online** (nunca relatado) | Entrar numa sala pelo iPhone, jogar um turno, abrir o Mercado, digitar com o teclado, sair. Conferir título/tela "Sua vez" (não vibra). |
| ⬜ | **Privacidade no console com as regras publicadas** | Em Realtime Database › Dados, `visao/{uid}` de cada jogador não pode trazer a mão nem o objetivo dos outros; o `estado` só deve ser legível pelo anfitrião (Rules Playground, simulações #1 a #7 do Apêndice A). |
| ⬜ | Consumo depois de uma **partida longa** | Aba *Uso* depois de uma partida inteira. |

**⬜ Pendente, menor (não trava a Fase 10)**
| | O que | Como |
|---|---|---|
| ⬜ | **Espiar** (evento individual) | Só quem tem o evento vê "Escolha quem espiar"; depois vê as moedas do espiado e isso some no fim do turno. (O dono não conseguiu confirmar: não saiu o evento.) |
| ⬜ | Recusa que só o anfitrião sabe | Convidado vende o que não tem ou compra sem moedas: aparece o motivo e nada muda. |
| ⬜ | **Melhorar** um plantio como convidado | A animação só toca depois da resposta do anfitrião. |
| ⬜ | Toque duplo | Dois toques rápidos em "Comprar campo" no convidado: só compra um. |
| ⬜ | Mercado: **digitação preservada e teclado** | Digitar quantidade/preço fora da vez e esperar o outro jogar: o texto não some, a janela não volta ao topo e o teclado do celular não fecha. Também o Mercado aberto na vez do bot (🤝). |
| ⬜ | **Retomada do anfitrião por F5** | F5 no anfitrião no meio da partida, Jogar Online › Achar Sala com o mesmo nome e código: a partida continua com as mesmas moedas e rodada. (O dono relatou a reconexão, mas não esta situação em separado.) |
| ⬜ | Limpeza de salas antigas | Criar 2 salas de teste e fechar; criar outra: no console só sobram as salas vivas. Conferir também que a sala **some** do console quando o anfitrião sai. |
| ⬜ | Tela de espera fora da vez (conferência explícita) | Fora da vez: só registro, eventos e botões Mercado/Sair; loja, mão e "Encerrar turno" só na sua vez. Visto indiretamente na eliminação. |
| ⬜ | Aviso "eliminado" | Conferir se a tela do eliminado mostra o aviso, além do registro. |


**Fase 10 — bateria em Node (26/10/2026, arquivos reais + peças falsas para `cartas.js`/`config.js`/`rodada.js`/`objetivos.js`/`dev.js`; o harness usa `teste_comum.js`)**
| Teste | Resultado |
|---|---|
| `teste_fase4.js` (comandos; 12 partidas de bots) | ✅ 115 certas, 0 falhas |
| `teste_fase7.js` | ✅ 63 certas, 0 falhas (64 sob as regras) |
| `teste_fase8.js` | ✅ 43 certas, 0 falhas (44 sob as regras) |
| `teste_fase9.js` | ✅ 52 certas, 0 falhas (53 sob as regras) |
| `teste_regras.js` (42 situações) | ✅ 42 certas, 0 erradas nas regras NOVAS. **A comparação com as antigas não rodou:** faltou o `regras_antigas.json`; usei uma cópia do teste que pula só essa coluna. |
| **`teste_fase10_versao.js` (novo)**: versão no menu, versões iguais sem aviso, diferentes = 1 aviso e a partida segue, anfitrião antigo ("antiga"), jogo local intacto | ✅ 14 certas, 0 falhas (15 sob as regras). Sabotei o envio da versão e o teste falhou (6 falhas), como deveria. Fases 4, 7, 8, 9 e a sala de 8 seguem sem falhas com o código novo. |
| **`teste_fase10_sala8.js` (novo)**: lobby REAL com 8 vagas (anfitrião + 1 convidado + 6 bots), um 9º não entra, 3 rodadas, privacidade do convidado, tamanhos | ✅ 11 certas, 0 falhas, 5 execuções seguidas (12 sob as regras). Estraguei o `visao.js` (vazar moedas, objetivo e mão) e o teste detectou. |
| Medida: visões completas por convidado com 8 jogadores (6 bots, ação a ação) | ≈ **23 por rodada**. Cada ação (inclusive de bot) faz o anfitrião reenviar a visão inteira a **todos** os humanos. Tamanho no teste: visão ≈ 2,6 KB e estado ≈ 8 KB, com cartas simplificadas (**só um piso**). |
**Não coberto pelo Node:** Firebase de verdade e o comportamento exato das regras (usar o Rules Playground), 4G/5G, iPhone, toque/teclado do celular, sala lotada com vários aparelhos humanos, partida longa de verdade, as cartas/rodada/objetivos reais. **Limites do Spark conferidos em 26/10/2026 (firebase.google.com/pricing):** 100 conexões simultâneas, 1 GB armazenado, 360 MB/dia de download (≈ 10 GB/mês).

> **Nota (iPhone):** o Safari do iPhone não tem a função de vibrar, e um site não consegue avisar com o app fechado sem *push* (fora do plano gratuito simples). Com a página aberta o título da aba muda e a tela diz "Sua vez". Se isso incomodar, a próxima opção é um som curto quando chegar a sua vez (não foi feito).

## Custos (conferido em 23/10/2026 — **reconferir antes de divulgar para mais gente**)
- **Plano Spark: gratuito e sem forma de pagamento.** Sem cartão cadastrado, não há o que cobrar.
- Realtime Database no Spark: **100 conexões simultâneas** e **1 GB armazenado**. O limite de download mensal (cerca de 10 GB, citado antes) **não foi reconfirmado**; ver a aba *Uso* do banco e `firebase.google.com/pricing`.
- **Nunca clicar em Upgrade / Blaze / Ativar faturamento.** Só o Blaze cobra.
- **Não usar** Cloud Storage, Functions, App Hosting nem Firebase Hosting. O jogo fica no GitHub Pages.

---

## Pendências fora do online

| # | Item | Situação |
|---|---|---|
| 1 | **`qa.html`** | ⏸ **Adiado pelo dono** (será ajustado em alguns dias). Lembretes: `menu()` abre o menu principal (use `Menu.ir('novo')` ou `A.new({ nomes, bots, first })`); recusas antes silenciosas agora chamam `alert`; o QA chama `A.*` direto, então **não testa a camada de comandos**. Quando for ajustar, envie o arquivo. |
| 2 | Bot no navegador | ✅ testado pelo dono. |
| 3 | Menus no celular | ✅ conferidos pelo dono (iOS e Android). |
| 4 | Evento individual do bot | ✅ **decidido: fica VISÍVEL e já está pronto** (jogo local: `tela.js`; online: `viewFor` em `visao.js` manda o `ind` de jogadores bot a todos — Fase 7). |
| 5 | **Balanceamento com 2 jogadores** | ⬜ **a fazer (dono aprovou).** Objetivos que raramente fecham: `noLoan`, `allLvl`, `clean`, `mUnits`, `mProfit`, `noites`, `floorUntil`. Provável causa: o cofre do Governo é finito. Fazer em **conversa própria**; enviar `cartas.js`, `config.js`, `objetivos.js`, `rodada.js`, `cartas-visual.js`, `bot.js`, `comandos.js` + as `acoes-*.js` + `estado.js`, `consultas.js` (para testar com `Bot.simular` de verdade). Pode ser feito antes ou depois do online; não trava nada. |

---

## PARTE 3 — Online (o que falta fazer)

### O que o bot e o mobile já deixaram pronto
| Já feito | Vantagem para o online |
|---|---|
| Ações com parâmetros: `A.sell`, `A.buyFeira`, `A.listRes`, `A.list` | A Fase 2 do roteiro antigo está **quase toda feita**: ações de rede não precisam ler campos da tela. |
| `A.new({ nomes, bots, first })` | O anfitrião cria a partida sem tela de menu. |
| `p.bot` e `bot.js` | **Bots podem ocupar vagas** numa partida online: quem roda o jogo (anfitrião) roda também os bots. |
| `Bot.tenta()` (executa uma ação com o `alert()` silenciado e detecta recusa) | É a mesma técnica que a camada de comandos do online precisa para não travar com `alert()`. |
| Gancho `if (p.bot) ...` em `tela.js` | É o mesmo ponto onde entra "Aguardando [jogador]". |

### O que ainda atrapalha para o online
> **Resolvido:** tudo das Fases 1 a 9: anfitrião que cai/recarrega (retoma), jogador que sai/cai (bot assume e devolve, confirmado), aviso de anfitrião desconectado, estado salvo, limpeza de salas, lobby brigando com o jogo, tela de espera fora da vez e **regras restritivas publicadas**.

| Problema que continua aberto | Onde | Fase |
|---|---|---|
| **iPhone online** e **4G/5G** ainda não foram testados (só Android + PC). | — | 10 |
| Quem troca de navegador/aparelho (uid novo) não consegue voltar a uma partida em andamento. | `rede.js` | 10/futuro |
| iPhone não vibra; não há notificação com o app fechado. | — | opcional (som curto) |
| Anfitrião que fecha a página de vez: a partida só continua se ele voltar (os convidados desistem em 2 min e podem voltar com o código). Não há troca de anfitrião. | `online.js` | futuro |
| `A.go`/`A.end` em si não conferem fase (quem confere é o `Cmd`; o `qa.html` ainda os chama direto). | `acoes-turno.js` | — |
| `qa.html` adiado pelo dono e não testa o online. | `qa.html` | — |

### Fase 9 entregue — o que mudou para as próximas fases
- **✅ Confirmada pelo dono em 26/10/2026** (Android + PC + bot): saída e queda de conexão de anfitrião e convidado, bot assumindo a vaga em ~30 s, reconexão, convidado recarregando e voltando, link de convite e regras restritivas publicadas. Consumo medido: 957 KB de download e 11 KB de armazenamento em testes curtos. Pendências menores na seção "Testes".
- **Feita com as Fases 7 e 8 só parcialmente confirmadas.** O dono jogou e relatou três problemas (loja fora da vez, partida travada quando B sai, B não avisado quando A sai); os três foram corrigidos aqui e entraram na lista de "reconferir".
- **Arquivos alterados:** `online.js` (retomada, presença, vaga assumida, faixas de conexão, saída), `rede.js` (`aoConexao`, `removerSala`, `limparAntigas`; `sair()` e presença não recriam sala apagada), `lobby.js` (`fechar()` apaga a sala), `tela.js` (tela de espera). **Novos:** `regras_firebase.json` (regras de segurança corrigidas) e `regras_antigas.json` (só para comparar). **Não alterados:** `comandos.js`, `bot.js`, `janelas.js`, `zoom.js`, `acoes-*.js`, `estado.js`, `consultas.js`, `visao.js`, `pecas-tela.js`, `menu.js`, `iniciar.js`, `index.html`.
- **Causa do "B não foi avisado quando A saiu" (achada reproduzindo com o lobby REAL):** o `lobby.js` continuava ouvindo a sala durante o jogo e reagia a "sala encerrada" com `Rede.sair()`; o `Rede.sair()` desliga TODOS os ouvintes, inclusive o do `online.js`, que então nunca era avisado. Nos testes das Fases 7 e 8 isso passou despercebido porque eu usava um lobby de mentira. Agora o `online.js` chama `Lobby.desliga()` ao iniciar.
- **Quem assume a vaga:** `S.players[i].bot = 'normal'` e `ex = 1` ("era humano"). Volta: `bot = ''`. Um jogador com vaga assumida continua recebendo visões. A ação `saindo` não passa por `Cmd`.
- **Retomada:** o anfitrião grava `S` inteiro em `salas/CODIGO/estado` (texto JSON) a cada mudança; ao voltar com o mesmo uid retoma. Precisa de uid igual: o mesmo navegador/aparelho.
- **Regras:** `regras_firebase.json` = Apêndice A + 3 correções (apagar sala, ação em sala inexistente, `args` ≤ 2000). **Sem a correção do `$sala/.write` o botão Sair do anfitrião seria NEGADO pelo banco** (testado com o interpretador). Ver Apêndice A.
- **Testado em Node:** `teste_fase9.js` (52), `teste_fase7.js` (63), `teste_fase8.js` (43), `teste_fase4.js` (115), `teste_regras.js` (42 situações). As Fases 7, 8 e 9 também rodam **SOB as regras novas** (`REGRAS=regras_firebase.json node teste_fase9.js`): 64, 44 e 53 conferências, e nenhuma operação do jogo foi negada. Estraguei a Fase 9 de 21 jeitos e todos foram detectados (alguns só depois de eu endurecer o teste, porque a presença "salvava" o cenário).
- **Não foi testado:** o Firebase de verdade e o **comportamento exato das regras no Firebase** (usei um interpretador meu: confira no Rules Playground e jogando), o toque/teclado no celular, o iPhone, e o `cartas.js`/`rodada.js`/`objetivos.js` reais.
- **Para a Fase 10:** os testes já cobrem muito; o que falta é só o teste real (4G/5G, dois aparelhos, partida longa, consumo) e o roteiro de privacidade com as regras publicadas.

### Fase 8 entregue — o que mudou para as próximas fases
- **Feita SEM a confirmação da Fase 7** (pedido do dono). Se o teste dos dois celulares achar problema na 7, a 8 pode precisar de ajuste.
- **Arquivos alterados:** `janelas.js`, `tela.js`, `zoom.js`, `bot.js`, `online.js`, `comandos.js`, `acoes-turno.js`. **Não alterados:** `estado.js`, `consultas.js`, `acoes-economia/plantio/mercado.js`, `visao.js`, `menu.js`, `pecas-tela.js`, `rede.js`, `index.html`, `lobby.js`, `dev.js` (não recebi; o painel Dev some do online só pela `janelas.js` e por `A.modal`, sem precisar dele). Também vão `teste_fase8.js` e `teste_comum.js` (e o `teste_fase7.js` passou a usar o comum).
- **Mercado online:** sempre pelo jogador deste aparelho ("Jogando como: X"); o seletor "Atuar como" só existe no jogo local. O Mercado abre também **na vez de um bot** (botão 🤝 na tela do bot, só online).
- **Fora da vez (online):** Governo (empréstimo, pagar, carta extra, vender, Feira), comprar campo, "Melhorar" e "Plantar" ficam **desativados** (o Mercado e a Ver jogador/Objetivo continuam livres). No jogo local nada muda.
- **Painel Dev:** não existe online (`A.modal('dev')` não faz nada e `janelas.js` não o desenha).
- **O que se digita sobrevive aos redesenhos:** quantidade e preço do Mercado, quantidade da Feira, campo em foco com o cursor e a rolagem da janela são guardados e devolvidos a cada visão nova (convidado) e a cada jogada de bot/outro jogador (anfitrião). Depois de uma jogada aceita, os campos dela voltam vazios.
- **O que foi testado em Node:** `teste_fase8.js` (dois aparelhos, `rede.js` real sobre Firebase falso): Mercado sem "atuar como" (mesmo forçando `UI.actor`); oferta feita fora da vez e comprada pelo outro; campos preservados e limpos; foco e rolagem; botões desativados fora da vez e ativos na vez; ver jogador e objetivo nos dois papéis; **espiar** (a janela só aparece para quem tem o evento, mostra o espiado e some no fim do turno); Mercado na vez do bot com digitação preservada; Dev ausente; jogo local intacto. 42 conferências, 11 defeitos plantados detectados. Fase 7 continua 59/59 e a Fase 4 115/115.
- **O que NÃO foi testado:** tudo o que já estava na lista da Fase 7 (Firebase real, `lobby.js` real, visual e toque no celular, `cartas.js`/`rodada.js`/`objetivos.js` reais), e agora também: **foco e teclado virtual do celular** (o teste simula foco, não o teclado do iOS/Android), e o `dev.js`.

**Roteiro extra para o teste dos dois celulares (some ao da Fase 7; +10 minutos):**
1. Abrir o **Mercado** nos dois celulares. Deve dizer "Jogando como: seu nome" e não ter o seletor "Atuar como".
2. No celular do convidado, **fora da vez dele**, digitar quantidade e preço de um recurso, esperar o anfitrião jogar algo (a tela redesenha) e conferir que o que foi digitado **continua lá** e a janela **não volta ao topo**. Depois tocar em **Ofertar**: a oferta aparece nos dois e os campos dela ficam vazios.
3. O anfitrião compra a oferta (na vez dele ou fora dela). Conferir moedas e estoque dos dois.
4. Fora da vez: abrir o **Governo** (botões cinzas e aviso), tentar comprar campo (cinza), abrir um campo e ver "Melhorar" cinza.
5. Na vez do **bot**: o botão 🤝 Mercado aparece; abrir, digitar um número e deixar o bot jogar; o número não pode sumir.
6. **Teclado do celular:** com o teclado aberto digitando no Mercado, esperar uma jogada do outro. O teclado deve continuar aberto (se fechar, anote em qual aparelho).
7. Conferir que não existe botão **Dev** em nenhum dos dois.

### Fase 7 entregue — o que mudou para as próximas fases
- **Arquivos:** `online.js` (novo) · alterados `comandos.js`, `tela.js`, `zoom.js`, `bot.js`, `visao.js`, `janelas.js`, `acoes-turno.js`, `menu.js`, `index.html` (uma linha: `<script src="online.js">` logo depois de `zoom.js`). **Não alterados:** `estado.js`, `consultas.js`, `acoes-economia/plantio/mercado.js`, `rede.js`, `iniciar.js`, `pecas-tela.js`, `lobby.js` (não recebi; usei só o contrato documentado). Também vai `teste_fase7.js`.
- **Desenho:** o ANFITRIÃO roda o jogo e os bots, recebe as jogadas (`Rede.aoAcao`), executa por `Cmd.run(idx, ...)` (o `idx` vem do UID de quem enviou) e publica a cada humano a SUA visão. O CONVIDADO só envia (`Online.pede`) e desenha a visão. O resultado de cada jogada volta como **recibo** dentro da visão (o `rede.js` não tem canal de resposta). Detalhes na Ficha, seção "Jogo online (Fase 7)".
- **Mudanças fora do `online.js`:** `A.new({ online: true })` ignora Configurações/Dev; `A.quit()` online vira `Online.sair()`; `A.act()` não faz nada online; `Cmd.local` no convidado só valida e envia; `render()` online não grava `tc_save`, esconde Dev, mostra "Sua vez / Aguarde", mostra "Encerrar turno" só na sua vez e não duplica abas de jogador eliminado; `Bot.agenda()` não roda no convidado; `viewFor` manda o `ind` dos bots; `janelas.js` usa `me()` em Governo, Objetivo, Espiar e Ver jogador (antes `cur()`, que quebraria no convidado: `cur().obj` de outro jogador não existe na visão); `Z.up` espera a resposta (`Z.resposta`); `menu.js` ganhou a tela `espera`.
- **Contrato com o `lobby.js` (não conferi o arquivo):** `Lobby.aoIniciar(cfg)` é chamado UMA vez em cada aparelho com `cfg = { nomes, bots, first, uids, meuIdx, host }`; o `online.js` atribui `Lobby.aoIniciar` ao carregar (precisa carregar DEPOIS do `lobby.js`). **Se a tela do lobby reaparecer por cima do jogo, ou o jogo não começar, mande o `lobby.js`** (provável causa: algum ouvinte do lobby redesenhando o menu).
- **O que foi testado em Node:** DOIS aparelhos (arquivos reais: `estado`, `consultas`, `acoes-*`, `comandos`, `bot`, `menu`, `pecas-tela`, `visao`, `janelas`, `tela`, `zoom`, `online`) falando pelo **`rede.js` real** sobre um Firebase falso em memória, com latência de escrita de 0, 3, 10 e 40 ms. Conferido: início; "Configurações/Dev" ignoradas; nada de `tc_save` online; privacidade (moedas, mão, objetivo e evento individual do anfitrião NÃO aparecem na visão do convidado; o do bot aparece); recusa local fora da vez; turno do anfitrião e do convidado; recibo e alerta de recusa; toque duplo; Feira sem quantidade; ação repetida (executa 1 vez); remetente desconhecido e falso (o convidado não consegue agir como o anfitrião); tipo fora da lista; bot só no anfitrião (e sem botão ⏩ no convidado); `Z.up` só anima depois da resposta e reabre o campo se recusado; eliminado sem abas duplicadas; vitória e saída sem apagar o jogo salvo; sala encerrada no meio; jogo local intacto. A Fase 4 continua com 115/115. Estraguei a Fase 7 de 10 jeitos e a bateria detectou os 10.
- **O que NÃO foi testado:** o Firebase de verdade; o `lobby.js` real; o visual real (`cartas-visual.js`, `style.css`) e o toque em celular; `cartas.js`, `rodada.js`, `objetivos.js` reais (entraram peças falsas); partidas longas.

**Roteiro para o dono (dois celulares, 15 minutos; use a sala criada pelo lobby como já fez):**
1. Anfitrião cria a sala, convidado entra, anfitrião põe **1 bot** e inicia. Os dois devem ver o jogo (o convidado passa rapidinho por "Partida iniciando…").
2. Conferir que a SUA tela diz "Sua vez"/"Vez de…" certo nos dois aparelhos, e que o título/vibração avisa quando chega a sua vez.
3. Jogar um turno completo em cada aparelho: começar → comprar campo → plantar → melhorar (animação) → Governo (vender, empréstimo) → encerrar. A jogada do convidado deve aparecer no anfitrião em ~1 s.
4. Fora da vez: tocar em "Encerrar"/comprar campo (o convidado vê o aviso na hora). Abrir Governo, Objetivo e Mercado fora da vez: devem mostrar os SEUS dados, sem erro.
5. Recusa que só o anfitrião sabe: vender um recurso que você não tem, comprar com moedas faltando → deve aparecer o aviso e nada mudar.
6. Mercado: um oferta, o outro compra (nas duas vezes de jogar).
7. Deixar o bot jogar: o convidado vê "Bot X está jogando..." com o evento individual dele.
8. Ver o consumo: Firebase › Realtime Database › **Uso** depois de ~10 minutos de jogo.
9. Sair: o convidado sai (confirma); o anfitrião sai (confirma que encerra para todos). Conferir que o **jogo local salvo** (Continuar Jogo) continua lá.
10. Se algo falhar, anote o passo e o que apareceu na tela (ou o erro do console).

### Fase 6 entregue — o que mudou para as próximas fases
- **Arquivos:** `lobby.js` (novo), `rede.js` (funções novas), `menu.js`, `iniciar.js`, `style.css` (bloco no fim), `index.html` (uma linha: `<script src="lobby.js">` depois de `menu.js`). Nada mais foi alterado (`tela.js`, `bot.js`, `janelas.js`, `zoom.js`, `comandos.js`, `visao.js` continuam como a Fase 4 deixou).
- **Fluxo:** Criar Sala (nome + 2 a 8 jogadores, bots contam) → sala de espera com código e link; Achar Sala (nome + código; o link `?sala=CODIGO` abre essa tela já preenchida). O anfitrião põe bots (fácil/normal), tira jogadores (✕), muda as vagas, escolhe quem começa (aleatório ou um jogador) e inicia. Convidado removido ou sala fechada: volta ao menu Online com aviso.
- **`rede.js` — acrescentado (só anfitrião, só em `lobby`):** `adicionarBot(nivel)`, `removerJogador(chave)`, `fixarJogadores(ordem)` (grava idx 0..n-1, recusa se a lista mudou), `definirVagas(n)` (2 a 8, não abaixo dos presentes). Também: nome sem `< > & " ' ` ` na origem, e `entrar` diz "Esta sala foi encerrada." quando o estado é `fim`. **Compatível com o Apêndice A** (o anfitrião já pode escrever em `jogadores/$uid`; `bot` é `facil|normal`; `vagas` 2 a 8). Fechar a sala = `definirEstado('fim')` (não apaga o nó, então as regras restritivas não precisam mudar).
- **Gancho para a Fase 7:** `Lobby.aoIniciar = cfg => ...`, chamado UMA vez em cada aparelho quando a sala vira `jogando`, com `cfg = { nomes, bots, first, uids, meuIdx, host }`. `nomes` já vêm limpos; `uids[i]` é o uid do jogador de idx `i` (bot = chave `bot...`); `meuIdx` é o idx deste aparelho; `first` só é definido no anfitrião. **Anfitrião:** `EU = cfg.meuIdx`, `A.new({ nomes, bots, first })` e a lista `uids` para mandar `viewFor(i)` a cada humano (`Rede.darVisoes`). **Convidado:** `EU = cfg.meuIdx` e esperar `Rede.aoVisao`. Sem `aoIniciar` definido, o lobby só mostra "Partida iniciada".
- **Nomes e XSS:** os nomes dos jogadores vêm da rede. O lobby escapa ao desenhar e `cfg.nomes` é limpo, mas **as telas do jogo (`tela.js`, `janelas.js`, `pecas-tela.js`) ainda inserem nomes sem escapar**; é seguro enquanto o jogo usar `cfg.nomes` do anfitrião (limpos). A Fase 7/8 não deve criar jogadores com nomes vindos direto do banco.
- **Limite de 8 jogadores online** (regra do `rede.js` e do Apêndice A); o jogo local continua até 10. Se quiser 10 online, mude o limite no `rede.js` (`criar`, `definirVagas`) E no Apêndice A.
- **O que o lobby NÃO faz (Fases seguintes):** reconectar depois de fechar a página, salas antigas, host que sai no meio (Fase 9). O anfitrião que volta à sala pelo código continua anfitrião.
- **Testes feitos aqui:** o `rede.js` REAL rodado sobre um Firebase falso em memória (33 verificações, incluindo recusas de convidado, sala cheia, depois do início e sala encerrada) e o lobby nos dois lados (41 verificações, também no modo em que o Firebase avisa os ouvintes ANTES da promessa terminar, como o real). Estraguei o `lobby.js` de propósito de 5 jeitos (nome sem escape, início em dobro, inicia com humano offline, não fixa a ordem, nomes sujos no jogo) e a bateria detectou todos. O teste também achou, e eu corrigi, um defeito no `iniciar.js` (`window.Menu` não existe: `Menu` é `const`). **Não foi testado no Firebase de verdade** (sem internet aqui): isso é com o dono.

### Fase 4 entregue — o que mudou para as próximas fases
- **Arquivos:** `comandos.js` (novo) · alterados `bot.js`, `tela.js`, `janelas.js`, `zoom.js`, `index.html` (`<script src="comandos.js">` logo depois de `acoes-mercado.js`). **Não alterados:** `estado.js`, `consultas.js`, as quatro `acoes-*.js`. Também vai `teste_fase4.js` (teste em Node).
- **O que é:** `Cmd.run(quem, 'sell', ['soja', 5])` → `{ ok, msg }`. Confere quem pediu, se é a vez, a fase do turno (`go` só antes de começar; o resto só depois, sem "espiar" pendente; `peek` só para quem tem a pendência; Mercado em qualquer hora, pelo REMETENTE) e limpa os argumentos. Recusa sem mexer em nada. Os botões usam os atalhos `Cmd.sell('soja')`, `Cmd.buyF(0)`, `Cmd.end()` (jogador deste aparelho, com `alert`, completando carta escolhida e campos da tela).
- **15 comandos de jogo** (`Cmd.nomes`): `go end buyF loan pay extra sell buyFeira plantIn up peek listRes list cancel buyM`. **Interface** (fica em `A.*`, nunca vai pela rede): `modal act view pick cancelPick new cont quit`.
- **Argumentos sempre explícitos** na rede: `plantIn(fi, h)` com a posição da carta na mão; `listRes(k, qtd, preco)`; `list(tipo, uid, preco)`. Em `sell` e `buyFeira` a quantidade é opcional (tudo / máximo).
- **Para a Fase 7 (o gancho já existe):** se `EU != null` e o remetente não é este aparelho, o `Cmd` guarda e devolve a `UI` do anfitrião e manda redesenhar. Basta fazer `EU = idx` do anfitrião ao entrar na sala e chamar `Cmd.run(uidDoRemetente→idx, tipo, args)` com o que chegar de `Rede.aoAcao` (o `tipo` precisa estar em `Cmd.nomes`; ignore `id` repetido). O bot do anfitrião usa o mesmo `Cmd.run`.
- **Efeitos novos no jogo local (esperados):** `go` duas vezes e `end` antes de começar o turno são recusados com motivo; com "espiar" pendente só `peek` vale (a janela já bloqueava a tela). `A.go`/`A.end` chamados direto (pelo `qa.html`) continuam funcionando como antes.
- **Bot:** `Bot.tenta(chave, 'nome', [args], texto)` e `Bot.cmd(p, nome, args)`; não mexe mais em `UI.actor`. Único `A.*` direto: um `A.end()` de emergência no tratamento de erro.
- **O que foi testado em Node (arquivos reais + peças falsas):** vez e fase; argumentos estranhos (texto, `NaN`, `Infinity`, negativos, `constructor`, `__proto__`); Mercado fora da vez e remetente; espiar; botões locais com `alert` e leitura dos campos; o caminho "remoto" com `EU` definido (a `UI` do anfitrião não muda); 12 partidas de bots pela camada, sem erros e **sem uma única recusa de validação** (só as recusas normais das regras). Estraguei a camada de 5 jeitos e o teste pegou os 5.
- **O que NÃO foi testado:** o desenho real da tela (`tela.js`, `janelas.js`, `zoom.js` com DOM de verdade), o `cartas.js`/`rodada.js`/`objetivos.js` reais (não recebi; entraram peças falsas) e o `Bot.simular` com o jogo completo.

**Roteiro para o dono conferir no navegador (10 minutos, jogo local, 3 jogadores):**
1. Começar uma partida e jogar um turno inteiro só com botões: Estou pronto → comprar campo → escolher carta e plantar → melhorar (animação do zoom) → Governo (empréstimo, pagar, carta extra, vender) → Encerrar turno.
2. Mercado: ofertar recurso (campos qtd e preço), ofertar carta, cancelar, comprar; "atuar como" outro jogador e ofertar por ele; abrir o Mercado na tela "Passe o dispositivo" e ofertar.
3. Feira Regional (se sair) comprando com a quantidade digitada e com o campo vazio (deve comprar o máximo).
4. Evento "espiar": escolher quem espiar na janela; tentar fechar a janela (não deve fechar).
5. Recusas: vender sem estoque, plantar sem carta escolhida, ofertar sem preço → cada uma deve mostrar o mesmo aviso de antes.
6. Bot: uma partida com 1 humano + 2 bots; e no console `Bot.simular(20, 3, ['normal'])` e `Bot.simular(20, 4, ['normal', 'facil'])` (deve continuar sem erros de estado).
7. "Continuar" no meio de uma partida salva.

### Fase 5 entregue (rede.js) — o que mudou para as próximas fases
- **SDK:** Firebase JS 12.19.0 fixa, via `import()` de gstatic.com (13.x ficou de fora por ser muito nova/versão principal nova). Só baixa ao chamar `Rede.iniciar()`.
- **Interface:** `iniciar`, `criar(nome, vagas)`, `entrar(codigo, nome)`, `enviar(tipo, args)`, `aoAcao` (anfitrião; apaga a ação processada; entrega "ao menos uma vez", então ignore `id` repetido), `aoVisao`, `aoJogadores`, `aoMeta`, `darVisao(s)`, `gravarEstado/lerEstado`, `definirEstado`, `sair`, `lerConvite`, `linkConvite`. Propriedades `Rede.uid/codigo/ehHost/naSala/convite`.
- **Mudança de formato (caminhos iguais aos do Apêndice A):** `args`, `visao/{uid}` e `estado` são gravados como **texto JSON**, porque o banco apaga arrays/objetos vazios e recusa chaves com `. $ # [ ] /`. As regras não podem inspecionar `args` (já eram `true`).
- ~~Fase 6 deve: reatribuir `idx` ao iniciar, criar bots como `jogadores` com chave própria e ler `Rede.convite` na tela 'achar'.~~ ✅ Feito na Fase 6 (`Rede.adicionarBot/fixarJogadores`, `lobby.js`).
- **Fase 7 deve:** tratar ações repetidas (por `id`) e ordenar entre jogadores (por jogador a ordem é garantida; entre jogadores, por chegada ou `ts`).
- **Fase 9 deve:** fechar/limpar salas (host que sai, salas antigas), reconexão com uid novo, e conferir sala cheia/partida iniciada no servidor, se desejado.
- **Login:** persistência padrão `'local'`: duas abas do mesmo navegador são o MESMO jogador. Para testar dois jogadores: `teste-rede.html` (uid por aba), outro navegador ou janela anônima.
- **Custos conferidos de novo (23/10/2026):** Spark = 100 conexões, 1 GB, 10 GB/mês de download (≈360 MB/dia na página oficial).

### Fase 1 entregue — o que mudou para as próximas fases
- **Arquivos alterados (9):** `estado.js`, `consultas.js`, `acoes-turno.js`, `acoes-plantio.js`, `acoes-mercado.js`, `bot.js`, `dev.js`, `tela.js`, `zoom.js`. **Não alterados:** `janelas.js`, `qa.html`, `menu.js`, `iniciar.js`, `index.html`, `rede.js`.
- **Quem sou eu:** `EU` (null no jogo local), `eu()` (índice) e `me()` (jogador) em `consultas.js`. Telas, zoom e (por enquanto só no código novo) janelas usam `me()`; as ações continuam em `cur()`. **No online, a Fase 6/7 só precisa fazer `EU = idx` ao entrar na sala.**
- **Interface fora de `S`:** o objeto `UI` (em `estado.js`) guarda `modal`, `plantSel`, `viewing`, `viewRes`, `actor`, `devP`, `dv`. O save (`tc_save`) não leva mais esses campos; `A.cont()` limpa saves antigos.
- **Espiar:** a escolha pendente agora é do jogo (`S.peekPend`), não da interface; a janela aparece só para quem é `eu()`.
- **`A.plantIn(fi, h)`:** a carta da mão pode ser passada direto (sem `A.pick`), o que já serve de comando de rede.
- **Ponte provisória `ligaUI()`:** `S.modal`, `S.plantSel`, `S.actor` etc. continuam existindo como atalhos para `UI` (não enumeráveis, não vão ao save). Assim `janelas.js` e `qa.html` funcionam sem mudança. **Remover a ponte quando os dois usarem `UI` direto.**
- **`janelas.js` (resolvido na Fase 4):** o arquivo atual já desenha o botão ✕ `.mx` da Parte 1; foi recebido e agora usa `Cmd.*` nos botões de jogo. Falta só migrá-lo de `cur()` para `me()`/`UI` (Fase 8).
- **Atenção para a Fase 7:** `tela.js` chama `Bot.agenda()` para qualquer aparelho quando a vez é de um bot. No online, só o anfitrião pode rodar os bots (`Rede.ehHost`).
- **Ainda aberto:** `Z.up` confere o resultado na hora (síncrono); no online a resposta vem depois (Fases 4/7).

### Fase 2 entregue — o que mudou para as próximas fases
- **Arquivos alterados (5):** `acoes-turno.js`, `acoes-economia.js`, `acoes-plantio.js`, `acoes-mercado.js`, `bot.js`.
- **Mecanismo:** `recusa(msg)` (mostra o `alert` e devolve `false`), `exec(fn)` (roda em silêncio e devolve `{ ok, msg }`) e `A.tentar(nome, ...args)`. Chamadas diretas (botões da tela) continuam com `alert`.
- **Toda recusa tem motivo**, inclusive as que antes eram silenciosas (plantar onde não cabe, pagar sem dívida, comprar campo inexistente, plantio inexistente etc.).
- **Validações novas no Mercado:** só se oferta item que é seu (`A.list`), só se cancela oferta sua (`A.cancel`), não se compra a própria oferta (`A.buyM`) e oferta inexistente não gera mais erro. Quem atua é `ator()` = `UI.actor` ou, se vazio, `eu()`.
- **Bot:** `Bot.tenta` usa `exec` e não mexe mais em `window.alert`.
- **Para a Fase 4:** `A.tentar` aceita QUALQUER ação de `A` (inclusive `new`, `quit`, `cont`, `modal`); a camada de comandos precisa de uma **lista permitida** e conferir quem enviou e se é a vez. `A.go` e `A.end` ainda não conferem a fase do turno (`go` duas vezes produziria duas vezes).
- **Ainda com `alert` direto:** `dev.js` (só existe no jogo local) e o que for de interface.
- **Atenção ao rodar o `qa.html`:** como recusas antes silenciosas agora chamam `alert`, o QA pode registrar mais alertas; se algo parecer errado, envie o `qa.html`.

### Fase 3 entregue — o que mudou para as próximas fases
- **Arquivos:** `visao.js` (novo) e `index.html` (uma linha: `<script src="visao.js">` depois de `pecas-tela.js`). Nenhum outro arquivo foi alterado.
- **`viewFor(i)`**: cópia profunda e JSON puro do estado como o jogador `i` pode vê-lo; `viewFor(null)` = espectador. Segue `sees()`: moedas, dívida, estoque, plantios e contagem de cartas na mão só para quem pode ver; mão, objetivo, evento individual e estatísticas só do dono; baralhos, `uid` e `devAll` nunca; cofre só com "Tudo à vista". Cartas da mão postas à venda no Mercado ficam visíveis a todos (a janela precisa mostrá-las).
- **Valores escondidos:** `coins`, `debt` e `res` ficam `null` (a tela nunca mostra um número falso); cartas ocultas da mão são `{ oculta: true }`.
- **Teste:** conferência automática de privacidade (1000+ verificações em partidas de bots, para cada jogador e para o espectador), cenários de "Tudo à vista", "Revelar-se" e "Espiar", e a tela desenhando com a visão de cada jogador. Também **testei a própria bateria**: ao estragar o `visao.js` de 5 jeitos (vazar moedas, objetivo, mão, cofre, baralhos), ela detectou todos.
- **Tamanho:** cerca de 5 KB por visão (mediana), máximo medido 12 KB. Cada ação do jogo manda uma visão por jogador; confira o consumo na aba *Uso* do Realtime Database depois da Fase 7.
- **Para a Fase 7 (cliente):** ao receber a visão, o aparelho faz `S = visão`, `ligaUI()`, `EU = índice` e `render()`. O `sees()` calculado no cliente dá o mesmo resultado do anfitrião. Bots, `A.*` e `Bot.agenda()` só rodam no anfitrião (com o `S` completo).
- **Bloqueio para a Fase 8:** o `janelas.js` atual (já recebido, com o ✕ `.mx`) ainda lê `cur()` (o jogador da vez). Com a visão filtrada isso quebra para quem não é o da vez (ex.: janelas de Governo e Objetivo). Precisa da migração para `me()`; a transformação já está pronta e testada.
- **O registro (`log`) é público e já mostra o nome do evento individual de cada jogador** (isso já era assim no jogo local); se quiser esconder, é decisão de regra do jogo.
- **Regra para o futuro:** ao criar um campo novo em `S` ou em um jogador, decida em `viewFor` se é público, condicional, só do dono ou secreto. A bateria avisa se algum campo de `S` não foi tratado.

### Decisões já tomadas (Fase 0)
- **Arquitetura:** o navegador de um jogador (**anfitrião**) roda o jogo e os bots; os outros enviam ações e recebem uma visão filtrada. Não precisa de servidor próprio.
- **Transporte: Firebase Realtime Database**, plano **Spark** (gratuito, sem cartão). Limites no quadro "Custos" acima.
- **Identidade: autenticação anônima do Firebase** (já ativa). Cada navegador recebe um `uid`; as regras de segurança usam esse `uid`.
- **Por que não PeerJS:** a sinalização é gratuita, mas o TURN gratuito foi desativado; sem TURN, jogadores atrás de certos tipos de NAT não conseguem conectar (provavelmente afeta quem joga no 4G/5G; só testando para saber).
- **Rede isolada em `rede.js`** com uma interface simples (criar sala, entrar, enviar, ao receber), para dar para trocar o transporte depois.
- **Segurança:** o anfitrião tem o estado inteiro no navegador e pode trapacear pelo console. Entre amigos costuma bastar. Regras restritivas no **Apêndice A** (Fase 9).
- **Hospedagem: GitHub Pages — já online.** O jogo só entrega arquivos.
- **Bots online:** o anfitrião roda os bots; se o anfitrião sai, os bots param.

### O que VOCÊ faz em paralelo (não precisa de código)
1. ✅ Projeto Firebase criado, Realtime Database, app Web e `firebaseConfig`.
2. ✅ Autenticação anônima ativa.
3. ✅ GitHub Pages no ar.
4. ✅ Domínio `inogx.github.io` em *Authentication › Configurações › Domínios autorizados*.
5. ✅ `firebaseConfig` entregue e já gravado em `rede.js` (não coloque nada de pagamento).
6. ✅ Regras simples publicadas; restritivas ficam para a Fase 9.
7. ✅ `rede.js`, `teste-rede.html`, `index.html` e `iniciar.js` no GitHub Pages e teste de duas abas feito.

### Arquivos a enviar (para a Fase 10)
| Arquivo | Por quê |
|---|---|
| **FICHAS_TECNICAS.md** e este plano (`PLANO_MOBILE_BOT_ONLINE.md`) | Sempre a versão mais recente. As Fichas **não mudaram** desde a Fase 9 (nenhum código novo desde então). |
| **O resultado dos testes** | Este plano já traz o que o dono confirmou em 26/10/2026. Se fizer mais testes antes de abrir a conversa (4G/5G, sala lotada, iPhone), diga o que passou e o que falhou (passo, aparelho, o que apareceu). |
| **online.js, rede.js, lobby.js, tela.js, regras_firebase.json** | O que a Fase 9 mexeu. |
| **comandos.js, bot.js, janelas.js, zoom.js, visao.js, acoes-turno.js, acoes-economia.js, acoes-plantio.js, acoes-mercado.js, estado.js, consultas.js, menu.js, pecas-tela.js, index.html, iniciar.js** | Para os testes em Node com os arquivos reais. |
| **teste_comum.js, teste_regras_motor.js, teste_fase4.js, teste_fase7.js, teste_fase8.js, teste_fase9.js, teste_fase10_sala8.js, teste_fase10_versao.js, teste_regras.js** e **regras_antigas.json** | Os testes (o `teste_regras.js` precisa do `regras_antigas.json` para a comparação). |
| *(opcional)* **Prints** da aba *Uso* e dos dados do Realtime Database | Ajudam na conferência de consumo e de privacidade. |

Não enviar: `cartas-visual.js` (visual puro, exceto se for mexer em `free/NV/vef/nm/evDesc`), `editor.html`, `qa.html`. O `firebaseConfig` já está no `rede.js`: não precisa colar de novo.

### PROMPT 3 — Preparação do online (para colar numa conversa nova; hoje a próxima é a FASE 10)

```
Estou enviando a Ficha Técnica, o plano e os arquivos do meu jogo "Tempo de Colheita" (HTML + JS puro), mais os arquivos da etapa.

OBJETIVO
Preparar o jogo para ser jogado ONLINE, eu contra um amigo (depois, mais jogadores), entrando por código de sala e link de convite, SEM gastar dinheiro (somente serviços gratuitos e seguros). O jogo local ("passe o aparelho", com bots) funciona no celular e NÃO pode quebrar.

JÁ DECIDIDO E PRONTO (não refaça)
- Transporte: Firebase Realtime Database, plano Spark (gratuito, SEM cartão). Autenticação anônima ativa. Jogo no GitHub Pages. rede.js pronto.
- Arquitetura: o navegador do anfitrião roda o jogo e os bots e grava o estado completo; os outros enviam comandos e recebem uma visão filtrada.
- FASES 1 a 6 ✅ (identidade, recusa/exec, visão filtrada, comandos, rede, lobby), confirmadas.
- FASES 7 e 8 ✅ (no essencial): online.js (anfitrião executa por Cmd.run e publica viewFor(i) + recibo + extra.feito; convidado valida e envia por Online.pede). Janelas online: Mercado sem "atuar como", digitação preservada, Mercado na vez do bot, sem Dev. O dono jogou (Android + PC + bot): sincronização, transações, Mercado (vender/comprar/nomes), eliminação e título da aba confirmados. Pendências menores no plano: espiar, recusa só do anfitrião, melhorar como convidado, toque duplo, teclado/digitação no Mercado.
- FASE 9 ✅ (confirmada pelo dono em 26/10/2026): tela de ESPERA fora da vez; bot assume a vaga de quem sai/cai e devolve quando volta (testado: sair e cair, ~30 s, reconexão); faixa de conexão e desistência do anfitrião sumido; retomada (Rede.gravarEstado/lerEstado); sala apagada ao sair; limpeza de salas antigas; o lobby se desliga ao iniciar; regras_firebase.json PUBLICADAS. Convidado que recarrega volta pelo código. Link de convite funciona. Consumo medido: 957 KB download e 11 KB armazenamento (testes curtos).
- AINDA NÃO TESTADO: 4G/5G, sala lotada (8 jogadores), iPhone online, privacidade no console com as regras publicadas, partida longa. Todos os testes até agora foram Android + PC (Windows) + 1 bot.
- qa.html está adiado (o dono ajusta depois): não depende dele.

REGRAS DE TRABALHO
1. Uma FASE por conversa; ao fim de cada fase o jogo OFFLINE (passe o aparelho, com e sem bots) deve continuar funcionando igual. Entregue e espere meu OK.
2. Mudanças pequenas e localizadas, listadas por arquivo. Não reescreva o jogo. Entregue os arquivos inteiros alterados.
3. Mantenha o cabeçalho "FICHA TÉCNICA" de cada arquivo e atualize a Ficha e o plano.
4. Nada de bibliotecas pagas ou que peçam cartão. Antes de recomendar um serviço, CONFIRA os limites gratuitos atuais.
5. Informação secreta (mão, objetivo, estoque e dívida de outros, conforme sees()) NUNCA vai a quem não pode vê-la.
6. Preserve os ids e classes da tela (.nm e .bt do menu, #rq…, #rp…, #pr…, #fq…, etc., ver Ficha).
7. Toda ação de jogo passa por Cmd; não chame A.* de jogo direto. Se criar ação nova, acrescente a linha na tabela CMD.
8. Se rodar código para testar, teste em Node com os arquivos reais (há teste_fase4/7/8/9.js, de dois aparelhos com o lobby e a rede REAIS, e teste_regras.js); diga claramente o que foi e o que não foi testado. Cuidado com peças falsas: o lobby falso escondeu um defeito na Fase 7.

ROTEIRO (status no quadro do plano)
FASES 0 a 9 — FEITAS e confirmadas pelo dono (com as pendências menores do plano).
FASE 10 — Testes. (1) Rodar a bateria em Node com os arquivos reais e dizer o que passou. (2) Dar ao dono um roteiro curto e ordenado para: 4G/5G; sala lotada de 8 (medir consumo por jogador na aba Uso); iPhone online; conferir no console do Firebase que nenhuma informação secreta aparece (visao/{uid} de cada um, estado só do anfitrião) e as simulações do Rules Playground; partida longa e consumo. (3) Incluir no roteiro as pendências menores do plano (espiar, recusa só do anfitrião, melhorar como convidado, toque duplo, digitação/teclado no Mercado, retomada do anfitrião por F5, limpeza de salas, aviso de eliminado). (4) Corrigir o que o dono relatar, em mudanças pequenas.
FASE 11 — Publicação. Documentar o convite (?sala=CODIGO) e o que conferir (domínio autorizado no Firebase Authentication; restringir a chave de API ao domínio do GitHub Pages).
```

---

## Ordem sugerida
1. ~~Fases 4, 6 e 9~~ ✅. ~~Publicar as regras de segurança~~ ✅ (26/10/2026).
2. **Fase 10 — Testes** (conversa nova, com o PROMPT 3 e os arquivos da lista "Arquivos a enviar"). Quando o dono puder, antes ou durante: **4G/5G**, **sala lotada**, **iPhone**.
3. Depois, a **Fase 11** (publicação: documentar o convite e restringir a chave de API ao domínio do GitHub Pages).
4. Em qualquer momento, em conversa própria: **balanceamento com 2 jogadores** e o ajuste do `qa.html`.

---

## Apêndice A — Regras de segurança do Realtime Database (Fase 9)

> **O arquivo é `regras_firebase.json`** (o texto abaixo é o mesmo). `regras_antigas.json` é a versão original deste apêndice, só para comparar. **Estas regras foram testadas com um interpretador simplificado que eu escrevi, NÃO com o Firebase de verdade: por isso o roteiro abaixo manda conferir no Rules Playground e jogando, e tem um plano de volta.**

> **✅ Publicadas pelo dono em 26/10/2026**; as partidas rodaram sob elas sem erro de permissão (sair, cair, voltar, convite). Falta só a conferência de privacidade no console e, se ainda não feitas, as simulações abaixo (Fase 10).

**O que mudou em relação às regras antigas (3 correções):**
1. **O anfitrião pode apagar a sala inteira** (`$sala/.write`, só para exclusão). Sem isso o botão Sair do anfitrião, o "Fechar sala" e a limpeza de salas antigas são NEGADOS pelo banco.
2. **Ninguém cria caixa de ações em sala que não existe** (sem lixo no banco).
3. **`args` de uma ação tem no máximo 2000 caracteres.**

**Estrutura de dados que as regras assumem** (é exatamente o que `rede.js` grava):

```
/salas/{CODIGO}/
    meta/          { host: uid, estado: 'lobby'|'jogando'|'fim', vagas: n, criadaEm: ts }
    jogadores/{uid}  { nome, idx, online, bot }        (bots: o anfitrião cria chaves próprias)
    acoes/{uid}/{id} { tipo, args, ts }                (cada jogador escreve só na própria caixa)
    visao/{uid}      (visão filtrada de cada jogador)  (só o anfitrião escreve; só o dono lê)
    estado           (estado COMPLETO do jogo)         (só o anfitrião lê e escreve)
```

**Regras** (colar em *Realtime Database › Regras › Publicar*):

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "salas": {
      "$sala": {
        "meta": {
          ".read": "auth != null",
          ".write": "auth != null && $sala.matches(/^[A-Z0-9]{4,8}$/) && (!data.exists() || data.child('host').val() === auth.uid)",
          ".validate": "newData.hasChildren(['host', 'estado'])",
          "host": {
            ".validate": "newData.val() === auth.uid || newData.val() === data.val()"
          },
          "estado": {
            ".validate": "newData.isString() && newData.val().matches(/^(lobby|jogando|fim)$/)"
          },
          "vagas": {
            ".validate": "newData.isNumber() && newData.val() >= 2 && newData.val() <= 8"
          },
          "criadaEm": {
            ".validate": "newData.isNumber()"
          },
          "$outro": {
            ".validate": false
          }
        },
        "jogadores": {
          ".read": "auth != null",
          "$uid": {
            ".write": "auth != null && (root.child('salas/' + $sala + '/meta/host').val() === auth.uid || (auth.uid === $uid && (data.exists() || root.child('salas/' + $sala + '/meta/estado').val() === 'lobby')))",
            ".validate": "newData.hasChildren(['nome'])",
            "nome": {
              ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 20"
            },
            "idx": {
              ".validate": "newData.isNumber()"
            },
            "online": {
              ".validate": "newData.isBoolean()"
            },
            "bot": {
              ".validate": "newData.isString() && newData.val().matches(/^(facil|normal)?$/)"
            },
            "$outro": {
              ".validate": false
            }
          }
        },
        "acoes": {
          ".read": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid",
          "$uid": {
            ".write": "auth != null && ((auth.uid === $uid && root.child('salas/' + $sala + '/meta').exists()) || root.child('salas/' + $sala + '/meta/host').val() === auth.uid)",
            "$id": {
              ".validate": "newData.hasChildren(['tipo', 'ts'])",
              "tipo": {
                ".validate": "newData.isString() && newData.val().length <= 30"
              },
              "args": {
                ".validate": "newData.isString() && newData.val().length <= 2000"
              },
              "ts": {
                ".validate": "newData.isNumber()"
              },
              "$outro": {
                ".validate": false
              }
            }
          }
        },
        "visao": {
          "$uid": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid"
          }
        },
        "estado": {
          ".read": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid",
          ".write": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid"
        },
        ".write": "auth != null && data.child('meta/host').val() === auth.uid && !newData.exists()"
      }
    }
  }
}
```

### Como publicar COM SEGURANÇA (passo a passo)
1. **Copie as regras que estão publicadas hoje** (Realtime Database › Regras) para um bloco de notas. É o seu plano de volta.
2. Cole as regras novas **sem publicar** e abra o **Rules Playground** (botão na mesma tela). Faça as simulações da tabela abaixo. Cada uma deve dar o resultado da coluna "Esperado".
3. Se tudo bater, clique em **Publicar**.
4. Com dois celulares, jogue **uma partida inteira**: criar sala, entrar, bot, iniciar, jogar um turno cada um, o convidado sair, o anfitrião Sair. Fique de olho: se aparecer **"Sem permissão no banco (confira as regras…)"**, volte as regras antigas do passo 1 e me avise **qual passo** deu o erro.
5. No console (Realtime Database › Dados), depois que o anfitrião sair, a sala deve ter **sumido**.

### Simulações do Rules Playground (as mesmas de `teste_regras.js`)
No Playground escolha o tipo (Leitura/Gravação), o caminho, marque *Autenticado* e coloque o *UID*. Use salas de teste que você criou. "Host" = o uid do anfitrião da sala; "Convidado" = o do outro jogador; "Estranho" = um uid qualquer fora da sala.

| # | Quem | Faz | Onde | Esperado |
|---|---|---|---|---|
| 1 | Host | Lê | `/salas/COD/estado` | Permitido |
| 2 | Convidado | Lê | `/salas/COD/estado` | **Negado** |
| 3 | Convidado | Lê | `/salas/COD/visao/(uid dele)` | Permitido |
| 4 | Convidado | Lê | `/salas/COD/visao/(uid do host)` | **Negado** |
| 5 | Estranho | Lê | `/salas/COD/visao/(uid do convidado)` | **Negado** |
| 6 | Convidado | Grava | `/salas/COD/visao/(uid dele)` | **Negado** |
| 7 | Convidado | Lê | `/salas/COD/acoes/(uid dele)` | **Negado** |
| 8 | Convidado | Grava | `/salas/COD/acoes/(uid do host)/x` com `{tipo:"end",args:"[]",ts:1}` | **Negado** |
| 9 | Convidado | Grava | `/salas/COD/acoes/(uid dele)/x` com `{tipo:"sell",args:"[]",ts:1}` | Permitido |
| 10 | Convidado | Grava | `/salas/COD/meta/estado` = `"fim"` | **Negado** |
| 11 | Convidado | Grava | `/salas/COD/meta/host` = (uid dele) | **Negado** |
| 12 | Estranho | Grava | `/salas/COD/jogadores/(uid dele)` com `{nome:"X",idx:3,online:true,bot:""}` numa sala **jogando** | **Negado** |
| 13 | Host | Grava (apagar) | `/salas/COD` (nó inteiro, valor vazio) | **Permitido** *(nova)* |
| 14 | Convidado | Grava (apagar) | `/salas/COD` | **Negado** |
| 15 | Qualquer | Lê | `/salas` (listar todas) | **Negado** |
| 16 | Não autenticado | Lê | `/salas/COD/meta` | **Negado** |
| 17 | Estranho | Grava | `/salas/ZZZ999/acoes/(uid dele)/x` numa sala que não existe | **Negado** *(nova)* |

**O que estas regras garantem**
- Nada fora de `/salas/...` pode ser lido ou escrito. Ninguém lista as salas; só entra quem sabe o código.
- Só quem está autenticado (login anônimo) acessa qualquer coisa.
- O primeiro a criar `meta` vira o anfitrião; ninguém "toma" a sala depois.
- Cada jogador só escreve a **própria** entrada em `jogadores/{uid}` e a **própria** caixa em `acoes/{uid}`.
- Só dá para entrar em uma sala nova durante o `lobby`. Depois que o jogo começa, só entra de novo quem já estava na lista (mesmo `uid`). É isso que permite o jogador voltar depois de cair.
- **A visão de cada jogador só pode ser lida pelo próprio jogador**, e o estado completo e as caixas de ação só pelo anfitrião. É isso que impede um jogador de espiar a mão e o objetivo dos outros pela rede.
- Um jogador atrasado não recria nada numa sala já apagada.

**O que elas NÃO garantem (limites conhecidos)**
- O anfitrião vê tudo e pode trapacear, como já decidido.
- Não limitam o número de jogadores por sala nem o tamanho de `visao` e `estado` (só o de `args`). Mantenha as mensagens pequenas e apague a sala ao terminar (o jogo já faz).
- O `uid` anônimo muda se o jogador limpar os dados do navegador ou trocar de aparelho: nesse caso ele **não consegue voltar** a uma partida em andamento (as regras só deixam voltar quem já estava na lista com o mesmo uid).
- Opcional e gratuito: no Google Cloud Console (APIs e serviços › Credenciais), restringir a chave de API do Firebase ao domínio do GitHub Pages. A chave não é segredo, mas a restrição reduz abuso.
