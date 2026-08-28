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

  const topScore = repos.length > 0 ? Math.max(...repos.map((r) => r.criticality_score ?? 0)) : 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 bg-transparent min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            // Developer Workspace
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 font-mono">
            {session.user?.name && (
              <>
                Connected as <span className="text-slate-900 dark:text-zinc-200 font-semibold">{session.user.name}</span>
                {" · "}
              </>
            )}
            {repos.length} REPOSITORIES INDEXED
          </p>
        </div>

        {/* Sync button + stats */}
        {repos.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="font-mono text-xs text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] px-3 py-1.5 rounded-none shadow-sm dark:shadow-none">
              TOP SCORE:{" "}
              <span className={`font-bold ${getScoreTextColor(topScore)}`}>
                {Math.round(topScore * 100)}%
              </span>
            </div>

            <button
              onClick={() => syncMutation.mutate()}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-4 py-2 font-mono text-xs font-semibold text-black hover:bg-emerald-400 hover:shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50"
            >
              {syncing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  SYNCING…
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  RE-SYNC REPOS
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Repo list */}
      {repos.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="h-5 w-5 text-slate-400 dark:text-zinc-400" />}
          title="No repositories synced"
          description="Fetch your public GitHub repositories to calculate OpenSSF criticality scores and match funding."
          action={{
            label: "Sync GitHub Repos",
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
  const { label: scoreLabel, accentBg, textColor } = getScoreTierInfo(score);

  return (
    <Link
      href={`/repo/${repo.id}`}
      className="group relative block rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-5 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md dark:hover:shadow-none transition-all overflow-hidden shadow-sm dark:shadow-none"
    >
      {/* Left-edge 2px accent bar colored by score tier */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBg} transition-colors group-hover:brightness-125`} />

      <div className="flex items-start justify-between gap-4 pl-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white font-sans group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {repo.github_full_name}
            </h2>
            {repo.primary_language && (
              <span className="inline-flex items-center rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {repo.primary_language}
              </span>
            )}
            <span className="inline-flex items-center rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {scoreLabel}
            </span>
          </div>

          {repo.description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 font-sans">
              {repo.description}
            </p>
          )}

          {/* Repo metadata pill bar */}
          <div className="mt-3 flex items-center gap-4 font-mono text-xs text-slate-400 dark:text-zinc-500">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              {repo.stars?.toLocaleString() ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="h-3 w-3 text-blue-500" />
              {repo.forks?.toLocaleString() ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-violet-500" />
              {repo.contributors_count ?? 0}
            </span>
          </div>
        </div>

        {/* Score column */}
        <div className="flex flex-col items-end shrink-0 font-mono">
          <span className={`text-2xl font-bold tabular-nums ${textColor}`}>
            {scorePercent}%
          </span>
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            CRITICALITY
          </span>
        </div>
      </div>
    </Link>
  );
}

function getScoreTierInfo(score: number): { label: string; accentBg: string; textColor: string } {
  if (score >= 0.5) {
    return {
      label: "Critical",
      accentBg: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    };
  }
  if (score >= 0.3) {
    return {
      label: "Moderate",
      accentBg: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    };
  }
  return {
    label: "Developing",
    accentBg: "bg-slate-400 dark:bg-zinc-600",
    textColor: "text-slate-500 dark:text-zinc-500",
  };
}

function getScoreTextColor(score: number): string {
  if (score >= 0.5) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 0.3) return "text-amber-600 dark:text-amber-400";
  return "text-slate-500 dark:text-zinc-500";
}
