// ===== FICHA TÉCNICA =====
// iniciar.js: Liga o jogo. Roda por último. Lê o link de convite (?sala=CODIGO, guardado em Rede.convite): se houver, abre direto a tela "Achar Sala" (Lobby.telaAchar usa o código) em vez do menu principal. Depois manda desenhar a primeira tela.
// ========================

if (window.Rede) Rede.lerConvite();
if (window.Rede && Rede.convite && typeof Menu !== 'undefined') Menu.tela = 'achar'; // (Menu é const, não fica em window)
render();
