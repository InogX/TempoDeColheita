# Tempo de Colheita — Plano (versão 6): o que falta

**Como usar numa conversa nova:** envie este arquivo + o `FICHAS_TECNICAS.md` atualizado + os arquivos da lista da etapa. **Uma etapa por conversa.** Sempre envie a versão mais recente dos arquivos.

**Legenda de status:** ✅ confirmado · 🔄 em andamento (sendo feito em outra conversa, **ainda não entregue/confirmado**) · ⬜ não iniciado · ❓ a conferir

---

## Onde estamos

| Parte | Situação |
|---|---|
| **1. Mobile (visual)** | ✅ Testado pelo dono em **iOS e Android**: o jogo roda tranquilo até a fase atual. O `janelas.js` atual já desenha o ✕ `.mx` (a dúvida antiga está resolvida). Ficam para a Fase 8 só as janelas passarem a usar `me()`. |
| **2. Bot** | ✅ Pronto, ligado e **testado no navegador pelo dono**. Desde a Fase 4 ele pede tudo pelos comandos (`Cmd`). |
| **2,5. Menus** | ✅ Conferidos no celular pelo dono. Criar Sala e Achar Sala existem como tela, mas a conexão só será ligada na Fase 6. |
| **3. Online** | **Fases 0, 1, 2, 3 e 5 ✅ feitas.** **Fase 4 entregue (🔄 até o dono conferir no navegador).** Fases 6 a 11 ainda não iniciadas. Infraestrutura do lado do dono pronta (quadro abaixo). |

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
| Regras do banco trocadas do modo de teste (o modo de teste **expira**, em geral em 30 dias) | ✅ regras simples publicadas (confirmado pelo dono). Regras restritivas no **Apêndice A**, para a Fase 9 (as simples NÃO protegem segredos) |

### Fases do código
| Fase | Status |
|---|---|
| 0 — Decisões e inventário | ✅ |
| 1 — Identidade local e estado de interface | ✅ entregue (9 arquivos), testada em Node, conferida no navegador e **confirmada nos arquivos** |
| 2 — Resultado das ações | ✅ entregue (5 arquivos), testada em Node, conferida no navegador e **confirmada nos arquivos** (o `qa.html` ainda não foi conferido com ela: adiado pelo dono) |
| 3 — Visão filtrada | ✅ `visao.js` + `index.html`; o dono confirmou que o jogo local abre normal. Ainda não é usada pelo jogo (a Fase 7 liga). |
| 4 — Camada de comandos | 🔄 **entregue nesta conversa** (`comandos.js` novo + `bot.js`, `tela.js`, `janelas.js`, `zoom.js`, `index.html`). Testada em Node (115 conferências, 5 defeitos plantados detectados). Vira ✅ depois que o dono conferir no navegador (roteiro na seção "Fase 4 entregue"). |
| 5 — Rede (`rede.js`) | ✅ entregue e testada no Firebase real pelo dono: duas abas de `teste-rede.html` no GitHub Pages criaram/entraram na sala e trocaram mensagem, e a aba *Uso* do Realtime Database mostrou as duas conexões. (Não foi testado ainda: dois aparelhos diferentes, 4G/5G, nem a parte de privacidade, que só vale após a Fase 9.) |
| 6 — Lobby | ⬜ **próxima** (usa `Rede.criar/entrar/aoJogadores/definirEstado` e `Rede.convite`) |
| 7 — Sincronização e vez | ⬜ |
| 8 — Janelas | ⬜ |
| 9 — Robustez + regras de segurança | ⬜ (regras prontas no Apêndice A) |
| 10 — Testes | ⬜ |
| 11 — Publicação | 🔄 parte já pronta: o jogo está no GitHub Pages; falta só documentar o convite (`?sala=`) na prática |

> Atualize este quadro quando cada fase for **entregue e testada**. Fases marcadas 🔄 só passam a ✅ depois que o arquivo novo for conferido.

---

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
| 4 | Evento individual do bot | ✅ **decidido: fica VISÍVEL.** No jogo local já era assim; a Fase 4 deixou isso explícito em `tela.js` (na vez de um bot mostra o evento dele, com o nome do bot). **Falta só no online:** o `visao.js` hoje esconde o `ind` de quem não é o dono; para jogadores bot ele precisa ser público (uma linha em `viewFor`). Mande o `visao.js` na Fase 7 (ou antes, se quiser). |
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
> **Resolvido:** jogador da vez → `me()`/`eu()` (Fase 1); estado de interface → `UI` (Fase 1); `Z.field/card/up`, `D.i()`, "atuar como" e Dev → `me()`/`eu()`/`UI` (Fase 1); ações devolvem sucesso ou erro (`A.tentar`, Fase 2); quem pode agir, na vez e na fase certa, e lista permitida (`Cmd`, Fase 4); o `zoom.js` e o bot passam pelo ponto único (Fase 4).

