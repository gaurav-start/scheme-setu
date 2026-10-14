import {
  evaluateRule,
  collectMissingFields,
  computeConditionStats,
  calculateEligibilityDegree,
} from '../../src/services/eligibility/ruleEngine.js';

describe('Rule Engine Service', () => {
  test('AND Semantics (PASS + PASS = PASS, PASS + FAIL = FAIL, PASS + UNKNOWN = UNKNOWN)', () => {
    const andRule = {
      type: 'group',
      operator: 'AND',
      conditions: [
        { type: 'condition', field: 'age', operator: 'gte', value: 60 },
        { type: 'condition', field: 'annualIncome', operator: 'lte', value: 300000 },
      ],
    };

    // Pass + Pass
    expect(evaluateRule(andRule, { age: 67, annualIncome: 250000 }).result).toBe('passed');

    // Pass + Fail
    expect(evaluateRule(andRule, { age: 67, annualIncome: 450000 }).result).toBe('failed');

    // Pass + Unknown
    expect(evaluateRule(andRule, { age: 67 }).result).toBe('unknown');
  });

  test('OR Semantics (PASS + FAIL = PASS, FAIL + FAIL = FAIL, FAIL + UNKNOWN = UNKNOWN)', () => {
    const orRule = {
      type: 'group',
      operator: 'OR',
      conditions: [
        { type: 'condition', field: 'category', operator: 'equals', value: 'SC' },
        { type: 'condition', field: 'hasBPLCard', operator: 'equals', value: true },
      ],
    };

    // Pass + Fail
    expect(evaluateRule(orRule, { category: 'GENERAL', hasBPLCard: true }).result).toBe('passed');

    // Fail + Fail
    expect(evaluateRule(orRule, { category: 'GENERAL', hasBPLCard: false }).result).toBe('failed');

    // Fail + Unknown
    expect(evaluateRule(orRule, { category: 'GENERAL' }).result).toBe('unknown');
  });

  test('NOT Semantics (PASS -> FAIL, FAIL -> PASS, UNKNOWN -> UNKNOWN)', () => {
    const notRule = {
      type: 'group',
      operator: 'NOT',
      conditions: [
        { type: 'condition', field: 'occupation', operator: 'equals', value: 'government_employee' },
      ],
    };

    expect(evaluateRule(notRule, { occupation: 'farmer' }).result).toBe('passed');
    expect(evaluateRule(notRule, { occupation: 'government_employee' }).result).toBe('failed');
    expect(evaluateRule(notRule, {}).result).toBe('unknown');
  });

  test('Example Prompt Test Case: age >= 60 AND (category == SC OR hasBPLCard == true)', () => {
    const citizen = {
      age: 67,
      annualIncome: 250000,
      category: 'GENERAL',
      hasBPLCard: true,
    };

    const rule = {
      type: 'group',
      operator: 'AND',
      conditions: [
        { type: 'condition', field: 'age', operator: 'gte', value: 60 },
        {
          type: 'group',
          operator: 'OR',
          conditions: [
            { type: 'condition', field: 'category', operator: 'equals', value: 'SC' },
            { type: 'condition', field: 'hasBPLCard', operator: 'equals', value: true },
          ],
        },
      ],
    };

    const evalResult = evaluateRule(rule, citizen);
    expect(evalResult.result).toBe('passed');

    const stats = computeConditionStats(evalResult);
    expect(stats.total).toBe(3);
    expect(stats.passed).toBe(2);
    expect(stats.failed).toBe(1);

    const degree = calculateEligibilityDegree(evalResult.result, stats);
    expect(degree).toBe('fully_eligible');
  });

  test('Missing Information extraction', () => {
    const rule = {
      type: 'group',
      operator: 'AND',
      conditions: [
        { type: 'condition', field: 'age', operator: 'gte', value: 60 },
        { type: 'condition', field: 'annualIncome', operator: 'lte', value: 300000 },
        { type: 'condition', field: 'state', operator: 'equals', value: 'Uttar Pradesh' },
      ],
    };

    const citizen = { age: 67, state: 'Uttar Pradesh' };
    const evalResult = evaluateRule(rule, citizen);
    const missing = collectMissingFields(evalResult);

    expect(missing).toEqual(['annualIncome']);
  });
});
