-- Create a function to create organization and add founder atomically
CREATE OR REPLACE FUNCTION public.create_organization_with_founder(
  _name text,
  _logo_url text DEFAULT NULL,
  _user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
  _actual_user_id uuid;
BEGIN
  -- Use provided user_id or get from auth context
  _actual_user_id := COALESCE(_user_id, auth.uid());
  
  IF _actual_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Create the organization
  INSERT INTO public.organizations (name, logo_url)
  VALUES (_name, _logo_url)
  RETURNING id INTO _org_id;

  -- Add user as founder
  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    permissions
  ) VALUES (
    _org_id,
    _actual_user_id,
    'founder',
    '{"can_edit_settings": true, "can_use_ai": true, "can_manage_calendar": true, "can_manage_members": true}'::jsonb
  );

  -- Set as active organization for user
  UPDATE public.users
  SET active_organization_id = _org_id
  WHERE id = _actual_user_id;

  RETURN _org_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_organization_with_founder(text, text, uuid) TO authenticated;