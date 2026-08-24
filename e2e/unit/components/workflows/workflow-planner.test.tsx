import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WorkflowPlanner } from "@/components/workflow-planner";
import { saveAiConfig } from "@/lib/ai/provider-config";

describe("WorkflowPlanner", () => {
  it("stays disabled until a provider is configured", () => {
    render(<WorkflowPlanner />);
    expect(
      screen.getByRole("button", { name: /propose workflow/i }),
    ).toBeDisabled();
    expect(screen.getByText(/add your own ai provider/i)).toBeInTheDocument();
  });

  it("requires explicit consent before the request button enables", async () => {
    saveAiConfig({
      providerId: "ollama",
      baseUrl: "http://localhost:11434/v1",
      model: "llama3.1",
      apiKey: "",
    });
    const user = userEvent.setup();
    render(<WorkflowPlanner />);

    await waitFor(() =>
      expect(screen.getByLabelText("Goal")).not.toBeDisabled(),
    );
    await user.type(screen.getByLabelText("Goal"), "format json");
    const submit = screen.getByRole("button", { name: /propose workflow/i });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    expect(submit).toBeEnabled();
  });
});
