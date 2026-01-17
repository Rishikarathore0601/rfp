import { z } from 'zod';

// Zod schema for RFP structure validation
const ItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  specs: z.string().optional().default('')
});

export const RFPSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  summary: z.string().min(1, 'Summary is required'),
  budget: z.number().positive('Budget must be a positive number'),
  currency: z.string().min(1, 'Currency is required').default('USD'),
  delivery_days: z.number().int().positive('Delivery days must be a positive integer'),
  items: z.array(ItemSchema).min(1, 'At least one item is required'),
  payment_terms: z.string().min(1, 'Payment terms are required'),
  warranty: z.string().min(1, 'Warranty information is required')
});

/**
 * Validates RFP data against the schema
 * @param {object} data - The data to validate
 * @returns {object} - Validated and sanitized data
 * @throws {Error} - If validation fails
 */
export function validateRFP(data) {
  try {
    return RFPSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('🔍 Zod Validation Error:', JSON.stringify(error.errors, null, 2));
      const messages = (error.errors || []).map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`RFP validation failed: ${messages || 'Unknown validation error'}`);
    }
    console.error('🔍 Non-Zod Error in Validator:', error);
    throw error;
  }
}

/**
 * Safely validates RFP data and returns result with success flag
 * @param {object} data - The data to validate
 * @returns {object} - { success: boolean, data?: object, error?: string }
 */
export function safeValidateRFP(data) {
  try {
    const validated = RFPSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: messages };
    }
    return { success: false, error: error.message };
  }
}
