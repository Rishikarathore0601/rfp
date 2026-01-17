import { callOllama } from './ollama.service.js';
import { extractJson } from '../utils/jsonExtractor.js';
import { validateRFP } from '../utils/jsonValidator.js';

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates structured RFP from natural language with retry mechanism
 * @param {string} userText - Natural language description of procurement needs
 * @returns {Promise<object>} - Validated structured RFP data
 */
export async function generateStructuredRfp(userText) {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000; // 1 second
  
  const prompt = `Convert this request into a valid JSON RFP.
IMPORTANT: You MUST include ALL fields in the schema. Do not skip any.

SCHEMA:
{
  "title": "Clear concise title",
  "summary": "2-3 sentence overview",
  "budget": 1000,
  "currency": "USD",
  "delivery_days": 14,
  "items": [{ "name": "Item Name", "quantity": 1, "specs": "Technical specs" }],
  "payment_terms": "e.g. Net 30",
  "warranty": "e.g. 1 Year"
}

REQUEST:
${userText}

Return ONLY the JSON object.`;

  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🤖 AI Generation Attempt ${attempt}/${MAX_RETRIES}`);
      
      // Call Ollama
      const raw = await callOllama(prompt);
      console.log('🧠 Raw AI Output:', raw.substring(0, 300) + '...');
      
      // Extract JSON
      const extracted = extractJson(raw);
      console.log('✅ JSON Extracted Successfully');
      
      // Validate against schema
      const validated = validateRFP(extracted);
      console.log('✅ Schema Validation Passed');
      
      return validated;
      
    } catch (err) {
      lastError = err;
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  // All retries failed
  console.error('❌ All AI generation attempts failed');
  throw new Error(`AI parsing failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}

