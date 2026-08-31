import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * GET /api/cron/refresh-scores
 *
 * Vercel Cron job — runs daily to refresh criticality scores.
 * Only accessible via Vercel's cron trigger (CRON_SECRET).
 *
 * Setup in vercel.json:
 * { "crons": [{ "path": "/api/cron/refresh-scores", "schedule": "0 6 * * *" }] }
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: staleRepos, error } = await supabase
    .from("repos")
    .select("id, github_full_name, user_id")
    .or(`last_analyzed_at.is.null,last_analyzed_at.lt.${sevenDaysAgo}`)
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "Failed to query repos" }, { status: 500 });
  }

  if (!staleRepos || staleRepos.length === 0) {
    return NextResponse.json({ message: "No stale repos to refresh", refreshed: 0 });
  }

  const userRepos = new Map<string, string[]>();
  for (const repo of staleRepos) {
    const existing = userRepos.get(repo.user_id) || [];
    existing.push(repo.id);
    userRepos.set(repo.user_id, existing);
  }

  let refreshed = 0;
  let failed = 0;

  for (const [userId, repoIds] of userRepos) {
    const { data: account } = await supabase
      .from("accounts")
      .select("access_token")
      .eq("userId", userId)
      .single();

    if (!account?.access_token) {
      failed += repoIds.length;
      continue;
    }

    const token = account.access_token;

    const { fetchContributorCount, fetchRecentCommitCount } = await import(
      "@/lib/github"
    );
    const { computeCriticalityScore } = await import("@/lib/scoring");

    for (const repoId of repoIds) {
      const { data: repo } = await supabase
        .from("repos")
        .select("*")
        .eq("id", repoId)
        .single();

      if (!repo) {
        failed++;
        continue;
      }

      try {
        const [contributors_count, commit_frequency] = await Promise.all([
          fetchContributorCount(token, repo.github_full_name),
          fetchRecentCommitCount(token, repo.github_full_name, 90),
        ]);

        const criticality_score = computeCriticalityScore({
          stars: repo.stars || 0,
          forks: repo.forks || 0,
          contributors_count,
          commit_frequency,
          open_issues: repo.open_issues || 0,
          created_at: repo.created_at,
          last_push: new Date().toISOString(),
        });

        await supabase
          .from("repos")
          .update({
            contributors_count,
            commit_frequency,
            criticality_score,
            last_analyzed_at: new Date().toISOString(),
          })
          .eq("id", repoId);

        refreshed++;
      } catch (err) {
        console.error(`Failed to refresh ${repo.github_full_name}:`, err);
        failed++;
      }
    }
  }

  return NextResponse.json({
    message: "Score refresh complete",
    refreshed,
    failed,
    total: staleRepos.length,
  });
}
