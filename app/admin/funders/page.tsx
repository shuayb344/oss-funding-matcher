"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Plus, Edit3, Trash2, X, Loader2, ShieldCheck } from "lucide-react";
import { useAdminStore } from "@/lib/useAdminStore";

const TYPES = [
  "direct_application",
  "nomination_based",
  "open_call",
  "manifest_based",
];

export default function AdminFundersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    isAdmin,
    funders,
    loading,
    saving,
    showForm,
    editing,
    formData,
    tagInput,
    checkAdmin,
    openCreateForm,
    openEditForm,
    closeForm,
    setFormData,
    setTagInput,
    addTag,
    removeTag,
    saveFunder,
    deleteFunder,
  } = useAdminStore();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      checkAdmin();
    }
  }, [status, checkAdmin]);

  const handleDelete = (id: string) => {
    if (confirm("Delete this funder program entry?")) {
      deleteFunder(id);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">VERIFYING ADMIN PRIVILEGES…</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (isAdmin === false) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 px-6 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-none border border-red-500/40 bg-red-500/10 text-red-400">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-zinc-200">
          [ ACCESS DENIED ]
        </h2>
        <p className="mt-2 text-xs font-sans text-zinc-400 max-w-md leading-relaxed">
          You do not have administrator permissions to access this control panel. Configure your GitHub ID or username in <code className="font-mono text-emerald-400 bg-black/60 px-1 py-0.5 border border-white/10">ADMIN_GITHUB_IDS</code> inside <code className="font-mono text-emerald-400 bg-black/60 px-1 py-0.5 border border-white/10">.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 bg-transparent min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            // Admin Panel / Funder Registry
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans sm:text-3xl">
            Manage Funding Programs
          </h1>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-zinc-400">
            {funders.length} ACTIVE FUNDER DIRECTORIES
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-4 py-2 font-mono text-xs font-semibold text-black hover:bg-emerald-400 hover:shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all"
        >
          <Plus className="h-4 w-4" /> ADD FUNDER
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0c10] p-6 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3 mb-5">
              <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {editing ? "[ EDIT FUNDER PROGRAM ]" : "[ CREATE FUNDER PROGRAM ]"}
              </h2>
              <button onClick={closeForm} className="text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                  Program Name
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full rounded-none border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ description: e.target.value })}
                  rows={3}
                  className="w-full rounded-none border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                    Grant / Amount Range
                  </label>
                  <input
                    value={formData.amount_range}
                    onChange={(e) => setFormData({ amount_range: e.target.value })}
                    className="w-full rounded-none border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="e.g. $10,000 - $50,000"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                    Application Type
                  </label>
                  <select
                    value={formData.application_type}
                    onChange={(e) => setFormData({ application_type: e.target.value })}
                    className="w-full rounded-none border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t} className="bg-zinc-900 text-white">
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                  Focus Tags
                </label>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 rounded-none border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="Type tag and press Enter"
                  />
                  <button
                    onClick={addTag}
                    className="rounded-none border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-xs text-zinc-300 hover:border-white/30 hover:text-white"
                  >
                    ADD
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {formData.focus_tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 rounded-none border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase text-zinc-300">
                      #{tag}
                      <button onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                  Eligibility Notes
                </label>
                <textarea
                  value={formData.eligibility_notes}
                  onChange={(e) => setFormData({ eligibility_notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-none border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                    Application URL
                  </label>
                  <input
                    value={formData.application_url}
                    onChange={(e) => setFormData({ application_url: e.target.value })}
                    className="w-full rounded-none border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1">
                    Region Restriction
                  </label>
                  <input
                    value={formData.region_restriction || ""}
                    onChange={(e) => setFormData({ region_restriction: e.target.value || null })}
                    className="w-full rounded-none border border-white/10 bg-black/60 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    placeholder="Global if blank"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10 font-mono text-xs">
              <button
                onClick={saveFunder}
                disabled={saving || !formData.name}
                className="inline-flex items-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-5 py-2 font-semibold text-black hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                {saving ? "SAVING…" : editing ? "UPDATE PROGRAM" : "CREATE PROGRAM"}
              </button>
              <button
                onClick={closeForm}
                className="text-zinc-500 hover:text-white transition-colors uppercase tracking-wider"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {funders.map((funder) => (
          <div
            key={funder.id}
            className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm dark:shadow-none"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                  {funder.name}
                </h3>
                <p className="mt-1 font-mono text-xs text-emerald-400 font-semibold">
                  {funder.amount_range} · <span className="uppercase text-slate-500 dark:text-zinc-400">{funder.application_type.replace(/_/g, " ")}</span>
                </p>
                {funder.focus_tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px]">
                    {funder.focus_tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111116] px-2 py-0.5 text-slate-500 dark:text-zinc-400 uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                <button
                  onClick={() => openEditForm(funder)}
                  className="inline-flex items-center gap-1 rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111116] px-3 py-1.5 text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <Edit3 className="h-3 w-3" /> EDIT
                </button>
                <button
                  onClick={() => handleDelete(funder.id)}
                  className="inline-flex items-center gap-1 rounded-none border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-red-400 hover:border-red-500/60 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 className="h-3 w-3" /> DELETE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
