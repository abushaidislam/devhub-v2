import { describe, expect, it } from "vitest";
import { builtInRecipes } from "../built-in-recipes";
import {
  buildRecipeTransfer,
  parseRecipeTransfer,
  RECIPE_TRANSFER_FORMAT,
  RECIPE_TRANSFER_LIMIT,
  RECIPE_TRANSFER_VERSION,
  recipeTransferFilename,
  serializeRecipeTransfer,
} from "../transfer";

const builtIn = builtInRecipes[0]!;
const draft = {
  name: builtIn.name,
  description: builtIn.description,
  inputType: builtIn.input.type,
  workflow: builtIn.workflow,
  sourceRecipeId: builtIn.id,
};

describe("recipe transfer", () => {
  it("round-trips a validated definition without runtime payloads", () => {
    const file = buildRecipeTransfer({
      ...draft,
      id: "stored-id",
      createdAt: 1,
      updatedAt: 2,
      input: "secret",
      output: "secret",
    });
    const parsed = parseRecipeTransfer(serializeRecipeTransfer(file));

    expect(file.format).toBe(RECIPE_TRANSFER_FORMAT);
    expect(file.version).toBe(RECIPE_TRANSFER_VERSION);
    expect(file.containsUserInputs).toBe(false);
    expect(file.recipe).not.toHaveProperty("id");
    expect(file.recipe).not.toHaveProperty("createdAt");
    expect(file.recipe).not.toHaveProperty("input");
    expect(file.recipe).not.toHaveProperty("output");
    expect(parsed).toEqual(file.recipe);
  });

  it("rejects malformed, unsupported, and payload-bearing files", () => {
    expect(() => parseRecipeTransfer("not json")).toThrow(/valid JSON/);
    expect(() =>
      parseRecipeTransfer(JSON.stringify({ format: "other", version: 1 })),
    ).toThrow(/not a DevHub recipe export/);
    expect(() =>
      parseRecipeTransfer(
        JSON.stringify({
          format: RECIPE_TRANSFER_FORMAT,
          version: 2,
          containsUserInputs: false,
          recipe: draft,
        }),
      ),
    ).toThrow(/version/);
    expect(() =>
      parseRecipeTransfer(
        JSON.stringify({
          format: RECIPE_TRANSFER_FORMAT,
          version: 1,
          containsUserInputs: true,
          recipe: draft,
        }),
      ),
    ).toThrow(/payload-free/);
  });

  it("validates imported recipe compatibility", () => {
    expect(() =>
      parseRecipeTransfer(
        JSON.stringify({
          format: RECIPE_TRANSFER_FORMAT,
          version: 1,
          containsUserInputs: false,
          recipe: { ...draft, inputType: "image" },
        }),
      ),
    ).toThrow(/invalid or incompatible/);
  });

  it("rejects oversized files before parsing", () => {
    expect(() => parseRecipeTransfer("a".repeat(RECIPE_TRANSFER_LIMIT + 1))).toThrow(
      /too large/,
    );
  });

  it("creates a bounded safe filename", () => {
    expect(recipeTransferFilename(" Base64 → URL encode ")).toBe(
      "devhub-recipe-base64-url-encode.json",
    );
    expect(recipeTransferFilename("***")).toBe("devhub-recipe-workflow.json");
  });
});
