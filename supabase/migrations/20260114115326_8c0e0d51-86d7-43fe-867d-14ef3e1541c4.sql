-- Move pg_net extension from public to extensions schema
-- Note: pg_net is managed by Supabase, we can only report this issue

-- Fix overly permissive RLS policies

-- 1. Fix live_chat_sessions - Anyone can create is too permissive
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON public.live_chat_sessions;
CREATE POLICY "Authenticated users can create chat sessions" 
ON public.live_chat_sessions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Add more specific policies for service role tables
-- For oauth_states - ensure service role policies are explicit
DROP POLICY IF EXISTS "Service role can manage oauth states" ON public.oauth_states;
-- OAuth states are managed by edge functions with service role, no direct user access needed

-- 3. Fix tokens table - remove duplicate policy
DROP POLICY IF EXISTS "Only service role can insert tokens" ON public.tokens;
-- The "Service role full access to tokens" policy handles all operations

-- 4. Ensure security_events is properly locked down
DROP POLICY IF EXISTS "service_role_insert_security_events" ON public.security_events;
-- Security events should only be inserted by edge functions using service role key
-- The table already has RLS enabled, service role bypasses it

-- 5. Rate limits - keep service role access but ensure no public access
DROP POLICY IF EXISTS "Service role can insert rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role can update rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Service role can delete rate limits" ON public.rate_limits;
-- Rate limits are managed by edge functions using service role, no direct user access

-- 6. Notifications - add user-specific policies
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
-- Add policy for users to view their own notifications (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can view own notifications'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can view own notifications" 
        ON public.notifications 
        FOR SELECT 
        USING (auth.uid() = user_id)';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'notifications' 
        AND policyname = 'Users can update own notifications'
    ) THEN
        EXECUTE 'CREATE POLICY "Users can update own notifications" 
        ON public.notifications 
        FOR UPDATE 
        USING (auth.uid() = user_id)';
    END IF;
END $$;