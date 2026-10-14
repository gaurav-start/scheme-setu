export const CATEGORIZED_FIELDS = {
  Personal: ['name', 'age', 'gender', 'maritalStatus', 'category', 'disabilityStatus'],
  Economic: ['annualIncome', 'occupation', 'employmentStatus', 'landHolding', 'economicCategory'],
  Location: ['state', 'district', 'block', 'ruralUrban', 'residenceYears'],
  Household: ['familySize', 'familyIncome', 'hasBPLCard', 'rationCardType', 'ownsHouse', 'householdType'],
  SpecialConditions: [
    'isStudent',
    'isFarmer',
    'isWidow',
    'isSeniorCitizen',
    'isOrphan',
    'isExServiceman',
    'otherSchemeSpecificFacts',
  ],
};

// Flattened list of allowed field keys
const flatFields = Object.values(CATEGORIZED_FIELDS).flat();

// Allowed field paths including category prefix (e.g. "Personal.age") and flat names ("age")
export const ALLOWED_FIELDS = new Set([
  ...flatFields,
  ...Object.entries(CATEGORIZED_FIELDS).flatMap(([category, fields]) =>
    fields.map((field) => `${category}.${field}`)
  ),
]);

// Forbidden field names to prevent prototype pollution or credential leakage
const FORBIDDEN_KEYS = new Set([
  'password',
  'refreshToken',
  'verificationToken',
  'resetPasswordToken',
  'otp',
  'otpExpires',
  '__proto__',
  'constructor',
  'prototype',
]);

/**
 * Check if a field path is valid and permitted
 */
export const isFieldAllowed = (fieldPath) => {
  if (!fieldPath || typeof fieldPath !== 'string') return false;
  if (FORBIDDEN_KEYS.has(fieldPath)) return false;
  return ALLOWED_FIELDS.has(fieldPath);
};

/**
 * Extract a fact value safely from citizen object supporting flat or category paths.
 * E.g., fieldPath = "age" or "Personal.age"
 */
export const getFactValue = (citizen, fieldPath) => {
  if (!citizen || typeof citizen !== 'object' || !isFieldAllowed(fieldPath)) {
    return undefined;
  }

  // 1. Direct property access on root citizen object (e.g., citizen.age)
  if (Object.prototype.hasOwnProperty.call(citizen, fieldPath)) {
    const val = citizen[fieldPath];
    if (val !== undefined && val !== null) return val;
  }

  // 2. Dot notation lookup (e.g., citizen.Personal.age)
  if (fieldPath.includes('.')) {
    const parts = fieldPath.split('.');
    let current = citizen;
    for (const part of parts) {
      if (!current || typeof current !== 'object' || FORBIDDEN_KEYS.has(part)) {
        return undefined;
      }
      current = current[part];
    }
    if (current !== undefined && current !== null) return current;
  }

  // 3. Category search if fieldPath is flat (e.g., fieldPath = "age" -> check citizen.Personal?.age)
  for (const [category, fields] of Object.entries(CATEGORIZED_FIELDS)) {
    if (fields.includes(fieldPath) && citizen[category] && typeof citizen[category] === 'object') {
      const val = citizen[category][fieldPath];
      if (val !== undefined && val !== null) return val;
    }
  }

  return undefined;
};
