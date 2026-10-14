import { evaluateCondition } from './conditionEvaluator.js';

/**
 * Recursively evaluate a rule node (condition or group) against citizen facts.
 */
export const evaluateRule = (rule, citizen) => {
  if (!rule || typeof rule !== 'object') {
    return {
      result: 'failed',
      type: 'unknown',
      error: 'Rule node is invalid or empty',
    };
  }

  // Leaf condition
  if (rule.type === 'condition') {
    return evaluateCondition(rule, citizen);
  }

  // Logical group node (AND, OR, NOT)
  if (rule.type === 'group') {
    const operator = (rule.operator || 'AND').toUpperCase();
    const children = Array.isArray(rule.conditions) ? rule.conditions : [];

    if (children.length === 0) {
      return {
        result: 'failed',
        type: 'group',
        operator,
        conditions: [],
        error: 'Group contains no child conditions',
      };
    }

    // Evaluate children recursively
    const childResults = children.map((child) => evaluateRule(child, citizen));

    let groupResult = 'passed';

    if (operator === 'AND') {
      const hasFailed = childResults.some((c) => c.result === 'failed');
      const hasUnknown = childResults.some((c) => c.result === 'unknown');

      if (hasFailed) {
        groupResult = 'failed';
      } else if (hasUnknown) {
        groupResult = 'unknown';
      } else {
        groupResult = 'passed';
      }
    } else if (operator === 'OR') {
      const hasPassed = childResults.some((c) => c.result === 'passed');
      const hasUnknown = childResults.some((c) => c.result === 'unknown');

      if (hasPassed) {
        groupResult = 'passed';
      } else if (hasUnknown) {
        groupResult = 'unknown';
      } else {
        groupResult = 'failed';
      }
    } else if (operator === 'NOT') {
      if (childResults.length !== 1) {
        return {
          result: 'failed',
          type: 'group',
          operator: 'NOT',
          conditions: childResults,
          error: 'NOT group must contain exactly one child condition',
        };
      }

      const singleChild = childResults[0];
      if (singleChild.result === 'passed') {
        groupResult = 'failed';
      } else if (singleChild.result === 'failed') {
        groupResult = 'passed';
      } else {
        groupResult = 'unknown';
      }
    } else {
      return {
        result: 'failed',
        type: 'group',
        operator,
        conditions: childResults,
        error: `Unsupported group operator '${operator}'`,
      };
    }

    return {
      result: groupResult,
      type: 'group',
      operator,
      conditions: childResults,
    };
  }

  return {
    result: 'failed',
    type: rule.type || 'unknown',
    error: `Unsupported rule node type '${rule.type}'`,
  };
};

/**
 * Recursively collect missing field names from unknown nodes in evaluation tree.
 */
export const collectMissingFields = (evaluationTree) => {
  const missing = new Set();

  const traverse = (node) => {
    if (!node) return;

    if (node.result === 'unknown' && node.field) {
      missing.add(node.field);
    }

    if (Array.isArray(node.conditions)) {
      node.conditions.forEach(traverse);
    }
  };

  traverse(evaluationTree);
  return Array.from(missing);
};

/**
 * Compute leaf condition statistics (total, passed, failed, unknown)
 */
export const computeConditionStats = (evaluationTree) => {
  let total = 0;
  let passed = 0;
  let failed = 0;
  let unknown = 0;

  const traverse = (node) => {
    if (!node) return;

    if (node.type === 'condition') {
      total += 1;
      if (node.result === 'passed') passed += 1;
      if (node.result === 'failed') failed += 1;
      if (node.result === 'unknown') unknown += 1;
    }

    if (Array.isArray(node.conditions)) {
      node.conditions.forEach(traverse);
    }
  };

  traverse(evaluationTree);

  const matchPercentage = total > 0 ? Math.round((passed / total) * 100) : 0;

  return {
    total,
    passed,
    failed,
    unknown,
    matchPercentage,
  };
};

/**
 * Determine eligibility degree string enum
 */
export const calculateEligibilityDegree = (status, stats) => {
  if (status === 'passed') {
    return 'fully_eligible';
  }

  if (status === 'failed') {
    return stats.passed > 0 ? 'partially_eligible' : 'ineligible';
  }

  if (status === 'unknown') {
    return stats.passed > 0 ? 'partially_eligible' : 'needs_more_info';
  }

  return 'ineligible';
};
