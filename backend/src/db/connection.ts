import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// Create the connection pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
  ssl: { rejectUnauthorized: false }, // For many cloud DBs (like Neon), SSL is required
});

export default pool;
