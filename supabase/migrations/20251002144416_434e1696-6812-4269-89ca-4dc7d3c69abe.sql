-- Skapa enum för användarplaner
CREATE TYPE public.user_plan AS ENUM ('free_trial', 'pro', 'pro_xl', 'pro_unlimited');

-- Skapa users-tabell med kreditsystem
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  company_name TEXT,
  industry TEXT,
  keywords TEXT[],
  plan public.user_plan DEFAULT 'free_trial' NOT NULL,
  credits_left INTEGER DEFAULT 1 NOT NULL,
  trial_used BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Skapa suggestions-tabell för att spara AI-förslag
CREATE TABLE public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  idea TEXT NOT NULL,
  caption TEXT NOT NULL,
  hashtags TEXT[] NOT NULL,
  best_time TEXT,
  credits_spent INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Skapa consents-tabell för GDPR
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  policy_version TEXT DEFAULT '1.0' NOT NULL,
  consented_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;

-- RLS policies för users
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS policies för suggestions
CREATE POLICY "Users can view own suggestions"
  ON public.suggestions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own suggestions"
  ON public.suggestions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS policies för consents
CREATE POLICY "Users can view own consents"
  ON public.consents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own consents"
  ON public.consents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger för att automatiskt skapa user-profil vid registrering
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, credits_left, trial_used)
  VALUES (
    new.id,
    new.email,
    'free_trial',
    1,
    false
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger för updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();