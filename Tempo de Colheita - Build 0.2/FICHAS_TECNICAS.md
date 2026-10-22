# Tempo de Colheita — Fichas Técnicas dos Arquivos

Todos os arquivos ficam na MESMA pasta (junto com a pasta `img/`).
Para jogar: abra `index.html`. Para editar cartas: `editor.html`.

## Regra de ouro
Se for só mudar NÚMEROS e TEXTOS de cartas e regras → use o `editor.html` (não mexa em código).
Se algo "se comporta errado" → use a tabela "Onde mexer" no fim deste arquivo.

## Arquivos de dados (o que o jogo "sabe")
- **cartas.js** — O baralho: todos os objetivos, campos, cartas de recurso e eventos, mais preços, níveis e regras. É escrito pelo editor.html. Não edite à mão.
- **config.js** — Nomes das culturas, textos dos objetivos, valores padrão e a função que completa arquivos antigos.

## Páginas
- **index.html** — A página do jogo. Só lista quais arquivos carregar (a ORDEM importa, não mude).
- **editor.html** — O editor de cartas e regras (use no Chrome/Edge).
- **qa.html** — O robô de testes que joga sozinho e procura erros.

## Aparência
- **style.css** — Cuida só da aparência: cores, tamanhos, posição das cartas, abas laterais, mão, janelas, zoom e animação de melhoria. Não tem nenhuma regra do jogo.

## Arquivos do motor do jogo (na ordem em que carregam)
1. **estado.js** — Guarda as peças básicas: o estado da partida, as regras lidas do editor e o embaralhador.
2. **cartas-visual.js** — Aparência e textos das cartas: nome, descrição, preço, nível, imagem de dia/noite.
3. **consultas.js** — Perguntas rápidas: de quem é a vez, quem está vivo, comprar do baralho, se a carta cabe no campo, registro de eventos.
4. **objetivos.js** — Decide se um objetivo foi cumprido, se foi violado (eliminação) e quem vence a rodada.
5. **rodada.js** — A virada de rodada: evento geral, juros, ordem dos jogadores, reposição dos campos à venda.
6. **acoes-turno.js** — O fluxo da partida: novo jogo, continuar, sair, começar turno (produção e manutenção), encerrar turno.
7. **acoes-economia.js** — Dinheiro com o Governo: comprar campo, empréstimo, pagar dívida, carta extra, vender recursos.
8. **acoes-plantio.js** — Lavoura: escolher carta, plantar no campo, evoluir de nível.
9. **acoes-mercado.js** — Mercado entre jogadores: ofertar, cancelar, comprar e contar as negociações.
10. **dev.js** — Ferramentas de teste (painel Dev): dar moedas, cartas, forçar eventos.
11. **menu.js** — Tela inicial: número de jogadores, nomes, quem começa.
12. **pecas-tela.js** — Peças pequenas da tela: ícones de moeda/recurso, abas laterais, quem pode ver as informações de quem.
13. **janelas.js** — As janelas de pop-up: Governo, Mercado, Objetivo, Espiar, Ver jogador, Dev.
14. **tela.js** — Desenha a tela principal e ajusta o tamanho das cartas do centro.
15. **zoom.js** — Ampliar carta, janela do campo, animação de melhoria, cliques e tecla Esc.
16. **iniciar.js** — Liga o jogo (último a carregar).

## Onde mexer (guia rápido)
| Quero mudar... | Arquivo |
|---|---|
| Valores, preços, regras, sprites | editor.html |
| Texto de um tipo de objetivo | config.js |
| Condição para vencer um objetivo | objetivos.js |
| O que acontece na virada de rodada | rodada.js |
| Produção/manutenção no início do turno | acoes-turno.js |
| Empréstimo, juros pagos, venda ao Governo | acoes-economia.js |
| Plantar ou evoluir | acoes-plantio.js |
| Mercado entre jogadores | acoes-mercado.js |
| Cores, tamanhos e posições (visual) | style.css |
| Quais elementos aparecem na tela principal | tela.js |
| Janelas (Governo, Mercado...) | janelas.js |
| Zoom/animação de carta (lógica) | zoom.js |
| Duração da animação de melhoria | zoom.js (UPGRADE_MS) e style.css (2s nas animações) |
| Ferramentas de teste | dev.js |
