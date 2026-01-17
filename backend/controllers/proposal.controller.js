import Proposal from '../models/Proposal.model.js';

/**
 * Create a new proposal (manually or from email)
 */
export async function createProposal(req, res) {
  try {
    const { rfpId, vendorId, emailSubject, emailBody, parsedData } = req.body;
    
    const proposal = await Proposal.create({
      rfp: rfpId,
      vendor: vendorId,
      emailSubject,
      emailBody,
      emailReceivedAt: new Date(),
      parsedData,
      aiExtracted: !!parsedData
    });
    
    await proposal.populate('vendor', 'name company email');
    
    res.status(201).json(proposal);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Proposal from this vendor already exists for this RFP' });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get all proposals for an RFP
 */
export async function getProposalsByRfp(req, res) {
  try {
    const proposals = await Proposal.find({ rfp: req.params.rfpId })
      .populate('vendor', 'name company email phone')
      .sort({ createdAt: -1 });
    
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get single proposal
 */
export async function getProposalById(req, res) {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('vendor', 'name company email phone')
      .populate('rfp', 'title referenceId');
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Update proposal (e.g., after AI parsing or manual review)
 */
export async function updateProposal(req, res) {
  try {
    const { parsedData, status, aiExtracted, aiConfidence } = req.body;
    
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { parsedData, status, aiExtracted, aiConfidence },
      { new: true, runValidators: true }
    ).populate('vendor', 'name company email');
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Delete proposal
 */
export async function deleteProposal(req, res) {
  try {
    const proposal = await Proposal.findByIdAndDelete(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    res.json({ message: 'Proposal deleted successfully', proposal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
