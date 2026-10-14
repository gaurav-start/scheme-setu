import { callGeminiLLM } from './geminiProvider.js';
import { isFieldAllowed } from '../eligibility/fieldWhitelist.js';
import { extractedProfileSchema } from '../../validations/profileValidation.js';

// Core list of standard citizen fields for missing fields tracking
const STANDARD_PROFILE_FIELDS = [
  'name',
  'age',
  'gender',
  'category',
  'maritalStatus',
  'disabilityStatus',
  'annualIncome',
  'occupation',
  'employmentStatus',
  'landHolding',
  'economicCategory',
  'state',
  'district',
  'block',
  'ruralUrban',
  'familySize',
  'familyIncome',
  'hasBPLCard',
  'rationCardType',
  'ownsHouse',
  'isStudent',
  'isFarmer',
  'isWidow',
  'isSeniorCitizen',
  'isOrphan',
  'isExServiceman',
  'educationLevel',
  'bankAccount',
];

const SYSTEM_PROMPT = `You are a structured information extraction system specializing in Indian citizen profiles.

Your job is to extract citizen profile facts from natural language text written in English or any of the 22 Eighth Schedule languages of India (Assamese, Bengali, Bodo, Dogri, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, Urdu) or regional scripts/transliterations.

STRICT INSTRUCTIONS:
1. Extract ONLY facts explicitly stated by the user in any supported language or script.
2. Do NOT infer, guess, or invent missing values.
3. Do NOT determine eligibility or scheme rules.
4. Do NOT provide recommendations or advice.
5. Translate and map extracted values to the standard JSON values specified in the allowed schema below:
   - name (string)
   - age (integer number 0-120)
   - gender ("male" | "female" | "other" | "prefer_not_to_say")
   - category ("GENERAL" | "OBC" | "SC" | "ST" | "EWS")
   - maritalStatus ("unmarried" | "married" | "widowed" | "divorced" | "separated")
   - disabilityStatus ("none" | "disabled")
   - annualIncome (number >= 0)
   - occupation (string)
   - employmentStatus (string)
   - landHolding (number >= 0)
   - economicCategory ("APL" | "BPL" | "EWS")
   - state (string)
   - district (string)
   - block (string)
   - ruralUrban ("rural" | "urban")
   - familySize (integer number)
   - familyIncome (number >= 0)
   - hasBPLCard (boolean)
   - rationCardType (string)
   - ownsHouse (boolean)
   - isStudent (boolean)
   - isFarmer (boolean)
   - isWidow (boolean)
   - isSeniorCitizen (boolean)
   - isOrphan (boolean)
   - isExServiceman (boolean)
   - educationLevel (string)
   - bankAccount (boolean)

6. If the user explicitly states contradictory values for the same field, DO NOT pick one. Instead, record it under the "conflicts" array as:
   {"field": "age", "values": [21, 24]}

7. Return JSON format matching:
{
  "extracted": { ... },
  "conflicts": [ {"field": "fieldName", "values": [...]} ]
}`;

/**
 * Filter and sanitize raw extracted object against whitelist and forbidden keys
 */
