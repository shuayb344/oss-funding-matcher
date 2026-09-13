import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminStore } from "./useAdminStore";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  useAdminStore.setState({
    isAdmin: null,
    activeTab: "funders",
    funders: [],
    suggestions: [],
    loading: true,
    loadingSuggestions: false,
    processingSuggestionId: null,
    lastModerationResult: null,
    saving: false,
    showForm: false,
    editing: null,
    formData: {
      name: "",
      description: "",
      amount_range: "",
      focus_tags: [],
      application_type: "direct_application",
      eligibility_notes: "",
      application_url: "",
      region_restriction: null,
    },
    tagInput: "",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useAdminStore", () => {
  it("loads funders from the API and updates the store", async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({
        funders: [
          {
            id: "f-1",
            name: "Aperture Fund",
            description: "Open-source infrastructure grants",
            amount_range: "$50k - $150k",
            focus_tags: ["security"],
            application_type: "direct_application",
            eligibility_notes: "",
            application_url: "https://example.com",
            region_restriction: null,
          },
        ],
      }),
    });

    const { result } = renderHook(() => useAdminStore());

    await act(async () => {
      await result.current.fetchFunders();
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/funders");
    expect(result.current.funders).toHaveLength(1);
    expect(result.current.funders[0].name).toBe("Aperture Fund");
  });

  it("switches tabs and opens the form state correctly", async () => {
    const { result } = renderHook(() => useAdminStore());

    act(() => {
      result.current.setActiveTab("suggestions");
      result.current.openCreateForm();
    });

    expect(result.current.activeTab).toBe("suggestions");
    expect(result.current.showForm).toBe(true);
    expect(result.current.editing).toBeNull();
  });
});
