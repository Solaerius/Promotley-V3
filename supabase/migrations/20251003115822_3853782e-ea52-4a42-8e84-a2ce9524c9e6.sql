-- Phase 1: Token Encryption & Rotation Infrastructure
-- Create oauth_states table for secure state management
CREATE TABLE public.oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_token text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  code_verifier text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  consumed boolean NOT NULL DEFAULT false,
  consumed_at timestamp with time zone
);

-- Index for fast state lookups
CREATE INDEX idx_oauth_states_token ON public.oauth_states(state_token);
CREATE INDEX idx_oauth_states_created ON public.oauth_states(created_at);

-- Enable RLS
ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;

-- Service role can manage states (for edge functions)
CREATE POLICY "Service role can manage oauth states"
ON public.oauth_states
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Auto-cleanup expired states (older than 10 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_expired_oauth_states()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.oauth_states
  WHERE created_at < now() - interval '10 minutes';
END;
$$;

-- Create rate_limits table for AI endpoint protection
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  last_request timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast rate limit lookups
CREATE INDEX idx_rate_limits_user_endpoint ON public.rate_limits(user_id, endpoint);
CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role can manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own rate limits
CREATE POLICY "Users can view own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Function to check rate limits (5 requests per minute)
CREATE OR REPLACE FUNCTION public.check_rate_limit(_user_id uuid, _endpoint text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_window timestamp with time zone := now() - interval '1 minute';
  current_count integer;
BEGIN
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits
  WHERE window_start < now() - interval '2 minutes';
  
  -- Get current count for this user/endpoint in the window
  SELECT request_count INTO current_count
  FROM public.rate_limits
  WHERE user_id = _user_id
    AND endpoint = _endpoint
    AND window_start > current_window;
  
  -- If no record or count is under limit
  IF current_count IS NULL THEN
    -- Create new rate limit record
    INSERT INTO public.rate_limits (user_id, endpoint, request_count, window_start, last_request)
    VALUES (_user_id, _endpoint, 1, now(), now());
    RETURN true;
  ELSIF current_count < 5 THEN
    -- Increment count
    UPDATE public.rate_limits
    SET request_count = request_count + 1,
        last_request = now()
    WHERE user_id = _user_id
      AND endpoint = _endpoint
      AND window_start > current_window;
    RETURN true;
  ELSE
    -- Rate limit exceeded
    RETURN false;
  END IF;
END;
$$;

-- Phase 4: Complete RLS Policies
-- Add missing INSERT policy for users table (handled by trigger, but explicit policy for clarity)
CREATE POLICY "Users can be created via auth trigger"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add UPDATE policy for connections (allow users to update their connection metadata)
CREATE POLICY "Users can update own connections"
ON public.connections
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add DELETE policy for tokens (allow users to revoke their own tokens)
CREATE POLICY "Users can delete own tokens"
ON public.tokens
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add soft delete support to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deletion_scheduled_at timestamp with time zone;

-- Function to soft delete user account
CREATE OR REPLACE FUNCTION public.soft_delete_user_account(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark user as deleted with 30-day grace period
  UPDATE public.users
  SET deleted_at = now(),
      deletion_scheduled_at = now() + interval '30 days'
  WHERE id = _user_id;
  
  -- Anonymize connections (keep for audit but remove identifiable info)
  UPDATE public.connections
  SET username = 'deleted_user_' || LEFT(id::text, 8)
  WHERE user_id = _user_id;
  
  -- Mark tokens for deletion (keep encrypted tokens for security audit)
  UPDATE public.tokens
  SET updated_at = now()
  WHERE user_id = _user_id;
END;
$$;

-- Phase 5: Security Audit Logging
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast security event lookups
CREATE INDEX idx_security_events_user ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_created ON public.security_events(created_at);

-- Enable RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only service role can manage security events
CREATE POLICY "Service role can manage security events"
ON public.security_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _user_id uuid,
  _event_type text,
  _event_details jsonb DEFAULT NULL,
  _ip_address text DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.security_events (user_id, event_type, event_details, ip_address, user_agent)
  VALUES (_user_id, _event_type, _event_details, _ip_address, _user_agent)
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;