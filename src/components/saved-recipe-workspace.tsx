"use client";

import { useMemo, useRef, useState } from "react";
import {
  Database,
  Download,
  Play,
  Plus,
  Trash2,
  Upload,
  Workflow,
} from "lucide-react";
import { RecipeRunnerPanel } from "@/components/recipe-runner";
import { builtInRecipes, type BuiltInRecipe } from "@/lib/workflows/built-in-recipes";
import {
  SAVED_RECIPE_LIMIT,
  type SavedRecipe,
} from "@/lib/workflows/storage";
import {
  buildRecipeTransfer,
  parseRecipeTransfer,
  RECIPE_TRANSFER_LIMIT,
  recipeTransferFilename,
  serializeRecipeTransfer,
} from "@/lib/workflows/transfer";
import { useSavedRecipes } from "@/lib/workflows/use-saved-recipes";
import styles from "./saved-recipe-workspace.module.css";

function stepSummary(recipe: BuiltInRecipe) {
  return recipe.workflow.steps.map((step) => step.engineId).join(" → ");
}

export function SavedRecipeWorkspace() {
  const {
    recipes,
    loading,
    available,
    error,
    dismissError,
    create,
    remove,
    clear,
  } = useSavedRecipes();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busyId, setBusyId] = useState<string>();
  const [activeRecipeId, setActiveRecipeId] = useState<string>();
  const [transferMessage, setTransferMessage] = useState<string>();
  const [transferError, setTransferError] = useState<string>();
  const savedSources = useMemo(
    () => new Set(recipes.map((recipe) => recipe.sourceRecipeId).filter(Boolean)),
    [recipes],
  );

  async function saveBuiltIn(recipe: BuiltInRecipe) {
    setBusyId(recipe.id);
    await create({
      name: recipe.name,
      description: recipe.description,
      inputType: recipe.input.type,
      workflow: recipe.workflow,
      sourceRecipeId: recipe.id,
    });
    setBusyId(undefined);
  }

  async function deleteRecipe(id: string) {
    setBusyId(id);
    if (activeRecipeId === id) setActiveRecipeId(undefined);
    await remove(id);
    setBusyId(undefined);
  }

  async function clearAll() {
    setBusyId("clear");
    setActiveRecipeId(undefined);
    await clear();
    setBusyId(undefined);
  }

  function exportRecipe(recipe: SavedRecipe) {
    try {
      const payload = serializeRecipeTransfer(buildRecipeTransfer(recipe));
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = recipeTransferFilename(recipe.name);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setTransferError(undefined);
      setTransferMessage(
        `Exported ${recipe.name}. The file contains its definition only.`,
      );
    } catch (cause) {
      setTransferMessage(undefined);
      setTransferError(
        cause instanceof Error ? cause.message : "Recipe export failed.",
      );
    }
  }

  function importRecipe(file: File) {
    setTransferMessage(undefined);
    setTransferError(undefined);
    if (file.size > RECIPE_TRANSFER_LIMIT) {
      setTransferError("Recipe file is too large to be a DevHub recipe export.");
      return;
    }

    setBusyId("import");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const draft = parseRecipeTransfer(String(reader.result ?? ""));
        const imported = await create(draft);
        if (imported) {
          setTransferMessage(
            `Imported ${draft.name}. Review the definition before running it.`,
          );
        }
      } catch (cause) {
        setTransferError(
          cause instanceof Error ? cause.message : "Recipe import failed.",
        );
      } finally {
        setBusyId(undefined);
      }
    };
    reader.onerror = () => {
      setBusyId(undefined);
      setTransferError("Recipe file could not be read.");
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <header className={styles.intro}>
        <span className="label">Local workflow library</span>
        <p>
          Save, export, import, and re-run workflow definitions in this browser.
          Runtime inputs and outputs are never stored or exported.
        </p>
      </header>

      <section className={styles.storage} aria-labelledby="recipe-storage">
        <span className={styles.storageIcon}><Database size={16} /></span>
        <div>
          <h2 id="recipe-storage">Browser-only recipe storage</h2>
          <p>
            Versioned recipe metadata and engine steps are stored in IndexedDB,
            up to {SAVED_RECIPE_LIMIT} recipes. Transfer files contain definitions
            only; run values exist only in memory.
          </p>
        </div>
        <span className={styles.localStatus}>Local only</span>
      </section>

      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button type="button" onClick={dismissError}>Dismiss</button>
        </div>
      )}

      <section className={styles.section} aria-labelledby="built-in-recipes">
        <header className={styles.sectionHeader}>
          <div><span className="label">Curated starting points</span><h2 id="built-in-recipes">Built-in recipes</h2></div>
          <span>{builtInRecipes.length}</span>
        </header>
        <div className={styles.grid}>
          {builtInRecipes.map((recipe) => {
            const saved = savedSources.has(recipe.id);
            return (
              <article className={styles.card} key={recipe.id}>
                <div className={styles.cardTop}>
                  <span className={styles.recipeIcon}><Workflow size={17} /></span>
                  <span className={styles.inputType}>{recipe.input.type}</span>
                </div>
                <h3>{recipe.name}</h3>
                <p>{recipe.description}</p>
                <code>{stepSummary(recipe)}</code>
                <div className={styles.cardFooter}>
                  <span>{recipe.workflow.steps.length} steps</span>
                  <button type="button" onClick={() => void saveBuiltIn(recipe)} disabled={!available || saved || Boolean(busyId)} aria-label={saved ? `${recipe.name} is saved` : `Save ${recipe.name}`}>
                    <Plus size={14} />{busyId === recipe.id ? "Saving…" : saved ? "Saved" : "Save"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="saved-recipes">
        <header className={styles.sectionHeader}>
          <div><span className="label">Private collection</span><h2 id="saved-recipes">Saved recipes</h2></div>
          <div className={styles.savedActions}>
            <span>{recipes.length}/{SAVED_RECIPE_LIMIT}</span>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={!available || Boolean(busyId)}>
              <Upload size={14} />{busyId === "import" ? "Importing…" : "Import recipe"}
            </button>
            <input
              ref={fileInputRef}
              className={styles.srOnly}
              type="file"
              accept="application/json,.json"
              aria-label="Import recipe file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) importRecipe(file);
                event.target.value = "";
              }}
            />
            <button type="button" onClick={() => void clearAll()} disabled={!available || !recipes.length || Boolean(busyId)}>
              <Trash2 size={14} />{busyId === "clear" ? "Clearing…" : "Clear all"}
            </button>
          </div>
        </header>

        {transferMessage && <p className={styles.transferStatus} role="status">{transferMessage}</p>}
        {transferError && <p className={styles.transferError} role="alert">{transferError}</p>}

        {loading ? (
          <div className={styles.empty} role="status"><Database size={24} /><h3>Loading recipes</h3><p>Reading workflow definitions from this browser.</p></div>
        ) : !available ? (
          <div className={styles.empty}><Database size={24} /><h3>Recipe storage unavailable</h3><p>This browser context does not allow local IndexedDB storage.</p></div>
        ) : recipes.length ? (
          <ul className={styles.savedList}>
            {recipes.map((recipe) => {
              const active = activeRecipeId === recipe.id;
              return (
                <li key={recipe.id}>
                  <div className={styles.savedRow}>
                    <span className={styles.recipeIcon}><Workflow size={16} /></span>
                    <div className={styles.savedIdentity}><strong>{recipe.name}</strong><p>{recipe.description || "Saved local workflow definition."}</p></div>
                    <code>{recipe.workflow.steps.map((step) => step.engineId).join(" → ")}</code>
                    <span className={styles.savedMeta}>{recipe.workflow.steps.length} steps · {recipe.inputType}</span>
                    <div className={styles.rowActions}>
                      <button type="button" onClick={() => setActiveRecipeId(active ? undefined : recipe.id)} disabled={Boolean(busyId)} aria-expanded={active} aria-label={`${active ? "Close" : "Run"} ${recipe.name}`}>
                        <Play size={14} />
                      </button>
                      <button type="button" onClick={() => exportRecipe(recipe)} disabled={Boolean(busyId)} aria-label={`Export ${recipe.name}`}>
                        <Download size={14} />
                      </button>
                      <button type="button" onClick={() => void deleteRecipe(recipe.id)} disabled={Boolean(busyId)} aria-label={`Delete ${recipe.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {active && <RecipeRunnerPanel key={recipe.id} recipe={recipe} />}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.empty}><Workflow size={24} /><h3>No saved recipes</h3><p>Save a built-in recipe or import a validated definition to create your private local collection.</p></div>
        )}
      </section>
    </div>
  );
}
