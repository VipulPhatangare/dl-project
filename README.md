# Production-Ready MERN AI Chatbot Platform

A scalable MERN stack AI chatbot platform with:
- Public no-login chatbot (anonymous sessions)
- Protected admin panel (JWT auth)
- MongoDB Atlas vector retrieval
- Gemini for response generation
- OpenAI `text-embedding-3-small` for embeddings

## Monorepo Structure

- `client/` – React (Vite + Tailwind)
- `server/` – Node.js + Express + MongoDB Atlas

## Features Implemented

### Public Chatbot
- No login required
- Anonymous chat sessions
- Optional local storage chat persistence
- ChatGPT-style UI
- Suggested prompts
- Markdown and code block rendering
- New chat + clear chat
- Dark/light mode
- Mobile responsive layout

### Admin Panel
- JWT login for admin only
- Protected routes
- Dashboard stats
- Upload PDF/CSV/TXT and manual text
- Chunking (700 tokens / 100 overlap)
- Embedding + storage in Atlas
- Knowledge base manager (search/view/delete/re-embed)
- Bot settings manager
- Danger zone actions with confirm
- Chat logs + date filtering + export CSV

### Security
- Helmet
- CORS
- Rate limiting
- bcrypt password hashing
- File type + size validation

## Required MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create database collections:
   - `admins`
   - `settings`
   - `documents`
   - `chunks`
   - `chats`
3. Create Atlas Vector Search index on `chunks.embedding` with index name from `VECTOR_INDEX_NAME` (default: `chunks_vector_index`).

Example vector index JSON:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

## Environment Setup

Copy values from:
- `server/.env.example`
- `client/.env.example`

Or use root `.env` placeholders.

## Run Locally

### Backend

1. Install dependencies in `server/`
2. Start API in dev mode
3. Seed admin account

### Frontend

1. Install dependencies in `client/`
2. Start Vite dev server

## API Endpoints

### Auth
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/profile`

### Admin
- `GET /api/admin/dashboard`
- `POST /api/admin/upload`
- `POST /api/admin/manual-text`
- `GET /api/admin/documents`
- `GET /api/admin/document/:id/chunks`
- `POST /api/admin/document/:id/re-embed`
- `DELETE /api/admin/document/:id`
- `DELETE /api/admin/delete-all-data`
- `DELETE /api/admin/delete-all-documents`
- `DELETE /api/admin/delete-all-chats`
- `GET /api/admin/chats`
- `GET /api/admin/chats/export`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

### Chat
- `POST /api/chat/ask`
- `POST /api/chat/new-session`
- `GET /api/chat/history/:sessionId`

## Deployment

- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: MongoDB Atlas

## Notes

- Keep admin credentials secure and rotate secrets.
- Use HTTPS-only origins in production.
- Optionally move JWT to HTTP-only cookies for stricter browser security.
