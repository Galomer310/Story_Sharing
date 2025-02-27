import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

/**
 * Send a private message from logged-in user to another user
 */
export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  const { receiver_id, message_text } = req.body;
  const sender_id = req.user?.id;

  if (!receiver_id || !message_text) {
    return res.status(400).json({ error: 'Receiver ID and message text are required' });
  }
  if (!sender_id) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO private_messages (sender_id, receiver_id, message_text)
       VALUES ($1, $2, $3) RETURNING *
      `,
      [sender_id, receiver_id, message_text]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Send message error:', error);
    next(error);
  }
};

/**
 * Get all private messages for the logged-in user
 */
export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  try {
    const query = `
      SELECT pm.*, s.username AS sender_username
      FROM private_messages pm
      JOIN users s ON pm.sender_id = s.id
      WHERE pm.receiver_id = $1
      ORDER BY pm.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get messages error:', error);
    next(error);
  }
};
