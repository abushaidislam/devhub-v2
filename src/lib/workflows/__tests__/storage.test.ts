import { describe, expect, it } from "vitest";
import { builtInRecipes } from "../built-in-recipes";
import {
  createSavedRecipe,
  listSavedRecipes,
  recipeStorageSupported,
  SAVED_RECIPE_DESCRIPTION_LIMIT,
  SAVED_RECIPE_LIMIT,
  SAVED_RECIPE_NAME_LIMIT,
  validateSavedRecipeDraft,
} from "../storage";

const builtIn = builtInRecipes[0]!;
const validDraft = {
  name: builtIn.name,
  description: builtIn.description,
  inputType: builtIn.input.type,
  workflow: builtIn.workflow,
  sourceRecipeId: builtIn.id,
};

describe("saved recipe validation", () => {
  it("normalizes a valid compatible recipe without storing runtime payloads", () => {
    const result = validateSavedRecipeDraft(validDraft);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.name).toBe(builtIn.name);
    expect(result.value.workflow).not.toBe(builtIn.workflow);
    expect(result.value).not.toHaveProperty("input");
    expect(result.value).not.toHaveProperty("output");
  });

  it("rejects missing and oversized metadata", () => {
    expect(validateSavedRecipeDraft({ ...validDraft, name: " " })).toEqual({
      ok: false,
      error: "Recipe name is required.",
    });
    expect(
      validateSavedRecipeDraft({
        ...validDraft,
        name: "x".repeat(SAVED_RECIPE_NAME_LIMIT + 1),
      }),
    ).toEqual({
      ok: false,
      error: `Recipe name must be ${SAVED_RECIPE_NAME_LIMIT} characters or fewer.`,
    });
    expect(
      validateSavedRecipeDraft({
        ...validDraft,
        description: "x".repeat(SAVED_RECIPE_DESCRIPTION_LIMIT + 1),
      }),
    ).toEqual({
      ok: false,
      error: `Recipe description must be ${SAVED_RECIPE_DESCRIPTION_LIMIT} characters or fewer.`,
    });
  });

  it("rejects incompatible workflows before opening storage", () => {
    const result = validateSavedRecipeDraft({
      ...validDraft,
      inputType: "image",
    });
    expect(result).toEqual({
      ok: false,
      error: "Recipe workflow is invalid or incompatible.",
    });
  });
});

describe("saved recipe storage boundary", () => {
  it("is capped at a documented small workspace size", () => {
    expect(SAVED_RECIPE_LIMIT).toBe(50);
  });

  it("fails closed when IndexedDB is unavailable", async () => {
    const original = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: undefined,
    });
    try {
      expect(recipeStorageSupported()).toBe(false);
      expect(await listSavedRecipes()).toEqual({
        ok: false,
        error: "Local recipe storage is unavailable in this browser.",
      });
      expect(await createSavedRecipe(validDraft)).toEqual({
        ok: false,
        error: "Local recipe storage is unavailable in this browser.",
      });
    } finally {
      Object.defineProperty(globalThis, "indexedDB", {
        configurable: true,
        value: original,
      });
    }
  });
});
