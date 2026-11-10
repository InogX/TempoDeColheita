# Tempo de Colheita — Planos pendentes

**Situação:** o online está **finalizado (Fases 0 a 11), pendente testes do dono**. Este arquivo lista (1) o que falta **testar** e (2) o que falta **desenvolver**, com a complexidade de cada coisa, para decidirmos o que faz sentido começar.

**Como usar numa conversa nova:** envie este arquivo + `PLANO_MOBILE_BOT_ONLINE (finalizado - pendente testes).md` + `FICHAS_TECNICAS.md` + os arquivos que o item pede (ver a **seção 5**, com a lista por item). Uma etapa por conversa.

**Escala de complexidade** (estimativa minha; onde eu ainda não vi os arquivos, está dito):
- **Baixa:** uma conversa curta, poucos arquivos, poucas decisões.
- **Média:** uma conversa inteira, vários arquivos ou várias idas e vindas com o dono.
- **Alta:** mais de uma conversa, ou mexe nas regras do banco / em decisões grandes de design.

---

## 1. Testes pendentes (tudo com o dono), por prioridade

### Sessão 1 — só no PC, ~15 min — **antes de divulgar para desconhecidos** (prioridade 1: segurança)
- [ ] **Rules Playground:** as 17 simulações do Bloco 1b do `ROTEIRO_FASE10.md` (quem lê/grava o quê). É a prova de verdade das regras; só foram testadas no meu interpretador simplificado.
- [ ] **Restringir a chave de API ao domínio** (`PUBLICACAO_FASE11.md`, seção 2.2) e testar em aba anônima (criar sala e entrar com outro aparelho). Se quebrar o login, desfaça a restrição.
- [ ] Conferir: regras publicadas **fora do modo de teste**, **Enforce HTTPS** ligado no GitHub Pages, nada de Blaze/Upgrade (seções 2.3 a 2.5).

### Sessão 2 — **uma partida longa só**, com tudo dentro (prioridade 2)
Junta num mesmo jogo: partida longa, consumo, sala lotada e as pendências menores. Pode ser dividida em duas conversas de jogo (2A: rodadas 1 a 7; 2B: segue até 20+).

**Montagem:** sala de **8 vagas**. Se tiver 5 aparelhos, use 5 humanos + 3 bots (os bots contam como vaga; é o mais perto de "sala lotada" que dá sem 8 aparelhos). Um dos aparelhos deve ser o **iPhone**, outro o **Android** e o anfitrião no **PC**. Jogue **20 rodadas ou mais**.

**Antes de começar:** anote *Download* e *Armazenamento* na aba **Uso** (Realtime Database).

**Durante a partida (nesta ordem; aproveite o jogo normal, não precisa parar tudo):**
1. **Rodada 1 a 3 — pendências de jogada (convidado):**
   - [ ] **Toque duplo:** na sua vez, dois toques rápidos em "Comprar campo" → compra **uma** só.
   - [ ] **Recusa que só o anfitrião sabe:** Mercado › vender **mais** do que tem → aparece o motivo, nada muda. Depois tente comprar uma oferta mais cara que suas moedas → "Moedas insuficientes".
   - [ ] **Melhorar plantio como convidado:** quando tiver recursos, abra o campo › Melhorar. A animação só toca **depois** da resposta; se recusar, o campo reabre com o aviso.
2. **Qualquer rodada — Mercado e teclado (celular e iPhone):**
   - [ ] Fora da sua vez, abra o Mercado, digite quantidade e preço, e **espere o outro jogar**: o texto não some, a janela não volta ao topo, o teclado não fecha. Repita com o Mercado aberto na vez do bot.
   - [ ] **iPhone:** ao tocar nos campos de número, a página **não dá zoom** estranho. (Se der, me avise: é um caso comum do Safari, correção pequena.)
3. **Quando sair:**
   - [ ] **Espiar:** se o seu evento individual for "espiar", só você vê "Escolha quem espiar"; depois vê o espiado e isso some no fim do turno. *Se não sair em 20 rodadas, marque "não saiu".*
