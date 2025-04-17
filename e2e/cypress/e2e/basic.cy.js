// This is a minimal test that uses a local HTML file instead of a server

describe('Minimal Test', () => {
  beforeEach(() => {
    // Load the local HTML file from fixtures
    cy.fixture('test.html').then((html) => {
      // Create a new document with the HTML content
      cy.document().then((doc) => {
        doc.write(html);
        doc.close();
      });
    });
  });

  it('should pass a simple assertion', () => {
    // This test will always pass
    expect(true).to.equal(true);
    cy.log('Basic test passed successfully');
  });

  it('should interact with the test HTML page', () => {
    // Test Cypress functionality with the local HTML
    cy.get('h1').should('contain', 'Cypress Test Page');
    cy.get('#test1').should('exist');
    cy.get('#test2').should('exist');

    // Test interaction
    cy.get('#testButton').click();
    cy.get('#test3').should('exist');
  });
});
