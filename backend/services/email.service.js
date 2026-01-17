import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create email transporter for Gmail
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password
    }
  });
};

/**
 * Generate RFP email content
 */
function generateRfpEmail(rfp) {
  const { structuredData, referenceId } = rfp;
  
  let itemsList = '';
  if (structuredData.items && structuredData.items.length > 0) {
    itemsList = structuredData.items.map((item, index) => 
      `${index + 1}. ${item.name} - Quantity: ${item.quantity}${item.specs ? ` (${item.specs})` : ''}`
    ).join('\n');
  }
  
  return `
Subject: Request for Proposal - ${structuredData.title || rfp.title}

Dear Vendor,

We are requesting proposals for the following procurement:

REFERENCE ID: ${referenceId}
(Please include this reference ID in your response)

SUMMARY:
${structuredData.summary || rfp.description}

ITEMS REQUIRED:
${itemsList}

BUDGET: ${structuredData.currency || 'USD'} ${structuredData.budget || 'N/A'}
DELIVERY TIMEFRAME: ${structuredData.delivery_days || 'N/A'} days
PAYMENT TERMS: ${structuredData.payment_terms || 'N/A'}
WARRANTY REQUIREMENTS: ${structuredData.warranty || 'N/A'}

Please provide your proposal including:
1. Detailed pricing for each item
2. Total cost
3. Delivery timeline
4. Payment terms you can offer
5. Warranty information
6. Any additional terms or conditions

Please reply to this email with your proposal.

Best regards,
Procurement Team
  `.trim();
}

/**
 * Send RFP to multiple vendors
 * @param {object} rfp - RFP document
 * @param {array} vendors - Array of vendor documents
 * @returns {Promise<object>} - Send results
 */
export async function sendRfpToVendors(rfp, vendors) {
  const transporter = createTransporter();
  const emailContent = generateRfpEmail(rfp);
  
  const results = {
    sent: [],
    failed: []
  };
  
  for (const vendor of vendors) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: vendor.email,
        subject: `Request for Proposal - ${rfp.structuredData.title || rfp.title}`,
        text: emailContent
      };
      
      await transporter.sendMail(mailOptions);
      
      results.sent.push({
        vendorId: vendor._id,
        vendorName: vendor.name,
        email: vendor.email
      });
      
      console.log(`✅ Email sent to ${vendor.name} (${vendor.email})`);
      
    } catch (error) {
      results.failed.push({
        vendorId: vendor._id,
        vendorName: vendor.name,
        email: vendor.email,
        error: error.message
      });
      
      console.error(`❌ Failed to send email to ${vendor.name}:`, error.message);
    }
  }
  
  return results;
}

/**
 * Test email configuration
 */
export async function testEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
}
