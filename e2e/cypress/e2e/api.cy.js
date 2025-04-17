describe('API Tests', () => {
  it('should return health check status', () => {
    // Test with retry and longer timeout
    cy.request({
      method: 'GET',
      url: 'http://localhost:5000/api/health',  // Use direct URL instead of env variable
      timeout: 30000,
      retryOnStatusCodeFailure: true,
      failOnStatusCode: false,  // Don't fail immediately on non-2xx
    }).then((response) => {
      cy.log(`Health check response: ${JSON.stringify(response.body)}`);
      expect(response.status).to.be.oneOf([200, 304]);  // Accept 304 Not Modified too
    });
  });
});
