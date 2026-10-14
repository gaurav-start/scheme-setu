import mongoose from 'mongoose';

const ruleSetSchema = new mongoose.Schema(
  {
    schemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: [true, 'Scheme ID is required'],
      index: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
      index: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
    },
    rootRule: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Root rule tree structure is required'],
    },
    source: {
      type: {
        type: String,
        default: 'manual',
      },
      documentUrl: {
        type: String,
        default: '',
      },
      pageReference: {
        type: String,
        default: '',
      },
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on schemeId and version for uniqueness
ruleSetSchema.index({ schemeId: 1, version: 1 }, { unique: true });

const RuleSet = mongoose.models.RuleSet || mongoose.model('RuleSet', ruleSetSchema);

export default RuleSet;
