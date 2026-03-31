# OnePager — Implementation Plan

## What is OnePager?
A Linktree alternative focused on **embedded content** rather than links. Users sign up with Google, connect their YouTube, Twitter/X, and Twitch accounts, and get a shareable page (`onepager.com/username`) that shows their latest video, tweets, and live stream status as rich embeds.

**Business model:** 3 free integrations per user, subscription for more (payments deferred to post-MVP).

## Tech Stack
- **Frontend/API:** Next.js (App Router) + TypeScript + Tailwind + Shadcn/ui
- **Backend:** Supabase (auth, PostgreSQL, RLS)
- **Deploy:** Vercel
- **Auth:** Google OAuth via Supabase

## Implementation Phases

### Phase 1: Foundation
1. Init Next.js project with App Router, TypeScript, Tailwind, ESLint
2. Install `@supabase/supabase-js`, `@supabase/ssr`, shadcn/ui components
3. Supabase project setup + run migrations for `profiles`, `integrations`, `pages` tables
4. Google OAuth login via Supabase (`/login` page, `/auth/callback` route)
5. Middleware for session refresh + protect `/dashboard/*` routes
6. Dashboard shell with sidebar layout

#### Database Schema
- **`profiles`** — id (refs auth.users), email, display_name, avatar_url, slug (unique), bio, plan (default 'free')
- **`integrations`** — id, user_id, platform (enum: youtube/twitter/twitch), platform_user_id, access_token, refresh_token, cached_data (jsonb), is_active
- **`pages`** — id, user_id (unique), layout (jsonb array of widget configs), theme, is_published

All tables have RLS. Auto-create profile on signup via trigger.

### Phase 2: YouTube Integration
1. OAuth connect/callback routes (`/api/integrations/youtube/connect` + `/callback`)
2. Fetch channel info + latest video ID via YouTube Data API, store in `cached_data`
3. `YouTubeEmbed` component — iframe (`youtube.com/embed/VIDEO_ID`)
4. `IntegrationCard` showing connection status + video thumbnail

### Phase 3: Twitter/X Integration
1. OAuth 2.0 PKCE connect/callback routes
2. Fetch recent tweet IDs, store in `cached_data`
3. `TwitterEmbed` component — uses `twitter-widget.js` to hydrate tweet blockquotes
4. Shows 3-5 most recent tweets

### Phase 4: Twitch Integration
1. OAuth connect/callback routes
2. Fetch user profile + stream status
3. `TwitchEmbed` component — iframe player (live/VOD), styled "offline" card

### Phase 5: Page Editor + Public Pages
1. Page editor (`/dashboard/page-editor`) — drag-to-reorder widgets, slug input, publish toggle
2. `PUT /api/page` to save layout config
3. `/[username]/page.tsx` — SSR public page with `revalidate = 60`
4. `generateMetadata` for OG tags

### Phase 6: Cron + Polish
1. `/api/cron/refresh` — refreshes cached_data every 15 min
2. Token refresh logic
3. Landing page (hero, features, CTA)
4. 3-integration limit enforcement
5. Error handling, loading states, mobile responsiveness
6. Deploy to Vercel

## Key Architecture Decisions

**Embed strategy:** All data fetched server-side on cron schedule, cached in DB. Public pages render client-side embeds (iframes/widget scripts). No live API calls on page load.

| Platform | Data Fetch | Render |
|----------|-----------|--------|
| YouTube | Cron → YouTube API → video ID in cached_data | Client iframe |
| Twitter | Cron → Twitter API → tweet IDs in cached_data | Client twitter-widget.js |
| Twitch | Cron → Twitch Helix → live status in cached_data | Client iframe player |

**Routing:** `[username]` is a top-level dynamic route. Static routes resolve first by Next.js convention.

**Slug validation:** Reject reserved words and enforce `^[a-z0-9][a-z0-9-]{2,30}$`.

## Project Structure
```
src/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── login/page.tsx                    # Google OAuth login
│   ├── auth/callback/route.ts            # Supabase OAuth code exchange
│   ├── dashboard/
│   │   ├── layout.tsx                    # Auth shell
│   │   ├── page.tsx                      # Dashboard home
│   │   ├── integrations/page.tsx         # Manage integrations
│   │   ├── page-editor/page.tsx          # Edit public page
│   │   └── settings/page.tsx             # Profile settings
│   ├── api/integrations/{youtube,twitter,twitch}/{connect,callback}/route.ts
│   ├── api/page/route.ts                # GET/PUT page config
│   ├── api/cron/refresh/route.ts         # Cron data refresh
│   └── [username]/page.tsx               # PUBLIC page (the product)
├── components/
│   ├── embeds/{YouTubeEmbed,TwitterEmbed,TwitchEmbed}.tsx
│   ├── dashboard/{Sidebar,IntegrationCard,PagePreview}.tsx
│   └── public-page/{PageShell,ProfileHeader,WidgetRenderer}.tsx
├── lib/
│   ├── supabase/{client,server,admin}.ts
│   └── integrations/{youtube,twitter,twitch}.ts
middleware.ts
supabase/migrations/
```

## Status
- [x] Plan designed and approved
- [ ] Phase 1: Foundation
- [ ] Phase 2: YouTube Integration
- [ ] Phase 3: Twitter/X Integration
- [ ] Phase 4: Twitch Integration
- [ ] Phase 5: Page Editor + Public Pages
- [ ] Phase 6: Cron + Polish

## Notes for Next Agent
- The existing `categorai-playwright-example/` directory is unrelated — can be deleted
- Start with Phase 1: init Next.js project at the repo root (remove the old playwright project)
- User wants Next.js + Supabase, Google OAuth, MVP integrations: YouTube + Twitter/X + Twitch
- Free tier only for MVP (no Stripe), 3 integration limit
- The repo remote currently points to `jamesjmclaren/categorais-playwright-example` — may want to create a new repo or rename