| Problema que continua aberto | Onde | Fase |
|---|---|---|
| A tela "Passe o dispositivo / Estou pronto" (`S.hide`) esconde informação num aparelho só. | `tela.js`, `acoes-turno.js` | 7 |
| `render()` grava o estado inteiro em `localStorage` (`tc_save`). | `tela.js` | 7 / 9 |
| `tela.js` chama `Bot.agenda()` para qualquer aparelho quando a vez é de um bot (no online só o anfitrião roda os bots). | `tela.js`, `bot.js` | 7 |
| `Z.up` já pede por `Cmd.up` e usa `r.ok`, mas no online a resposta chega depois (a animação precisa esperar a visão nova). | `zoom.js` | 7 |
| `sees()` filtra o desenho; `viewFor` filtra os dados (pronto), mas o jogo ainda não usa a visão. | `pecas-tela.js`, `visao.js` | 7 |
| `janelas.js` ainda lê `cur()` (Governo, Objetivo, Espiar) e o "atuar como" (`UI.actor`). | `janelas.js` | 8 |
| `dev.js` mexe em `S` direto e lê campos da tela (desligar no online). | `dev.js` | 8 |
| `A.go`/`A.end` em si não conferem fase (quem confere é o `Cmd`; o `qa.html` ainda os chama direto). | `acoes-turno.js` | — |
| `iniciar.js` só lê `?sala=`; falta ligar a rede (criar/entrar, `EU = idx`). | `iniciar.js`, `menu.js` | 6 / 7 |
| `style.css`: o modo compacto usa `(max-width:700px),(max-height:520px)`; `.menu` já estica `.nm`, `#n` e `#f` a 100%; o lobby pode reaproveitar `.menu`. | `style.css` | 6 |

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
- **Fase 6 deve:** reatribuir `idx` ao iniciar (o do convidado é provisório), criar bots como `jogadores` com chave própria (o `aoAcao` ignora quem tem `bot`), e ler `Rede.convite` na tela 'achar'.
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

### Arquivos a enviar (para a Fase 6)
| Arquivo | Por quê |
|---|---|
| **FICHAS_TECNICAS.md** e este plano | Sempre a versão mais recente. |
| **rede.js** | O lobby usa `Rede.criar/entrar/aoJogadores/definirEstado/convite`. |
| **menu.js** | As telas `criar` e `achar` já existem e serão ligadas à rede. |
| **iniciar.js, index.html** | Onde se lê `?sala=` e se carrega o lobby. |
| **acoes-turno.js** | `A.new({ nomes, bots, first })` que o anfitrião chama ao iniciar. |
| **estado.js, consultas.js** | `EU`, `eu()`, `me()`, `UI`. |
| **style.css** | As telas de sala e lobby reaproveitam o visual do menu (ou só os trechos de menu/botões). |
| **comandos.js** | Só leitura (a Fase 6 não mexe; a 7 usa). |

Fases seguintes: **Fase 7** pede também `tela.js`, `bot.js`, `zoom.js`, `visao.js`, `pecas-tela.js`, `comandos.js`; **Fase 8** pede `janelas.js`, `dev.js`, `zoom.js`, `tela.js`; **Fase 9** pede `rede.js` e o Apêndice A. Não enviar: `cartas-visual.js` (visual puro, exceto se for mexer em `free/NV/vef/nm/evDesc`), `editor.html`, `qa.html`.

### PROMPT 3 — Preparação do online (para colar numa conversa nova; hoje a próxima é a FASE 6)

