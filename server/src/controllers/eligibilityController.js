import Scheme from '../models/Scheme.js';
import RuleSet from '../models/RuleSet.js';
import EligibilityCheck from '../models/EligibilityCheck.js';
import { checkEligibility } from '../services/eligibility/eligibilityService.js';

// @desc    Evaluate citizen facts against a specific Scheme's active RuleSet
// @route   POST /api/eligibility/check/:schemeSlug
// @access  Private (Protected by authMiddleware)
export const checkSchemeEligibility = async (req, res, next) => {
  try {
    const { schemeSlug } = req.params;
    const bodyFacts = req.body.facts || req.body || {};

    // Combine user profile facts (if logged in) with request facts
    const citizenFacts = {
      ...(req.user
        ? {
            age: req.user.age,
            gender: req.user.gender,
            phone: req.user.phone,
            state: req.user.state,
          }
        : {}),
      ...bodyFacts,
    };

    const scheme = await Scheme.findOne({ slug: schemeSlug });
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: `Scheme '${schemeSlug}' not found`,
      });
    }

    if (!scheme.currentRuleSetId) {
      return res.status(400).json({
        success: false,
        message: `Scheme '${schemeSlug}' does not currently have an active RuleSet`,
      });
    }

    const ruleSet = await RuleSet.findById(scheme.currentRuleSetId);
    if (!ruleSet) {
      return res.status(404).json({
        success: false,
        message: `Active RuleSet for scheme '${schemeSlug}' was not found`,
      });
    }

    // Execute rule engine check
    const evaluation = checkEligibility(citizenFacts, ruleSet);

    // Save audit log snapshot in EligibilityCheck model
    const auditRecord = await EligibilityCheck.create({
      userId: req.user?._id || null,
      schemeId: scheme._id,
      ruleSetId: ruleSet._id,
      ruleSetVersion: ruleSet.version,
      inputSnapshot: citizenFacts,
      status: evaluation.status,
      eligibilityDegree: evaluation.eligibilityDegree,
      matchPercentage: evaluation.matchPercentage,
      eligible: evaluation.eligible,
      missingInformation: evaluation.missingInformation,
      evaluationResult: evaluation.details,
      evaluatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      scheme: {
        id: scheme._id,
        name: scheme.name,
        slug: scheme.slug,
        ministry: scheme.ministry,
        category: scheme.category,
      },
      evaluation: {
        auditId: auditRecord._id,
        status: evaluation.status,
        eligibilityDegree: evaluation.eligibilityDegree,
        matchPercentage: evaluation.matchPercentage,
        eligible: evaluation.eligible,
        ruleSetVersion: evaluation.ruleSetVersion,
        missingInformation: evaluation.missingInformation,
        details: evaluation.details,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's historical eligibility checks
// @route   GET /api/eligibility/history
// @access  Private
export const getEligibilityHistory = async (req, res, next) => {
  try {
    const checks = await EligibilityCheck.find({ userId: req.user._id })
      .populate('schemeId', 'name slug ministry category')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: checks.length,
      history: checks,
    });
  } catch (err) {
    next(err);
  }
};
