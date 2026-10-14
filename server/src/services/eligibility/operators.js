/**
 * Pure comparison operators for scheme eligibility conditions.
 * Returns boolean true / false.
 */

export const operators = {
  equals: (actual, expected) => {
    if (typeof actual === 'string' && typeof expected === 'string') {
      return actual.trim().toLowerCase() === expected.trim().toLowerCase();
    }
    return actual === expected;
  },

  notEquals: (actual, expected) => {
    return !operators.equals(actual, expected);
  },

  gt: (actual, expected) => {
    const numActual = Number(actual);
    const numExpected = Number(expected);
    if (isNaN(numActual) || isNaN(numExpected)) return false;
    return numActual > numExpected;
  },

  gte: (actual, expected) => {
    const numActual = Number(actual);
    const numExpected = Number(expected);
    if (isNaN(numActual) || isNaN(numExpected)) return false;
    return numActual >= numExpected;
  },

  lt: (actual, expected) => {
    const numActual = Number(actual);
    const numExpected = Number(expected);
    if (isNaN(numActual) || isNaN(numExpected)) return false;
    return numActual < numExpected;
  },

  lte: (actual, expected) => {
    const numActual = Number(actual);
    const numExpected = Number(expected);
    if (isNaN(numActual) || isNaN(numExpected)) return false;
    return numActual <= numExpected;
  },

  in: (actual, expected) => {
    if (!Array.isArray(expected)) {
      return false;
    }

    if (Array.isArray(actual)) {
      // Check if any element of actual is present in expected
      return actual.some((actItem) =>
        expected.some((expItem) => operators.equals(actItem, expItem))
      );
    }

    return expected.some((expItem) => operators.equals(actual, expItem));
  },

  notIn: (actual, expected) => {
    return !operators.in(actual, expected);
  },
};

export const SUPPORTED_OPERATORS = Object.keys(operators);

/**
 * Execute an operator safely by name
 */
export const evaluateOperator = (operatorName, actual, expected) => {
  const fn = operators[operatorName];
  if (!fn) {
    throw new Error(`Unsupported operator: ${operatorName}`);
  }
  return fn(actual, expected);
};
