// backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/connection';
import { generateAccessToken, generateRefreshToken } from '../helpers/authHelpers';
import { RegisterRequestBody, LoginRequestBody } from '../types/types';
/**
 * Register a new user
 */
export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // Check if user already exists
    const existing = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username',
      [username, email, hashedPassword]
    );
    const newUser = result.rows[0];

    // Generate tokens
    const accessToken = generateAccessToken(newUser.id, newUser.username);
    const refreshToken = generateRefreshToken(newUser.id);

    // Set refresh token as a cookie (optional if you want to store refresh tokens)
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return res.status(201).json({ message: 'User registered successfully', accessToken });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Login controller
 */
export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if user exists
    const userQuery = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userQuery.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = userQuery.rows[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return res.json({ message: 'Login successful', accessToken });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Refresh token controller
 */
export const refreshAccessToken = (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET as string, (err: jwt.VerifyErrors | null, decoded: any) => {
    if (err) return res.sendStatus(403);

    const userId = (decoded as any).userId;
    const username = (decoded as any).username || 'unknown';

    const newAccessToken = generateAccessToken(userId, username);
    return res.json({ accessToken: newAccessToken });
  });
};



export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, username FROM users ORDER BY username ASC');
    return res.json(result.rows);
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};