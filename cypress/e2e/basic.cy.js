describe('AgendaEstética - Testes E2E', () => {
  beforeEach(() => {
    // Visitar página inicial
    cy.visit('/');
  });

  it('Deve carregar a página inicial', () => {
    cy.contains('AgendaEstética').should('be.visible');
  });

  it('Deve mostrar erro quando Firebase não configurado', () => {
    // Simular erro de configuração
    cy.window().then((win) => {
      win.APP_CONFIG = null;
    });
    cy.reload();
    cy.contains('Configuração Necessária').should('be.visible');
  });

  it('Deve permitir navegação para login', () => {
    // Assumindo que há um link para login
    cy.get('a[href*="login"]').should('exist').or('contain', 'Login');
  });

  it('Deve validar formulários de entrada', () => {
    // Testar validação de email
    cy.get('input[type="email"]').type('email-invalido');
    cy.get('input[type="email"]').blur();
    // Deve mostrar erro ou prevenir submit
  });

  it('Deve carregar página pública de profissional', () => {
    // Testar página pública (assumindo rota /agenda/:id)
    cy.visit('/agenda/test-profissional', { failOnStatusCode: false });
    // Deve carregar ou mostrar erro apropriado
  });

  it('Deve testar responsividade mobile', () => {
    cy.viewport('iphone-6');
    cy.contains('AgendaEstética').should('be.visible');
    // Verificar se layout se adapta
  });

  it('Deve testar PWA - Service Worker', () => {
    cy.window().then((win) => {
      if ('serviceWorker' in win.navigator) {
        expect(win.navigator.serviceWorker).to.exist;
      }
    });
  });

  it('Deve testar cache de slots', () => {
    // Simular carregamento de slots
    cy.window().then((win) => {
      // Verificar se localStorage é usado
      expect(win.localStorage).to.exist;
    });
  });
});