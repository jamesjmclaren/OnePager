-- Custom domains table for Pro users
CREATE TABLE public.custom_domains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  domain text UNIQUE NOT NULL,
  txt_record text NOT NULL,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own domains"
  ON public.custom_domains FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own domains"
  ON public.custom_domains FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
  ON public.custom_domains FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains"
  ON public.custom_domains FOR DELETE USING (auth.uid() = user_id);

-- Allow public read of verified domains (needed for middleware domain lookup)
CREATE POLICY "Public can read verified domains"
  ON public.custom_domains FOR SELECT USING (verified = true);
