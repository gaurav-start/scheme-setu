import Scheme from '../models/Scheme.js';
import RuleSet from '../models/RuleSet.js';

// Helper to generate URL-safe slugs
const generateSlug = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

// @desc    Create a new Scheme with optional initial RuleSet
// @route   POST /api/schemes
// @access  Private/Admin
export const createScheme = async (req, res, next) => {
  try {
    const {
      name,
      slug: customSlug,
      description,
      ministry,
      state,
      category,
      sourceUrl,
      sourceDocument,
      status,
      initialRuleSet,
    } = req.body;

    const slug = customSlug ? generateSlug(customSlug) : generateSlug(name);

    const existingScheme = await Scheme.findOne({ slug });
    if (existingScheme) {
      return res.status(400).json({
        success: false,
        message: `Scheme with slug '${slug}' already exists`,
      });
    }

    const scheme = new Scheme({
      name,
      slug,
      description,
      ministry: ministry || '',
      state: state || 'All India',
      category: category || 'General',
      sourceUrl: sourceUrl || '',
      sourceDocument: sourceDocument || '',
      status: status || 'draft',
    });

    await scheme.save();

    // Create initial RuleSet if provided
    if (initialRuleSet && initialRuleSet.rootRule) {
      const ruleSet = await RuleSet.create({
        schemeId: scheme._id,
        version: 1,
        status: status === 'active' ? 'active' : 'draft',
        rootRule: initialRuleSet.rootRule,
        source: initialRuleSet.source || {},
        verifiedBy: req.user?._id,
        verifiedAt: new Date(),
      });

      if (status === 'active' || initialRuleSet.status === 'active') {
        scheme.currentRuleSetId = ruleSet._id;
        scheme.status = 'active';
        await scheme.save();
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      scheme,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all Schemes
// @route   GET /api/schemes
// @access  Public
export const getAllSchemes = async (req, res, next) => {
  try {
    const { category, state, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (state) query.state = state;
    if (status) query.status = status;
    else query.status = { $ne: 'draft' }; // Hide drafts from public view by default

    const schemes = await Scheme.find(query)
      .populate('currentRuleSetId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: schemes.length,
      schemes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Scheme by slug
// @route   GET /api/schemes/:slug
// @access  Public
export const getSchemeBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const scheme = await Scheme.findOne({ slug }).populate('currentRuleSetId');
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: `Scheme '${slug}' not found`,
      });
    }

    // Fetch all RuleSets for version history if admin
    let ruleSets = [];
    if (req.user && req.user.role === 'admin') {
      ruleSets = await RuleSet.find({ schemeId: scheme._id }).sort({ version: -1 });
    }

    return res.status(200).json({
      success: true,
      scheme,
      ruleSets: ruleSets.length > 0 ? ruleSets : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a new RuleSet version for a Scheme
// @route   POST /api/schemes/:slug/rulesets
// @access  Private/Admin
export const createRuleSetVersion = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { rootRule, source, effectiveFrom, effectiveTo, status } = req.body;

    const scheme = await Scheme.findOne({ slug });
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: `Scheme '${slug}' not found`,
      });
    }

    // Find highest version number
    const latestRuleSet = await RuleSet.findOne({ schemeId: scheme._id }).sort({ version: -1 });
    const nextVersion = latestRuleSet ? latestRuleSet.version + 1 : 1;

    const ruleSet = new RuleSet({
      schemeId: scheme._id,
      version: nextVersion,
      status: status || 'draft',
      rootRule,
      source: source || {},
      effectiveFrom: effectiveFrom || new Date(),
      effectiveTo: effectiveTo || null,
      verifiedBy: req.user?._id,
      verifiedAt: new Date(),
    });

    await ruleSet.save();

    // If marked active, set as current rule set for scheme
    if (status === 'active') {
      // Archive old active rule sets
      await RuleSet.updateMany(
        { schemeId: scheme._id, _id: { $ne: ruleSet._id }, status: 'active' },
        { status: 'archived' }
      );
      scheme.currentRuleSetId = ruleSet._id;
      scheme.status = 'active';
      await scheme.save();
    }

    return res.status(201).json({
      success: true,
      message: `RuleSet v${nextVersion} created successfully`,
      ruleSet,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Activate a specific RuleSet version
// @route   PATCH /api/schemes/:slug/rulesets/:version/activate
// @access  Private/Admin
export const activateRuleSet = async (req, res, next) => {
  try {
    const { slug, version } = req.params;

    const scheme = await Scheme.findOne({ slug });
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: `Scheme '${slug}' not found`,
      });
    }

    const targetRuleSet = await RuleSet.findOne({
      schemeId: scheme._id,
      version: Number(version),
    });

    if (!targetRuleSet) {
      return res.status(404).json({
        success: false,
        message: `RuleSet v${version} not found for scheme '${slug}'`,
      });
    }

    // Archive existing active rule sets
    await RuleSet.updateMany(
      { schemeId: scheme._id, _id: { $ne: targetRuleSet._id }, status: 'active' },
      { status: 'archived' }
    );

    targetRuleSet.status = 'active';
    await targetRuleSet.save();

    scheme.currentRuleSetId = targetRuleSet._id;
    scheme.status = 'active';
    await scheme.save();

    return res.status(200).json({
      success: true,
      message: `RuleSet v${version} activated successfully`,
      scheme,
      ruleSet: targetRuleSet,
    });
  } catch (err) {
    next(err);
  }
};
