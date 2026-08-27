-- OSS Funding Matcher — Database Schema


-- ============================================================
-- USERS
-- ============================================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  github_id text unique not null,
  username text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- ACCOUNTS
-- ============================================================
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid references users(id) on delete cascade,
  type text,
  provider text,
  "providerAccountId" text,
  access_token text,
  token_type text,
  scope text,
  created_at timestamptz default now(),
  unique(provider, "providerAccountId")
);

-- ============================================================
-- REPOS
-- ============================================================
create table if not exists repos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  github_full_name text not null,       -- e.g. "octocat/hello-world"
  description text,
  primary_language text,
  stars int,
  forks int,
  open_issues int,
  contributors_count int,
  commit_frequency numeric,             -- commits per 90 days, used in scoring
  criticality_score numeric,            -- 0.0–1.0, computed
  last_analyzed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, github_full_name)
);

-- ============================================================
-- FUNDERS
-- ============================================================
create table if not exists funders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  amount_range text,                    -- human-readable, e.g. "$10,000 + Azure credits"
  focus_tags text[],                    -- e.g. {'security','infrastructure'}
  application_type text,                -- 'direct_application' | 'nomination_based' | 'open_call' | 'manifest_based'
  eligibility_notes text,
  application_url text,
  region_restriction text,              -- null if global
  unique(name)
);

-- ============================================================
-- MATCHES
-- ============================================================
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  repo_id uuid references repos(id) on delete cascade,
  funder_id uuid references funders(id) on delete cascade,
  match_score int,                      -- 0–100, AI-generated
  match_reasoning text,                 -- AI-generated, 1-2 sentences
  created_at timestamptz default now(),
  unique(repo_id, funder_id)
);

-- ============================================================
-- PITCHES
-- ============================================================
create table if not exists pitches (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  draft_text text,
  edited_text text,                     -- user's edited version, nullable
  generated_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_repos_user_id on repos(user_id);
create index if not exists idx_repos_criticality on repos(criticality_score desc);
create index if not exists idx_matches_repo_id on matches(repo_id);
create index if not exists idx_matches_funder_id on matches(funder_id);
create index if not exists idx_funders_application_type on funders(application_type);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) & PERMISSIONS
-- ============================================================
alter table users enable row level security;
alter table accounts enable row level security;
alter table repos enable row level security;
alter table funders enable row level security;
alter table matches enable row level security;
alter table pitches enable row level security;

-- Revoke API access on accounts table to prevent token exposure
revoke all on table accounts from anon, authenticated;
grant all on table accounts to service_role, postgres;

-- Public RLS Policies
create policy "Allow public read access to funders" on funders for select to anon, authenticated using (true);
create policy "Allow public read access to user profiles" on users for select to anon, authenticated using (true);
create policy "Allow public read access to repos" on repos for select to anon, authenticated using (true);
create policy "Allow public read access to matches" on matches for select to anon, authenticated using (true);
create policy "Allow authenticated read access to pitches" on pitches for select to authenticated, service_role using (true);

