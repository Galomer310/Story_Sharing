import { Request, Response, NextFunction } from 'express';
import pool from '../db/connection';

/**
 * Create a new story
 */
export const createStory = async (req: Request, res: Response, next: NextFunction) => {
  const { title, content, background_color } = req.body;
  const authorId = req.user?.id;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  if (!authorId) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO stories (title, content, author_id, background_color) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, authorId, background_color || 'lightcoral']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create story error:', error);
    next(error);
  }
};

/**
 * Get all stories
 */
export const getStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id || 0; // 0 means "not logged in"

    const query = `
      SELECT s.*,
             u.username AS author_username,
             CASE WHEN s.author_id = $1 THEN 'author' ELSE 'none' END AS user_role
      FROM stories s
      JOIN users u ON s.author_id = u.id
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get stories error:', error);
    next(error);
  }
};

/**
 * Get one story by ID
 */
export const getStoryById = async (req: Request, res: Response, next: NextFunction) => {
  const { storyId } = req.params;
  try {
    const query = `
      SELECT s.*, u.username AS author_username
      FROM stories s
      JOIN users u ON s.author_id = u.id
      WHERE s.id = $1
    `;
    const result = await pool.query(query, [storyId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get story by ID error:', error);
    next(error);
  }
};

/**
 * Update a story (only the author can update)
 */
export const updateStory = async (req: Request, res: Response, next: NextFunction) => {
  const { storyId } = req.params;
  const { title, content, background_color } = req.body;
  const userId = req.user?.id;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  if (!userId) {
    return res.status(403).json({ error: 'User not authenticated' });
  }

  try {
    const result = await pool.query(
      `UPDATE stories
       SET title = $1,
           content = $2,
           background_color = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND author_id = $5
       RETURNING *
      `,
      [title, content, background_color, storyId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Story not found or not authorized' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update story error:', error);
    next(error);
  }
};

/**
 * Delete a story (only the author can delete)
 */
export const deleteStory = async (req: Request, res: Response, next: NextFunction) => {
  const { storyId } = req.params;
  const userId = req.user?.id;
  try {
    const result = await pool.query(
      'DELETE FROM stories WHERE id = $1 AND author_id = $2 RETURNING *',
      [storyId, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Story not found or not authorized' });
    }
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    next(error);
  }
};
