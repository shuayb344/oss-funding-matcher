import { create } from "zustand";

export interface Funder {
  id: string;
  name: string;
  description: string;
  amount_range: string;
  focus_tags: string[];
  application_type: string;
  eligibility_notes: string;
  application_url: string;
  region_restriction: string | null;
}

export type FunderFormData = Omit<Funder, "id">;

export const EMPTY_FUNDER: FunderFormData = {
  name: "",
  description: "",
  amount_range: "",
  focus_tags: [],
  application_type: "direct_application",
  eligibility_notes: "",
  application_url: "",
  region_restriction: null,
};

interface AdminStore {
  isAdmin: boolean | null;
  funders: Funder[];
  loading: boolean;
  saving: boolean;
  showForm: boolean;
  editing: Funder | null;
  formData: FunderFormData;
  tagInput: string;

  checkAdmin: () => Promise<void>;
  fetchFunders: () => Promise<void>;
  openCreateForm: () => void;
  openEditForm: (funder: Funder) => void;
  closeForm: () => void;
  setFormData: (data: Partial<FunderFormData>) => void;
  setTagInput: (val: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  saveFunder: () => Promise<boolean>;
  deleteFunder: (id: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  isAdmin: null,
  funders: [],
  loading: true,
  saving: false,
  showForm: false,
  editing: null,
  formData: EMPTY_FUNDER,
  tagInput: "",

  checkAdmin: async () => {
    try {
      const res = await fetch("/api/admin/check");
      const data = await res.json();
      const isAdmin = Boolean(data.isAdmin);
      set({ isAdmin });
      if (isAdmin) {
        await get().fetchFunders();
      } else {
        set({ loading: false });
      }
    } catch {
      set({ isAdmin: false, loading: false });
    }
  },

  fetchFunders: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/funders");
      const data = await res.json();
      set({ funders: data.funders || [] });
    } catch {
      set({ funders: [] });
    } finally {
      set({ loading: false });
    }
  },

  openCreateForm: () => {
    set({ formData: EMPTY_FUNDER, editing: null, showForm: true, tagInput: "" });
  },

  openEditForm: (funder: Funder) => {
    set({
      formData: {
        name: funder.name,
        description: funder.description || "",
        amount_range: funder.amount_range || "",
        focus_tags: funder.focus_tags || [],
        application_type: funder.application_type || "direct_application",
        eligibility_notes: funder.eligibility_notes || "",
        application_url: funder.application_url || "",
        region_restriction: funder.region_restriction || null,
      },
      editing: funder,
      showForm: true,
      tagInput: "",
    });
  },

  closeForm: () => {
    set({ showForm: false, editing: null });
  },

  setFormData: (data) => {
    set((state) => ({ formData: { ...state.formData, ...data } }));
  },

  setTagInput: (val) => set({ tagInput: val }),

  addTag: () => {
    const { tagInput, formData } = get();
    const tag = tagInput.trim();
    if (tag && !formData.focus_tags.includes(tag)) {
      set({
        formData: { ...formData, focus_tags: [...formData.focus_tags, tag] },
        tagInput: "",
      });
    }
  },

  removeTag: (tag: string) => {
    const { formData } = get();
    set({
      formData: {
        ...formData,
        focus_tags: formData.focus_tags.filter((t) => t !== tag),
      },
    });
  },

  saveFunder: async () => {
    const { editing, formData, fetchFunders } = get();
    set({ saving: true });
    try {
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { ...formData, id: editing.id } : formData;

      const res = await fetch("/api/admin/funders", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        set({ showForm: false, editing: null });
        await fetchFunders();
        return true;
      }
      return false;
    } finally {
      set({ saving: false });
    }
  },

  deleteFunder: async (id: string) => {
    const { fetchFunders } = get();
    try {
      const res = await fetch("/api/admin/funders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await fetchFunders();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
}));
