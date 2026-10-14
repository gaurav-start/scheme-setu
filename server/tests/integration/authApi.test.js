import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import '../setupMongoMemory.js';

describe('Auth API Login Integration Tests', () => {
  test('POST /api/auth/login sends OTP when valid email is provided in req.body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testlogin@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('OTP sent');

    // Verify user was created in database
    const user = await User.findOne({ email: 'testlogin@example.com' });
    expect(user).not.toBeNull();
    expect(user.email).toBe('testlogin@example.com');
  });

  test('POST /api/auth/login rejects requests missing email in req.body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/login rejects invalid email format in req.body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
