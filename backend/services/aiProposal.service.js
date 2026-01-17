import { callOllama } from './ollama.service.js';
import { extractJson } from '../utils/jsonExtractor.js';

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Parse vendor proposal email using AI
 * @param {string} emailBody - Raw email body from vendor
 * @param {object} rfp - Original RFP for context
 * @returns {Promise<object>} - Parsed proposal data
 */
export async function parseVendorProposal(emailBody, rfp) {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000;
  
  const prompt = `You are an AI assistant that extracts structured data from vendor proposal emails.

CRITICAL RULES:
1. Return ONLY valid JSON - no explanations, no markdown, no extra text
2. Do NOT wrap in code blocks
3. Extract pricing, delivery, and terms information
4. If information is not found, use null

REQUIRED JSON SCHEMA:
{
  "totalPrice": number or null - total price quoted,
  "currency": "string" - currency code (USD, EUR, etc.),
  "deliveryDays": number or null - delivery timeframe in days,
  "paymentTerms": "string" - payment terms offered,
  "warranty": "string" - warranty information,
  "itemPrices": [
    {
      "itemName": "string",
      "unitPrice": number or null,
      "quantity": number or null,
      "totalPrice": number or null
    }
  ],
  "additionalNotes": "string" - any other important information
}

ORIGINAL RFP CONTEXT:
Title: ${rfp.structuredData?.title || rfp.title}
Items Requested: ${JSON.stringify(rfp.structuredData?.items || [])}

VENDOR EMAIL:
${emailBody}

Extract the proposal data as JSON:`;

  let lastError = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🤖 AI Proposal Parsing Attempt ${attempt}/${MAX_RETRIES}`);
      
      const raw = await callOllama(prompt);
      console.log('🧠 Raw AI Output:', raw.substring(0, 200) + '...');
      
      const extracted = extractJson(raw);
      console.log('✅ Proposal JSON Extracted Successfully');
      
      // Basic validation
      if (typeof extracted === 'object' && extracted !== null) {
        return extracted;
      }
      
      throw new Error('Invalid proposal structure');
      
    } catch (err) {
      lastError = err;
      console.error(`❌ Attempt ${attempt} failed:`, err.message);
      
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY * Math.pow(2, attempt - 1);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  
  console.error('❌ All proposal parsing attempts failed');
  throw new Error(`AI proposal parsing failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
}
