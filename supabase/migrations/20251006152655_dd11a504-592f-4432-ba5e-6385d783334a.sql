-- Drop the overly permissive policy that allows modification and deletion of security logs
DROP POLICY IF EXISTS "Service role can manage security events" ON public.security_events;

-- Create append-only policy: service role can INSERT security events
CREATE POLICY "Service role can insert security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- Allow service role to SELECT security events for monitoring and auditing
CREATE POLICY "Service role can view security events"
ON public.security_events
FOR SELECT
USING (true);

-- No UPDATE or DELETE policies - making this table truly append-only
-- Security audit logs should never be modified or deleted to maintain integrity