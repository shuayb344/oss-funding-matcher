"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ExternalLink, MapPin } from "lucide-react";

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
  nomination_based: "Nomination Based",
  open_call: "Open Call",
  manifest_based: "Manifest Based",
};

const TYPE_COLORS: Record<string, string> = {
  direct_application: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  nomination_based: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  open_call: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  manifest_based: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/30",
};

export default function FundersPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: funders = [], isLoading: loading } = useQuery<Funder[]>({
    queryKey: ["funders"],
    queryFn: () =>
      fetch("/api/funders")
        .then((r) => r.json())
        .then((data) => data.funders || []),
  });

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
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 bg-transparent min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
          // Verified Funder Registry
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans sm:text-3xl">
          Active Funding Programs
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 font-mono">
          DIRECTORIES OF GRANTS, SPONSORSHIP FUNDS &amp; OPEN SOURCE STIPENDS
        </p>
      </div>

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search by funder name, tag, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] pl-9 pr-4 py-2.5 font-mono text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none shadow-sm dark:shadow-none"
          />
        </div>

        {/* Type pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-none border px-3 py-1.5 uppercase transition-all ${
                typeFilter === type
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold"
                  : "border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {type === "all" ? "All Types" : TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-none border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02] animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] p-12 text-center font-mono text-xs text-slate-400 dark:text-zinc-500 uppercase shadow-sm dark:shadow-none">
          No funders matching your search filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((funder) => (
            <div
              key={funder.id}
              className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md dark:hover:shadow-none transition-all flex flex-col justify-between shadow-sm dark:shadow-none"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white font-sans">
                    {funder.name}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-none border px-2 py-0.5 font-mono text-[10px] uppercase font-bold shrink-0 ${
                      TYPE_COLORS[funder.application_type] ||
                      "border-slate-200 dark:border-white/10 text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {TYPE_LABELS[funder.application_type] || funder.application_type}
                  </span>
                </div>

                <p className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
                  {funder.amount_range}
                </p>

                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans line-clamp-3 mb-4">
                  {funder.description}
                </p>
              </div>

              <div>
                {funder.focus_tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px] mb-4">
                    {funder.focus_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] px-2 py-0.5 text-slate-500 dark:text-zinc-400 uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between font-mono text-xs">
                  {funder.region_restriction ? (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500">
                      <MapPin className="h-3 w-3" />
                      {funder.region_restriction}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">GLOBAL ELIGIBILITY</span>
                  )}

                  {funder.application_url && (
                    <a
                      href={funder.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline uppercase text-[11px]"
                    >
                      APPLY <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
