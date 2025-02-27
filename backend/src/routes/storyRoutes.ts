import express from 'express';
import {
  createStory,
  getStories,
  getStoryById,
  updateStory,
  deleteStory,
} from '../controllers/storyController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateToken, createStory);
router.get('/', authenticateToken, getStories);
router.get('/:storyId', authenticateToken, getStoryById);
router.put('/:storyId', authenticateToken, updateStory);
router.delete('/:storyId', authenticateToken, deleteStory);

export default router;
