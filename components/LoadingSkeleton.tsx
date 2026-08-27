"use client";

import { Loader2 } from "lucide-react";

/**
 * Animated loading skeleton for repo cards on the dashboard.
 */
export function RepoCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-48 rounded bg-zinc-800" />
          <div className="h-3 w-72 rounded bg-zinc-800/60" />
          <div className="flex gap-4">
            <div className="h-3 w-12 rounded bg-zinc-800/40" />
            <div className="h-3 w-12 rounded bg-zinc-800/40" />
            <div className="h-3 w-20 rounded bg-zinc-800/40" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="h-7 w-10 rounded bg-zinc-800" />
          <div className="h-3 w-12 rounded bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full-page loading spinner with text.
 */
export function PageLoader({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        <span className="text-sm text-zinc-500">{text}</span>
      </div>
    </div>
  );
}
