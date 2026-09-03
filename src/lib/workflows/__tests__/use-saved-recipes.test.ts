import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSavedRecipes } from "../use-saved-recipes";
import * as storage from "../storage";
import type { SavedRecipe, SavedRecipeDraft } from "../storage";

vi.mock("../storage", () => ({
  clearSavedRecipes: vi.fn(),
  createSavedRecipe: vi.fn(),
  deleteSavedRecipe: vi.fn(),
  listSavedRecipes: vi.fn(),
  recipeStorageSupported: vi.fn(),
  SAVED_RECIPES_CHANGED: "devhub:saved-recipes:changed",
  updateSavedRecipe: vi.fn(),
}));

describe("useSavedRecipes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storage.recipeStorageSupported).mockReturnValue(true);
    vi.mocked(storage.listSavedRecipes).mockResolvedValue({
      ok: true,
      value: [],
    });
  });

  it("should initialize with loading state", async () => {
    const { result } = renderHook(() => useSavedRecipes());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle storage not supported", async () => {
    vi.mocked(storage.recipeStorageSupported).mockReturnValue(false);

    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.available).toBe(false);
    expect(result.current.recipes).toEqual([]);
  });

  it("should list recipes successfully", async () => {
    const mockRecipes = [
      { id: "1", name: "Recipe 1" } as SavedRecipe,
      { id: "2", name: "Recipe 2" } as SavedRecipe,
    ];
    vi.mocked(storage.listSavedRecipes).mockResolvedValue({
      ok: true,
      value: mockRecipes,
    });

    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.available).toBe(true);
    expect(result.current.recipes).toEqual(mockRecipes);
  });

  it("should handle list recipes error", async () => {
    vi.mocked(storage.listSavedRecipes).mockResolvedValue({
      ok: false,
      error: "Failed to load",
    });

    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.available).toBe(false);
    expect(result.current.recipes).toEqual([]);
    expect(result.current.error).toBe("Failed to load");
  });

  it("should handle create recipe", async () => {
    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(storage.createSavedRecipe).mockResolvedValue({
      ok: true,
      value: { id: "new-id" } as SavedRecipe,
    });
    vi.mocked(storage.listSavedRecipes).mockResolvedValue({
      ok: true,
      value: [{ id: "new-id" } as SavedRecipe],
    });

    let success = false;
    await act(async () => {
      success = await result.current.create({ name: "New" } as SavedRecipeDraft);
    });

    expect(success).toBe(true);
    expect(storage.createSavedRecipe).toHaveBeenCalledWith({ name: "New" });
    expect(result.current.recipes).toEqual([{ id: "new-id" }]);
  });

  it("should handle create recipe error", async () => {
    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(storage.createSavedRecipe).mockResolvedValue({
      ok: false,
      error: "Create failed",
    });

    let success = true;
    await act(async () => {
      success = await result.current.create({ name: "New" } as SavedRecipeDraft);
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Create failed");
  });

  it("should handle create recipe error without error message", async () => {
    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(storage.createSavedRecipe).mockResolvedValue({
      ok: false,
      error: undefined as unknown as string, // Force undefined error
    });

    let success = true;
    await act(async () => {
      success = await result.current.create({ name: "New" } as SavedRecipeDraft);
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Recipe storage operation failed.");
  });

  it("should handle update recipe", async () => {
    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(storage.updateSavedRecipe).mockResolvedValue({
      ok: true,
      value: { id: "1" } as SavedRecipe,
    });

    let success = false;
    await act(async () => {
      success = await result.current.update("1", { name: "Updated" });
    });

    expect(success).toBe(true);
    expect(storage.updateSavedRecipe).toHaveBeenCalledWith("1", { name: "Updated" });
  });

  it("should handle remove recipe", async () => {
    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(storage.deleteSavedRecipe).mockResolvedValue({
      ok: true,
      value: true,
    });

    let success = false;
    await act(async () => {
      success = await result.current.remove("1");
    });

    expect(success).toBe(true);
    expect(storage.deleteSavedRecipe).toHaveBeenCalledWith("1");
  });

  it("should handle clear recipes", async () => {
    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    vi.mocked(storage.clearSavedRecipes).mockResolvedValue({
      ok: true,
      value: true,
    });

    let success = false;
    await act(async () => {
      success = await result.current.clear();
    });

    expect(success).toBe(true);
    expect(storage.clearSavedRecipes).toHaveBeenCalled();
  });

  it("should dismiss error", async () => {
    vi.mocked(storage.listSavedRecipes).mockResolvedValue({
      ok: false,
      error: "Failed to load",
    });

    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to load");
    });

    act(() => {
      result.current.dismissError();
    });

    expect(result.current.error).toBeUndefined();
  });

  it("should refresh on SAVED_RECIPES_CHANGED event", async () => {
    const { result } = renderHook(() => useSavedRecipes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(storage.listSavedRecipes).toHaveBeenCalledTimes(1);

    await act(async () => {
      window.dispatchEvent(new Event(storage.SAVED_RECIPES_CHANGED));
    });

    expect(storage.listSavedRecipes).toHaveBeenCalledTimes(2);
  });
});
