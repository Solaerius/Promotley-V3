-- Add RLS policy to allow anyone to read organizations by invite code
-- This is needed for the join flow to work
CREATE POLICY "Anyone can view organizations by invite code"
ON public.organizations
FOR SELECT
USING (
  invite_link_enabled = true
);

-- Also allow reading organization_invites by invite code for joining
CREATE POLICY "Anyone can view invites by code"
ON public.organization_invites
FOR SELECT
USING (
  status = 'pending' AND expires_at > now()
);