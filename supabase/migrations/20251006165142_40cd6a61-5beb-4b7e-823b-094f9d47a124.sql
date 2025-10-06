-- CRITICAL SECURITY FIX: Prevent public data exposure in users and suggestions tables
-- Issue: Conflicting RLS policies allowing anonymous access to sensitive user data

-- FIX 1: USERS TABLE - Remove conflicting policies and ensure proper authentication
-- Drop the overly restrictive default-deny policy that conflicts with user-scoped access
DROP POLICY IF EXISTS "Default deny all access to users table" ON public.users;

-- Fix the deny_anon policy to properly require authentication instead of blocking everything
DROP POLICY IF EXISTS "deny_anon_users" ON public.users;
CREATE POLICY "deny_anon_users"
ON public.users
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- FIX 2: SUGGESTIONS TABLE - Ensure only authenticated users can access their own suggestions
DROP POLICY IF EXISTS "deny_anon_suggestions" ON public.suggestions;
CREATE POLICY "deny_anon_suggestions"
ON public.suggestions
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- FIX 3: CONNECTIONS TABLE - Same fix for consistency
DROP POLICY IF EXISTS "deny_anon_connections" ON public.connections;
CREATE POLICY "deny_anon_connections"
ON public.connections
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- FIX 4: CONSENTS TABLE - Same fix
DROP POLICY IF EXISTS "deny_anon_consents" ON public.consents;
CREATE POLICY "deny_anon_consents"
ON public.consents
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- FIX 5: METRICS TABLE - Same fix
DROP POLICY IF EXISTS "deny_anon_metrics" ON public.metrics;
CREATE POLICY "deny_anon_metrics"
ON public.metrics
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- FIX 6: TOKENS TABLE - Same fix
DROP POLICY IF EXISTS "deny_anon_tokens" ON public.tokens;
CREATE POLICY "deny_anon_tokens"
ON public.tokens
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- FIX 7: OAUTH_STATES TABLE - Same fix
DROP POLICY IF EXISTS "deny_anon_oauth_states" ON public.oauth_states;
CREATE POLICY "deny_anon_oauth_states"
ON public.oauth_states
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- FIX 8: RATE_LIMITS TABLE - Same fix
DROP POLICY IF EXISTS "deny_anon_rate_limits" ON public.rate_limits;
CREATE POLICY "deny_anon_rate_limits"
ON public.rate_limits
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- FIX 9: SECURITY_EVENTS TABLE - Same fix
DROP POLICY IF EXISTS "deny_anon_security_events" ON public.security_events;
CREATE POLICY "deny_anon_security_events"
ON public.security_events
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Verification: Test that anonymous access is now properly blocked
-- Anonymous users should receive authentication errors when trying to access these tables