4. **Perto da rodada 10:** anote a aba **Uso** (consumo parcial).
5. **Meio da partida — outro navegador/aparelho:**
   - [ ] Um convidado sai (ou fecha o navegador) e tenta voltar pelo código **em outro navegador**. Esperado: como o login anônimo fica guardado no navegador, **não volta à partida em andamento** (um bot assumiu a vaga). Anote a mensagem que aparecer.
6. **Ao final (partida acabando):**
   - [ ] Aba **Uso** de novo. Anote: rodadas jogadas, aparelhos humanos, duração, download total. **(Depois − Antes) ÷ rodadas = download por rodada**; ÷ nº de convidados = por jogador.
   - [ ] **Armazenamento volta a quase zero** (a sala é apagada ao sair) e a sala sumiu do console.
   - [ ] Nenhuma mensagem "sem permissão" durante a partida.
7. **Depois de sair (2 min):**
   - [ ] **Limpeza de salas:** crie e feche 2 salas de teste e crie uma terceira. No console só devem sobrar as salas vivas.

**Já medido (para comparar):** sala de 5 aparelhos, 7 rodadas = 4,41 MB de download (≈ 630 KB por rodada na sala toda); armazenamento 11,27 KB. Com 360 MB/dia, cabem dezenas de partidas assim.

### Sem urgência / só se aparecer
- Sala de **8 aparelhos humanos** de verdade (não dá para simular com abas do mesmo navegador: elas compartilham o mesmo login).
- Se algum teste acima falhar: me mande o passo, o aparelho e o que apareceu (print ajuda), e eu corrijo em mudança pequena.

---

## 2. O que falta desenvolver

| # | Item | Categoria | Complexidade | Precisa de | Trava algo? |
|---|---|---|---|---|---|
| A | **Balanceamento** (2 jogadores feito; 3 a 6+ pendente) | Regras / design | **Média** (2 rodadas **feitas**; falta o dono jogar) | `cartas.js`, `config.js`, `objetivos.js`, `rodada.js`, `cartas-visual.js`, `bot.js`, `comandos.js`, `acoes-*.js`, `estado.js`, `consultas.js` | Não (o dono já aprovou) |
| B | **VFX** (efeitos visuais) | Visual | **Baixa a média** | `zoom.js`, `style.css`, `cartas-visual.js` | Não |
| C | **Tutorial** | Conteúdo + tela | **Baixa (texto) a alta (guiado)** | depende do formato; `menu.js`, `tela.js`, `style.css` | Não |
| D | **`qa.html`** | Ferramenta do dono | **Baixa a média** | o próprio `qa.html` + os arquivos atuais | Não (adiado pelo dono) |
| E | **Buscar Partida** | Online / social | **Alta** | `rede.js`, `lobby.js`, `menu.js`, regras do banco | Não |
| G | **Mesa (visão superior), Chat e Botão de Objetivo** (plano próprio) | Visual / online | **M1 e M2 feitos; M3 alta, M4 média, M5 média (opcional)** | `mesa.js`, `tela.js`, `visao.js`, `style.css`, `zoom.js`, `janelas.js`, `pecas-tela.js` + `PLANO_DESENVOLVIMENTO_MESA` | Não |
| F ✅ | **Loja de campos por jogador, muda a cada turno (com trava)** | Regras / design | **Média** (mexe em regra, comandos, bot e tela; sem mexer nas regras do banco, a confirmar) | `rodada.js`, `acoes-economia.js`, `comandos.js`, `visao.js`, `tela.js`, `bot.js`, `consultas.js`, `acoes-turno.js`, `style.css`, `online.js` | Não, mas **afeta o balanceamento (A)**: decidir antes de medir de novo |

