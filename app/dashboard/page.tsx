"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RepoCardSkeleton, PageLoader } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";

interface Repo {
  id: string;
  github_full_name: string;
  description: string | null;
  primary_language: string | null;
  stars: number | null;
  forks: number | null;
  contributors_count: number | null;
  criticality_score: number | null;
  last_analyzed_at: string | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const fetchRepos = useCallback(async () => {
    try {
      const res = await fetch("/api/repos");
      const data = await res.json();
      setRepos(data.repos || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchRepos();
  }, [status, fetchRepos]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/sync", { method: "POST" });
      await fetchRepos();
    } catch {
      // silent
    } finally {
      setSyncing(false);
    }
  };

  if (status === "loading" || loading) {
    return <PageLoader text="Loading your dashboard…" />;
  }

  if (!session) return null;

  const totalStars = repos.reduce((sum, r) => sum + (r.stars ?? 0), 0);
  const topScore = repos.length > 0 ? Math.max(...repos.map((r) => r.criticality_score ?? 0)) : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {session.user?.name && (
            <>
              Connected as{" "}
              <span className="text-zinc-400">{session.user.name}</span>
              {" · "}
            </>
          )}
          {repos.length} repos · {totalStars.toLocaleString()} total stars
        </p>
      </div>

      {/* Sync button + stats */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {syncing ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Syncing…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              {repos.length === 0 ? "Sync your repos" : "Re-sync repos"}
            </>
          )}
        </button>

        {repos.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>
              Top score:{" "}
              <span className={getScoreColor(topScore)}>
                {Math.round(topScore * 100)}%
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Repo list */}
      {repos.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.729-3.563" />
            </svg>
          }
          title="No repos synced yet"
          description="Click the button above to fetch your GitHub repos and compute their criticality scores."
          action={{
            label: "Sync your repos",
            onClick: handleSync,
            loading: syncing,
          }}
        />
      ) : syncing ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <RepoCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  const score = repo.criticality_score ?? 0;
  const scorePercent = Math.round(score * 100);
  const { label: scoreLabel, color: scoreColor } = getScoreInfo(score);

  return (
    <Link
      href={`/repo/${repo.id}`}
      className="group block rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-100 truncate group-hover:text-white transition-colors">
              {repo.github_full_name}
            </h3>
            {repo.primary_language && (
              <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {repo.primary_language}
              </span>
            )}
          </div>
          {repo.description && (
            <p className="mt-1.5 text-xs text-zinc-500 line-clamp-1">
              {repo.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              {repo.stars ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-4.274a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L5.25 8.5" />
              </svg>
              {repo.forks ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
              </svg>
              {repo.contributors_count ?? 0}
            </span>
          </div>
        </div>

        {/* Score badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className={`text-lg font-bold tabular-nums ${scoreColor}`}>
            {scorePercent}%
          </div>
          <div className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</div>
        </div>
      </div>
    </Link>
  );
}

function getScoreInfo(score: number): { label: string; color: string } {
  if (score >= 0.7) return { label: "Critical", color: "text-red-400" };
  if (score >= 0.5) return { label: "High", color: "text-orange-400" };
  if (score >= 0.3) return { label: "Moderate", color: "text-yellow-400" };
  if (score >= 0.1) return { label: "Low", color: "text-zinc-400" };
  return { label: "Minimal", color: "text-zinc-600" };
}

function getScoreColor(score: number): string {
  if (score >= 0.7) return "text-red-400";
  if (score >= 0.5) return "text-orange-400";
  if (score >= 0.3) return "text-yellow-400";
  return "text-zinc-400";
}
