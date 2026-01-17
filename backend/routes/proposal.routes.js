import express from 'express';
import { 
  createProposal, 
  getProposalsByRfp, 
  getProposalById, 
  updateProposal, 
  deleteProposal 
} from '../controllers/proposal.controller.js';

const router = express.Router();

router.post('/', createProposal);
router.get('/rfp/:rfpId', getProposalsByRfp);
router.get('/:id', getProposalById);
router.put('/:id', updateProposal);
router.delete('/:id', deleteProposal);

export default router;