### A. Balanceamento — **3 rodadas feitas** (ver `RELATORIO_BALANCEAMENTO.md`, seção "Rodada 3")
- **Feito (rodada 3, já com a loja por jogador):** recoloquei duas correções que faltavam no jogo (`allLvl` texto e bot); calibrei 2 a 6 jogadores; números novos no `cartas.js`; metas de moedas por tabela (`FMOEDA`), `floorUntil` e metas de construção por tamanho. Verificação com os arquivos reais: 0 erros de 2 a 10 jogadores; `teste_loja.js` 98 de 98.
- **Falta (dono):** trocar os arquivos (`cartas.js`, `cartas-visual.js`, `objetivos.js`, `rodada.js`, `bot.js`, `config.js` + os do item F), **começar partida nova**, jogar de 2 e de 4 a 6 jogadores e dizer se o ritmo agradou.
- **Sub-itens que sobraram:**
  - **A3. `lvl3crops` (0 a 9%):** mediana isolada 26 rodadas; decidir se vira objetivo de partida longa, se muda a regra ou se é aliviado. *Média.*
  - **A4. Mercado (`mSales`, `mUnits`, `mAll`, `mSellTo`):** inflados por bots; esperar o teste com humanos ou desligar com `minJ` 99. *Baixa.*
  - **A5. Partidas de 5 a 6+ jogadores:** objetivos de construção com 5 a 8% (a partida acaba em ~13 rodadas). Medir de novo depois de jogar. *Média.*
  - **A6. Concentração de dinheiro:** só olhar se as partidas parecerem "decididas cedo". *Média a alta.*
- **Ferramentas:** `balanceamento_medicao.zip` (agora com `solo_nx.js`, que escolhe o tamanho da partida; sem o `dev.js`, crie um arquivo vazio com esse nome).

### B. VFX — complexidade **baixa a média**
- **O que é:** efeitos visuais. Já existe um **gancho vazio** `Z.fx(el)` no `zoom.js` para a animação de melhoria (a animação em si já existe).
- **Baixa** se for só CSS/animações simples em pontos já conhecidos (melhoria de carta, plantio, compra).
- **Média** se quiser efeitos em vários momentos (produção, vitória, eventos) ou partículas. Sem bibliotecas pagas; o que usar precisa rodar bem no celular.
- **Falta saber:** quais efeitos e em quais momentos. Não vi `style.css` nem `cartas-visual.js`.
- **Risco:** desempenho em celular fraco; animação não pode atrapalhar o redesenho online (a tela é redesenhada a cada visão).

### C. Tutorial — complexidade **baixa a alta, conforme o formato**
- **Baixa:** tela de texto/ilustrações com as regras (o menu já tem o botão "Tutorial (em breve)").
- **Média:** partida local guiada com mensagens por cima do jogo e um bot parado/previsível.
- **Alta:** tutorial interativo que bloqueia botões e confere cada passo.
- **Falta decidir (dono):** formato e conteúdo. O texto das regras é seu, eu só posso escrever com base no que você aprovar.
- **Vantagem:** não mexe em rede nem em regras do banco, só em tela.

### D. `qa.html` — complexidade **baixa a média**
- **Situação:** adiado pelo dono (ele ajusta). Avisos já no plano: `menu()` agora abre o menu principal; recusas antes silenciosas agora chamam `alert`; o QA chama `A.*` direto, então **não testa a camada de comandos**.
- **Para eu ajudar:** enviar o `qa.html` atual. Não vi o arquivo, por isso a estimativa é aproximada.
- **Observação:** os testes em Node (Fases 4, 7, 8, 9 e 10) cobrem boa parte do que o QA cobriria; o `qa.html` é útil mesmo para **você** testar no navegador sem Node.

### E. Buscar Partida — complexidade **alta**
- **O que é:** achar partida sem digitar código (lista de salas abertas ou fila).
- **Por que é alta:**
  - As regras atuais **proíbem listar** `/salas` (de propósito, por privacidade). Para listar seria preciso um nó novo (ex.: `publicas`) com **regras novas**, que você teria de publicar e eu testar no Playground.
  - Sem servidor (plano gratuito, sem Functions), a lista fica com **salas fantasma** (anfitrião some e a sala continua na lista): é preciso limpeza e verificação de "online".
  - **Estranhos jogando juntos:** nomes livres, ninguém modera. É decisão de produto e de segurança.
  - Mais conexões simultâneas e mais download (limites do Spark: 100 conexões, 360 MB/dia).
