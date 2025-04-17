const request = require('supertest');
const app = require('./mockServer');

// Set test environment
process.env.NODE_ENV = 'test';

describe('Server Tests', () => {
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
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/chat')
            .send({ message: `Test ${i}` })
        );
      }

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
  });

  describe('Security', () => {
    test('should require authentication for protected routes', async () => {
      await request(app)
        .get('/api/admin')
        .expect(401);
    });
  });
});

