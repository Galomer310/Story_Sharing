/**
 * General types for the backend
 */
export interface JwtPayload {
    userId: number;
    username: string;
    iat?: number;
    exp?: number;
  }
  
  export interface RegisterRequestBody {
    username: string;
    email: string;
    password: string;
  }
  
  export interface LoginRequestBody {
    username: string;
    password: string;
  }
  
  /**
   * Extending Express Request to include "user"
   */
  declare global {
    namespace Express {
      interface Request {
        user?: {
          id: number;
          username: string;
        };
      }
    }
  }
  