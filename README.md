# Mini Team Chat Application

This workspace contains a minimal full-stack team chat application scaffold:

- Backend: TypeScript + Express + Mongoose + Socket.IO
- Frontend: React + TypeScript + socket.io-client

Folders:
- `backend/` — Express + TypeScript server
- `frontend/` — React TypeScript client

Quick start (dev):

1. Open two terminals.

2. Backend (in `backend`):

```powershell
cd backend; npm install
# copy .env.example to .env and edit MONGODB_URI, JWT_SECRET
npm run dev
```

3. Frontend (in `frontend`):

```powershell
cd frontend; npm install
npm start
```

Notes:
- This scaffold contains core models, services, controllers, Socket.IO wiring, and React contexts/components matching the provided spec.
- You must provide a running MongoDB instance and set `MONGODB_URI` in `backend/.env`.
- For production build, run `npm run build` in both projects and deploy accordingly.

Next steps suggested:
- Implement the remaining UI components for the chat area, message list, and input box.
- Add file/image uploads and moderation if needed.
- Deploy backend to a hosted Node.js environment (Heroku, Railway, Render) and frontend (Vercel, Netlify).
