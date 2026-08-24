import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecipeRunnerPanel } from "@/components/recipe-runner";
import type { ToolValue } from "@/lib/engine-types";
import { builtInRecipes } from "@/lib/workflows/built-in-recipes";
import { validateWorkflowCompatibility } from "@/lib/workflows/compatibility";
import type {
  WorkflowRunnerOptions,
  WorkflowRunResult,
} from "@/lib/workflows/runner";

const builtIn = builtInRecipes[0]!;
const recipe = {
  id: "saved-1",
  name: builtIn.name,
  inputType: builtIn.input.type,
  workflow: builtIn.workflow,
};

describe("RecipeRunnerPanel", () => {
  it("shows compatibility and boundaries before explicit execution", () => {
    render(<RecipeRunnerPanel recipe={recipe} />);
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getAllByText("local")).toHaveLength(recipe.workflow.steps.length);
    expect(screen.getByRole("button", { name: "Run workflow" })).toBeDisabled();
    expect(screen.getByText(/stay in memory/)).toBeInTheDocument();
  });

  it("runs the workflow with ephemeral input and renders output", async () => {
    const user = userEvent.setup();
    render(<RecipeRunnerPanel recipe={recipe} />);
    await user.type(screen.getByLabelText(/Runtime input/), "DevHub");
    await user.click(screen.getByRole("button", { name: "Run workflow" }));
    expect(await screen.findByText("RGV2SHVi")).toBeInTheDocument();
    expect(screen.getByText(/2 steps/)).toBeInTheDocument();
  });

  it("supports cooperative cancellation", async () => {
    const preflight = validateWorkflowCompatibility(
      recipe.workflow,
      recipe.inputType,
    );
    const runner = vi.fn(
      async (
        _workflow: unknown,
        _input: ToolValue,
        options: WorkflowRunnerOptions = {},
      ): Promise<WorkflowRunResult> =>
        new Promise((resolve) => {
          options.signal?.addEventListener("abort", () =>
            resolve({
              status: "cancelled",
              preflight,
              steps: [],
              durationMs: 0,
            }),
          );
        }),
    );
    const user = userEvent.setup();
    render(<RecipeRunnerPanel recipe={recipe} runner={runner} />);
    await user.type(screen.getByLabelText(/Runtime input/), "DevHub");
    await user.click(screen.getByRole("button", { name: "Run workflow" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    expect(await screen.findByText("Run cancelled.")).toBeInTheDocument();
  });

  it("clears runtime state when the panel unmounts", async () => {
    const user = userEvent.setup();
    const view = render(<RecipeRunnerPanel recipe={recipe} />);
    const input = screen.getByLabelText(/Runtime input/);
    await user.type(input, "temporary secret");
    expect(input).toHaveValue("temporary secret");
    view.unmount();
    render(<RecipeRunnerPanel recipe={recipe} />);
    await waitFor(() => expect(screen.getByLabelText(/Runtime input/)).toHaveValue(""));
  });
});
