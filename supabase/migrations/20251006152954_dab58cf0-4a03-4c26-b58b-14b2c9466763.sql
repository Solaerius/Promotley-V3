-- Phase 1: Critical RLS Policy Fixes

-- ============================================
-- Fix security_events table access control
-- ============================================

-- Drop existing policies that use 'true' condition (applies to all roles)
DROP POLICY IF EXISTS "Service role can insert security events" ON public.security_events;
DROP POLICY IF EXISTS "Service role can view security events" ON public.security_events;

-- Create policies restricted to service role ONLY
CREATE POLICY "Service role ONLY can insert security events"
ON public.security_events
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role ONLY can view security events"
ON public.security_events
FOR SELECT
USING (auth.role() = 'service_role');

-- Explicit denial for anonymous access (defense in depth)
CREATE POLICY "Block anonymous access to security events"
ON public.security_events
FOR ALL
TO anon
USING (false);

-- ============================================
-- Harden users table access control
-- ============================================

-- Add explicit denial for anonymous access to users table
CREATE POLICY "Block anonymous access to users"
ON public.users
FOR ALL
TO anon
USING (false);

-- Ensure authenticated users can ONLY see their own data
-- (existing policies already do this, but let's verify with explicit policy)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- Audit other sensitive tables
-- ============================================

-- Ensure tokens table has anonymous access blocked
CREATE POLICY "Block anonymous access to tokens"
ON public.tokens
FOR ALL
TO anon
USING (false);

-- Ensure connections table has anonymous access blocked
CREATE POLICY "Block anonymous access to connections"
ON public.connections
FOR ALL
TO anon
USING (false);

-- Ensure suggestions table has anonymous access blocked
CREATE POLICY "Block anonymous access to suggestions"
ON public.suggestions
FOR ALL
TO anon
USING (false);

-- Ensure oauth_states table has anonymous access blocked
CREATE POLICY "Block anonymous access to oauth_states"
ON public.oauth_states
FOR ALL
TO anon
USING (false);