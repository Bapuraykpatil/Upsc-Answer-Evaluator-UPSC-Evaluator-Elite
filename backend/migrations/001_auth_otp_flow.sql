-- ================================
-- Pending registrations (before OTP verification)
-- ================================
CREATE TABLE IF NOT EXISTS pending_registrations (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  hashed_password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- OTPs linked to pending registrations
-- ================================
CREATE TABLE IF NOT EXISTS pending_otps (
  id SERIAL PRIMARY KEY,
  pending_registration_id INTEGER NOT NULL
    REFERENCES pending_registrations(id)
    ON DELETE CASCADE,
  otp_hash VARCHAR(128) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
