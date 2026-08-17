import {
  validateSavedRecipeDraft,
  type SavedRecipeDraft,
} from "./storage";

export const RECIPE_TRANSFER_FORMAT = "devhub-recipe" as const;
export const RECIPE_TRANSFER_VERSION = 1 as const;
export const RECIPE_TRANSFER_LIMIT = 32_000;

export type RecipeTransferFile = {
  format: typeof RECIPE_TRANSFER_FORMAT;
  version: typeof RECIPE_TRANSFER_VERSION;
  exportedAt: string;
  containsUserInputs: false;
  recipe: SavedRecipeDraft;
};

function byteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

function validatedDraft(value: unknown): SavedRecipeDraft {
  const result = validateSavedRecipeDraft(value);
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

export function buildRecipeTransfer(value: unknown): RecipeTransferFile {
  return {
    format: RECIPE_TRANSFER_FORMAT,
    version: RECIPE_TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    containsUserInputs: false,
    recipe: validatedDraft(value),
  };
}

export function serializeRecipeTransfer(value: RecipeTransferFile) {
  const serialized = JSON.stringify(value, null, 2);
  if (byteLength(serialized) > RECIPE_TRANSFER_LIMIT) {
    throw new Error("Recipe export is too large to share safely.");
  }
  return serialized;
}

export function parseRecipeTransfer(raw: string): SavedRecipeDraft {
  if (byteLength(raw) > RECIPE_TRANSFER_LIMIT) {
    throw new Error("Recipe file is too large to be a DevHub recipe export.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Recipe file is not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Recipe file is not a DevHub recipe export.");
  }

  const record = parsed as Record<string, unknown>;
  if (record.format !== RECIPE_TRANSFER_FORMAT) {
    throw new Error("Recipe file is not a DevHub recipe export.");
  }
  if (record.version !== RECIPE_TRANSFER_VERSION) {
    throw new Error(
      `Unsupported recipe export version. This app supports version ${RECIPE_TRANSFER_VERSION}.`,
    );
  }
  if (record.containsUserInputs !== false) {
    throw new Error("Recipe file does not declare a payload-free definition.");
  }

  return validatedDraft(record.recipe);
}

export function recipeTransferFilename(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `devhub-recipe-${slug || "workflow"}.json`;
}
