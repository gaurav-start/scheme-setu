import mongoose from 'mongoose';

const eligibilityCheckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: [true, 'Scheme ID is required'],
      index: true,
    },
    ruleSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RuleSet',
      required: [true, 'RuleSet ID is required'],
    },
    ruleSetVersion: {
      type: Number,
      required: true,
    },
    inputSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'unknown'],
      required: true,
    },
    eligibilityDegree: {
      type: String,
      enum: ['fully_eligible', 'partially_eligible', 'ineligible', 'needs_more_info'],
      required: true,
    },
    matchPercentage: {
      type: Number,
      default: 0,
    },
    eligible: {
      type: Boolean,
      required: true,
    },
    missingInformation: {
      type: [String],
      default: [],
    },
    evaluationResult: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    evaluatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const EligibilityCheck =
  mongoose.models.EligibilityCheck || mongoose.model('EligibilityCheck', eligibilityCheckSchema);

export default EligibilityCheck;
