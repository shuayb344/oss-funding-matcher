"use client";

import { Loader2 } from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-none border border-dashed border-slate-300 dark:border-white/10 bg-white dark:bg-[#0e0e12] p-12 text-center shadow-sm dark:shadow-none">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-400 dark:text-zinc-400">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200 tracking-tight">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-500 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.loading}
          className="mt-6 inline-flex items-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-5 py-2 font-mono text-xs font-semibold text-black hover:bg-emerald-400 hover:shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all disabled:opacity-50"
        >
          {action.loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Working…
            </>
          ) : (
            action.label
          )}
        </button>
      )}
    </div>
  );
}
