import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import storyRoutes from './routes/storyRoutes';
import commentRoutes from './routes/commentRoutes';
import messageRoutes from './routes/messageRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS config
const allowedOrigins = [
  "https://story-sharing-site.onrender.com" // your frontend's origin
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);

// Serve static files if you'd like (for a single Heroku/Render deployment)
// e.g. app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Global error handler
app.use(errorHandler);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