- **Alternativa mais barata:** continuar só com código e link (já funciona e é o que o jogo foi desenhado para fazer).

### F. Loja de campos por jogador, sorteada a cada turno, com trava — ✅ **código pronto e testado em Node; falta o dono jogar**
- **Decisão do dono:** cada jogador tem a **sua loja** (visível só para ele), sorteada de novo no início de cada turno dele, para um jogador nunca impedir a compra de outro. O centro compartilhado deixou de existir.
- **Trava:** um botão 🔓/🔒 sob cada campo. O campo travado continua na loja do jogador **no turno seguinte** (e destrava sozinho; para guardar de novo é preciso travar outra vez). Comprar o campo tira a trava. Por padrão pode-se travar **1** campo; no `editor.html` há "Campos que o jogador pode travar" (0 = sem trava; número igual ao tamanho da loja = trava tudo). Tamanho da loja = o maior entre "mínimo" e "máximo" de campos à venda. A opção antiga "Reposição dos campos à venda (turno/rodada)" saiu do editor (não faz mais sentido).
- **Bot:** compra da própria loja como antes e **trava** o campo que quer e não consegue pagar agora (ou que não pode comprar mais neste turno); o nível fácil só às vezes.
- **Arquivos mudados:** `consultas.js` (`lojaTam`, `travaMax`, `lojaDe`, `travados`, `novaLoja`), `acoes-turno.js`, `acoes-economia.js` (`buyF` da loja, `A.trava`), `comandos.js` (comando `trava`; agora são 16), `visao.js`, `tela.js`, `style.css`, `bot.js`, `config.js`, `editor.html`, `online.js` (`VERSAO` = `2026-10-31a`), `teste_fase4.js` (15 → 16 comandos) e **novo** `teste_loja.js`. Regras do banco: **não mudaram** (o tipo de ação é só um texto de até 30 caracteres).
- **Testes feitos aqui:** `teste_loja.js` 98 de 98 (cada jogador tem a sua loja, compra, trava e destrava, limite, trava desligada ou com 2, volta no turno seguinte, privacidade da visão, save antigo, 30 partidas só de bots sem erro). O `teste_fase4.js` completo **não rodei** (faltaram `acoes-plantio.js` e `acoes-mercado.js`): rode `node teste_fase4.js` e `node teste_loja.js` na sua pasta.
- **Falta (dono):** trocar os arquivos, **começar partida nova** (saves e salas antigas têm o centro velho), jogar local e online e dizer se o ritmo e a trava agradaram.
- **Pontas soltas (não travam nada):** (1) `rodada.js` ainda chama `refillCenter`, que enche um `S.center` que ninguém mais usa; inofensivo, mas quando enviar o `rodada.js` eu limpo. (2) `qa.html` e `dev.js`, se mexerem em `S.center`, precisam apontar para `p.loja`. (3) Online: a janela "Ver jogador" não mostra a loja dos outros (de propósito).

---

