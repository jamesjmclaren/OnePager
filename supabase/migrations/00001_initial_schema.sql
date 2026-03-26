-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  slug text unique,
  bio text,
  plan text default 'free' check (plan in ('free', 'pro')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Slug validation: lowercase alphanumeric + hyphens, 3-31 chars, starts with alphanumeric
alter table public.profiles
  add constraint slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{2,30}$');

-- Reserved slugs
create or replace function public.validate_slug()
returns trigger as $$
begin
  if new.slug in (
    'login', 'auth', 'api', 'dashboard', 'admin', 'settings',
    'integrations', 'page-editor', 'about', 'pricing', 'terms',
    'privacy', 'help', 'support', 'blog', 'docs'
  ) then
    raise exception 'This username is reserved';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger check_reserved_slug
  before insert or update of slug on public.profiles
  for each row execute function public.validate_slug();

-- RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Integrations table
create type public.platform_type as enum ('youtube', 'twitter', 'twitch');

create table public.integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform public.platform_type not null,
  platform_user_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  cached_data jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, platform)
);

-- RLS for integrations
alter table public.integrations enable row level security;

create policy "Users can view own integrations"
  on public.integrations for select using (auth.uid() = user_id);

create policy "Users can insert own integrations"
  on public.integrations for insert with check (auth.uid() = user_id);

create policy "Users can update own integrations"
  on public.integrations for update using (auth.uid() = user_id);

create policy "Users can delete own integrations"
  on public.integrations for delete using (auth.uid() = user_id);

-- Pages table
create table public.pages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  layout jsonb default '[]'::jsonb,
  theme text default 'default',
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for pages
alter table public.pages enable row level security;

create policy "Published pages are viewable by everyone"
  on public.pages for select using (is_published or auth.uid() = user_id);

create policy "Users can insert own page"
  on public.pages for insert with check (auth.uid() = user_id);

create policy "Users can update own page"
  on public.pages for update using (auth.uid() = user_id);

-- Auto-create profile + page on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.pages (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger update_integrations_updated_at
  before update on public.integrations
  for each row execute function public.update_updated_at();

create trigger update_pages_updated_at
  before update on public.pages
  for each row execute function public.update_updated_at();
