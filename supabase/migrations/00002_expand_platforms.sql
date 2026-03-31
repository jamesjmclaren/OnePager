-- Expand platform_type enum with new integrations
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'github';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'spotify';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'discord';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'bluesky';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'custom_link';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'substack';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'medium';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'reddit';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'kick';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'soundcloud';
ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'mastodon';

-- Change unique constraint to allow multiple custom links per user
-- (platform_user_id differentiates them)
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_user_id_platform_key;
ALTER TABLE public.integrations ADD CONSTRAINT integrations_user_id_platform_pid_key UNIQUE (user_id, platform, platform_user_id);

-- Add layout_mode to pages table
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS layout_mode text DEFAULT 'single'
  CHECK (layout_mode IN ('single', 'grid'));

-- Allow admin/service-role to read integrations for cron (public policy for cached_data on public pages)
CREATE POLICY "Public can read cached_data for published pages" ON public.integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.user_id = integrations.user_id AND pages.is_published = true
    )
  );
