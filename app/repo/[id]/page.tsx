"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLoader } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";
import { RepoOverviewCard, Repo } from "@/components/repo/RepoOverviewCard";
import { MatchCardList, Match } from "@/components/repo/MatchCardList";
import { NoMatchExplanationCard } from "@/components/repo/NoMatchExplanationCard";
import { PitchOutputEditor, Pitch } from "@/components/repo/PitchOutputEditor";

export default function RepoDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const repoId = params.id as string;

  const [repo, setRepo] = useState<Repo | null>(null);
  const [loadingRepo, setLoadingRepo] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [hasRunMatching, setHasRunMatching] = useState(false);
  const [noMatchExplanation, setNoMatchExplanation] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  // Fetch repository metadata
  useEffect(() => {
    if (status === "authenticated" && repoId) {
      setLoadingRepo(true);
      fetch("/api/repos")
        .then((r) => r.json())
        .then((data) => {
          const list: Repo[] = data.repos || [];
          const found = list.find((r) => r.id === repoId);
          if (found) setRepo(found);
        })
        .catch(() => {})
        .finally(() => setLoadingRepo(false));
    }
  }, [status, repoId]);

  const handleMatch = async () => {
    setLoadingMatches(true);
    setError(null);
    setNoMatchExplanation(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_id: repoId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Matching failed");
        return;
      }
      setMatches(data.matches || []);
      setHasRunMatching(true);
      if (data.no_match_explanation) {
        setNoMatchExplanation(data.no_match_explanation);
      }
    } catch {
      setError("Failed to run matching. Please try again.");
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleGeneratePitch = async (match: Match) => {
    setSelectedMatch(match);
    setGeneratingPitch(true);
    setPitch(null);
    setError(null);
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: match.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Pitch generation failed");
        return;
      }
      setPitch(data.pitch);
    } catch {
      setError("Failed to generate pitch. Please try again.");
    } finally {
      setGeneratingPitch(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleSaveEdit = async () => {
    if (!pitch) return;
    setSaving(true);
    try {
      const res = await fetch("/api/pitch", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch_id: pitch.id, edited_text: editText }),
      });
      if (res.ok) {
        setPitch({ ...pitch, edited_text: editText });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setEditText(pitch?.edited_text || pitch?.draft_text || "");
    setEditing(true);
  };

  if (status === "loading" || loadingRepo) {
    return <PageLoader text="Loading repository analysis…" />;
  }

  if (!session) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-10 min-h-[calc(100vh-3.5rem)]">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-mono text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          BACK TO DASHBOARD
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-none border border-red-500/30 bg-red-500/10 p-4 text-xs font-mono text-red-500 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* REPOSITORY OVERVIEW CARD */}
      {repo && <RepoOverviewCard repo={repo} />}

      {/* SECTION HEADER WITH ACTION BUTTON */}
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            // Match Intelligence Engine
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans sm:text-2xl">
            Funding Matches
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 font-mono">
            EVALUATE REPOSITORY METADATA AGAINST ACTIVE VERIFIED GRANT DIRECTORIES
          </p>
        </div>

        <button
          onClick={handleMatch}
          disabled={loadingMatches}
          className="inline-flex items-center justify-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-5 py-2.5 font-mono text-xs font-semibold text-black hover:bg-emerald-400 hover:shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50 shrink-0"
        >
          {loadingMatches ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ANALYZING MATCHES…
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              {matches.length > 0 ? "RE-RUN MATCHING" : "RUN FUNDING MATCH"}
            </>
          )}
        </button>
      </div>

      {/* MATCHING CARDS LIST */}
      {matches.length > 0 && (
        <MatchCardList
          matches={matches}
          selectedMatch={selectedMatch}
          generatingPitch={generatingPitch}
          onGeneratePitch={handleGeneratePitch}
        />
      )}

      {/* Loading state */}
      {loadingMatches && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-8 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <p className="font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-zinc-400">
            Synthesizing OpenSSF score against active grant directories...
          </p>
        </div>
      )}

      {/* EXPLICIT NO MATCH EXPLANATION BOX */}
      {hasRunMatching && matches.length === 0 && !loadingMatches && (
        <NoMatchExplanationCard
          repoFullName={repo?.github_full_name}
          noMatchExplanation={noMatchExplanation}
        />
      )}

      {/* Initial Empty State (Before running match) */}
      {!hasRunMatching && matches.length === 0 && !loadingMatches && (
        <EmptyState
          icon={<Search className="h-5 w-5 text-slate-400 dark:text-zinc-400" />}
          title="No funding matches evaluated yet"
          description="Click 'RUN FUNDING MATCH' above to evaluate your repository against verified grant directories."
        />
      )}

      {/* PITCH OUTPUT & IDE EDITOR CONTAINER */}
      {pitch && (
        <PitchOutputEditor
          pitch={pitch}
          editing={editing}
          editText={editText}
          copied={copied}
          saving={saving}
          onStartEditing={startEditing}
          onCancelEditing={() => setEditing(false)}
          onEditTextChange={setEditText}
          onSaveEdit={handleSaveEdit}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
}
