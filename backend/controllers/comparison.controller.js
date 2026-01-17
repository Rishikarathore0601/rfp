import { compareProposals } from '../services/comparison.service.js';

/**
 * Get comparison for all proposals of an RFP
 */
export async function getComparison(req, res) {
  try {
    const { rfpId } = req.params;
    
    const comparison = await compareProposals(rfpId);
    
    res.json(comparison);
  } catch (err) {
    if (err.message.includes('No proposals found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
}
