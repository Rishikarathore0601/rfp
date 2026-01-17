import mongoose from 'mongoose';

const VendorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  company: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index handled by unique: true above

export default mongoose.model('Vendor', VendorSchema);
