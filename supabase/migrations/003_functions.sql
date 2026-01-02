-- Pattern League Database Functions
-- Migration 003: Helper Functions

-- Function to create a new profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- Create entitlement (free by default)
  INSERT INTO public.entitlements (user_id)
  VALUES (NEW.id);

  -- Create initial ratings for all modes
  INSERT INTO public.ratings (user_id, mode) VALUES
    (NEW.id, 'flash_grid'),
    (NEW.id, 'sequence_forge'),
    (NEW.id, 'rotation_run'),
    (NEW.id, 'weekly_run');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status TEXT;
  v_period_end TIMESTAMPTZ;
BEGIN
  SELECT status, current_period_end
  INTO v_status, v_period_end
  FROM entitlements
  WHERE user_id = p_user_id;

  IF v_status IN ('active', 'trialing') THEN
    RETURN TRUE;
  END IF;

  -- Check if still within period end even if past_due
  IF v_status = 'past_due' AND v_period_end > NOW() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's weekly run count
CREATE OR REPLACE FUNCTION get_weekly_runs_used(p_user_id UUID, p_week_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_runs INTEGER;
BEGIN
  SELECT runs_used INTO v_runs
  FROM weekly_run_limits
  WHERE user_id = p_user_id AND week_key = p_week_key;

  RETURN COALESCE(v_runs, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment weekly runs
CREATE OR REPLACE FUNCTION increment_weekly_runs(p_user_id UUID, p_week_key TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_runs INTEGER;
BEGIN
  INSERT INTO weekly_run_limits (user_id, week_key, runs_used)
  VALUES (p_user_id, p_week_key, 1)
  ON CONFLICT (user_id, week_key)
  DO UPDATE SET runs_used = weekly_run_limits.runs_used + 1
  RETURNING runs_used INTO v_runs;

  RETURN v_runs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update or insert leaderboard entry
CREATE OR REPLACE FUNCTION upsert_leaderboard_entry(
  p_scope TEXT,
  p_date_key TEXT,
  p_mode TEXT,
  p_user_id UUID,
  p_score INTEGER,
  p_accuracy NUMERIC(5,2),
  p_duration_ms INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_entry_id UUID;
BEGIN
  INSERT INTO leaderboard_entries (scope, date_key, mode, user_id, score, accuracy, duration_ms)
  VALUES (p_scope, p_date_key, p_mode, p_user_id, p_score, p_accuracy, p_duration_ms)
  ON CONFLICT (scope, date_key, mode, user_id)
  DO UPDATE SET
    score = GREATEST(leaderboard_entries.score, p_score),
    accuracy = CASE WHEN p_score > leaderboard_entries.score THEN p_accuracy ELSE leaderboard_entries.accuracy END,
    duration_ms = CASE WHEN p_score > leaderboard_entries.score THEN p_duration_ms ELSE leaderboard_entries.duration_ms END
  RETURNING id INTO v_entry_id;

  RETURN v_entry_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leaderboard with ranks
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_scope TEXT,
  p_date_key TEXT,
  p_mode TEXT,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  score INTEGER,
  accuracy NUMERIC(5,2),
  duration_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY le.score DESC, le.duration_ms ASC) AS rank,
    le.user_id,
    p.display_name,
    p.avatar_url,
    le.score,
    le.accuracy,
    le.duration_ms
  FROM leaderboard_entries le
  JOIN profiles p ON p.id = le.user_id
  WHERE le.scope = p_scope AND le.date_key = p_date_key AND le.mode = p_mode
  ORDER BY le.score DESC, le.duration_ms ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's rank in leaderboard
CREATE OR REPLACE FUNCTION get_user_rank(
  p_scope TEXT,
  p_date_key TEXT,
  p_mode TEXT,
  p_user_id UUID
)
RETURNS TABLE (
  rank BIGINT,
  score INTEGER,
  total_entries BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked AS (
    SELECT
      le.user_id,
      le.score,
      ROW_NUMBER() OVER (ORDER BY le.score DESC, le.duration_ms ASC) AS rank
    FROM leaderboard_entries le
    WHERE le.scope = p_scope AND le.date_key = p_date_key AND le.mode = p_mode
  ),
  total AS (
    SELECT COUNT(*) AS total_entries
    FROM leaderboard_entries
    WHERE scope = p_scope AND date_key = p_date_key AND mode = p_mode
  )
  SELECT r.rank, r.score, t.total_entries
  FROM ranked r
  CROSS JOIN total t
  WHERE r.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update pattern rating (Elo-like)
CREATE OR REPLACE FUNCTION update_pattern_rating(
  p_user_id UUID,
  p_mode TEXT,
  p_score INTEGER,
  p_tier INTEGER,
  p_success BOOLEAN
)
RETURNS TABLE (
  old_pr INTEGER,
  new_pr INTEGER,
  delta INTEGER
) AS $$
DECLARE
  v_current_pr INTEGER;
  v_expected_score NUMERIC;
  v_k_factor INTEGER := 32;
  v_tier_rating INTEGER;
  v_actual_score NUMERIC;
  v_new_pr INTEGER;
BEGIN
  -- Get current PR
  SELECT pr INTO v_current_pr FROM ratings WHERE user_id = p_user_id AND mode = p_mode;
  v_current_pr := COALESCE(v_current_pr, 1000);

  -- Calculate tier "rating" (higher tier = harder = higher expected rating)
  v_tier_rating := 900 + (p_tier * 50);

  -- Calculate expected score based on Elo formula
  v_expected_score := 1.0 / (1.0 + POWER(10.0, (v_tier_rating - v_current_pr) / 400.0));

  -- Actual score: 1 for success, 0 for failure, with bonus for high scores
  IF p_success THEN
    v_actual_score := 0.5 + (LEAST(p_score, 1000)::NUMERIC / 2000.0);
  ELSE
    v_actual_score := GREATEST(0, (p_score::NUMERIC / 2000.0) - 0.25);
  END IF;

  -- Calculate new PR
  v_new_pr := v_current_pr + ROUND(v_k_factor * (v_actual_score - v_expected_score));
  v_new_pr := GREATEST(100, v_new_pr); -- Minimum PR of 100

  -- Update ratings table
  UPDATE ratings SET
    pr = v_new_pr,
    games_played = games_played + 1,
    wins = wins + CASE WHEN p_success THEN 1 ELSE 0 END,
    losses = losses + CASE WHEN NOT p_success THEN 1 ELSE 0 END,
    last_played_at = NOW()
  WHERE user_id = p_user_id AND mode = p_mode;

  RETURN QUERY SELECT v_current_pr, v_new_pr, v_new_pr - v_current_pr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
