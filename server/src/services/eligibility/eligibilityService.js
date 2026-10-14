import {
  evaluateRule,
  collectMissingFields,
  computeConditionStats,
  calculateEligibilityDegree,
} from './ruleEngine.js';

/**
 * Perform a complete eligibility check for a citizen against a RuleSet.
 */
export const checkEligibility = (citizen, ruleSet) => {
  if (!ruleSet || !ruleSet.rootRule) {
    throw new Error('Valid RuleSet with rootRule is required');
  }

  const evaluationTree = evaluateRule(ruleSet.rootRule, citizen || {});
  const missingInformation = collectMissingFields(evaluationTree);
  const stats = computeConditionStats(evaluationTree);

  const status = evaluationTree.result; // 'passed' | 'failed' | 'unknown'
  const eligibilityDegree = calculateEligibilityDegree(status, stats);
  
  // Boolean eligible flag: true if fully or partially eligible
  const eligible = eligibilityDegree === 'fully_eligible' || eligibilityDegree === 'partially_eligible';

  return {
    status,
    eligibilityDegree,
    matchPercentage: stats.matchPercentage,
    eligible,
    ruleSetId: ruleSet._id || ruleSet.id || null,
    ruleSetVersion: ruleSet.version || 1,
    missingInformation,
    stats,
    details: evaluationTree,
  };
};
