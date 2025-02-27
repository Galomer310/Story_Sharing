import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, sendMessage);
router.get('/', authenticateToken, getMessages);

export default router;
