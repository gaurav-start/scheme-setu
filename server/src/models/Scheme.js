import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Scheme slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Scheme description is required'],
    },
    ministry: {
      type: String,
      default: '',
      trim: true,
    },
    state: {
      type: String,
      default: 'All India',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    sourceDocument: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'draft',
      index: true,
    },
    currentRuleSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RuleSet',
    },
    lastVerifiedAt: {
      type: Date,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Scheme = mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema);

export default Scheme;
