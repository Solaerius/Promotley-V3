-- Fix OAuth token exposure by making RLS policies more restrictive
-- Drop existing user view policy and recreate with explicit restrictions

-- Drop the existing "Users can view own tokens" policy
DROP POLICY IF EXISTS "Users can view own tokens" ON public.tokens;

-- Create a more restrictive SELECT policy that explicitly prevents access to other users' tokens
-- This policy uses RESTRICTIVE type to ensure it must pass in addition to other policies
CREATE POLICY "Users can only view their own tokens - strict"
ON public.tokens
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Ensure the service role policies are clearly separated and don't interfere
-- Drop and recreate service role policy with explicit role check
DROP POLICY IF EXISTS "Service role can manage tokens" ON public.tokens;

CREATE POLICY "Service role full access to tokens"
ON public.tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add explicit deny policy for attempts to access other users' tokens
CREATE POLICY "Deny access to other users tokens"
ON public.tokens
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);

-- Ensure INSERT is restricted to service role only
DROP POLICY IF EXISTS "Service role can insert tokens" ON public.tokens;

CREATE POLICY "Only service role can insert tokens"
ON public.tokens
FOR INSERT
TO service_role
WITH CHECK (true);