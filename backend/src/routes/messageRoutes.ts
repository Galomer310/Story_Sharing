import express from 'express';
import { sendMessage, getMessages, deleteMessage } from '../controllers/messageController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, sendMessage);
router.get('/', authenticateToken, getMessages);
router.delete('/:messageId', authenticateToken, deleteMessage);

export default router;
