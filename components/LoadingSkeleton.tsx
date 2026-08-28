"use client";

import { Loader2 } from "lucide-react";

export function RepoCardSkeleton() {
  return (
    <div className="relative rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] p-5 animate-pulse overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-zinc-700" />
      <div className="flex items-start justify-between gap-4 pl-1">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-48 rounded-none bg-slate-200 dark:bg-zinc-800" />
          <div className="h-3 w-72 rounded-none bg-slate-200/60 dark:bg-zinc-800/60" />
          <div className="flex gap-4">
            <div className="h-3 w-12 rounded-none bg-slate-200/40 dark:bg-zinc-800/40" />
            <div className="h-3 w-12 rounded-none bg-slate-200/40 dark:bg-zinc-800/40" />
            <div className="h-3 w-20 rounded-none bg-slate-200/40 dark:bg-zinc-800/40" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="h-7 w-12 rounded-none bg-slate-200 dark:bg-zinc-800" />
          <div className="h-3 w-14 rounded-none bg-slate-200/60 dark:bg-zinc-800/60" />
        </div>
      </div>
    </div>
  );
}

export function PageLoader({ text = "Loading…" }: { text?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center py-24 min-h-[calc(100vh-14rem)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500 dark:text-emerald-400" />
        </div>
        <span className="font-mono text-xs tracking-wider text-slate-500 dark:text-zinc-500 uppercase">{text}</span>
      </div>
    </div>
  );
}