### G. Mesa (visão superior), Chat e Botão de Objetivo — plano próprio (`Plano de Desenvolvimento Mesa, Chat e Botão de Objetivo`) — ✅ **M1 e M2 prontos e testados em Node; falta o dono testar no celular**
- **Feito:** Chat (Fase 12) ✅; botão 🎯 Objetivo (online) ✅; protótipo v2 ✅; **M1** números públicos na visão (cartas na mão, vagas usadas por campo, cartas em cada baralho) ✅; **M2** a mesa no lugar da tela de espera e da vez do bot ✅; **Editor** controla fundo e versos dos baralhos (seção Mesa) ✅. `teste_mesa.js` 60/60; a bateria completa continua verde. Sabotei a visão (vazando moedas e loja) e o teste pegou.
- **Decisões do dono:** campos dos outros mostram usados/vagas; cartas na mão de todos são públicas; com "ver tudo" aparece também o plantado; centro = a SUA loja.
- **Falta (dono):** trocar os arquivos, **abrir o Editor e clicar em Salvar** (grava `ASSETS.mesa` e `camposTrava` no `cartas.js`), e **testar no celular** (em pé e deitado, Android e iPhone): legibilidade das zonas, 5 a 10 jogadores, o Mercado e o chat com a cena girada (teclado), tocar numa zona, o painel 📜 e o ⚙ (desligar a rotação ou a mesa).
- **Teste no celular (feito pelo dono, Blocos 0 a 4) e correções:** o dono apontou (1) proporção das imagens, (2) centro desproporcional com a loja, (3) no PC a área de compra descendo até ficar inacessível, (4) com o celular virado a loja cortada e tamanho mínimo. **Corrigido** com o palco de proporção fixa 2:1 e o centro que se adapta à altura (verificado em 140 combinações de tela, jogadores e campos, 0 problemas). **Falta o dono rever no aparelho** as mesmas telas.
- **Riscos que só o celular mostra:** teclado do Mercado/chat com a cena girada 90°; iPhone anterior ao iOS 16 não entende `cqw`; zona com muitos campos (mostra 12 e "+N"); o botão 💬 do chat fica fixo no canto da tela e pode cobrir parte da mesa; faixa de segurança (notch) ainda não tratada (M4).
- **Ainda não feito:** **M3** mesa na sua vez (mão embaixo, compra da loja, plantar, Governo, Encerrar turno: reaproveita `Cmd` e `Z`; complexidade *alta*); **M4** ergonomia no celular (miniaturas, áreas seguras, alvos de toque, movimento reduzido; *média*); **M5** animações (*média, opcional*; cobre parte do VFX do item B).
- **Cuidado:** muitos arquivos mudaram, então o `VERSAO` do `online.js` foi para `2026-11-02a`. Não publicar com partida em andamento.

## 3. Ideias menores e opcionais (só se fizerem falta)
- **Ajuste do zoom no iPhone** nos campos de número: só se o teste mostrar o problema; precisa do `style.css`. *Baixa.*
- **Menos consumo de download:** hoje cada ação reenvia a visão inteira a todos os humanos. Só vale se a medida real mostrar problema; não parece ser o caso. *Baixa a média.*
- **Aviso de versão já na entrada da sala** (hoje é na primeira visão depois do início): exigiria mudar as regras do banco. *Baixa, mas mexe nas regras.*
- ~~**`rodar_todos.js`** que roda todos os testes de uma vez~~ ✅ feito: os testes agora vêm num pacote único (`testes_tempo_de_colheita.zip`).

---

## 4. Ordem por prioridade estratégica (é uma sugestão, a decisão é sua)

| Ordem | Item | Por quê nessa posição |
|---|---|---|
| 1 | **Sessão 1 de testes** (segurança, ~15 min) | Barata e é pré-requisito para divulgar a desconhecidos: regras do banco, chave de API, HTTPS. Nada mais vale se isso estiver aberto. |
| 2 | **F. Campos do centro mudam a cada turno** | É uma mudança de **regra central**. Quanto antes decidir, menos retrabalho: ela afeta o balanceamento, o bot, o tutorial e os testes. |
| 3 | **A. Balanceamento** (trocar os 5 arquivos, jogar 2 jogadores e uma de 6, depois A5/A3/A4) | Define a qualidade do jogo em si. Só faz sentido medir **depois do F**. |
| 4 | **Sessão 2 de testes** (partida longa, consumo, sala lotada) | Vale mais feita **na versão final de regras** (com F e A): uma partida só cobre tudo. Se quiser divulgar antes, pode fazer já e repetir depois. |
| 4b | **G. Mesa: testar M1 e M2 no celular**, depois M3 | É o que o dono mais quer ver no jogo e já está pronto; testar no celular antes de começar o M3 evita refazer a mesa na sua vez. |
| 5 | **C. Tutorial** (começar pelo formato simples, de texto) | Ensina as regras, então só depois de F e A estabilizarem. É o que mais ajuda quem chega sem conhecer ninguém. |
| 6 | **B. VFX** | Baixo risco e resultado visível, mas é acabamento: não muda se o jogo é bom ou não. |
| 7 | **D. `qa.html`** | Rede de segurança para regras; mais útil depois que as regras pararem de mudar. Pode subir de posição se você quiser testar F e A sem Node. |
| 8 | **E. Buscar Partida** | O mais caro e arriscado (regras do banco, salas fantasma, estranhos jogando juntos). Só se o jogo ganhar público; o convite por link cumpre o papel hoje. |

