// backend/src/routes/authRoutes.ts
import express from 'express';
import { login, register, refreshAccessToken, getAllUsers } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);

router.get('/protected', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({
    message: 'This is a protected route',
    user: { id: req.user.id, username: req.user.username },
  });
});

// NEW: get all users (requires login)
router.get('/users', authenticateToken, getAllUsers);

export default router;
