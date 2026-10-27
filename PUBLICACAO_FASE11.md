# Publicação — Tempo de Colheita online (Fase 11)

Situação: o jogo já está no GitHub Pages (`inogx.github.io`) e o domínio já está autorizado no Firebase Authentication (confirmado por você em captura de tela). Este guia documenta o convite e o que conferir antes de divulgar para mais gente.

> Os testes manuais da Fase 10 (`ROTEIRO_FASE10.md`) continuam **pendentes**. Recomendo fazer pelo menos o **Bloco 1 (privacidade)** antes de divulgar o link para desconhecidos.

---

## 1. Como o convite funciona (confirmado no código do `rede.js`)

- **Link de convite:** `https://inogx.github.io/SEU-REPOSITORIO/?sala=CODIGO`. O jogo monta o link sozinho a partir do endereço da própria página (sem `?` nem `#` antigos) e acrescenta `?sala=` + o código.
- **Código:** 6 letras e números (as regras do banco aceitam de 4 a 8), gerado sem `0`, `O`, `1`, `I` e `L` (evita confusão ao ditar). Maiúsculas e minúsculas tanto faz: o jogo normaliza.
- **Quem abre o link:** cai direto na tela **Achar Sala** com o código já preenchido; só precisa digitar o nome e tocar em **Conectar**.
- **Botões na sala de espera do anfitrião:** *Copiar código*, *Copiar link de convite* e, em celulares que suportam, *Compartilhar convite* (abre WhatsApp etc.).
- **Sem o link:** *Jogar Online › Achar Sala*, digitar nome e código.
- **Voltar a uma partida:** quem caiu, recarregou ou fechou a página volta com o mesmo link ou código, **no mesmo navegador/aparelho** (o login é anônimo e guardado no navegador: limpar os dados do navegador ou trocar de aparelho impede de voltar a uma partida em andamento; só entra em sala nova).
- **Anfitrião que recarregou (F5):** abre *Achar Sala* com o mesmo nome e código e a partida é retomada.
- O link só funciona enquanto a sala existe. Quando o anfitrião usa **Sair/Fechar sala**, ela é apagada.

---

## 2. O que conferir antes de divulgar

### 2.1 Domínio autorizado (Firebase Authentication) — ✅ já feito
*Authentication › Configurações › Domínios autorizados* deve conter `inogx.github.io` (sem `https://`, sem barra). Se um dia mudar de conta ou criar domínio próprio, adicione o novo domínio aqui, senão o login anônimo falha.

### 2.2 Restringir a chave de API ao domínio (recomendado, gratuito)
A chave que está no `rede.js` **não é segredo** (toda chave de app web do Firebase fica visível no navegador). Quem protege os dados são as **regras do banco**, já publicadas. A restrição só reduz o risco de alguém usar a chave em outro site.

1. Abra o **Google Cloud Console › APIs e serviços › Credenciais**, no projeto `tempodecolheita`.
2. Em *Chaves de API*, abra a chave do app web (costuma se chamar **"Browser key (auto created by Firebase)"**; confira que é a mesma que aparece no `rede.js`).
3. *Restrições de aplicativos* → **Referenciadores HTTP (sites)** → adicionar:
   - `https://inogx.github.io/*`
   - `https://tempodecolheita.firebaseapp.com/*` (inofensivo e útil para o login)
   - *(só se for testar no PC)* `http://localhost/*` e `http://127.0.0.1/*` — remova depois se não usar.
4. **Salvar.** Pode levar alguns minutos para valer.
5. **Teste imediatamente:** abra o jogo no GitHub Pages em uma aba anônima, crie uma sala e entre com outro aparelho. Se aparecer erro de login/permissão, **desfaça a restrição** (volte para "Nenhuma") e me diga a mensagem.
6. *(Opcional, mais avançado)* *Restrições de API › Restringir chave*: marque só o que o jogo usa (**Identity Toolkit API** e **Token Service API**, usadas pelo login anônimo). Se restringir e algo quebrar, volte a "Não restringir". **Não consegui confirmar na documentação atual se o Realtime Database exige outra API na lista**, então este passo é opcional: a restrição por referenciador (passo 3) já é o ganho principal.

