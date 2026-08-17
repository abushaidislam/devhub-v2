import type { ToolValueType } from "../engine-types";
import { validateWorkflowCompatibility } from "./compatibility";
import type { Workflow } from "./types";

export type BuiltInRecipe = {
  id: string;
  name: string;
  description: string;
  input: {
    type: ToolValueType;
    label: string;
    description: string;
    example: string;
  };
  workflow: Workflow;
};

const recipeDefinitions: BuiltInRecipe[] = [
  {
    id: "base64-url-encode",
    name: "Base64 then URL encode",
    description:
      "Convert UTF-8 text to Base64, then make the encoded value safe for a URL component.",
    input: {
      type: "text",
      label: "Plain text",
      description: "UTF-8 text to encode locally in this browser.",
      example: "DevHub",
    },
    workflow: {
      version: 1,
      steps: [
        { engineId: "base64", options: { mode: "encode" } },
        { engineId: "url-encoder", options: { mode: "encode" } },
      ],
    },
  },
  {
    id: "url-base64-decode",
    name: "URL decode then Base64 decode",
    description:
      "Decode a URL component and then convert the resulting Base64 value back to UTF-8 text.",
    input: {
      type: "text",
      label: "URL-encoded Base64",
      description: "A URL component containing a valid UTF-8 Base64 value.",
      example: "RGV2SHVi",
    },
    workflow: {
      version: 1,
      steps: [
        { engineId: "url-encoder", options: { mode: "decode" } },
        { engineId: "base64", options: { mode: "decode" } },
      ],
    },
  },
  {
    id: "markdown-sha256",
    name: "Markdown HTML fingerprint",
    description:
      "Render Markdown to escaped HTML and generate a SHA-256 fingerprint of that result.",
    input: {
      type: "text",
      label: "Markdown",
      description: "Markdown source to render and fingerprint locally.",
      example: "# DevHub",
    },
    workflow: {
      version: 1,
      steps: [
        { engineId: "markdown-preview" },
        { engineId: "hash-generator", options: { algorithm: "SHA-256" } },
      ],
    },
  },
  {
    id: "sql-sha256",
    name: "Formatted SQL fingerprint",
    description:
      "Format SQL for stable readability and generate a SHA-256 fingerprint of the formatted result.",
    input: {
      type: "text",
      label: "SQL query",
      description: "A SQL statement to format and fingerprint locally.",
      example: "select id from users",
    },
    workflow: {
      version: 1,
      steps: [
        { engineId: "sql-formatter" },
        { engineId: "hash-generator", options: { algorithm: "SHA-256" } },
      ],
    },
  },
];

function freezeRecipe(recipe: BuiltInRecipe): BuiltInRecipe {
  Object.freeze(recipe.input);
  for (const step of recipe.workflow.steps) {
    if (step.options) {
      Object.freeze(step.options);
    }
    Object.freeze(step);
  }
  Object.freeze(recipe.workflow.steps);
  Object.freeze(recipe.workflow);
  return Object.freeze(recipe);
}

function validateDefinitions(recipes: BuiltInRecipe[]) {
  const ids = new Set<string>();

  for (const recipe of recipes) {
    if (ids.has(recipe.id)) {
      throw new Error(`Duplicate built-in recipe id "${recipe.id}".`);
    }
    ids.add(recipe.id);

    const result = validateWorkflowCompatibility(
      recipe.workflow,
      recipe.input.type,
    );
    if (!result.compatible) {
      throw new Error(`Built-in recipe "${recipe.id}" is not compatible.`);
    }
  }
}

validateDefinitions(recipeDefinitions);

/** Curated, immutable recipes in stable display order. */
export const builtInRecipes: readonly BuiltInRecipe[] = Object.freeze(
  recipeDefinitions.map(freezeRecipe),
);

export function getBuiltInRecipe(id: string): BuiltInRecipe | undefined {
  return builtInRecipes.find((recipe) => recipe.id === id);
}
