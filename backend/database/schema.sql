-- Paste this into Supabase > SQL Editor, then click Run.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','staff'))
);

CREATE TABLE IF NOT EXISTS workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  instructor TEXT NOT NULL,
  location TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  reserved_seats INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  CHECK (reserved_seats >= 0 AND reserved_seats <= capacity)
);

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled')),
  created_by UUID NOT NULL REFERENCES app_users(id),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_by UUID REFERENCES app_users(id),
  cancelled_at TIMESTAMPTZ
);

-- The same attendee cannot hold two active seats in one workshop.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_seat_per_email
ON registrations (workshop_id, lower(email)) WHERE status = 'active';

-- The application accesses the DB through Express, not from the browser.
-- RLS blocks direct anonymous Supabase Data API access to these tables.
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
