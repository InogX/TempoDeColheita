// ===== FICHA TÉCNICA =====
// iniciar.js: Liga o jogo. Roda por último. Lê o link de convite (?sala=CODIGO, guardado em Rede.convite
// para a tela 'achar' usar na Fase 6) e manda desenhar a primeira tela.
// ========================

if (window.Rede) Rede.lerConvite();
render();
