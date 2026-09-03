import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ErrorExplainer } from "../error-explainer";
import * as aiConfig from "@/lib/ai/use-ai-config";
import * as explainError from "@/lib/ai/explain-error";

vi.mock("@/lib/ai/use-ai-config", () => ({
  useAiConfig: vi.fn(),
}));

vi.mock("@/lib/ai/explain-error", () => ({
  explainToolError: vi.fn(),
}));

describe("ErrorExplainer", () => {
  const mockConfig = {
    providerId: "openai" as const,
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4",
    apiKey: "test-key",
    schemaVersion: 1 as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows gate message and disables form when not configured", () => {
    vi.mocked(aiConfig.useAiConfig).mockReturnValue({
      config: undefined,
      configured: false,
      loading: false,
      error: undefined,
      save: vi.fn(),
      clear: vi.fn(),
    });

    render(<ErrorExplainer />);

    expect(screen.getByText(/Add your own AI provider/)).toBeInTheDocument();

    // Form elements should be disabled
    expect(screen.getByRole("combobox", { name: "Tool" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Error message" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /Send the tool name/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Explain error" })).toBeDisabled();
  });

  it("enables inputs but disables submit until valid state is reached", async () => {
    vi.mocked(aiConfig.useAiConfig).mockReturnValue({
      config: mockConfig,
      configured: true,
      loading: false,
      error: undefined,
      save: vi.fn(),
      clear: vi.fn(),
    });

    render(<ErrorExplainer />);
    const user = userEvent.setup();

    expect(screen.queryByText(/Add your own AI provider/)).not.toBeInTheDocument();

    const toolSelect = screen.getByRole("combobox", { name: "Tool" });
    const messageInput = screen.getByRole("textbox", { name: "Error message" });
    const consentCheckbox = screen.getByRole("checkbox", { name: /Send the tool name/ });
    const submitBtn = screen.getByRole("button", { name: "Explain error" });

    expect(toolSelect).not.toBeDisabled();
    expect(messageInput).not.toBeDisabled();
    expect(consentCheckbox).not.toBeDisabled();

    // Submit is disabled initially because message is empty and consent is false
    expect(submitBtn).toBeDisabled();

    // Type message
    await user.type(messageInput, "Some error");
    expect(submitBtn).toBeDisabled(); // Consent still false

    // Click consent
    await user.click(consentCheckbox);
    expect(submitBtn).not.toBeDisabled(); // Now it should be enabled
  });

  it("calls explainToolError and displays explanation on success", async () => {
    vi.mocked(aiConfig.useAiConfig).mockReturnValue({
      config: mockConfig,
      configured: true,
      loading: false,
      error: undefined,
      save: vi.fn(),
      clear: vi.fn(),
    });

    const mockExplain = vi.mocked(explainError.explainToolError).mockResolvedValue({
      ok: true,
      explanation: "This means your JSON is malformed.",
    });

    render(<ErrorExplainer />);
    const user = userEvent.setup();

    const messageInput = screen.getByRole("textbox", { name: "Error message" });
    const consentCheckbox = screen.getByRole("checkbox", { name: /Send the tool name/ });
    const submitBtn = screen.getByRole("button", { name: "Explain error" });

    await user.type(messageInput, "Unexpected token");
    await user.click(consentCheckbox);
    await user.click(submitBtn);

    expect(mockExplain).toHaveBeenCalledTimes(1);
    expect(mockExplain).toHaveBeenCalledWith({
      engineId: "json-formatter", // First engine in the list typically
      message: "Unexpected token",
      config: mockConfig,
    });

    await waitFor(() => {
      expect(screen.getByText("Explanation")).toBeInTheDocument();
      expect(screen.getByText("This means your JSON is malformed.")).toBeInTheDocument();
    });

    // Consent should be reset after submission
    expect(consentCheckbox).not.toBeChecked();
  });

  it("displays error message if explainToolError fails", async () => {
    vi.mocked(aiConfig.useAiConfig).mockReturnValue({
      config: mockConfig,
      configured: true,
      loading: false,
      error: undefined,
      save: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(explainError.explainToolError).mockResolvedValue({
      ok: false,
      error: "Failed to connect to AI provider.",
    });

    render(<ErrorExplainer />);
    const user = userEvent.setup();

    const messageInput = screen.getByRole("textbox", { name: "Error message" });
    const consentCheckbox = screen.getByRole("checkbox", { name: /Send the tool name/ });
    const submitBtn = screen.getByRole("button", { name: "Explain error" });

    await user.type(messageInput, "Another error");
    await user.click(consentCheckbox);
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to connect to AI provider.");
    });
  });
});
