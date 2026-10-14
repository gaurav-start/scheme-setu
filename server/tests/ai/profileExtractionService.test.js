import { extractCitizenProfile } from '../../src/services/ai/profileExtractionService.js';

describe('AI Profile Extraction Service', () => {
  test('extracts structured citizen attributes from natural language text', async () => {
    const inputText =
      "I am Rishabh, I am male, 21 years old, unmarried, OBC category and I don't have any disability. I live in Lucknow and my annual income is around 2.5 lakh.";

    const mockLlmResponse = JSON.stringify({
      extracted: {
        name: 'Rishabh',
        gender: 'male',
        age: 21,
        maritalStatus: 'unmarried',
        category: 'OBC',
        disabilityStatus: 'none',
        district: 'Lucknow',
        annualIncome: 250000,
      },
      conflicts: [],
    });

    const result = await extractCitizenProfile(inputText, async () => mockLlmResponse);

    expect(result.extracted).toEqual({
      name: 'Rishabh',
      gender: 'male',
      age: 21,
      maritalStatus: 'unmarried',
      category: 'OBC',
      disabilityStatus: 'none',
      district: 'Lucknow',
      annualIncome: 250000,
    });

    expect(result.conflicts).toEqual([]);
    expect(result.missingFields).toContain('state');
    expect(result.missingFields).toContain('occupation');
  });

  test('does NOT invent unmentioned fields', async () => {
    const inputText = 'I am 21 and I live in Lucknow.';

    const mockLlmResponse = JSON.stringify({
      extracted: {
        age: 21,
        district: 'Lucknow',
      },
      conflicts: [],
    });

    const result = await extractCitizenProfile(inputText, async () => mockLlmResponse);

    expect(result.extracted).toEqual({
      age: 21,
      district: 'Lucknow',
    });

    expect(result.extracted.gender).toBeUndefined();
    expect(result.extracted.category).toBeUndefined();
    expect(result.missingFields).toContain('gender');
    expect(result.missingFields).toContain('category');
  });

  test('filters out forbidden or system fields', async () => {
    const inputText = 'I am 25 years old.';

    const mockLlmResponse = JSON.stringify({
      extracted: {
        age: 25,
        role: 'admin',
        password: 'hacked_password',
        eligible: true,
        schemeId: '12345',
      },
      conflicts: [],
    });

    const result = await extractCitizenProfile(inputText, async () => mockLlmResponse);

    expect(result.extracted).toEqual({ age: 25 });
    expect(result.extracted.role).toBeUndefined();
    expect(result.extracted.password).toBeUndefined();
    expect(result.extracted.eligible).toBeUndefined();
  });

  test('detects contradictory facts stated by the user', async () => {
    const inputText = "I am 21 years old. Actually I'm 24.";

    const mockLlmResponse = JSON.stringify({
      extracted: {},
      conflicts: [
        {
          field: 'age',
          values: [21, 24],
        },
      ],
    });

    const result = await extractCitizenProfile(inputText, async () => mockLlmResponse);

    expect(result.conflicts).toEqual([{ field: 'age', values: [21, 24] }]);
    expect(result.extracted.age).toBeUndefined();
  });
});
