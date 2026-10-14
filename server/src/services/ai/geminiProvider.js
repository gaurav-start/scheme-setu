import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

/**
 * Isolated Google Gemini Provider
 * Uses @google/genai SDK to invoke Gemini models (e.g. gemini-2.5-flash)
 */
export const callGeminiLLM = async (messages, options = {}) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  // In unit/integration tests, return mock JSON structure
  if (process.env.NODE_ENV === 'test') {
    return JSON.stringify({
      extracted: { age: 25, gender: 'female', category: 'OBC', annualIncome: 180000, state: 'Uttar Pradesh' },
      conflicts: []
    });
  }

  if (!apiKey || apiKey.startsWith('test_') || apiKey.includes('placeholder') || apiKey.includes('your_')) {
    throw new Error('GEMINI_API_KEY environment variable is not configured in server/.env');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format system prompt and user text from messages array
  const systemMessage = messages.find((m) => m.role === 'system')?.content || '';
  const userMessage = messages.find((m) => m.role === 'user')?.content || '';

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemMessage}\n\nUSER INPUT TEXT:\n${userMessage}` }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: options.temperature ?? 0,
    }
  });

  const content = response.text;
  if (!content) {
    throw new Error('Gemini API returned empty completion content');
  }

  return content;
};
