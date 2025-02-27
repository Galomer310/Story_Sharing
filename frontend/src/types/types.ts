/**
 * Shared types for the frontend
 */

export interface User {
    id: number;
    username: string;
  }
  
  export interface Story {
    id: number;
    title: string;
    content: string;
    background_color: string;
    author_username: string;
    created_at: string;
    user_role: 'author' | 'none';
  }
  