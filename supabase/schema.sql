-- ============================================================
-- DMC-VAZIX — Supabase Database Schema
-- Run this entire script in the Supabase SQL Editor
-- ============================================================

-- 1. Enable pgcrypto for bcrypt hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. TABLES
-- ============================================================

-- app_users ── custom authentication, no Supabase Auth
CREATE TABLE IF NOT EXISTS app_users (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  username        TEXT        UNIQUE NOT NULL,
  access_code_hash TEXT       NOT NULL,
  role            TEXT        NOT NULL DEFAULT 'user'
                              CHECK (role IN ('master_admin', 'admin', 'user')),
  display_name    TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at   TIMESTAMPTZ,
  created_by      UUID        REFERENCES app_users(id) ON DELETE SET NULL
);

-- mood_entries ── unlimited entries per day per user
CREATE TABLE IF NOT EXISTS mood_entries (
  id               UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID          NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  entry_date       DATE          NOT NULL DEFAULT CURRENT_DATE,
  entry_time       TIME          NOT NULL DEFAULT CURRENT_TIME,
  mood_rating      SMALLINT      CHECK (mood_rating  BETWEEN 1 AND 10),
  sleep_hours      NUMERIC(4,1)  CHECK (sleep_hours  BETWEEN 0 AND 24),
  anxiety_rating   SMALLINT      CHECK (anxiety_rating BETWEEN 1 AND 10),
  energy_rating    SMALLINT      CHECK (energy_rating  BETWEEN 1 AND 10),
  stress_rating    SMALLINT      CHECK (stress_rating  BETWEEN 1 AND 10),
  pain_rating      SMALLINT      CHECK (pain_rating    BETWEEN 1 AND 10),
  activity         TEXT,
  medication_note  TEXT,
  trigger_event    TEXT,
  general_note     TEXT,
  tags             TEXT[]        NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- saved_notes ── reusable quick notes per user
CREATE TABLE IF NOT EXISTS saved_notes (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  category      TEXT        NOT NULL DEFAULT 'general',
  title         TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  is_quick_note BOOLEAN     NOT NULL DEFAULT false,
  use_count     INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- app_settings ── per-user key/value settings
CREATE TABLE IF NOT EXISTS app_settings (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES app_users(id) ON DELETE CASCADE,
  key        TEXT        NOT NULL,
  value      JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);

-- audit_log ── track all admin and sensitive actions
CREATE TABLE IF NOT EXISTS audit_log (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id       UUID        REFERENCES app_users(id) ON DELETE SET NULL,
  actor_username TEXT,
  action         TEXT        NOT NULL,
  target_type    TEXT,
  target_id      UUID,
  details        JSONB,
  ip_address     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date
  ON mood_entries (user_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_mood_entries_date
  ON mood_entries (entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_saved_notes_user
  ON saved_notes (user_id, is_quick_note, use_count DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor
  ON audit_log (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_date
  ON audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_app_users_username
  ON app_users (username);

-- ============================================================
-- 4. updated_at AUTO-TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_saved_notes_updated_at
  BEFORE UPDATE ON saved_notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 5. SECURITY FUNCTIONS (SECURITY DEFINER — only callable via service role)
-- ============================================================

-- Verify login: returns user row only if code matches
CREATE OR REPLACE FUNCTION verify_access_code(p_username TEXT, p_code TEXT)
RETURNS TABLE (
  id           UUID,
  username     TEXT,
  role         TEXT,
  display_name TEXT,
  is_active    BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, u.role, u.display_name, u.is_active
  FROM   app_users u
  WHERE  u.username = lower(trim(p_username))
    AND  u.access_code_hash = crypt(p_code, u.access_code_hash);
END;
$$;

-- Create a new user with a hashed access code
CREATE OR REPLACE FUNCTION create_app_user(
  p_username     TEXT,
  p_code         TEXT,
  p_role         TEXT    DEFAULT 'user',
  p_display_name TEXT    DEFAULT NULL,
  p_created_by   UUID    DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO app_users (username, access_code_hash, role, display_name, created_by)
  VALUES (
    lower(trim(p_username)),
    crypt(p_code, gen_salt('bf', 10)),
    p_role,
    p_display_name,
    p_created_by
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

-- Reset a user's access code
CREATE OR REPLACE FUNCTION reset_access_code(
  p_user_id UUID,
  p_new_code TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE app_users
  SET    access_code_hash = crypt(p_new_code, gen_salt('bf', 10)),
         updated_at       = now()
  WHERE  id = p_user_id;
END;
$$;

-- ============================================================
-- 6. MASTER ADMIN USER INSERT
-- Username: yousafali  |  Access code: 491709
-- ============================================================
INSERT INTO app_users (username, access_code_hash, role, display_name)
VALUES (
  'yousafali',
  crypt('491709', gen_salt('bf', 10)),
  'master_admin',
  'Yousaf Ali'
)
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- 7. DEFAULT QUICK NOTES (seeded for master admin)
-- ============================================================
INSERT INTO saved_notes (user_id, category, title, content, is_quick_note)
SELECT
  u.id,
  notes.category,
  notes.title,
  notes.content,
  true
FROM app_users u,
(VALUES
  ('mood',     'Overthinking',       'Overthinking'),
  ('stress',   'Work stress',        'Work stress'),
  ('sleep',    'Good sleep',         'Good sleep'),
  ('sleep',    'Poor sleep',         'Poor sleep'),
  ('anxiety',  'Anxiety increased',  'Anxiety increased'),
  ('mood',     'Felt calm',          'Felt calm'),
  ('activity', 'Gym helped',         'Gym helped'),
  ('trigger',  'Argument',           'Argument'),
  ('health',   'Headache',           'Headache'),
  ('health',   'Medication changed', 'Medication changed')
) AS notes(category, title, content)
WHERE u.username = 'yousafali'
ON CONFLICT DO NOTHING;
