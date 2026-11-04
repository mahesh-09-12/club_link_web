import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server.ts';

describe('API Integration Tests', () => {
  it('GET /api/clubs should return 200', async () => {
    const res = await request(app).get('/api/clubs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/auth/register should register a user', async () => {
    const timestamp = Date.now();
    const email = `api_${timestamp}@campus.edu`;
    const res = await request(app).post('/api/auth/register').send({
      full_name: 'Api Student',
      email,
      password: 'password123',
      role: 'student'
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
  });
});
