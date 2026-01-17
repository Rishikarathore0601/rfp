import express from 'express';
import { getComparison } from '../controllers/comparison.controller.js';

const router = express.Router();

router.get('/:rfpId', getComparison);

export default router;
