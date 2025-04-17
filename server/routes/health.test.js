const request = require('supertest');
const express = require('express');
const healthRouter = require('./health');

describe('Health Route', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health', healthRouter);
  });

  it('should return a 200 status code', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
  });

  it('should return a status property with value "ok"', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body).toHaveProperty('status', 'ok');
  });

  it('should return a model property', async () => {
    const response = await request(app).get('/api/health');
    expect(response.body).toHaveProperty('model');
  });
});
