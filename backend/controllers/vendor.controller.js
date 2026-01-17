import Vendor from '../models/Vendor.model.js';

/**
 * Create a new vendor
 */
export async function createVendor(req, res) {
  try {
    const { name, company, email, phone, address, notes } = req.body;
    
    const vendor = await Vendor.create({
      name,
      company,
      email,
      phone,
      address,
      notes
    });
    
    res.status(201).json(vendor);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get all vendors
 */
export async function getAllVendors(req, res) {
  try {
    const { isActive } = req.query;
    const filter = isActive !== undefined ? { isActive: isActive === 'true' } : {};
    
    const vendors = await Vendor.find(filter).sort({ company: 1 });
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Get vendor by ID
 */
export async function getVendorById(req, res) {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Update vendor
 */
export async function updateVendor(req, res) {
  try {
    const { name, company, email, phone, address, notes, isActive } = req.body;
    
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { name, company, email, phone, address, notes, isActive },
      { new: true, runValidators: true }
    );
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json(vendor);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * Delete vendor
 */
export async function deleteVendor(req, res) {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    
    res.json({ message: 'Vendor deleted successfully', vendor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
