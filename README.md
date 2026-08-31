# OSS Funding Matcher

A tool where open source maintainers connect their GitHub repo, see how critical their project really is, get matched against real funding programs they qualify for, and get an AI-drafted application ready to send.

## How it works

1. **Connect** — Sign in with GitHub. We fetch your repos and analyze them.
2. **Match** — AI scores your projects against verified funding programs.
3. **Apply** — Get a tailored pitch draft — copy, edit, and send to the funder.
4. **Suggest** — Community members can suggest new funding programs for admin moderation.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | Fullstack in one deploy, no separate backend |
| Auth | Auth.js (NextAuth) with GitHub provider | Free, handles OAuth cleanly |
| Database | Supabase (Postgres) | Free tier, no credit card |
| Hosting | Vercel Hobby tier | Free, integrates natively with Next.js |
| AI | Google AI Studio (Gemini 3.6 Flash) | Free tier, fast inference, no credit card required | AND Grok llama-3.3-70b-versatile| Free tier, fast inference, no credit card required |

## Key Features

- **Infinite Marquee Strip**: Auto-scrolling horizontal wordmarks of verified grant programs.
- **Live Database Stats**: Real-time program count and maximum grant amount calculations.
- **OpenSSF Criticality Scoring**: Objective 0.0 to 1.0 scoring model for repository health and impact.
- **AI Matching & Pitch Generation**: Tailored grant matching and application pitch drafts using Gemini 3.6 Flash and Grok llama-3.3-70b-versatile.
- **Community Funder Suggestions**: Submit new grant programs with automated live URL verification and admin moderation.
- **Admin Moderation Panel**: Responsive dashboard (`/admin/funders`) for approving, editing, importing, or rejecting funder submissions.

## Criticality Scoring

We reimplement OpenSSF's published criticality scoring methodology directly in JavaScript, using GitHub API data. This avoids needing to run their Go CLI inside serverless functions.

Factors and weights:
- **Contributor count** (0.20) — more distinct contributors = healthier, more critical
- **Commit frequency** (0.25) — commits per 90 days, active maintenance signal
- **Project age** (0.15) — older, still-active = more embedded in ecosystem
- **Recent activity** (0.20) — time since last push
- **Issue activity** (0.10) — community engagement signal
- **Stars + forks** (0.10) — usage signal / visibility proxy

> Inspired by OpenSSF's methodology, reimplemented in JS for serverless compatibility.

## Setup

1. Copy `.env.local.example` to `.env.local` and fill in the values
2. Create a Supabase project at [supabase.com](https://supabase.com) (free)
3. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
4. Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers)
5. Seed funders: `npx tsx scripts/seed-funders.ts`
6. Run `npm run dev`

### GitHub OAuth App Settings

- **Application name:** anything (e.g. "OSS Funding Matcher")
- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`

### Admin Access Configuration

Add your GitHub numeric ID or username to `ADMIN_GITHUB_IDS` in `.env.local`:
```env
ADMIN_GITHUB_IDS="your-github-id-or-username"
```

### AI Provider

For matching and pitch generation, set up a free Google AI Studio API key:
- **Google AI Studio:** Get a key at [aistudio.google.com](https://aistudio.google.com) and add it as `GOOGLE_AI_STUDIO_KEY` in `.env.local`.

## Project Structure

```
oss-funding-matcher/
├── app/
│   ├── admin/
│   │   └── funders/page.tsx             # Responsive Admin dashboard & moderation
│   ├── api/
│   │   ├── admin/
│   │   │   ├── check/route.ts           # Admin authorization endpoint
│   │   │   └── suggestions/
│   │   │       ├── route.ts             # Fetch suggestions
│   │   │       └── approve/route.ts     # Moderation (live URL check & import)
│   │   ├── auth/[...nextauth]/route.ts  # Auth.js handler
│   │   ├── funders/
│   │   │   ├── route.ts                 # Fetch active funders
│   │   │   └── suggest/route.ts         # Community suggestion submission
│   │   ├── repos/route.ts               # Fetch user's repos
│   │   ├── sync/route.ts                # Sync repos from GitHub + compute scores
│   │   ├── match/route.ts               # AI matching against funders
│   │   ├── pitch/route.ts               # AI pitch generation
│   │   └── session/route.ts             # Session endpoint
│   ├── dashboard/page.tsx               # Repo list with scores
│   ├── funders/page.tsx                 # Public funder list + Suggestion modal
│   ├── repo/[id]/page.tsx              # Repo detail + matches + pitches
│   ├── page.tsx                         # Landing page (Marquee, Stats, FAQ)
│   └── globals.css
├── components/
│   ├── Navbar.tsx                       # Dynamic navigation bar with Admin link
│   ├── EmptyState.tsx                   # Empty state component
│   └── LoadingSkeleton.tsx              # Loading skeletons
├── lib/
│   ├── admin.ts                         # Admin authorization helper
│   ├── ai.ts                            # AI provider integration (Google AI Studio / Gemini)
│   ├── db.ts                            # Supabase client
│   ├── github.ts                        # GitHub API helpers
│   ├── scoring.ts                       # Criticality score calculation
│   └── useAdminStore.ts                 # Zustand store for admin state
├── scripts/
│   ├── seed-funders.ts                  # Load funders into Supabase
│   └── create-suggestions-table.ts      # Database migration script
├── seed/
│   └── funders.json                     # Verified funding programs registry
└── supabase/
    └── schema.sql                       # Complete database schema & RLS rules
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sync` | Fetch repos from GitHub, compute scores, store in Supabase |
| POST | `/api/match` | AI matches a repo against all funders |
| POST | `/api/pitch` | AI generates a tailored pitch draft |
| GET | `/api/repos` | Fetch user's repos with scores |
| GET | `/api/funders` | Fetch all verified funding programs |
| POST | `/api/funders/suggest` | Submit a community funder suggestion |
| GET | `/api/admin/check` | Verify current user admin authorization |
| GET | `/api/admin/suggestions` | Fetch community suggestions for admin moderation |
| POST | `/api/admin/suggestions/approve` | Approve suggestion (runs HTTP 200 check & imports) |

## Scope & Honesty

This tool produces a ready-to-send, tailored pitch — not an auto-submitted application. Most funders don't have a simple "submit" button; some use nomination, some use open calls, some use forms. For nomination-based funders, we frame the output honestly: "Here's a case you can send directly to someone who works there."

## License

MIT
