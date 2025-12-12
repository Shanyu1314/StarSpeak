/*
  # Enable Password Leak Protection

  Enables Supabase Auth's compromised password detection feature
  which checks passwords against HaveIBeenPwned.org database.

  This is a configuration change that happens outside of SQL migrations.
  The actual setting is configured in Supabase Dashboard:
  Authentication > Auth Providers > Email > Security

  Instructions:
  1. Go to your Supabase project dashboard
  2. Navigate to Authentication > Auth Providers
  3. Click on Email
  4. Under "Security", enable "Detect compromised passwords"
  5. Save changes

  Note: This SQL file documents the requirement. The actual
  implementation is done through Supabase dashboard UI.
*/

-- This is a documentation migration
-- No SQL changes needed - setting is managed through Supabase dashboard
