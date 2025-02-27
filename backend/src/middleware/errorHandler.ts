import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error:', err);
  res.status(500).json({ error: 'Something went wrong' });
};
