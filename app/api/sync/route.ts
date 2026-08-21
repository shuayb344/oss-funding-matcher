import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { rateLimitOrContinue } from "@/lib/rate-limit";
import {
  fetchUserRepos,
  fetchContributorCount,
  fetchRecentCommitCount,
} from "@/lib/github";
import { computeCriticalityScore, type RepoMetrics } from "@/lib/scoring";

/**
 * POST /api/sync
 * Fetches the authenticated user's repos from GitHub,
 * computes criticality scores, and stores everything in Supabase.
 */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 syncs per minute per user
  const { response } = rateLimitOrContinue(`sync:${session.user.id}`, 5, 60_000);
  if (response) return response;

  // Get or create the user in our database
  let { data: dbUser } = await supabase
    .from("users")
    .select("id, username")
    .eq("github_id", session.user.id)
    .single();

  if (!dbUser) {
    // First time — create the user record
    const username = session.user.name || session.user.email || "unknown";
    const { data: newUser } = await supabase
      .from("users")
      .insert({
        github_id: session.user.id,
        username,
        avatar_url: session.user.image,
      })
      .select("id, username")
      .single();

    dbUser = newUser;
  }

  if (!dbUser) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  // We need a GitHub access token to call the API.
  // Auth.js stores it in the Account table.
  const { data: account } = await supabase
    .from("accounts")
    .select("access_token")
    .eq("userId", dbUser.id)
    .single();

  if (!account?.access_token) {
    return NextResponse.json(
      { error: "GitHub access token not found. Please re-authenticate." },
      { status: 401 }
    );
  }

  const token = account.access_token;

  try {
    // Fetch repos from GitHub
    const githubRepos = await fetchUserRepos(token, dbUser.username);

    // Process each repo: fetch extra metrics and compute score
    const results = [];

    for (const repo of githubRepos.slice(0, 50)) {
      // Cap at 50 repos per sync to stay within rate limits
      try {
        const [contributors_count, commit_frequency] = await Promise.all([
          fetchContributorCount(token, repo.full_name),
          fetchRecentCommitCount(token, repo.full_name, 90),
        ]);

        const metrics: RepoMetrics = {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          contributors_count,
          commit_frequency,
          open_issues: repo.open_issues_count,
          created_at: repo.created_at,
          last_push: repo.pushed_at,
        };

        const criticality_score = computeCriticalityScore(metrics);

        // Upsert into Supabase
        const { data: savedRepo } = await supabase
          .from("repos")
          .upsert(
            {
              user_id: dbUser.id,
              github_full_name: repo.full_name,
              description: repo.description,
              primary_language: repo.language,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              open_issues: repo.open_issues_count,
              contributors_count,
              commit_frequency,
              criticality_score,
              last_analyzed_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,github_full_name",
            }
          )
          .select("id, github_full_name, criticality_score")
          .single();

        results.push(savedRepo);
      } catch (err) {
        console.error(`Failed to process ${repo.full_name}:`, err);
        // Continue with other repos
      }
    }

    return NextResponse.json({
      synced: results.length,
      repos: results,
    });
  } catch (err) {
    console.error("Sync failed:", err);
    return NextResponse.json(
      { error: "Failed to sync repositories" },
      { status: 500 }
    );
  }
}
