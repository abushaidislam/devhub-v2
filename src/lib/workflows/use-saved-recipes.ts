"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearSavedRecipes,
  createSavedRecipe,
  deleteSavedRecipe,
  listSavedRecipes,
  recipeStorageSupported,
  SAVED_RECIPES_CHANGED,
  updateSavedRecipe,
  type SavedRecipe,
  type SavedRecipeDraft,
  type SavedRecipeUpdate,
} from "./storage";

export function useSavedRecipes() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    if (!recipeStorageSupported()) {
      setAvailable(false);
      setRecipes([]);
      setLoading(false);
      return;
    }
    const result = await listSavedRecipes();
    setAvailable(result.ok);
    if (result.ok) {
      setRecipes(result.value);
    } else {
      setRecipes([]);
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    window.addEventListener(SAVED_RECIPES_CHANGED, onChange);
    return () => window.removeEventListener(SAVED_RECIPES_CHANGED, onChange);
  }, [refresh]);

  const runAction = useCallback(
    async (action: () => Promise<{ ok: boolean; error?: string }>) => {
      setError(undefined);
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Recipe storage operation failed.");
        return false;
      }
      await refresh();
      return true;
    },
    [refresh],
  );

  return {
    recipes,
    loading,
    available,
    error,
    dismissError: () => setError(undefined),
    create: (draft: SavedRecipeDraft) =>
      runAction(() => createSavedRecipe(draft)),
    update: (id: string, updates: SavedRecipeUpdate) =>
      runAction(() => updateSavedRecipe(id, updates)),
    remove: (id: string) => runAction(() => deleteSavedRecipe(id)),
    clear: () => runAction(() => clearSavedRecipes()),
  };
}
