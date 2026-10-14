import { checkEligibility } from '../../src/services/eligibility/eligibilityService.js';

describe('Eligibility Service', () => {
  const sampleRuleSet = {
    _id: 'rule_set_123',
    version: 1,
    rootRule: {
      type: 'group',
      operator: 'AND',
      conditions: [
        { type: 'condition', field: 'age', operator: 'gte', value: 60 },
        { type: 'condition', field: 'annualIncome', operator: 'lte', value: 300000 },
        { type: 'condition', field: 'state', operator: 'equals', value: 'Uttar Pradesh' },
      ],
    },
  };

  test('returns fully_eligible when all criteria match', () => {
    const citizen = { age: 65, annualIncome: 200000, state: 'Uttar Pradesh' };
    const result = checkEligibility(citizen, sampleRuleSet);

    expect(result.status).toBe('passed');
    expect(result.eligibilityDegree).toBe('fully_eligible');
    expect(result.matchPercentage).toBe(100);
    expect(result.eligible).toBe(true);
    expect(result.missingInformation).toEqual([]);
  });

  test('returns needs_more_info when required fields are missing', () => {
    const citizen = { age: 65 };
    const result = checkEligibility(citizen, sampleRuleSet);

    expect(result.status).toBe('unknown');
    expect(result.eligibilityDegree).toBe('partially_eligible'); // age passed (1 of 3)
    expect(result.eligible).toBe(true);
    expect(result.missingInformation).toEqual(['annualIncome', 'state']);
  });

  test('returns ineligible when mandatory criteria explicitly fail with 0 passes', () => {
    const citizen = { age: 40, annualIncome: 500000, state: 'Delhi' };
    const result = checkEligibility(citizen, sampleRuleSet);

    expect(result.status).toBe('failed');
    expect(result.eligibilityDegree).toBe('ineligible');
    expect(result.eligible).toBe(false);
  });
});
