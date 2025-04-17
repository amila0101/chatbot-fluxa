// This is a minimal test that doesn't require any server or network access

describe('Minimal Test', () => {
  // Before each test, disable network requests
  beforeEach(() => {
    cy.intercept('*', { statusCode: 200, body: 'Intercepted' }).as('anyRequest');
  });

  it('should pass a simple assertion', () => {
    // This test will always pass
    expect(true).to.equal(true);
    cy.log('Basic test passed successfully');
  });

  it('should verify Cypress is working correctly', () => {
    // Test Cypress functionality without network requests
    cy.wrap({ key: 'value' }).should('have.property', 'key', 'value');
  });
});
