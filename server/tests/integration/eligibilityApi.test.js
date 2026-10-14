import request from 'supertest';
import app from '../../src/app.js';
import Scheme from '../../src/models/Scheme.js';
import RuleSet from '../../src/models/RuleSet.js';
import EligibilityCheck from '../../src/models/EligibilityCheck.js';
import User from '../../src/models/User.js';
import { generateAccessToken } from '../../src/utils/tokenUtils.js';
import '../setupMongoMemory.js';

describe('Eligibility API Integration Tests (MongoMemoryServer)', () => {
  let sampleScheme;
  let sampleRuleSet;
  let user;
  let accessToken;

  beforeEach(async () => {
    // Create test user
    user = await User.create({
      name: 'Rishabh Citizen',
      email: 'citizen@example.com',
      role: 'citizen',
    });

    accessToken = generateAccessToken(user);

    // Create Scheme in in-memory MongoDB
    sampleScheme = await Scheme.create({
      name: 'Indira Gandhi National Old Age Pension Scheme',
      slug: 'ignoaps',
      description: 'Pension for senior citizens from BPL households.',
      status: 'active',
    });

    // Create RuleSet
    sampleRuleSet = await RuleSet.create({
      schemeId: sampleScheme._id,
      version: 1,
      status: 'active',
      rootRule: {
        type: 'group',
        operator: 'AND',
        conditions: [
          { type: 'condition', field: 'age', operator: 'gte', value: 60 },
          { type: 'condition', field: 'hasBPLCard', operator: 'equals', value: true },
        ],
      },
    });

    sampleScheme.currentRuleSetId = sampleRuleSet._id;
    await sampleScheme.save();
  });

  test('POST /api/eligibility/check/:schemeSlug rejects unauthenticated users with 401', async () => {
    const res = await request(app)
      .post('/api/eligibility/check/ignoaps')
      .send({
        age: 67,
        hasBPLCard: true,
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/eligibility/check/:schemeSlug returns fully_eligible for matching citizen', async () => {
    const res = await request(app)
      .post('/api/eligibility/check/ignoaps')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({
        age: 67,
        hasBPLCard: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.evaluation.status).toBe('passed');
    expect(res.body.evaluation.eligibilityDegree).toBe('fully_eligible');
    expect(res.body.evaluation.matchPercentage).toBe(100);
    expect(res.body.evaluation.eligible).toBe(true);
    expect(res.body.evaluation.missingInformation).toEqual([]);

    // Check audit database record
    const auditLogs = await EligibilityCheck.find({ schemeId: sampleScheme._id });
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].status).toBe('passed');
    expect(auditLogs[0].eligibilityDegree).toBe('fully_eligible');
  });

  test('POST /api/eligibility/check/:schemeSlug returns needs_more_info when facts are missing', async () => {
    const res = await request(app)
      .post('/api/eligibility/check/ignoaps')
      .set('Cookie', [`accessToken=${accessToken}`])
      .send({
        age: 67,
      });

    expect(res.status).toBe(200);
    expect(res.body.evaluation.status).toBe('unknown');
    expect(res.body.evaluation.missingInformation).toEqual(['hasBPLCard']);
  });

  test('GET /api/schemes returns active schemes', async () => {
    const res = await request(app).get('/api/schemes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.schemes).toHaveLength(1);
    expect(res.body.schemes[0].slug).toBe('ignoaps');
  });
});
