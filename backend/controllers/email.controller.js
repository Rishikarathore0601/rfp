import RFP from '../models/RFP.model.js';
import Vendor from '../models/Vendor.model.js';
import { sendRfpToVendors, testEmailConfig } from '../services/email.service.js';
import { checkEmailsForProposals } from '../services/imap.service.js';

/**
 * Send RFP to selected vendors via email
 */
export async function sendRfpEmail(req, res) {
  try {
    const { rfpId, vendorIds } = req.body;
    
    if (!rfpId || !Array.isArray(vendorIds) || vendorIds.length === 0) {
      return res.status(400).json({ error: 'rfpId and vendorIds array are required' });
    }
    
    // Get RFP
    const rfp = await RFP.findById(rfpId);
    if (!rfp) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    
    // Get vendors
    const vendors = await Vendor.find({ _id: { $in: vendorIds }, isActive: true });
    if (vendors.length === 0) {
      return res.status(404).json({ error: 'No active vendors found' });
    }
    
    // Send emails
    const results = await sendRfpToVendors(rfp, vendors);
    
    // Update RFP status
    if (results.sent.length > 0) {
      await RFP.findByIdAndUpdate(rfpId, { status: 'SENT' });
    }
    
    res.json({
      message: `Sent to ${results.sent.length} vendors, ${results.failed.length} failed`,
      results
    });
    
  } catch (err) {
    console.error('❌ Email sending failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}

/**
 * Test email configuration
 */
export async function testEmail(req, res) {
  try {
    const isValid = await testEmailConfig();
    
    if (isValid) {
      res.json({ message: 'Email configuration is valid' });
    } else {
      res.status(500).json({ error: 'Email configuration is invalid' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Check inbox for new proposals
 */
export async function checkInbox(req, res) {
  try {
    const results = await checkEmailsForProposals();
    res.json({
        message: 'Inbox checked successfully',
        processed: results.processed,
        errors: results.errors
    });
  } catch (err) {
    console.error('❌ Check inbox failed:', err.message);
    res.status(500).json({ error: err.message });
  }
}
