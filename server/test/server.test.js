const request = require('supertest');
const express = require('express');
const app = require('../server');
const dbHandler = require('./setup');

describe('Server Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await dbHandler.connect();
    process.env.NODE_ENV = 'test';
  });

  afterEach(async () => {
    // Clear database after each test
    await dbHandler.clearDatabase();
  });

  afterAll(async () => {
    // Disconnect and cleanup
    await dbHandler.closeDatabase();
    app.close();
  });

  describe('Health Check', () => {
    test('should return 200 OK', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Chat API', () => {
    test('should handle valid chat requests', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('response');
    });

    test('should handle invalid requests', async () => {
      await request(app)
        .post('/api/chat')
        .send({})
        .expect(400);
    });

    test('should handle rate limiting', async () => {
      // Make multiple requests in quick succession
      const requests = Array(10).fill().map(() => 
        request(app)
          .post('/api/chat')
          .send({ message: 'Test' })
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.some(res => res.status === 429);
      expect(tooManyRequests).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 routes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    test('should handle server errors', async () => {
      // Mock error in route handler
      const originalHandler = app._router.handle;
      app._router.handle = () => {
        throw new Error('Simulated server error');
      };

      const response = await request(app)
        .get('/api/health')
        .expect(500);

      expect(response.body).toHaveProperty('error');
      app._router.handle = originalHandler;
    });

    test('should handle API timeouts', async () => {
      // Mock slow response
      jest.setTimeout(10000);
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Slow request' })
        .timeout(5000)
        .expect(408);

      expect(response.body).toHaveProperty('error', 'Request timeout');
    });
  });

  describe('Security', () => {
    test('should validate input', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const response = await request(app)
        .post('/api/chat')
        .send({ message: maliciousInput })
        .expect(200);

      expect(response.body.response).not.toContain('<script>');
    });

    test('should require authentication for protected routes', async () => {
      await request(app)
        .get('/api/admin')
        .expect(401);
    });
  });
});

