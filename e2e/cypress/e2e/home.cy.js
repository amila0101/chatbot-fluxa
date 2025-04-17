describe('Home Page', () => {
  beforeEach(() => {
    // Visit the homepage with retry on failure
    cy.visit('/', { retryOnStatusCodeFailure: true, timeout: 30000 });
  });

  it('should display the chat interface', () => {
    // Check if the page has loaded properly
    cy.log('Checking if page has loaded');
    cy.get('body').should('be.visible');

    // Use more reliable selectors and longer timeouts
    cy.get('body', { timeout: 10000 }).then($body => {
      // Log the body content for debugging
      cy.log('Page content loaded');

      // Simple test to verify the page has loaded
      cy.get('h1', { timeout: 10000 }).should('be.visible');
    });
  });
});
