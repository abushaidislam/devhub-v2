import type { ToolValueType } from "../engine-types";
import { validateWorkflowCompatibility } from "./compatibility";
import type { Workflow } from "./types";

export const SAVED_RECIPE_SCHEMA_VERSION = 1 as const;
export const SAVED_RECIPE_LIMIT = 50;
export const SAVED_RECIPES_CHANGED = "devhub:saved-recipes:changed";
export const SAVED_RECIPE_NAME_LIMIT = 80;
export const SAVED_RECIPE_DESCRIPTION_LIMIT = 240;

const DB_NAME = "devhub-recipes";
const DB_VERSION = 1;
const STORE = "recipes";

export type SavedRecipeDraft = {
  name: string;
  description: string;
  inputType: ToolValueType;
  workflow: Workflow;
  sourceRecipeId?: string;
};

export type SavedRecipe = SavedRecipeDraft & {
  schemaVersion: typeof SAVED_RECIPE_SCHEMA_VERSION;
  id: string;
  createdAt: number;
  updatedAt: number;
};

export type SavedRecipeUpdate = Partial<SavedRecipeDraft>;

export type RecipeStorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function failure<T>(error: string): RecipeStorageResult<T> {
  return { ok: false, error };
}

function cloneWorkflow(workflow: Workflow): Workflow {
  return {
    version: workflow.version,
    steps: workflow.steps.map((step) => ({
      engineId: step.engineId,
      ...(step.options
        ? { options: JSON.parse(JSON.stringify(step.options)) }
        : {}),
    })),
  };
}

export function validateSavedRecipeDraft(
  value: unknown,
): RecipeStorageResult<SavedRecipeDraft> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return failure("Recipe details are invalid.");
  }

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.name !== "string" || !candidate.name.trim()) {
    return failure("Recipe name is required.");
  }
  const name = candidate.name.trim();
  if (name.length > SAVED_RECIPE_NAME_LIMIT) {
    return failure(
      `Recipe name must be ${SAVED_RECIPE_NAME_LIMIT} characters or fewer.`,
    );
  }

  if (typeof candidate.description !== "string") {
    return failure("Recipe description is invalid.");
  }
  const description = candidate.description.trim();
  if (description.length > SAVED_RECIPE_DESCRIPTION_LIMIT) {
    return failure(
      `Recipe description must be ${SAVED_RECIPE_DESCRIPTION_LIMIT} characters or fewer.`,
    );
  }

  if (
    candidate.sourceRecipeId !== undefined &&
    (typeof candidate.sourceRecipeId !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate.sourceRecipeId) ||
      candidate.sourceRecipeId.length > 80)
  ) {
    return failure("Recipe source identifier is invalid.");
  }

  const compatibility = validateWorkflowCompatibility(
    candidate.workflow,
    candidate.inputType,
  );
  if (
    !compatibility.compatible ||
    !compatibility.workflow ||
    !compatibility.initialInputType
  ) {
    return failure("Recipe workflow is invalid or incompatible.");
  }

  return {
    ok: true,
    value: {
      name,
      description,
      inputType: compatibility.initialInputType,
      workflow: cloneWorkflow(compatibility.workflow),
      ...(candidate.sourceRecipeId
        ? { sourceRecipeId: candidate.sourceRecipeId }
        : {}),
    },
  };
}

function normalizeRecord(value: unknown): SavedRecipe | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const candidate = value as Record<string, unknown>;
  if (
    candidate.schemaVersion !== SAVED_RECIPE_SCHEMA_VERSION ||
    typeof candidate.id !== "string" ||
    !candidate.id ||
    typeof candidate.createdAt !== "number" ||
    !Number.isFinite(candidate.createdAt) ||
    typeof candidate.updatedAt !== "number" ||
    !Number.isFinite(candidate.updatedAt)
  ) {
    return;
  }

  const draft = validateSavedRecipeDraft(candidate);
  if (!draft.ok) return;
  return {
    ...draft.value,
    schemaVersion: SAVED_RECIPE_SCHEMA_VERSION,
    id: candidate.id,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SAVED_RECIPES_CHANGED));
  }
}

function createId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

