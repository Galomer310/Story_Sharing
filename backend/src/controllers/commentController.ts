// backend/src/controllers/commentController.ts
import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  const { storyId, comment_text } = req.body;
  const userId = req.user?.id;

  if (!storyId || !comment_text) {
    return res.status(400).json({ error: 'Story ID and comment text are required' });
  }
  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO story_comments (story_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
      [storyId, userId, comment_text]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    next(error);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  const { storyId } = req.params;
  try {
    const query = `
      SELECT sc.*, u.username
      FROM story_comments sc
      JOIN users u ON sc.user_id = u.id
      WHERE sc.story_id = $1
      ORDER BY sc.created_at ASC
    `;
    const result = await pool.query(query, [storyId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    next(error);
  }
};

/**
 * Update a comment (only the author can do it).
 * commentId is a URL param. The new text is in req.body.comment_text.
 */
export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId } = req.params;
  const { comment_text } = req.body;
  const userId = req.user?.id;

  if (!comment_text) {
    return res.status(400).json({ error: 'comment_text is required' });
  }
  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      `UPDATE story_comments
       SET comment_text = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *
      `,
      [comment_text, commentId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update comment error:', error);
    next(error);
  }
};

/**
 * Delete a comment (only the author can do it).
 */
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  const { commentId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM story_comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [commentId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found or not authorized' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    next(error);
  }
};
