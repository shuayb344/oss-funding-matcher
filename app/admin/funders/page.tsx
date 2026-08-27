"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Plus, Edit3, Trash2, X, Loader2 } from "lucide-react";
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
    if (confirm("Delete this funder?")) {
      deleteFunder(id);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!session) return null;

  if (isAdmin === false) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-20 px-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-950/50 text-red-400">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-base font-semibold text-zinc-200">Access Denied</h2>
        <p className="mt-1.5 text-sm text-zinc-500 max-w-md leading-relaxed">
          You do not have administrator permissions to access this page. Please set your GitHub ID or username in <code className="text-zinc-300">ADMIN_GITHUB_IDS</code> in <code className="text-zinc-300">.env.local</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">
            Manage Funders
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {funders.length} funding programs
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add funder
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-6 mx-4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4">
              {editing ? "Edit Funder" : "Add Funder"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ description: e.target.value })}
                  rows={3}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Amount Range</label>
                  <input
                    value={formData.amount_range}
                    onChange={(e) => setFormData({ amount_range: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="e.g. $10,000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Application Type</label>
                  <select
                    value={formData.application_type}
                    onChange={(e) => setFormData({ application_type: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Focus Tags</label>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="Add tag and press Enter"
                  />
                  <button onClick={addTag} className="rounded border border-zinc-800 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.focus_tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-zinc-600 hover:text-zinc-300">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 mb-1">Eligibility Notes</label>
                <textarea
                  value={formData.eligibility_notes}
                  onChange={(e) => setFormData({ eligibility_notes: e.target.value })}
                  rows={2}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600 resize-y"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Application URL</label>
                  <input
                    value={formData.application_url}
                    onChange={(e) => setFormData({ application_url: e.target.value })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Region Restriction</label>
                  <input
                    value={formData.region_restriction || ""}
                    onChange={(e) => setFormData({ region_restriction: e.target.value || null })}
                    className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-600"
                    placeholder="null if global"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={saveFunder}
                disabled={saving || !formData.name}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </button>
              <button
                onClick={closeForm}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Funder list */}
      <div className="space-y-3">
        {funders.map((funder) => (
          <div
            key={funder.id}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {funder.name}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {funder.amount_range} · {funder.application_type.replace(/_/g, " ")}
                </p>
                {funder.focus_tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {funder.focus_tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center rounded-full border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditForm(funder)}
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(funder.id)}
                  className="inline-flex items-center gap-1 text-xs text-red-500/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
