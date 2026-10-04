# CivicDrive — Render Deployment

## 1. Backend Web Service

- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `node server.js` (or `npm start`)
- Health Check Path: `/api/health`

Add these environment variables in Render:

- `DB_HOST` = your MySQL host
- `DB_PORT` = `3306` (or the port supplied by your provider)
- `DB_USER` = your MySQL username
- `DB_PASSWORD` = your MySQL password
- `DB_NAME` = `traffic_reporter`
- `JWT_SECRET` = a long random secret
- `GEMINI_API_KEY` = your Gemini key if the AI route is used

Do not upload or commit the real `.env` file. Use Render's Environment Variables instead.

## 2. Database

This backend expects MySQL. The app now connects directly to the database named by `DB_NAME`; it no longer drops/recreates the database during startup. Create the database first in your MySQL provider.

## 3. Frontend Static Site

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

The frontend already uses relative `/api/...` requests. Add a Render Static Site rewrite:

- Source: `/api/*`
- Destination: `https://YOUR-BACKEND.onrender.com/api/*`
- Action: `Rewrite`

This keeps the frontend API calls unchanged.

## 4. Local development

Backend:

```bash
cd backend
npm install
npm start
```

Frontend (separate terminal):

```bash
cd frontend
npm install
npm run dev
```

## Important

The original `db.js`, `server.js`, and `.env.example` are backed up as `.backup` files in this working copy. The real `.env` is intentionally not included in the deployment ZIP.
