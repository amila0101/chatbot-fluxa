describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the chat interface', () => {
    cy.get('[data-testid="chat-container"]').should('exist');
    cy.get('[data-testid="message-input"]').should('exist');
    cy.get('[data-testid="send-button"]').should('exist');
  });

  it('should send a message and receive a response', () => {
    const testMessage = 'Hello, bot!';
    cy.get('[data-testid="message-input"]').type(testMessage);
    cy.get('[data-testid="send-button"]').click();
    
    // Verify the message was sent
    cy.get('[data-testid="user-message"]').should('contain', testMessage);
    
    // Wait for bot response (with timeout)
    cy.get('[data-testid="bot-message"]', { timeout: 10000 }).should('exist');
  });
});
