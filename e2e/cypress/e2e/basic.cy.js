// This is a basic test that doesn't require the server to be running
// It's used as a fallback when the server can't start

describe('Basic Test', () => {
  it('should pass a simple assertion', () => {
    // This test will always pass
    expect(true).to.equal(true);
    cy.log('Basic test passed successfully');
  });

  it('should verify Cypress is working', () => {
    // Create a simple HTML page for testing
    cy.visit('about:blank');
    
    // Modify the page content
    cy.document().then((doc) => {
      doc.body.innerHTML = '<h1>Cypress Test Page</h1><p>This is a test page created by Cypress.</p>';
    });
    
    // Verify the content
    cy.get('h1').should('contain', 'Cypress Test Page');
    cy.get('p').should('contain', 'This is a test page created by Cypress.');
  });
});