```
Estou enviando a Ficha Técnica, o plano e os arquivos do meu jogo "Tempo de Colheita" (HTML + JS puro), mais os arquivos da etapa.

OBJETIVO
Preparar o jogo para ser jogado ONLINE, eu contra um amigo (depois, mais jogadores), entrando por código de sala e link de convite, SEM gastar dinheiro (somente serviços gratuitos e seguros). Hoje o jogo é "passe o aparelho" (um navegador guarda todo o estado S e esconde informação com a tela "Estou pronto"), funciona no celular e tem bots.

JÁ DECIDIDO E PRONTO (não refaça)
- Transporte: Firebase Realtime Database, plano Spark (gratuito, SEM cartão; não usar Blaze, Storage, Functions nem Hosting). Autenticação anônima ativa. Jogo no GitHub Pages. rede.js pronto e testado (Fase 5).
- Arquitetura: o navegador do anfitrião roda o jogo e os bots; os outros enviam comandos e recebem uma visão filtrada.
- FASE 1 ✅: quem sou eu (EU, eu(), me()) e estado de interface fora de S (objeto UI; ponte provisória ligaUI() para janelas.js e qa.html).
- FASE 2 ✅: ações recusam por recusa(msg); exec(fn) e A.tentar devolvem { ok, msg }.
- FASE 3 ✅: viewFor(i) em visao.js é a ÚNICA saída do estado para outros jogadores (testada, com bateria de privacidade).
- FASE 4 ✅ (confirmar no quadro do plano): camada de comandos em comandos.js. Cmd.run(quem, nome, args) → { ok, msg }; lista permitida em Cmd.nomes (15 comandos); confere vez, fase do turno e argumentos; se EU != null e o remetente não é este aparelho, guarda e devolve a UI do anfitrião. Botões, janelas, zoom e bots já passam por ele.
- FASE 5 ✅: rede.js (criar, entrar, enviar, aoAcao, aoVisao, aoJogadores, aoMeta, darVisao, gravarEstado/lerEstado, definirEstado, sair, lerConvite, linkConvite; args/visao/estado gravados como texto JSON).
- Decisão do dono: o evento individual de um BOT é público (na vez do bot todos o veem). Falta só tornar o `ind` de jogadores bot público em viewFor (visao.js), na Fase 7.
- qa.html está adiado (o dono ajusta depois): não depende dele.

REGRAS DE TRABALHO
1. Uma FASE por conversa; ao fim de cada fase o jogo OFFLINE (passe o aparelho, com e sem bots) deve continuar funcionando igual. Entregue e espere meu OK.
2. Mudanças pequenas e localizadas, listadas por arquivo. Não reescreva o jogo. Entregue os arquivos inteiros alterados.
3. Mantenha o cabeçalho "FICHA TÉCNICA" de cada arquivo e atualize a Ficha e o plano.
4. Nada de bibliotecas pagas ou que peçam cartão. Antes de recomendar um serviço, CONFIRA os limites gratuitos atuais.
5. Informação secreta (mão, objetivo, estoque e dívida de outros, conforme sees()) NUNCA vai a quem não pode vê-la.
6. Preserve os ids e classes da tela (.nm e .bt do menu, #rq…, #rp…, #pr…, #fq…, etc., ver Ficha).
7. Toda ação de jogo passa por Cmd; não chame A.* de jogo direto. Se criar ação nova, acrescente a linha na tabela CMD.
8. Se rodar código para testar, teste em Node com os arquivos reais; diga claramente o que foi e o que não foi testado.

ROTEIRO (status no quadro do plano)
FASES 0 a 5 — FEITAS (a 4 aguarda minha conferência no navegador).
FASE 6 — Lobby. As telas 'criar' (código + formulário + "Jogadores conectados") e 'achar' (nome + código + Conectar) JÁ EXISTEM em menu.js, só com o aviso "em implementação": ligá-las à rede: gerar e mostrar o código, listar quem conectou, vagas de bot (fácil/normal), botão "Iniciar" (só o anfitrião), usando A.new({ nomes, bots, first }). Reatribuir idx ao iniciar; criar bots como `jogadores` com chave própria; ler Rede.convite na tela 'achar'. Buscar Partida e Tutorial continuam como aviso.
FASE 7 — Sincronização e vez. O anfitrião faz EU = seu idx, recebe cada Rede.aoAcao, valida e executa por Cmd.run (ignorando `id` repetido), e envia a cada jogador a sua viewFor(i). Clientes: S = visão, ligaUI(), EU = índice, render(). Trocar "Passe o dispositivo" por "Aguardando [jogador]" (no mesmo ponto do gancho do bot em tela.js). Só o anfitrião roda Bot.agenda() e grava o estado completo em localStorage. Z.up precisa esperar a resposta (assíncrona). Tornar público o `ind` de jogadores bot em viewFor.
FASE 8 — Janelas. Migrar janelas.js para me()/UI (hoje lê cur()). Mercado e Governo atuam só pelo jogador local (sem "atuar como" outros). Dev desligado no online. Ver jogador e zoom respeitam sees() e usam o jogador local. Remover a ponte ligaUI() quando janelas.js e qa.html usarem UI direto.
FASE 9 — Robustez e segurança. Desconexão e reconexão (uid novo), retomar a partida da sala, mensagens duplicadas ou fora de ordem, anfitrião que sai (os bots param), limpar salas antigas. Publicar as regras restritivas do Apêndice A e testá-las no Rules Playground.
FASE 10 — Testes. Roteiro com duas abas e depois dois aparelhos; conferência de que nenhuma informação secreta aparece nas mensagens.
FASE 11 — Publicação. Documentar o convite (?sala=CODIGO) e o que conferir (domínio autorizado no Firebase Authentication).
```

