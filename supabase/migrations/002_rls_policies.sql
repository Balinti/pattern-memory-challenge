-- Pattern League RLS Policies
-- Migration 002: Row Level Security

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_run_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- profiles policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = FALSE); -- Prevent setting is_admin

-- Public can read limited profile info for leaderboards (display_name, avatar_url)
CREATE POLICY "Public can view limited profile info" ON profiles
  FOR SELECT USING (TRUE);

-- Service role can insert profiles (on signup)
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- entitlements policies
-- Users can read their own entitlement
CREATE POLICY "Users can view own entitlement" ON entitlements
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can modify entitlements (handled by API routes)
-- No insert/update/delete policies for regular users

-- ratings policies
-- Users can read their own ratings
CREATE POLICY "Users can view own ratings" ON ratings
  FOR SELECT USING (auth.uid() = user_id);

-- Public can read ratings for leaderboard purposes
CREATE POLICY "Public can view all ratings" ON ratings
  FOR SELECT USING (TRUE);

-- challenge_issues policies
-- Users can read their own challenge issues
CREATE POLICY "Users can view own challenge issues" ON challenge_issues
  FOR SELECT USING (auth.uid() = user_id);

-- attempts policies
-- Users can read their own attempts
CREATE POLICY "Users can view own attempts" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

-- weekly_run_limits policies
-- Users can read their own weekly run limits
CREATE POLICY "Users can view own weekly run limits" ON weekly_run_limits
  FOR SELECT USING (auth.uid() = user_id);

-- leaderboard_entries policies
-- Public can read all leaderboard entries
CREATE POLICY "Public can view leaderboard entries" ON leaderboard_entries
  FOR SELECT USING (TRUE);

-- app_config policies
-- Public can read app config
CREATE POLICY "Public can view app config" ON app_config
  FOR SELECT USING (TRUE);

-- Create a view for public profile info (used in leaderboards)
CREATE OR REPLACE VIEW public_profiles AS
SELECT
  id,
  display_name,
  avatar_url,
  country_code
FROM profiles;

-- Grant select on the view
GRANT SELECT ON public_profiles TO anon, authenticated;