const sanitizeExtractedFields = (rawExtracted) => {
  if (!rawExtracted || typeof rawExtracted !== 'object' || Array.isArray(rawExtracted)) {
    return {};
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(rawExtracted)) {
    // Whitelist check
    if (isFieldAllowed(key) && value !== null && value !== undefined && value !== '') {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Heuristic fallback fact extraction when LLM API is out of quota or offline
 */
const extractFallbackFacts = (text) => {
  const extracted = {};
  const lower = text.toLowerCase();

  // Age matching (e.g., "21 years old", "21 years", "age 21", "21 yr")
  const ageMatch = text.match(/\b(\d{1,2})\s*(?:years|yr|yrs|year|yo|y\/o)\b/i) || text.match(/\bage\s*(?:is|:)?\s*(\d{1,2})\b/i);
  if (ageMatch && ageMatch[1]) {
    const ageNum = parseInt(ageMatch[1], 10);
    if (ageNum >= 0 && ageNum <= 120) extracted.age = ageNum;
  }

  // Gender matching
  if (/\b(?:male|man|boy|purush)\b/i.test(lower)) extracted.gender = 'male';
  else if (/\b(?:female|woman|girl|mahila|stri)\b/i.test(lower)) extracted.gender = 'female';

  // Category matching
  if (/\bobc\b/i.test(lower)) extracted.category = 'OBC';
  else if (/\bsc\b/i.test(lower)) extracted.category = 'SC';
  else if (/\bst\b/i.test(lower)) extracted.category = 'ST';
  else if (/\bews\b/i.test(lower)) extracted.category = 'EWS';
  else if (/\bgeneral\b/i.test(lower)) extracted.category = 'GENERAL';

  // Marital status
  if (/\b(?:unmarried|single)\b/i.test(lower)) extracted.maritalStatus = 'unmarried';
  else if (/\b(?:married)\b/i.test(lower)) extracted.maritalStatus = 'married';
  else if (/\b(?:widow|widowed)\b/i.test(lower)) extracted.maritalStatus = 'widowed';

  // Annual Income matching (e.g. "2.5 lakh", "250000", "income of 2 lakh")
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs)\b/i);
  if (lakhMatch && lakhMatch[1]) {
    extracted.annualIncome = parseFloat(lakhMatch[1]) * 100000;
  } else {
    const rawIncomeMatch = text.match(/(?:income|salary)\s*(?:of|is|:)?\s*₹?\s*([\d,]+)/i);
    if (rawIncomeMatch && rawIncomeMatch[1]) {
      const val = parseInt(rawIncomeMatch[1].replace(/,/g, ''), 10);
      if (!isNaN(val)) extracted.annualIncome = val;
    }
  }

  // State matching
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];
  for (const s of states) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(text)) {
      extracted.state = s;
      break;
    }
  }

  return { extracted, conflicts: [] };
};

/**
 * Main service to extract citizen profile candidate facts from natural language
 */
export const extractCitizenProfile = async (text, providerOverride = null) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Input text is required for profile extraction');
  }

  let parsed = { extracted: {}, conflicts: [] };

  try {
    let jsonResponseText;
    if (providerOverride) {
      jsonResponseText = await providerOverride(text);
    } else {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ];
      jsonResponseText = await callGeminiLLM(messages);
    }

    try {
      parsed = JSON.parse(jsonResponseText);
    } catch (_) {
      parsed = extractFallbackFacts(text);
    }
  } catch (llmError) {
    console.warn('Gemini LLM extraction failed or key missing. Using deterministic fallback fact extractor:', llmError.message);
    parsed = extractFallbackFacts(text);
  }

  const rawExtracted = parsed.extracted || parsed;
  const rawConflicts = Array.isArray(parsed.conflicts) ? parsed.conflicts : [];

  // Sanitize extracted fields against whitelist
  const sanitizedCandidate = sanitizeExtractedFields(rawExtracted);

  // Zod validation against extractedProfileSchema
  let validatedExtracted = {};
  try {
    validatedExtracted = extractedProfileSchema.parse(sanitizedCandidate);
  } catch (zodError) {
    // Remove invalid keys that failed Zod validation
    const validKeys = {};
    for (const [key, val] of Object.entries(sanitizedCandidate)) {
      try {
        extractedProfileSchema.parse({ [key]: val });
        validKeys[key] = val;
      } catch (_) {
        // Drop invalid field
      }
    }
    validatedExtracted = validKeys;
  }

  // Calculate missing fields from STANDARD_PROFILE_FIELDS
  const extractedKeys = new Set(Object.keys(validatedExtracted));
  const conflictedKeys = new Set(rawConflicts.map((c) => c.field));

  const missingFields = STANDARD_PROFILE_FIELDS.filter(
    (field) => !extractedKeys.has(field) && !conflictedKeys.has(field)
  );

  return {
    extracted: validatedExtracted,
    missingFields,
    conflicts: rawConflicts,
  };
};
