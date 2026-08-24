import { describe, expect, it } from "vitest";
import { validateWorkflowCompatibility } from "@/lib/workflows/compatibility";
import {
  builtInRecipes,
  getBuiltInRecipe,
} from "@/lib/workflows/built-in-recipes";
import { runWorkflow } from "@/lib/workflows/runner";
import { WORKFLOW_SCHEMA_VERSION } from "@/lib/workflows/types";

describe("built-in workflow recipes", () => {
  it("provides a small curated registry with unique stable IDs", () => {
    expect(builtInRecipes).toHaveLength(4);
    expect(new Set(builtInRecipes.map((recipe) => recipe.id)).size).toBe(
      builtInRecipes.length,
    );

    for (const recipe of builtInRecipes) {
      expect(recipe.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(recipe.name.trim()).not.toBe("");
      expect(recipe.description.trim()).not.toBe("");
      expect(recipe.input.label.trim()).not.toBe("");
      expect(recipe.input.description.trim()).not.toBe("");
      expect(recipe.input.example).not.toBe("");
      expect(recipe.workflow.version).toBe(WORKFLOW_SCHEMA_VERSION);
      expect(recipe.workflow.steps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps the registry and nested workflow definitions immutable", () => {
    expect(Object.isFrozen(builtInRecipes)).toBe(true);
    for (const recipe of builtInRecipes) {
      expect(Object.isFrozen(recipe)).toBe(true);
      expect(Object.isFrozen(recipe.input)).toBe(true);
      expect(Object.isFrozen(recipe.workflow)).toBe(true);
      expect(Object.isFrozen(recipe.workflow.steps)).toBe(true);
      for (const step of recipe.workflow.steps) {
        expect(Object.isFrozen(step)).toBe(true);
        if (step.options) {
          expect(Object.isFrozen(step.options)).toBe(true);
        }
      }
    }
  });

  it("preflights every recipe for its declared initial input type", () => {
    for (const recipe of builtInRecipes) {
      const result = validateWorkflowCompatibility(
        recipe.workflow,
        recipe.input.type,
      );
      expect(result.compatible, recipe.id).toBe(true);
      expect(result.issues, recipe.id).toEqual([]);
      expect(result.steps).toHaveLength(recipe.workflow.steps.length);
    }
  });

  it("runs every representative example successfully", async () => {
    for (const recipe of builtInRecipes) {
      const result = await runWorkflow(recipe.workflow, {
        type: recipe.input.type,
        value: recipe.input.example,
      });
      expect(result.status, recipe.id).toBe("completed");
      expect(result.steps, recipe.id).toHaveLength(recipe.workflow.steps.length);
      expect(result.output?.type, recipe.id).toBe(
        result.preflight.finalOutputType,
      );
    }
  });

  it("produces the expected reversible encoding examples", async () => {
    const encoded = getBuiltInRecipe("base64-url-encode")!;
    const decoded = getBuiltInRecipe("url-base64-decode")!;

    const encodedResult = await runWorkflow(encoded.workflow, {
      type: encoded.input.type,
      value: encoded.input.example,
    });
    const decodedResult = await runWorkflow(decoded.workflow, {
      type: decoded.input.type,
      value: decoded.input.example,
    });

    expect(encodedResult.output?.value).toBe("RGV2SHVi");
    expect(decodedResult.output?.value).toBe("DevHub");
  });

  it("looks up recipes by ID without inventing fallbacks", () => {
    expect(getBuiltInRecipe("sql-sha256")?.name).toBe(
      "Formatted SQL fingerprint",
    );
    expect(getBuiltInRecipe("not-a-recipe")).toBeUndefined();
  });
});
