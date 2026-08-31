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

  const { response } = rateLimitOrContinue(`sync:${session.user.id}`, 5, 60_000);
  if (response) return response;

  let { data: dbUser } = await supabase
    .from("users")
    .select("id, username")
    .eq("github_id", session.user.id)
    .single();

  if (!dbUser) {
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

  let token = (session.user as any)?.accessToken;

  if (!token) {
    const { data: account } = await supabase
      .from("accounts")
      .select("access_token")
      .eq("userId", dbUser.id)
      .single();
    token = account?.access_token;
  }

  if (!token) {
    return NextResponse.json(
      { error: "GitHub access token not found. Please re-authenticate." },
      { status: 401 }
    );
  }

  try {
    const githubRepos = await fetchUserRepos(token, dbUser.username);

    const results = [];
    const BATCH_SIZE = 5;

    for (let i = 0; i < githubRepos.length; i += BATCH_SIZE) {
      const batch = githubRepos.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (repo) => {
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

          return savedRepo;
        } catch (err) {
          console.error(`Failed to process ${repo.full_name}:`, err);
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      for (const res of batchResults) {
        if (res) results.push(res);
      }
    }

    return NextResponse.json({
      synced: results.length,
      repos: results,
    });
  } catch (err: any) {
    console.error("Sync failed:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to sync repositories" },
      { status: 500 }
    );
  }
}
