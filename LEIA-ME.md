# Mesa (M1 + M2) — arquivos para copiar por cima do jogo

Esta etapa parte da **sua pasta atual** (a do `TempoDeColheita.zip` + os arquivos do `loja_e_balanceamento.zip`). Copie todos os arquivos deste pacote para a pasta do jogo, **substituindo** os de mesmo nome. Antes, faça um commit (ou uma cópia) para poder voltar atrás.

## Arquivos
**Novos:** `mesa.js`, `teste_mesa.js`, `teste_editor_mesa.js`
**Alterados no jogo:** `visao.js` (números públicos), `pecas-tela.js`, `janelas.js`, `tela.js` (ganchos da mesa), `style.css` (bloco 12), `index.html` (`<script src="mesa.js">`), `online.js` (`VERSAO` = 2026-11-02a)
**Alterados por fusão:** `config.js` e `editor.html`. Eles reúnem **a sua rodada 3 de balanceamento (e `camposTrava`) + os padrões e a seção "Mesa"** (a rodada 3 tinha partido de versões sem a mesa). Não troque pelos antigos.
**Testes alterados:** `teste_comum.js` (carrega o `mesa.js`), `teste_fase7.js`, `teste_fase8.js`, `teste_fase9.js`, `teste_chat.js` (agora aceitam a mesa no lugar da tela de espera de texto).

## Depois de copiar
1. Abra o **`editor.html`** → "Abrir pasta do jogo" → **Salvar**. Isso grava `ASSETS.mesa` (e a regra `camposTrava`) no `cartas.js`. Na seção **Mesa** você escolhe fundo e versos dos baralhos (imagem vazia = cor).
2. Rode os testes (Node): `node teste_mesa.js`, `node teste_fase7.js`, `node teste_fase8.js`, `node teste_fase9.js`, `node teste_chat.js`, `node teste_loja.js`.
3. **Comece partida nova** e teste no celular (checklist em `PLANOS_PENDENTES.md`, item G).

## Observações
- `node teste_chat.js` com a variável `REGRAS=regras_firebase.json` falha 1 verificação genérica ("nenhuma operação negada"): isso **já acontecia antes** (o teste do chat tenta de propósito escrever mensagens proibidas). Não é da mesa.
- A mesa só existe no online e só quando você não está jogando. O jogo local não muda.
