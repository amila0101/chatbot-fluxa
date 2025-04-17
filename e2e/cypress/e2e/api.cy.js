describe('API Tests', () => {
  it('should return health check status', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/health`,
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
    });
  });

  it('should handle chat messages', () => {
    const testMessage = 'Test message';
    
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/chat`,
      body: { message: testMessage },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('botResponse');
    });
  });
});
