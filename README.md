# OSS Funding Matcher

A tool where open source maintainers connect their GitHub repo, see how critical their project really is, get matched against real funding programs they qualify for, and get an AI-drafted application ready to send.

## How it works

1. **Connect** — Sign in with GitHub. We fetch your repos and analyze them.
2. **Match** — AI scores your projects against 18+ verified funding programs.
3. **Apply** — Get a tailored pitch draft — copy, edit, and send to the funder.

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16 (App Router) | Fullstack in one deploy, no separate backend |
| Auth | Auth.js (NextAuth) with GitHub provider | Free, handles OAuth cleanly |
| Database | Supabase (Postgres) | Free tier, no credit card |
| Hosting | Vercel Hobby tier | Free, integrates natively with Next.js |
| AI | Google AI Studio (Gemini 2.0 Flash) | Free tier, fast inference, no credit card required |

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

### AI Provider

For matching and pitch generation, set up a free Google AI Studio API key:
- **Google AI Studio:** Get a key at [aistudio.google.com](https://aistudio.google.com) and add it as `GOOGLE_AI_STUDIO_KEY` in `.env.local`.

## Project Structure

```
oss-funding-matcher/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # Auth.js handler
│   │   ├── repos/route.ts                # Fetch user's repos
│   │   ├── sync/route.ts                 # Sync repos from GitHub + compute scores
│   │   ├── match/route.ts                # AI matching against funders
│   │   ├── pitch/route.ts                # AI pitch generation
│   │   └── session/route.ts              # Session endpoint
│   ├── dashboard/page.tsx                # Repo list with scores
│   ├── repo/[id]/page.tsx               # Repo detail + matches + pitches
│   ├── error.tsx                         # Global error boundary
│   ├── not-found.tsx                     # Custom 404
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout
│   └── globals.css
├── components/
│   ├── Navbar.tsx                        # Shared navigation bar
│   ├── EmptyState.tsx                    # Empty state component
│   └── LoadingSkeleton.tsx               # Loading skeletons
├── lib/
│   ├── ai.ts                             # AI provider integration (Google AI Studio / Gemini)
│   ├── auth.ts                           # Auth.js config
│   ├── db.ts                             # Supabase client
│   ├── github.ts                         # GitHub API helpers
│   └── scoring.ts                        # Criticality score calculation
├── scripts/
│   └── seed-funders.ts                   # Load funders into Supabase
├── seed/
│   └── funders.json                      # 18 verified funding programs
└── supabase/
    └── schema.sql                        # Database schema
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sync` | Fetch repos from GitHub, compute scores, store in Supabase |
| POST | `/api/match` | AI matches a repo against all funders |
| POST | `/api/pitch` | AI generates a tailored pitch draft |
| GET | `/api/repos` | Fetch user's repos with scores |

## Scope & Honesty

This tool produces a ready-to-send, tailored pitch — not an auto-submitted application. Most funders don't have a simple "submit" button; some use nomination, some use open calls, some use forms. For nomination-based funders, we frame the output honestly: "Here's a case you can send directly to someone who works there."

## License

MIT
