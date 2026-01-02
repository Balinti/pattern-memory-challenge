-- Pattern League Database Schema
-- Migration 001: Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  display_name TEXT NOT NULL,
  avatar_url TEXT NULL,
  country_code TEXT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2) entitlements
CREATE TABLE entitlements (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'weekly' | 'annual'
  status TEXT NOT NULL DEFAULT 'inactive', -- 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
  current_period_end TIMESTAMPTZ NULL,
  stripe_customer_id TEXT NULL UNIQUE,
  stripe_subscription_id TEXT NULL UNIQUE,
  trial_ends_at TIMESTAMPTZ NULL
);

-- 3) ratings
CREATE TABLE ratings (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL, -- 'flash_grid' | 'sequence_forge' | 'rotation_run' | 'weekly_run'
  pr INTEGER NOT NULL DEFAULT 1000,
  games_played INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMPTZ NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, mode)
);

-- 4) challenge_issues
CREATE TABLE challenge_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL, -- 'daily' | 'weekly' | 'practice'
  mode TEXT NOT NULL, -- 'flash_grid' | 'sequence_forge' | 'rotation_run' | 'weekly_run'
  date_key TEXT NOT NULL, -- e.g. '2026-01-02' for daily, '2026-W01' for weekly
  tier INTEGER NOT NULL,
  seed TEXT NOT NULL,
  params JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_challenge_issues_user_created ON challenge_issues(user_id, created_at DESC);
CREATE INDEX idx_challenge_issues_kind_date_mode ON challenge_issues(kind, date_key, mode);

-- 5) attempts
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_issue_id UUID NOT NULL REFERENCES challenge_issues(id) ON DELETE RESTRICT,
  kind TEXT NOT NULL, -- 'daily' | 'weekly' | 'practice'
  mode TEXT NOT NULL,
  date_key TEXT NOT NULL,
  tier INTEGER NOT NULL,
  seed TEXT NOT NULL,
  score INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL, -- 0..100
  duration_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  details JSONB NOT NULL, -- mode-specific breakdown
  client_meta JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX idx_attempts_user_created ON attempts(user_id, created_at DESC);
CREATE INDEX idx_attempts_mode_date_score ON attempts(mode, date_key, score DESC);

-- 6) weekly_run_limits
CREATE TABLE weekly_run_limits (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_key TEXT NOT NULL, -- '2026-W01'
  runs_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, week_key)
);

-- 7) leaderboard_entries
CREATE TABLE leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scope TEXT NOT NULL, -- 'daily' | 'weekly'
  date_key TEXT NOT NULL, -- daily date or week key
  mode TEXT NOT NULL, -- per-mode or 'weekly_run'
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  duration_ms INTEGER NOT NULL,
  rank_hint INTEGER NULL,
  UNIQUE (scope, date_key, mode, user_id)
);

CREATE INDEX idx_leaderboard_scope_date_mode_score ON leaderboard_entries(scope, date_key, mode, score DESC);

-- 8) app_config
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default config values
INSERT INTO app_config (key, value) VALUES
  ('daily_tier', '3'::JSONB),
  ('weekly_tier', '3'::JSONB),
  ('free_weekly_runs', '1'::JSONB),
  ('trial_days', '7'::JSONB);

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at
  BEFORE UPDATE ON entitlements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_run_limits_updated_at
  BEFORE UPDATE ON weekly_run_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_config_updated_at
  BEFORE UPDATE ON app_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
