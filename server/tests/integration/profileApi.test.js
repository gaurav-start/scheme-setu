import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import { generateAccessToken } from '../../src/utils/tokenUtils.js';
import '../setupMongoMemory.js';

describe('Profile API Integration Tests', () => {
  let user;
  let accessToken;

  beforeEach(async () => {
    user = await User.create({
      name: 'Rishabh',
      email: 'rishabh@example.com',
      role: 'citizen',
    });

    accessToken = generateAccessToken(user);
  });

  test('POST /api/profile/ai-fill previews extracted facts without mutating user profile', async () => {
    const res = await request(app)
      .post('/api/profile/ai-fill')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({
        text: "I am male, 21 years old, OBC category living in Lucknow.",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.extracted).toBeDefined();
    expect(res.body.data.missingFields).toBeDefined();
    expect(res.body.data.conflicts).toBeDefined();

    // Verify user profile in DB was NOT changed automatically
    const dbUser = await User.findById(user._id);
    expect(dbUser.age).toBeUndefined();
  });

  test('PATCH /api/profile updates user profile after user confirmation', async () => {
    const res = await request(app)
      .patch('/api/profile')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({
        age: 21,
        gender: 'male',
        category: 'OBC',
        district: 'Lucknow',
        annualIncome: 250000,
        isStudent: true,
        hasBPLCard: true,
        familySize: 4,
        educationLevel: 'Graduate',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.age).toBe(21);
    expect(res.body.user.gender).toBe('male');
    expect(res.body.user.category).toBe('OBC');
    expect(res.body.user.isStudent).toBe(true);
    expect(res.body.user.hasBPLCard).toBe(true);

    // Verify user profile in DB WAS updated with all attributes
    const dbUser = await User.findById(user._id);
    expect(dbUser.age).toBe(21);
    expect(dbUser.gender).toBe('male');
    expect(dbUser.category).toBe('OBC');
    expect(dbUser.annualIncome).toBe(250000);
    expect(dbUser.isStudent).toBe(true);
    expect(dbUser.hasBPLCard).toBe(true);
    expect(dbUser.familySize).toBe(4);
    expect(dbUser.educationLevel).toBe('Graduate');
  });

  test('POST /api/profile/ai-fill rejects unauthorized requests', async () => {
    const res = await request(app)
      .post('/api/profile/ai-fill')
      .send({ text: "I am 21 years old." });

    expect(res.status).toBe(401);
  });

  test('DELETE /api/profile rejects request if email does not match', async () => {
    const res = await request(app)
      .delete('/api/profile')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ email: 'wrong@example.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/does not match/i);
  });

  test('DELETE /api/profile permanently deletes account when email matches', async () => {
    const res = await request(app)
      .delete('/api/profile')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({ email: 'rishabh@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dbUser = await User.findById(user._id);
    expect(dbUser).toBeNull();
  });
});
