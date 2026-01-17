/**
 * Repairs common JSON issues from LLM outputs
 * @param {string} text - Raw text that might contain JSON
 * @returns {string} - Cleaned JSON string
 */
function repairJson(text) {
  let cleaned = text;

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/g, '');
  cleaned = cleaned.replace(/```\s*/g, '');
  
  // Remove common LLM prefixes
  cleaned = cleaned.replace(/^(Here's the JSON|Here is the JSON|JSON output|Output):\s*/i, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Extracts JSON from text with repair logic
 * @param {string} text - Raw text containing JSON
 * @returns {object} - Parsed JSON object
 * @throws {Error} - If no valid JSON found
 */
export function extractJson(text) {
  // First, try to repair common issues
  const repaired = repairJson(text);
  
  // Find JSON object boundaries
  const firstBrace = repaired.indexOf('{');
  const lastBrace = repaired.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No JSON object found in AI response');
  }

  const jsonString = repaired.substring(firstBrace, lastBrace + 1);
  
  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    // Log the problematic JSON for debugging
    console.error('❌ Failed to parse JSON:', jsonString.substring(0, 200));
    throw new Error(`Invalid JSON structure: ${parseError.message}`);
  }
}
