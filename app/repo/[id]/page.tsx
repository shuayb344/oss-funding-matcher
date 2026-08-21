"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageLoader } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";

interface Match {
  id: string;
  match_score: number;
  match_reasoning: string;
  funders: {
    name: string;
    description: string;
    amount_range: string;
    application_type: string;
    application_url: string | null;
    focus_tags: string[];
  };
}

interface Pitch {
  id: string;
  draft_text: string;
  edited_text: string | null;
  generated_at: string;
}

export default function RepoDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const repoId = params.id as string;

  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
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

  const handleMatch = async () => {
    setLoadingMatches(true);
    setError(null);
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
    } catch {
      setError("Failed to run matching. Please try again.");
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleGeneratePitch = async (matchId: string) => {
    setGeneratingPitch(true);
    setPitch(null);
    setError(null);
    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId }),
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
    } catch {
      // fallback
    }
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

  if (status === "loading") {
    return <PageLoader text="Loading repo…" />;
  }

  if (!session) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-400 flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}

      {/* Match button */}
      <div className="mb-8">
        <button
          onClick={handleMatch}
          disabled={loadingMatches}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loadingMatches ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing funding matches…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              {matches.length === 0 ? "Find funding matches" : "Re-run matching"}
            </>
          )}
        </button>
      </div>

      {/* Matches list */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Matched Funding Programs
            </h2>
            <span className="text-xs text-zinc-600">{matches.length} matches</span>
          </div>
          {matches.map((match) => (
            <div
              key={match.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {match.funders.name}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                      {match.funders.application_type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {match.funders.amount_range}
                  </p>
                  <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">
                    {match.match_reasoning}
                  </p>
                  {match.funders.focus_tags?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {match.funders.focus_tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div
                    className={`text-xl font-bold tabular-nums ${getScoreColor(match.match_score)}`}
                  >
                    {match.match_score}
                  </div>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
                    / 100
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 border-t border-zinc-800/50 pt-4 flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedMatch(match);
                    handleGeneratePitch(match.id);
                  }}
                  disabled={generatingPitch && selectedMatch?.id === match.id}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-zinc-100 transition-colors disabled:opacity-50"
                >
                  {generatingPitch && selectedMatch?.id === match.id ? (
                    <>
                      <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                      </svg>
                      Generate pitch
                    </>
                  )}
                </button>

                {match.funders.application_url && (
                  <a
                    href={match.funders.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Learn more
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No matches yet */}
      {matches.length === 0 && !loadingMatches && (
        <EmptyState
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          }
          title="No matches yet"
          description="Click the button above to analyze this repo against 18+ verified funding programs."
          action={{
            label: "Find funding matches",
            onClick: handleMatch,
            loading: loadingMatches,
          }}
        />
      )}

      {/* Pitch output */}
      {pitch && (
        <div className="mt-8 rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-emerald-400">
                {pitch.edited_text ? "Your Pitch" : "Pitch Draft"}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {!editing && (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-900/30 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                  Edit
                </button>
              )}
              <button
                onClick={() => copyToClipboard(pitch.edited_text || pitch.draft_text)}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-900/30 transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {editing ? (
            <div>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full min-h-[200px] rounded-lg border border-emerald-900 bg-emerald-950/30 p-4 text-sm text-zinc-300 leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
              />
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save edits"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed">
              {pitch.edited_text || pitch.draft_text}
            </p>
          )}

          <p className="mt-4 text-xs text-zinc-600 border-t border-emerald-900/30 pt-3">
            Review this draft, edit as needed, and send it to the funder. This is
            a starting point — not a final application.
          </p>
        </div>
      )}
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  return "text-zinc-500";
}
