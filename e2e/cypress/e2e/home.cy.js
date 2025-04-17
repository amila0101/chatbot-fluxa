describe('Server Health Check', () => {
  it('should verify the server is running', () => {
    // Test the API health endpoint directly
    cy.request({
      url: '/api/health',
      failOnStatusCode: false,
      timeout: 30000
    }).then((response) => {
      cy.log(`Health check response: ${JSON.stringify(response.body)}`);
      expect(response.status).to.be.oneOf([200, 304]);
    });
  });
});
