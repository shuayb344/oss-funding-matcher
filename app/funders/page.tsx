"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Funder {
  id: string;
  name: string;
  description: string;
  amount_range: string;
  focus_tags: string[];
  application_type: string;
  eligibility_notes: string;
  application_url: string | null;
  region_restriction: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  direct_application: "Direct Application",
  nomination_based: "Nomination",
  open_call: "Open Call",
  manifest_based: "Manifest",
};

const TYPE_COLORS: Record<string, string> = {
  direct_application: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
  nomination_based: "bg-amber-900/50 text-amber-400 border-amber-800",
  open_call: "bg-blue-900/50 text-blue-400 border-blue-800",
  manifest_based: "bg-violet-900/50 text-violet-400 border-violet-800",
};

export default function FundersPage() {
  const [funders, setFunders] = useState<Funder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/funders")
      .then((r) => r.json())
      .then((data) => setFunders(data.funders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = funders.filter((f) => {
    const matchesSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.description?.toLowerCase().includes(search.toLowerCase()) ||
      f.focus_tags.some((t) =>
        t.toLowerCase().includes(search.toLowerCase())
      );
    const matchesType =
      typeFilter === "all" || f.application_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const types = ["all", ...new Set(funders.map((f) => f.application_type))];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Funding Programs
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {funders.length} verified programs that fund open source projects.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, description, or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-700"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === type
                  ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
              }`}
            >
              {type === "all"
                ? "All"
                : TYPE_LABELS[type] || type.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-sm text-zinc-500">
          Loading funding programs…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-zinc-500">
          No programs match your search.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((funder) => (
            <FunderCard key={funder.id} funder={funder} />
          ))}
        </div>
      )}
    </div>
  );
}

function FunderCard({ funder }: { funder: Funder }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-sm font-semibold text-zinc-100">
              {funder.name}
            </h3>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                TYPE_COLORS[funder.application_type] ||
                "border-zinc-800 text-zinc-400"
              }`}
            >
              {TYPE_LABELS[funder.application_type] ||
                funder.application_type.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">{funder.amount_range}</p>
        </div>
        {funder.application_url && (
          <a
            href={funder.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1 rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 transition-colors"
          >
            Apply
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </div>

      {funder.description && (
        <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">
          {funder.description}
        </p>
      )}

      {/* Tags */}
      {funder.focus_tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {funder.focus_tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500"
            >
              {tag}
            </span>
          ))}
          {funder.region_restriction && (
            <span className="inline-flex items-center rounded-full border border-amber-900/50 px-2 py-0.5 text-[10px] text-amber-500">
              📍 {funder.region_restriction}
            </span>
          )}
        </div>
      )}

      {/* Expandable eligibility */}
      {funder.eligibility_notes && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {expanded ? "Hide" : "Show"} eligibility details
          </button>
          {expanded && (
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed bg-zinc-800/30 rounded p-3">
              {funder.eligibility_notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
