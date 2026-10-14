import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      default: 'local',
    },
    providerId: {
      type: String,
    },
    methods: {
      type: [String],
      enum: ['local', 'google'],
      default: ['local'],
    },
    role: {
      type: String,
      enum: ['citizen', 'csc_operator', 'ngo_worker', 'admin', 'user'],
      default: 'citizen',
      set: (v) => (v === 'user' ? 'citizen' : v),
    },
    phone: {
      type: String,
      trim: true,
    },
    cscCenterId: {
      type: String,
      trim: true,
    },
    ngoOrg: {
      type: String,
      trim: true,
    },
    assignedDistricts: {
      type: [String],
      default: [],
    },
    policyInsightOptIn: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Citizen Profile fields for scheme eligibility
    age: { type: Number },
    gender: { type: String, trim: true },
    category: { type: String, trim: true },
    maritalStatus: { type: String, trim: true },
    disabilityStatus: { type: String, trim: true },
    annualIncome: { type: Number },
    occupation: { type: String, trim: true },
    employmentStatus: { type: String, trim: true },
    landHolding: { type: Number },
    economicCategory: { type: String, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    block: { type: String, trim: true },
    ruralUrban: { type: String, trim: true },
    residenceYears: { type: Number },
    familySize: { type: Number },
    familyIncome: { type: Number },
    hasBPLCard: { type: Boolean },
    rationCardType: { type: String, trim: true },
    ownsHouse: { type: Boolean },
    householdType: { type: String, trim: true },
    isStudent: { type: Boolean },
    isFarmer: { type: Boolean },
    isWidow: { type: Boolean },
    isSeniorCitizen: { type: Boolean },
    isOrphan: { type: Boolean },
    isExServiceman: { type: Boolean },
    otherSchemeSpecificFacts: { type: [String], default: [] },
    educationLevel: { type: String, trim: true },
    bankAccount: { type: Boolean },
    refreshToken: {
      type: String,
      select: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
