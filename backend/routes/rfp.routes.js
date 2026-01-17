import express from 'express';
import { 
  createRfpWithAI, 
  getAllRfps, 
  getRfpById, 
  updateRfp, 
  deleteRfp,
  associateVendors 
} from '../controllers/rfp.controller.js';

const router = express.Router();

router.post('/ai-generate', createRfpWithAI);
router.get('/', getAllRfps);
router.get('/:id', getRfpById);
router.put('/:id', updateRfp);
router.delete('/:id', deleteRfp);
router.post('/:id/vendors', associateVendors);

export default router;
