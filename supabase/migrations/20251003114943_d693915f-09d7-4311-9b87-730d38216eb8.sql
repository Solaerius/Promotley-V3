-- Fix tokens table RLS policy to allow Edge Functions to write
-- Drop the blocking policy
DROP POLICY IF EXISTS "No direct token access" ON public.tokens;

-- Create new policies for tokens table
-- Allow service_role to manage tokens (for Edge Functions)
CREATE POLICY "Service role can manage tokens"
ON public.tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own tokens (read-only)
CREATE POLICY "Users can view own tokens"
ON public.tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);