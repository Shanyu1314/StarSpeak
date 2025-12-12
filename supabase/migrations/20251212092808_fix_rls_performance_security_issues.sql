/*
  # Fix RLS Performance and Security Issues

  1. RLS Optimization
    - Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row
    - Apply to all tables: user_profiles, word_entries, sos_scenarios, drill_history, chat_sessions

  2. Index Cleanup
    - Drop unused indexes on dictionary and words_unified tables

  3. Policy Consolidation
    - Merge multiple INSERT policies on words_unified table

  4. Function Security
    - Fix search_path mutability for handle_new_user function

  Security Impact: Improved query performance and reduced security vulnerabilities
*/

-- ============================================================================
-- 1. FIX RLS POLICIES - user_profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- 2. FIX RLS POLICIES - word_entries
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own words" ON word_entries;
CREATE POLICY "Users can view own words"
  ON word_entries FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own words" ON word_entries;
CREATE POLICY "Users can insert own words"
  ON word_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own words" ON word_entries;
CREATE POLICY "Users can update own words"
  ON word_entries FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own words" ON word_entries;
CREATE POLICY "Users can delete own words"
  ON word_entries FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- 3. FIX RLS POLICIES - sos_scenarios
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own scenarios" ON sos_scenarios;
CREATE POLICY "Users can view own scenarios"
  ON sos_scenarios FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own scenarios" ON sos_scenarios;
CREATE POLICY "Users can insert own scenarios"
  ON sos_scenarios FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- 4. FIX RLS POLICIES - drill_history
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own drill history" ON drill_history;
CREATE POLICY "Users can view own drill history"
  ON drill_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own drill history" ON drill_history;
CREATE POLICY "Users can insert own drill history"
  ON drill_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- 5. FIX RLS POLICIES - chat_sessions
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own chat sessions" ON chat_sessions;
CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- 6. CONSOLIDATE POLICIES - words_unified (merge duplicate INSERT policies)
-- ============================================================================

DROP POLICY IF EXISTS "Allow inserting dictionary data" ON words_unified;
DROP POLICY IF EXISTS "Authenticated users can insert AI words" ON words_unified;

CREATE POLICY "Authenticated users can insert words"
  ON words_unified FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 7. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_word_entries_added_at;
DROP INDEX IF EXISTS idx_dictionary_word;
DROP INDEX IF EXISTS idx_dictionary_word_prefix;
DROP INDEX IF EXISTS idx_dictionary_bnc;
DROP INDEX IF EXISTS idx_dictionary_frq;
DROP INDEX IF EXISTS idx_words_unified_source;
DROP INDEX IF EXISTS idx_words_unified_display;
DROP INDEX IF EXISTS idx_words_unified_source_tags;

-- ============================================================================
-- 8. FIX FUNCTION SECURITY - handle_new_user
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- ============================================================================
-- NOTES
-- ============================================================================
/*
  Summary of Changes:

  1. RLS Performance Fix (14 policies updated)
     - Changed auth.uid() to (select auth.uid()) in WHERE/WITH CHECK clauses
     - This prevents re-evaluation per row, improving query performance
     - Applied to: user_profiles (3), word_entries (4), sos_scenarios (2),
       drill_history (2), chat_sessions (3)

  2. Index Cleanup (8 indexes dropped)
     - Removed unused indexes on dictionary and words_unified tables
     - Reduces storage and improves INSERT/UPDATE performance

  3. Policy Consolidation
     - Merged two duplicate INSERT policies on words_unified table
     - Reduces policy overhead

  4. Function Security Fix
     - Set search_path to PUBLIC for handle_new_user function
     - Prevents search path mutation attacks

  5. Performance Impact
     - Reduced query time for large datasets
     - Lower memory consumption per query
     - Faster index scans

  6. Security Impact
     - Reduced attack surface for search path vulnerabilities
     - Cleaner policy structure
     - Better maintainability
*/
