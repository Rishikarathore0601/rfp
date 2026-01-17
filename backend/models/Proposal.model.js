import mongoose from 'mongoose';

const ProposalSchema = new mongoose.Schema({
  rfp: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'RFP',
    required: true
  },
  vendor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vendor',
    required: true
  },
  
  // Raw email data
  emailSubject: String,
  emailBody: String,
  emailReceivedAt: Date,
  
  // Parsed proposal data (extracted by AI)
  parsedData: {
    totalPrice: Number,
    currency: { type: String, default: 'USD' },
    deliveryDays: Number,
    paymentTerms: String,
    warranty: String,
    itemPrices: [{
      itemName: String,
      unitPrice: Number,
      quantity: Number,
      totalPrice: Number
    }],
    additionalNotes: String
  },
  
  // AI extraction metadata
  aiExtracted: {
    type: Boolean,
    default: false
  },
  aiConfidence: {
    type: Number,
    min: 0,
    max: 1
  },
  
  status: {
    type: String,
    enum: ['RECEIVED', 'PARSED', 'REVIEWED', 'ACCEPTED', 'REJECTED'],
    default: 'RECEIVED'
  }
}, { timestamps: true });

// Compound index for RFP-Vendor uniqueness
ProposalSchema.index({ rfp: 1, vendor: 1 }, { unique: true });

export default mongoose.model('Proposal', ProposalSchema);
