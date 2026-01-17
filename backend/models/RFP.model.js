import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  specs: { type: String, default: '' }
}, { _id: false });

const RFPSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // Original user input
  
  structuredData: {
    title: String,
    summary: String,
    budget: Number,
    currency: { type: String, default: 'USD' },
    delivery_days: Number,
    items: [ItemSchema],
    payment_terms: String,
    warranty: String
  },
  
  vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  
  status: {
    type: String,
    enum: ['DRAFT', 'SENT', 'CLOSED'],
    default: 'DRAFT'
  },
  
  referenceId: { 
    type: String, 
    unique: true,
    default: () => `RFP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}, { timestamps: true });

export default mongoose.model('RFP', RFPSchema);
