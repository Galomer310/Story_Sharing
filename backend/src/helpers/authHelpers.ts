import jwt from 'jsonwebtoken';

/**
 * Generate an Access Token
 */
export const generateAccessToken = (userId: number, username: string) => {
  return jwt.sign({ userId, username }, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
  });
};

/**
 * Generate a Refresh Token
 */
export const generateRefreshToken = (userId: number) => {
  return jwt.sign({ userId }, process.env.REFRESH_SECRET as string, {
    expiresIn: '7d',
  });
};
