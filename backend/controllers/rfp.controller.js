import RFP from '../models/RFP.model.js';
import { generateStructuredRfp } from '../services/aiRfp.service.js';

/**
 * Create RFP using AI to parse natural language
 */
export async function createRfpWithAI(req, res) {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    console.log('📝 Creating RFP from description...');
    const structuredData = await generateStructuredRfp(description);

    const rfp = await RFP.create({
      title: structuredData.title,
      description,
      structuredData
    });

    console.log('✅ RFP created:', rfp.referenceId);
    res.json(rfp);
  } catch (err) {
    console.error('❌ RFP creation failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get all RFPs
 */
export async function getAllRfps(req, res) {
  try {
    const rfps = await RFP.find()
      .populate('vendors', 'name company email')
      .sort({ createdAt: -1 });
    res.json(rfps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get single RFP by ID
 */
export async function getRfpById(req, res) {
  try {
    const rfp = await RFP.findById(req.params.id)
      .populate('vendors', 'name company email phone');
    
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    res.json(rfp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Update RFP
 */
export async function updateRfp(req, res) {
  try {
    const { title, status, structuredData } = req.body;
    
    const rfp = await RFP.findByIdAndUpdate(
      req.params.id,
      { title, status, structuredData },
      { new: true, runValidators: true }
    );
    
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    res.json(rfp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Delete RFP
 */
export async function deleteRfp(req, res) {
  try {
    const rfp = await RFP.findByIdAndDelete(req.params.id);
    
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    res.json({ message: 'RFP deleted successfully', rfp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Associate vendors with an RFP
 */
export async function associateVendors(req, res) {
  try {
    const { vendorIds } = req.body;
    
    if (!Array.isArray(vendorIds)) {
      return res.status(400).json({ error: 'vendorIds must be an array' });
    }
    
    const rfp = await RFP.findByIdAndUpdate(
      req.params.id,
      { vendors: vendorIds },
      { new: true }
    ).populate('vendors', 'name company email');
    
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    res.json(rfp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
