# Workshoply — Workshop Registration Service

A small full-stack staff application for a training centre. Built with React, Express and Supabase PostgreSQL.

## Requirements
Node.js 22+, npm, and a Supabase project.

## Database
1. Create a Supabase project at https://supabase.com/dashboard.
2. Open SQL Editor and run `backend/database/schema.sql`.
3. Click Connect and copy the Session pooler PostgreSQL URI (port 5432). Put the database password in the URI and append `?sslmode=require` if it is not already present. Keep the connection string private.

## Backend
```powershell
cd backend
npm install
Copy-Item .env.example .env
```
Edit `.env`: replace `DATABASE_URL`, `JWT_SECRET`, and `ADMIN_PASSWORD` with your own values. Set `CLIENT_ORIGIN=http://localhost:5173`.

```powershell
npm run seed
npm run dev
```
Test `http://localhost:5000/api/health` — should return `{ "ok": true }`.

## Frontend (another terminal)
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Visit `http://localhost:5173`. Log in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` set in your backend `.env`, then create Manager and Staff accounts.

## Access permissions
- Admin: create and view user accounts only.
- Manager: view workshops/history; create and edit workshops; register and cancel attendees.
- Staff: view workshops/history; register and cancel attendees.

Only the backend accesses PostgreSQL. The frontend never receives database credentials.

## Preventing over-registration
The backend reserves a seat with a conditional PostgreSQL `UPDATE workshops SET reserved_seats = reserved_seats + 1 ... AND reserved_seats < capacity` and inserts the registration inside one transaction. PostgreSQL locks the row so two simultaneous requests cannot both take the last seat. On a failed insert, the entire transaction rolls back. Cancellation marks the record cancelled and frees the seat in one transaction. A partial unique index prevents duplicate active registrations of one email to one workshop.

## API
- `POST /api/auth/login`
- `GET /api/users`, `POST /api/users` — Admin
- `GET /api/workshops` — Manager / Staff
- `POST /api/workshops`, `PUT /api/workshops/:id` — Manager
- `GET /api/workshops/:id/registrations`, `POST /api/workshops/:id/registrations` — Manager / Staff
- `PATCH /api/registrations/:id/cancel` — Manager / Staff

## Deploy
- Push root folder to GitHub. GitHub Actions runs an API syntax check and React build on push.
- Deploy backend to Render as a Web Service (root `backend`, build `npm install`, start `npm start`). Add backend `.env` values to Render's environment settings. Render should supply `PORT`.
- Deploy frontend on Vercel (root `frontend`, framework Vite). Set `VITE_API_URL=https://YOUR-BACKEND-URL/api` and redeploy.
- Set backend `CLIENT_ORIGIN` to your exact Vercel URL and redeploy. Test live login and registrations.
- GitHub-connected hosts may redeploy automatically on pushes; GitHub Actions checks are separate unless you configure deployment gates.

## Known trade-offs
- JWT stored in localStorage for quick implementation; HTTP-only secure cookies with CSRF protection would be preferable for production.
- Workshop filters are in the frontend (sufficient for 15 staff and a small catalogue).
- Optional waitlist and extended change audit were skipped. Registration/cancellation audit is implemented.
- For production, add refresh-token/session invalidation, stronger password policy, automated integration/concurrency tests, centralized audit logs and accessibility testing.

## Demo checklist
1. Admin creates Manager and Staff.
2. Manager creates a workshop with capacity 1.
3. Staff registers attendee A, then attempts attendee B (receives 409).
4. Staff cancels A, confirms cancellation history, then registers B.
5. Try Manager-only `POST /api/workshops` with Staff credentials (403).


admin@workshoply.test
ChangeThis123!