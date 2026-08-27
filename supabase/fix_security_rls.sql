

-- Step 1: Enable Row Level Security on all public tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pitches ENABLE ROW LEVEL SECURITY;

-- Step 2: Lock down ACCOUNTS table (contains GitHub OAuth access tokens)
-- Revoke all permissions from anon and authenticated roles for direct PostgREST API access
REVOKE ALL ON TABLE public.accounts FROM anon, authenticated;
GRANT ALL ON TABLE public.accounts TO service_role, postgres;

-- Step 3: Define RLS policies for each table

-- ------------------------------------------------------------
-- FUNDERS: Publicly readable, writeable only by service_role/admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access to funders" ON public.funders;
CREATE POLICY "Allow public read access to funders" ON public.funders
  FOR SELECT TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------
-- USERS: Publicly readable for profile metadata
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access to user profiles" ON public.users;
CREATE POLICY "Allow public read access to user profiles" ON public.users
  FOR SELECT TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------
-- REPOS: Publicly readable (enables /r/[owner]/[repo] public impact cards)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access to repos" ON public.repos;
CREATE POLICY "Allow public read access to repos" ON public.repos
  FOR SELECT TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------
-- MATCHES: Publicly readable for matching details on repo share pages
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read access to matches" ON public.matches;
CREATE POLICY "Allow public read access to matches" ON public.matches
  FOR SELECT TO anon, authenticated
  USING (true);

-- ------------------------------------------------------------
-- PITCHES: Readable by authenticated users and service role
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated read access to pitches" ON public.pitches;
CREATE POLICY "Allow authenticated read access to pitches" ON public.pitches
  FOR SELECT TO authenticated, service_role
  USING (true);

-- ------------------------------------------------------------
-- ACCOUNTS: Strictly restricted to service_role (No RLS policies for anon/authenticated)
-- ------------------------------------------------------------
-- (No policies created for anon or authenticated; access completely denied via API)
