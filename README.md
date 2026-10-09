# Workshop Registration Service

A full-stack web application developed for managing workshops and attendee registrations at a community training centre.

## Local Setup

### Backend

Navigate to the backend folder and install dependencies.

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` and configure the Supabase database connection, JWT secret, and other required variables.

Run the SQL script in `backend/database/schema.sql` using the Supabase SQL Editor.

Seed the Admin account and example workshops:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

Backend: http://localhost:5000

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

The frontend uses `VITE_API_URL` to communicate with the backend.

## Demo Admin Account

Email: `admin@workshop.test`

ADMIN_PASSWORD=ChangeThis123!

## Implementation Notes

The application uses role-based access control enforced through Express middleware. PostgreSQL transactions and conditional seat updates are used to prevent simultaneous registrations from exceeding workshop capacity.

Cancelled registrations are retained for history purposes.

## Current Status

Developed for the technical assessment and tested locally. Live deployment is not yet available.

## Developer

Amanda Lakshani Batagoda