### 2.3 Regras do banco — ✅ publicadas
Conferir que o texto publicado em *Realtime Database › Regras* é o de `regras_firebase.json` e que **não** está em "modo de teste" (o modo de teste expira). A conferência de privacidade no Rules Playground está no Bloco 1 do roteiro.

### 2.4 Nunca clicar em Upgrade / Blaze
Spark = sem cartão = sem cobrança. Limites do Realtime Database no Spark (conferidos em 26/10/2026 em firebase.google.com/pricing): 100 conexões simultâneas, 1 GB armazenado, 360 MB/dia de download (≈ 10 GB/mês). **Reconfira antes de divulgar para muita gente** e acompanhe a aba *Uso*. Não ative Cloud Storage, Functions, App Hosting nem Firebase Hosting.

### 2.5 HTTPS
Em *GitHub › Settings › Pages*, deixe **Enforce HTTPS** marcado (o login e o banco exigem HTTPS).

---

## 3. O que publicar no repositório

- **Publicar (tudo que o `index.html` carrega):** `index.html`, `style.css`, `cartas.js`, `config.js`, `estado.js`, `cartas-visual.js`, `consultas.js`, `objetivos.js`, `rodada.js`, `acoes-turno.js`, `acoes-economia.js`, `acoes-plantio.js`, `acoes-mercado.js`, `comandos.js`, `bot.js`, `rede.js`, `dev.js`, `menu.js`, `lobby.js`, `pecas-tela.js`, `visao.js`, `janelas.js`, `tela.js`, `zoom.js`, `online.js`, `iniciar.js` (+ as imagens/ícones que o jogo usa).
- **Não precisa publicar:** os `teste_*.js`, `regras_*.json`, `.md` do plano e da Ficha, `qa.html`, `editor.html`. Não guardam segredo, mas só deixam o site mais confuso; se ficarem no repositório público, qualquer um os lê.
- **Nunca publique** chave de conta de serviço (arquivo `.json` baixado do Google Cloud). O jogo não usa nenhuma.

---

## 4. Atualizar o jogo (versão e salas em andamento)

O jogo tem um **número de versão** (`VERSAO` no início do objeto `Online`, no arquivo `online.js`, hoje `'2026-10-26a'`). Ele aparece em letras pequenas no menu principal. O anfitrião envia a versão dele junto com o jogo e, se a do convidado for diferente, o convidado recebe **um aviso** pedindo para recarregar a página. Ninguém é expulso. A checagem acontece na **primeira atualização do jogo depois do início da partida** (não na entrada da sala, porque isso exigiria mudar as regras do banco).

**Ao publicar uma mudança:**
1. **Mude o número `VERSAO` em `online.js`** (por exemplo, `'2026-10-30a'`; na segunda do mesmo dia, `'2026-10-30b'`). Sem isso, o aviso não funciona.
2. **Não publique enquanto houver partida em andamento.** O navegador e o GitHub Pages guardam arquivos em cache por alguns minutos, então anfitrião e convidado podem ficar em versões diferentes.
3. Depois de publicar, espere uns minutos e peça a **todos** para recarregar com força (PC: Ctrl+F5; celular: fechar e abrir o navegador, ou limpar o cache do site). Confira no menu principal que o número é o novo.
4. Só então criem uma sala nova.

---

## 5. Lista final antes de divulgar

- [ ] Bloco 1 do roteiro (privacidade/Rules Playground) feito e OK.
- [ ] Número `VERSAO` (online.js) mudado para esta publicação e conferido no menu principal do site.
- [ ] Domínio `inogx.github.io` autorizado (✅).
- [ ] Chave de API restrita por referenciador **e testada** em aba anônima (2.2).
- [ ] Regras restritivas publicadas, fora do modo de teste (✅).
- [ ] Spark, sem cartão; nada de Blaze/Upgrade (✅).
- [ ] Enforce HTTPS ligado.
- [ ] Jogo local (passe o aparelho, com e sem bots) abre e joga no celular.
- [ ] Link `?sala=CODIGO` testado em um aparelho diferente do anfitrião (✅ já confirmado por você).
- [ ] Você sabe onde ver o consumo (*Realtime Database › Uso*) e o limite de 360 MB/dia.
