import { evaluateCondition } from '../../src/services/eligibility/conditionEvaluator.js';

describe('Condition Evaluator', () => {
  test('evaluates valid passed condition', () => {
    const condition = { type: 'condition', field: 'age', operator: 'gte', value: 60 };
    const citizen = { age: 67 };
    const result = evaluateCondition(condition, citizen);
    expect(result.result).toBe('passed');
    expect(result.actual).toBe(67);
  });

  test('evaluates valid failed condition', () => {
    const condition = { type: 'condition', field: 'annualIncome', operator: 'lte', value: 300000 };
    const citizen = { annualIncome: 450000 };
    const result = evaluateCondition(condition, citizen);
    expect(result.result).toBe('failed');
    expect(result.actual).toBe(450000);
  });

  test('returns unknown for missing citizen fact', () => {
    const condition = { type: 'condition', field: 'annualIncome', operator: 'lte', value: 300000 };
    const citizen = { age: 67 };
    const result = evaluateCondition(condition, citizen);
    expect(result.result).toBe('unknown');
    expect(result.actual).toBeNull();
  });

  test('evaluates category prefixed field path (e.g. Personal.age)', () => {
    const condition = { type: 'condition', field: 'Personal.age', operator: 'gte', value: 60 };
    const citizen = { Personal: { age: 65 } };
    const result = evaluateCondition(condition, citizen);
    expect(result.result).toBe('passed');
    expect(result.actual).toBe(65);
  });

  test('rejects disallowed or forbidden fields', () => {
    const condition = { type: 'condition', field: 'password', operator: 'equals', value: 'secret' };
    const citizen = { password: 'secret' };
    const result = evaluateCondition(condition, citizen);
    expect(result.result).toBe('failed');
    expect(result.error).toContain('not permitted');
  });
});
