import { operators, evaluateOperator } from '../../src/services/eligibility/operators.js';

describe('Operators Service', () => {
  test('equals - strings, numbers, booleans', () => {
    expect(operators.equals('Uttar Pradesh', 'uttar pradesh')).toBe(true);
    expect(operators.equals(60, 60)).toBe(true);
    expect(operators.equals(true, true)).toBe(true);
    expect(operators.equals('SC', 'ST')).toBe(false);
  });

  test('notEquals', () => {
    expect(operators.notEquals('SC', 'ST')).toBe(true);
    expect(operators.notEquals(50, 50)).toBe(false);
  });

  test('gt and gte', () => {
    expect(operators.gt(67, 60)).toBe(true);
    expect(operators.gt(60, 60)).toBe(false);
    expect(operators.gte(60, 60)).toBe(true);
    expect(operators.gte(59, 60)).toBe(false);
  });

  test('lt and lte', () => {
    expect(operators.lt(250000, 300000)).toBe(true);
    expect(operators.lt(300000, 300000)).toBe(false);
    expect(operators.lte(300000, 300000)).toBe(true);
    expect(operators.lte(350000, 300000)).toBe(false);
  });

  test('in and notIn', () => {
    expect(operators.in('SC', ['SC', 'ST', 'OBC'])).toBe(true);
    expect(operators.in('GENERAL', ['SC', 'ST'])).toBe(false);
    expect(operators.notIn('GENERAL', ['SC', 'ST'])).toBe(true);
  });

  test('evaluateOperator helper', () => {
    expect(evaluateOperator('gte', 65, 60)).toBe(true);
    expect(() => evaluateOperator('invalidOp', 1, 1)).toThrow('Unsupported operator');
  });
});
