import express from 'express';
import { sendRfpEmail, testEmail, checkInbox } from '../controllers/email.controller.js';

const router = express.Router();

// Check inbox
router.post('/check', checkInbox);

router.post('/send-rfp', sendRfpEmail);
router.get('/test', testEmail);

export default router;
