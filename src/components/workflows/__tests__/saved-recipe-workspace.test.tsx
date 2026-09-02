import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SavedRecipeWorkspace } from "@/components/workflows/saved-recipe-workspace";

const mocks = vi.hoisted(() => ({
  create: vi.fn(async (_payload?: unknown) => true),
  remove: vi.fn(async () => true),
  clear: vi.fn(async () => true),
  dismissError: vi.fn(),
  state: {
    recipes: [] as Array<{
      schemaVersion: 1;
      id: string;
      name: string;
      description: string;
      inputType: "text";
      workflow: { version: 1; steps: Array<{ engineId: string }> };
      sourceRecipeId?: string;
      createdAt: number;
      updatedAt: number;
    }>,
    loading: false,
    available: true,
    error: undefined as string | undefined,
  },
}));

vi.mock("@/lib/workflows/use-saved-recipes", () => ({
  useSavedRecipes: () => ({
    ...mocks.state,
    create: mocks.create,
    remove: mocks.remove,
    clear: mocks.clear,
    update: vi.fn(),
    dismissError: mocks.dismissError,
  }),
}));

const savedRecipe = {
  schemaVersion: 1 as const,
  id: "saved-1",
  name: "My recipe",
  description: "Local definition",
  inputType: "text" as const,
  workflow: { version: 1 as const, steps: [{ engineId: "base64" }] },
  createdAt: 1,
  updatedAt: 1,
};

function recipeFile(content: string) {
  return new File([content], "devhub-recipe.json", {
    type: "application/json",
  });
}

describe("SavedRecipeWorkspace", () => {
  beforeEach(() => {
    mocks.state.recipes = [];
    mocks.state.loading = false;
    mocks.state.available = true;
    mocks.state.error = undefined;
    mocks.create.mockClear();
    mocks.remove.mockClear();
    mocks.clear.mockClear();
  });

  it("shows curated recipes and an explicit empty saved state", () => {
    render(<SavedRecipeWorkspace />);
    expect(screen.getByRole("heading", { name: "Built-in recipes" })).toBeInTheDocument();
    expect(screen.getByText("Base64 then URL encode")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No saved recipes" })).toBeInTheDocument();
    expect(screen.getByText(/Runtime inputs and outputs are never stored or exported/)).toBeInTheDocument();
  });

  it("saves only the selected recipe definition and metadata", async () => {
    const user = userEvent.setup();
    render(<SavedRecipeWorkspace />);
    await user.click(
      screen.getByRole("button", { name: "Save Base64 then URL encode" }),
    );
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Base64 then URL encode",
        inputType: "text",
        sourceRecipeId: "base64-url-encode",
      }),
    );
    expect(mocks.create.mock.calls[0]?.[0]).not.toHaveProperty("input");
    expect(mocks.create.mock.calls[0]?.[0]).not.toHaveProperty("output");
  });

  it("exports one recipe as a local definition-only file", async () => {
    mocks.state.recipes = [savedRecipe];
    const createObjectURL = vi.fn(() => "blob:recipe");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const user = userEvent.setup();
    render(<SavedRecipeWorkspace />);
    await user.click(screen.getByRole("button", { name: "Export My recipe" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:recipe");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "The file contains its definition only",
    );
  });

  it("imports a validated definition before saving it locally", async () => {
    const user = userEvent.setup();
    render(<SavedRecipeWorkspace />);
    const file = recipeFile(
      JSON.stringify({
        format: "devhub-recipe",
        version: 1,
        exportedAt: "2026-07-28T00:00:00.000Z",
        containsUserInputs: false,
        recipe: {
          name: "Imported recipe",
          description: "Definition only",
          inputType: "text",
          workflow: { version: 1, steps: [{ engineId: "base64" }] },
        },
      }),
    );

    await user.upload(screen.getByLabelText("Import recipe file"), file);

    await waitFor(() =>
      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Imported recipe" }),
      ),
    );
    const imported = mocks.create.mock.calls[0]?.[0];
    expect(imported).not.toHaveProperty("input");
    expect(imported).not.toHaveProperty("output");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Review the definition before running it",
    );
  });

  it("rejects an invalid transfer file before storage", async () => {
    const user = userEvent.setup();
    render(<SavedRecipeWorkspace />);
    await user.upload(
      screen.getByLabelText("Import recipe file"),
      recipeFile("not json"),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Recipe file is not valid JSON.",
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("disables saving when browser storage is unavailable", () => {
    mocks.state.available = false;
    render(<SavedRecipeWorkspace />);
    expect(
      screen.getByRole("heading", { name: "Recipe storage unavailable" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save Base64 then URL encode" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Import recipe" })).toBeDisabled();
  });

  it("deletes a saved recipe and exposes the error state", async () => {
    mocks.state.recipes = [savedRecipe];
    mocks.state.error = "Recipe could not be saved in this browser.";
    const user = userEvent.setup();
    render(<SavedRecipeWorkspace />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Recipe could not be saved in this browser.",
    );
    await user.click(screen.getByRole("button", { name: "Delete My recipe" }));
    expect(mocks.remove).toHaveBeenCalledWith("saved-1");
  });
});