---

## Ordem sugerida
1. **Conferir a Fase 4 no navegador** (roteiro de 10 minutos na seção "Fase 4 entregue"). Se algo falhar, me avise antes de seguir.
2. **Fase 6 — Lobby** (conversa nova, com o PROMPT 3 e os arquivos da lista).
3. Fases 7, 8, 9, 10 e 11, uma por conversa.
4. Em qualquer momento, em conversa própria: **balanceamento com 2 jogadores** e o ajuste do `qa.html`.

---

## Apêndice A — Regras de segurança do Realtime Database (Fase 9)

> Nota da Fase 5: o `rede.js` grava exatamente esta estrutura. Só o **valor** de `args`, `visao/{uid}` e `estado` é um texto JSON. Nenhuma regra precisou mudar. As regras simples da Fase 5 (`/salas` legível e gravável por qualquer autenticado) NÃO protegem segredos.

**Estrutura de dados que estas regras assumem** (a Fase 5 deve gravar assim, ou as regras precisam ser ajustadas):

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
          "host": { ".validate": "newData.val() === auth.uid || newData.val() === data.val()" },
          "estado": { ".validate": "newData.isString() && newData.val().matches(/^(lobby|jogando|fim)$/)" },
          "vagas": { ".validate": "newData.isNumber() && newData.val() >= 2 && newData.val() <= 8" },
          "criadaEm": { ".validate": "newData.isNumber()" },
          "$outro": { ".validate": false }
        },
        "jogadores": {
          ".read": "auth != null",
          "$uid": {
            ".write": "auth != null && (root.child('salas/' + $sala + '/meta/host').val() === auth.uid || (auth.uid === $uid && (data.exists() || root.child('salas/' + $sala + '/meta/estado').val() === 'lobby')))",
            ".validate": "newData.hasChildren(['nome'])",
            "nome": { ".validate": "newData.isString() && newData.val().length >= 1 && newData.val().length <= 20" },
            "idx": { ".validate": "newData.isNumber()" },
            "online": { ".validate": "newData.isBoolean()" },
            "bot": { ".validate": "newData.isString() && newData.val().matches(/^(facil|normal)?$/)" },
            "$outro": { ".validate": false }
          }
        },
        "acoes": {
          ".read": "auth != null && root.child('salas/' + $sala + '/meta/host').val() === auth.uid",
          "$uid": {
            ".write": "auth != null && (auth.uid === $uid || root.child('salas/' + $sala + '/meta/host').val() === auth.uid)",
            "$id": {
              ".validate": "newData.hasChildren(['tipo', 'ts'])",
              "tipo": { ".validate": "newData.isString() && newData.val().length <= 30" },
              "args": { ".validate": true },
              "ts": { ".validate": "newData.isNumber()" },
              "$outro": { ".validate": false }
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
        }
      }
    }
  }
}
```

**O que estas regras garantem**
- Nada fora de `/salas/...` pode ser lido ou escrito. Ninguém consegue listar todas as salas; só entra quem sabe o código.
- Só quem está autenticado (login anônimo) acessa qualquer coisa.
- O primeiro a criar `meta` vira o anfitrião; ninguém "toma" a sala depois.
- Cada jogador só escreve a **própria** entrada em `jogadores/{uid}` e a **própria** caixa em `acoes/{uid}`.
- Só dá para entrar em uma sala nova durante o `lobby`. Depois que o jogo começa, só entra de novo quem já estava na lista (mesmo `uid`).
- **A visão de cada jogador só pode ser lida pelo próprio jogador**, e o estado completo só pelo anfitrião. É isso que impede um jogador de espiar a mão e o objetivo dos outros pela rede.

**O que elas NÃO garantem (limites conhecidos)**
- O anfitrião vê tudo e pode trapacear, como já decidido.
- Não limitam o número de jogadores por sala nem o tamanho de cada mensagem (as regras não medem tamanho). Mantenha as mensagens pequenas e apague a sala ao terminar.
- O `uid` anônimo muda se o jogador limpar os dados do navegador ou trocar de aparelho. Para voltar **durante o jogo** com um `uid` novo, o anfitrião precisa recriar `jogadores/{novoUid}` (ele tem permissão). Isso é parte da reconexão da Fase 9.
- Opcional e gratuito: no Google Cloud Console (APIs e serviços › Credenciais), restringir a chave de API do Firebase ao domínio do GitHub Pages. A chave não é segredo, mas a restrição reduz abuso.

**Como testar:** use o **Rules Playground** (aba Regras): simule leitura de `/salas/ABC123/estado` como um `uid` que não é o anfitrião (deve ser negada) e leitura de `/salas/ABC123/visao/{outroUid}` (deve ser negada).
