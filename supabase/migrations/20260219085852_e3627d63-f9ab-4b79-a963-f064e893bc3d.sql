
-- Fix: Remove email-based viewing from organization_invites to prevent data exposure
-- The "Anyone can view invites by code" policy already handles invite acceptance
-- Only org members should see the full invite list

DROP POLICY IF EXISTS "Members can view org invites" ON public.organization_invites;

CREATE POLICY "Members can view org invites"
ON public.organization_invites FOR SELECT
USING (is_org_member(auth.uid(), organization_id));

-- Also update the "Admins can update invites" policy to remove email-based access
DROP POLICY IF EXISTS "Admins can update invites" ON public.organization_invites;

CREATE POLICY "Admins can update invites"
ON public.organization_invites FOR UPDATE
USING (
  get_org_role(auth.uid(), organization_id) = ANY (ARRAY['founder'::text, 'admin'::text])
);
