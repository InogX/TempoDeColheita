# Tempo de Colheita — Planos pendentes

**Situação:** o online está **finalizado (Fases 0 a 11), pendente testes do dono**. Este arquivo lista (1) o que falta **testar** e (2) o que falta **desenvolver**, com a complexidade de cada coisa, para decidirmos o que faz sentido começar.

**Como usar numa conversa nova:** envie este arquivo + `PLANO_MOBILE_BOT_ONLINE (finalizado - pendente testes).md` + `FICHAS_TECNICAS.md` + os arquivos que o item pede. Uma etapa por conversa.

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
| A | **Balanceamento com 2 jogadores** | Regras / design | **Média** (1ª rodada **feita**: medida e proposta, falta aprovar/jogar) | `cartas.js`, `config.js`, `objetivos.js`, `rodada.js`, `cartas-visual.js`, `bot.js`, `comandos.js`, `acoes-*.js`, `estado.js`, `consultas.js` | Não (o dono já aprovou) |
| B | **VFX** (efeitos visuais) | Visual | **Baixa a média** | `zoom.js`, `style.css`, `cartas-visual.js` | Não |
| C | **Tutorial** | Conteúdo + tela | **Baixa (texto) a alta (guiado)** | depende do formato; `menu.js`, `tela.js`, `style.css` | Não |
| D | **`qa.html`** | Ferramenta do dono | **Baixa a média** | o próprio `qa.html` + os arquivos atuais | Não (adiado pelo dono) |
| E | **Buscar Partida** | Online / social | **Alta** | `rede.js`, `lobby.js`, `menu.js`, regras do banco | Não |

### A. Balanceamento com 2 jogadores — **1ª rodada feita** (ver `RELATORIO_BALANCEAMENTO.md`)
- **Feito:** causa confirmada (dinheiro total fixo = 1500 × nº de jogadores); metas em moedas passam a escalar com isso; 14 números ajustados; verificação com os arquivos reais (900 partidas de bots, 0 erros). Objetivos de dinheiro passaram de "impossíveis" para ~19–22 rodadas.
- **Falta (dono):** trocar os 3 arquivos (`cartas.js`, `cartas-visual.js`, `objetivos.js`), **jogar** algumas partidas de 2 jogadores e dizer se o ritmo agradou; conferir o `editor.html` (ele reescreve o `cartas.js`).
- **Sub-itens que sobraram (cada um é pequeno e independente):**
  - **A2. Melhorar o bot no `allLvl`** (um plantio por campo de 2+ vagas; evoluir primeiro os plantios mais baixos). *Baixa a média*; mexe só no `bot.js`.
  - **A3. `mAll`/`mSellTo` em 2 jogadores** (viram "1 negociação", 77–92% de vitórias): exige decisão de regra/código. *Baixa a média.*
  - **A4. `lvl3n`/`lvl3crops` (~20%):** têm piso de ~27 rodadas; precisa de decisão de design (são "objetivos de fim de partida"?). *Média.*
  - **A5. Balancear 3 a 5 jogadores:** nova rodada de medição por tamanho (o valor base de 5+ ainda é lento: `coins`, `clean`, `noLoan` ~0% com 5). *Média.*
  - **A6. Concentração de dinheiro / cofre que zera:** característica da economia fechada; só olhar se as partidas parecerem "decididas cedo". *Média a alta (mexe na economia).*
- **Ferramentas:** `balanceamento_medicao.zip` (medir de novo depois de qualquer mudança).

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

---

## 3. Ideias menores e opcionais (só se fizerem falta)
- **Ajuste do zoom no iPhone** nos campos de número: só se o teste mostrar o problema; precisa do `style.css`. *Baixa.*
- **Menos consumo de download:** hoje cada ação reenvia a visão inteira a todos os humanos. Só vale se a medida real mostrar problema; não parece ser o caso. *Baixa a média.*
- **Aviso de versão já na entrada da sala** (hoje é na primeira visão depois do início): exigiria mudar as regras do banco. *Baixa, mas mexe nas regras.*
- ~~**`rodar_todos.js`** que roda todos os testes de uma vez~~ ✅ feito: os testes agora vêm num pacote único (`testes_tempo_de_colheita.zip`).

---

## 4. Ordem que eu sugeriria (é uma sugestão, a decisão é sua)
1. **Sessão 1 de testes** (segurança, 15 min) antes de divulgar.
2. **A. Balanceamento** (já aprovado, afeta a qualidade do jogo em si).
3. **B. VFX** (baixo risco, dá resultado visível rápido) e **C. Tutorial** em formato simples.
4. **D. `qa.html`** quando você quiser retomar.
5. **E. Buscar Partida**: só se o jogo ganhar público; hoje o convite por link cumpre o papel.

A **Sessão 2** de testes pode acontecer a qualquer momento, em paralelo a qualquer item acima.