export function recipeStorageSupported() {
  try {
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!recipeStorageSupported()) {
      reject(new Error("Recipe storage is unavailable."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Recipe storage could not be opened."));
    request.onblocked = () =>
      reject(new Error("Recipe storage is blocked by another tab."));
  });
}

function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Recipe storage request failed."));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        transaction.error ?? new Error("Recipe storage transaction failed."),
      );
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("Recipe storage was aborted."));
  });
}

async function putRecord(record: SavedRecipe): Promise<void> {
  const db = await openDb();
  try {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put(record);
    await transactionDone(transaction);
  } finally {
    db.close();
  }
}

export async function listSavedRecipes(): Promise<
  RecipeStorageResult<SavedRecipe[]>
> {
  if (!recipeStorageSupported()) {
    return failure("Local recipe storage is unavailable in this browser.");
  }
  let db: IDBDatabase | undefined;
  try {
    db = await openDb();
    const records = await requestValue(
      db.transaction(STORE, "readonly").objectStore(STORE).getAll(),
    );
    const recipes = records
      .map(normalizeRecord)
      .filter((record): record is SavedRecipe => Boolean(record))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, SAVED_RECIPE_LIMIT);
    return { ok: true, value: recipes };
  } catch {
    return failure("Saved recipes could not be read from this browser.");
  } finally {
    db?.close();
  }
}

export async function createSavedRecipe(
  value: unknown,
): Promise<RecipeStorageResult<SavedRecipe>> {
  const draft = validateSavedRecipeDraft(value);
  if (!draft.ok) return draft;

  const existing = await listSavedRecipes();
  if (!existing.ok) return existing;
  if (existing.value.length >= SAVED_RECIPE_LIMIT) {
    return failure(
      `Recipe workspace is full. Delete a recipe before saving another (${SAVED_RECIPE_LIMIT} maximum).`,
    );
  }

  const now = Date.now();
  const record: SavedRecipe = {
    ...draft.value,
    schemaVersion: SAVED_RECIPE_SCHEMA_VERSION,
    id: createId(),
    createdAt: now,
    updatedAt: now,
  };
  try {
    await putRecord(record);
    notify();
    return { ok: true, value: record };
  } catch {
    return failure("Recipe could not be saved in this browser.");
  }
}

export async function updateSavedRecipe(
  id: string,
  updates: SavedRecipeUpdate,
): Promise<RecipeStorageResult<SavedRecipe>> {
  const listed = await listSavedRecipes();
  if (!listed.ok) return listed;
  const current = listed.value.find((recipe) => recipe.id === id);
  if (!current) return failure("Saved recipe was not found.");

  const draft = validateSavedRecipeDraft({
    name: updates.name ?? current.name,
    description: updates.description ?? current.description,
    inputType: updates.inputType ?? current.inputType,
    workflow: updates.workflow ?? current.workflow,
    sourceRecipeId:
      updates.sourceRecipeId === undefined
        ? current.sourceRecipeId
        : updates.sourceRecipeId,
  });
  if (!draft.ok) return draft;

  const record: SavedRecipe = {
    ...draft.value,
    schemaVersion: SAVED_RECIPE_SCHEMA_VERSION,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: Date.now(),
  };
  try {
    await putRecord(record);
    notify();
    return { ok: true, value: record };
  } catch {
    return failure("Recipe changes could not be saved in this browser.");
  }
}

export async function deleteSavedRecipe(
  id: string,
): Promise<RecipeStorageResult<true>> {
  if (!id || !recipeStorageSupported()) {
    return failure("Saved recipe could not be deleted.");
  }
  let db: IDBDatabase | undefined;
  try {
    db = await openDb();
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).delete(id);
    await transactionDone(transaction);
    notify();
    return { ok: true, value: true };
  } catch {
    return failure("Saved recipe could not be deleted.");
  } finally {
    db?.close();
  }
}

export async function clearSavedRecipes(): Promise<RecipeStorageResult<true>> {
  if (!recipeStorageSupported()) {
    return failure("Local recipe storage is unavailable in this browser.");
  }
  let db: IDBDatabase | undefined;
  try {
    db = await openDb();
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).clear();
    await transactionDone(transaction);
    notify();
    return { ok: true, value: true };
  } catch {
    return failure("Saved recipes could not be cleared.");
  } finally {
    db?.close();
  }
}
