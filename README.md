# Story Sharing

**Story Sharing** is a full-stack web application that lets users create, share, and interact with stories. Users can sign up, log in, create stories with customizable styles, comment on stories, and send private messages to one another. The application supports dynamic features like content truncation with "read more/less" toggles, rich styling options for stories, and customizable sorting of stories and messages.

## Features

- **User Authentication:**  
  Register, login, and logout with secure password hashing and JWT-based authentication.
  
- **Story Management:**  
  - Create, edit, and delete stories.
  - Customize story appearance with options for background color.
  - Long stories are automatically truncated (if over 250 characters) with a "read more/less" toggle.

- **Comments:**  
  - Add, edit, and delete comments on stories.
  - Comments display the creator's username and timestamp.

- **Private Messaging:**  
  - Send private messages between users.
  - Reply to or delete messages.
  - Sort messages by date or sender name.
  - Alert after sending a message indicating that messages remain visible until leaving the private messages area.

- **Sorting Options:**  
  - Sort stories by date, last updated, or author name.
  - Sort messages by date or sender name.

## Tech Stack

- **Backend:**  
  Node.js, Express, TypeScript, PostgreSQL  
  Uses JWT for authentication and bcrypt for password hashing.

- **Frontend:**  
  React, Vite, Redux Toolkit, TypeScript, CSS  
  Implements a dynamic UI with custom styling and state management.

- **Deployment:**  
  Render.com is used to deploy both the backend (Web Service) and frontend (Static Site).

## Folder Structure

```
story-sharing/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
│       ├── db/
│       │   └── connection.ts
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── storyController.ts
│       │   ├── commentController.ts
│       │   └── messageController.ts
│       ├── helpers/
│       │   └── authHelpers.ts
│       ├── middleware/
│       │   ├── authMiddleware.ts
│       │   └── errorHandler.ts
│       ├── routes/
│       │   ├── authRoutes.ts
│       │   ├── storyRoutes.ts
│       │   ├── commentRoutes.ts
│       │   └── messageRoutes.ts
│       ├── types/
│       │   └── types.ts
│       └── server.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── .env
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── pages/
        │   ├── HomePage.tsx
        │   ├── LoginPage.tsx
        │   ├── RegisterPage.tsx
        │   ├── UserPage.tsx
        │   ├── CreateStoryPage.tsx
        │   ├── EditStoryPage.tsx
        │   └── MessagesPage.tsx
        ├── store/
        │   ├── store.ts
        │   ├── authSlice.ts
        │   └── storySlice.ts
        ├── types/
        │   └── types.ts
        └── styles/
            └── style.css
```

## Installation

### Prerequisites

- Node.js (v14 or higher recommended)
- PostgreSQL

### Backend Setup

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the `backend/` folder with contents similar to:
   ```env
   PGUSER=your_pg_user
   PGHOST=your_pg_host
   PGDATABASE=your_pg_database
   PGPASSWORD=your_pg_password
   PGPORT=5432

   JWT_SECRET=your_jwt_secret
   REFRESH_SECRET=your_refresh_secret
   ```
4. **Set up your PostgreSQL database:**  
   Run the provided SQL schema (see below) to create the necessary tables.

### Frontend Setup

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the `frontend/` folder with:
   ```env
   VITE_API_URL=https://your-backend-service.onrender.com
   ```
   (For local development, you can use `http://localhost:3000`.)

## Running Locally

### Start the Backend

From the `backend/` folder, run:
```bash
npm run dev
```
*(This command uses nodemon to auto-reload your server on changes.)*

### Start the Frontend

From the `frontend/` folder, run:
```bash
npm run dev
```
*(This starts the Vite development server, typically on http://localhost:5173.)*

## Deployment on Render

### Backend (Web Service)

1. **Create a new Web Service** on Render.
2. **Connect your repository** (if using a monorepo, set the root directory to `backend/`).
3. **Configure build settings:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start` (or `node dist/server.js`)
4. **Add environment variables** in Render’s dashboard (PGUSER, PGHOST, PGDATABASE, etc., JWT_SECRET, REFRESH_SECRET).
5. **Deploy** your service.

### Frontend (Static Site)

1. **Create a new Static Site** on Render.
2. **Connect your repository** (set the root directory to `frontend/`).
3. **Configure build settings:**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. **Add public environment variables** (e.g., `VITE_API_URL`) if necessary.
5. **Deploy** your static site.

## SQL Schema

Run the following in your PostgreSQL database to create the required tables:

```sql
-- Table for registered users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for stories with rich styling options
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  background_color VARCHAR(50) DEFAULT 'lightcoral',

  -- Header styling options
  header_font VARCHAR(100) DEFAULT 'Arial',
  header_font_size INTEGER DEFAULT 24,
  header_color VARCHAR(50) DEFAULT '#000000',
  header_bold BOOLEAN DEFAULT FALSE,
  header_underline BOOLEAN DEFAULT FALSE,

  -- Content styling options
  content_font VARCHAR(100) DEFAULT 'Arial',
  content_font_size INTEGER DEFAULT 16,
  content_color VARCHAR(50) DEFAULT '#000000',
  content_bold BOOLEAN DEFAULT FALSE,
  content_underline BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for story comments
CREATE TABLE IF NOT EXISTS story_comments (
  id SERIAL PRIMARY KEY,
  story_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table for private messages
CREATE TABLE IF NOT EXISTS private_messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## CORS Configuration

Ensure that your backend is configured to allow requests from your frontend’s domain. In your backend's Express configuration (e.g., in `server.ts`):

```ts
import cors from "cors";
const allowedOrigins = ["https://your-frontend-service.onrender.com"];
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
```

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open a pull request or issue to improve the project.

## License

This project is licensed under the [MIT License](LICENSE).