A **Sessão 2** pode acontecer a qualquer momento, em paralelo.

---

## 5. Arquivos para enviar em cada item

**Sempre enviar (em toda conversa):** `PLANOS_PENDENTES.md` (este), `PLANO_MOBILE_BOT_ONLINE (finalizado - pendente testes).md` e `FICHAS_TECNICAS.md`.

| Item | Arquivos extras |
|---|---|
| **Sessão 1** (segurança) | `ROTEIRO_FASE10.md`, `PUBLICACAO_FASE11.md`. Só se algo falhar: `regras_firebase.json` e `teste_regras.js`. |
| **F. Centro que muda com trava** | `rodada.js` (renovação), `acoes-turno.js` (começar/encerrar turno), `acoes-economia.js` (comprar campo), `comandos.js` (comando novo da trava), `consultas.js`, `visao.js` (campo `travado`), `tela.js` (cadeado e botão), `bot.js` (quando travar), `style.css`, `online.js` (`VERSAO`), `estado.js`. Para o número de travas/custo editável: `config.js`, `cartas.js`, `editor.html`. Para conferir as regras do banco: `regras_firebase.json`. Testes: `teste_fase4.js`. |
| **A. Balanceamento** | `RELATORIO_BALANCEAMENTO.md`, `balanceamento_medicao.zip`, `cartas.js`, `config.js`, `objetivos.js`, `rodada.js`, `cartas-visual.js`, `bot.js`, `comandos.js`, `acoes-turno.js`, `acoes-economia.js`, `acoes-plantio.js`, `acoes-mercado.js`, `estado.js`, `consultas.js`, `editor.html`, `online.js` (para mudar o `VERSAO` ao publicar). Se o F já foi feito, envie as versões novas desses arquivos. |
| **Sessão 2** (partida longa) | Nenhum arquivo. Leve a anotação da aba **Uso** antes/depois e prints dos problemas. Se algo falhar, aí envie o que o item pedir: `online.js`, `tela.js`, `janelas.js`, `style.css` (Mercado/teclado), `zoom.js` (melhorar plantio). |
| **C. Tutorial** | **Formato texto:** `menu.js`, `style.css`, `index.html` (se criar arquivo novo) e o **texto das regras aprovado por você**. **Guiado:** além disso `tela.js`, `acoes-turno.js`, `comandos.js`, `bot.js`, `estado.js`, `config.js`, `cartas.js`. **Interativo com bloqueio de botões:** acrescente `janelas.js` e `zoom.js`. |
| **B. VFX** | `zoom.js` (gancho `Z.fx`), `style.css`, `cartas-visual.js`, `tela.js`. Para efeitos de produção/vitória/eventos: `rodada.js`, `acoes-turno.js`. Para conferir o redesenho online: `online.js`. |
| **D. `qa.html`** | `qa.html` (atual), `acoes-turno.js`, `acoes-economia.js`, `acoes-plantio.js`, `acoes-mercado.js`, `comandos.js`, `estado.js`, `menu.js`, e o pacote `testes_tempo_de_colheita.zip` para comparar. |
| **E. Buscar Partida** | `rede.js`, `lobby.js`, `menu.js`, `online.js`, `chat.js` (moderação), `regras_firebase.json`, `teste_regras.js`, `PUBLICACAO_FASE11.md`, `style.css`. |
| **G. Mesa (M3 em diante)** | `mesa.js`, `tela.js`, `zoom.js`, `janelas.js`, `visao.js`, `pecas-tela.js`, `bot.js`, `online.js`, `style.css`, `cartas-visual.js`, `config.js`, `editor.html`, `teste_comum.js`, `teste_mesa.js` e o resultado do teste no celular (prints). |
