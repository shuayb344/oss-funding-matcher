-- OSS Funding Matcher — Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- ============================================================
-- USERS
-- ============================================================
create table users (
  id uuid primary key default gen_random_uuid(),
  github_id text unique not null,
  username text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- REPOS
-- ============================================================
create table repos (
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
create table funders (
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
create table matches (
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
create table pitches (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  draft_text text,
  edited_text text,                     -- user's edited version, nullable
  generated_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_repos_user_id on repos(user_id);
create index idx_repos_criticality on repos(criticality_score desc);
create index idx_matches_repo_id on matches(repo_id);
create index idx_matches_funder_id on matches(funder_id);
create index idx_funders_application_type on funders(application_type);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table users enable row level security;
alter table repos enable row level security;
alter table funders enable row level security;
alter table matches enable row level security;
alter table pitches enable row level security;

-- Users can only see their own profile
create policy "Users see own profile" on users
  for select using (auth.uid()::text = github_id);

-- Users can only see their own repos
create policy "Users see own repos" on repos
  for select using (
    user_id in (
      select id from users where github_id = auth.uid()::text
    )
  );

-- Funders are public (read-only for everyone)
create policy "Funders are public" on funders
  for select using (true);

-- Matches: users can only see matches for their own repos
create policy "Users see own matches" on matches
  for select using (
    repo_id in (
      select id from repos where user_id in (
        select id from users where github_id = auth.uid()::text
      )
    )
  );

-- Pitches: users can only see pitches for their own matches
create policy "Users see own pitches" on pitches
  for select using (
    match_id in (
      select m.id from matches m
      join repos r on m.repo_id = r.id
      where r.user_id in (
        select id from users where github_id = auth.uid()::text
      )
    )
  );
