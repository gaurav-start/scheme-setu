import { getFactValue, isFieldAllowed } from './fieldWhitelist.js';
import { evaluateOperator, SUPPORTED_OPERATORS } from './operators.js';

/**
 * Evaluate a single leaf condition against citizen facts.
 * Returns three-valued result: 'passed' | 'failed' | 'unknown'
 */
export const evaluateCondition = (condition, citizen) => {
  const { field, operator, value } = condition;

  if (!field || typeof field !== 'string') {
    return {
      result: 'failed',
      type: 'condition',
      field: field || 'unknown',
      operator: operator || 'equals',
      expected: value,
      actual: null,
      error: 'Invalid condition field',
    };
  }

  if (!isFieldAllowed(field)) {
    return {
      result: 'failed',
      type: 'condition',
      field,
      operator,
      expected: value,
      actual: null,
      error: `Field '${field}' is not permitted or unsupported`,
    };
  }

  if (!SUPPORTED_OPERATORS.includes(operator)) {
    return {
      result: 'failed',
      type: 'condition',
      field,
      operator,
      expected: value,
      actual: null,
      error: `Unsupported operator '${operator}'`,
    };
  }

  const actual = getFactValue(citizen, field);

  // If citizen fact is missing, return unknown (do NOT treat missing data as false/failed)
  if (actual === undefined || actual === null) {
    return {
      result: 'unknown',
      type: 'condition',
      field,
      operator,
      expected: value,
      actual: null,
    };
  }

  try {
    const passed = evaluateOperator(operator, actual, value);
    return {
      result: passed ? 'passed' : 'failed',
      type: 'condition',
      field,
      operator,
      expected: value,
      actual,
    };
  } catch (err) {
    return {
      result: 'failed',
      type: 'condition',
      field,
      operator,
      expected: value,
      actual,
      error: err.message,
    };
  }
};
