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

/**
 * Consistent empty state component used across dashboard and detail pages.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/50 text-zinc-500">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
      <p className="mt-1.5 text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.loading}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {action.loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
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
