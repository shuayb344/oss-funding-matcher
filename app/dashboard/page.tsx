"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { RepoCardSkeleton, PageLoader } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { RefreshCw, Loader2, FolderGit2, Star, GitFork, Users } from "lucide-react";

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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const {
    data: repos = [],
    isLoading: loading,
    refetch,
  } = useQuery<Repo[]>({
    queryKey: ["repos"],
    queryFn: () =>
      fetch("/api/repos")
        .then((r) => r.json())
        .then((data) => data.repos || []),
    enabled: status === "authenticated",
  });

  const syncMutation = useMutation({
    mutationFn: () => fetch("/api/sync", { method: "POST" }),
    onSuccess: () => {
      refetch();
    },
  });

  const syncing = syncMutation.isPending;

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

      {/* Sync button + stats (only shown when repos exist) */}
      {repos.length > 0 && (
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing…
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Re-sync repos
              </>
            )}
          </button>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>
              Top score:{" "}
              <span className={getScoreColor(topScore)}>
                {Math.round(topScore * 100)}%
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Repo list */}
      {repos.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-6 w-6 text-zinc-400" />}
          title="No repos synced yet"
          description="Click the button below to fetch your GitHub repos and compute their criticality scores."
          action={{
            label: "Sync your repos",
            onClick: () => syncMutation.mutate(),
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
              <Star className="h-3.5 w-3.5 text-amber-400/70" />
              {repo.stars ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5 text-zinc-500" />
              {repo.forks ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-zinc-500" />
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
