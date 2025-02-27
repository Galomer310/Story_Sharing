// backend/src/routes/commentRoutes.ts
import express from 'express';
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
} from '../controllers/commentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Add a comment to a story
router.post('/', authenticateToken, addComment);

// Get all comments for a story
router.get('/:storyId', getComments);

// NEW: update a comment
router.put('/:commentId', authenticateToken, updateComment);

// NEW: delete a comment
router.delete('/:commentId', authenticateToken, deleteComment);

export default router;
