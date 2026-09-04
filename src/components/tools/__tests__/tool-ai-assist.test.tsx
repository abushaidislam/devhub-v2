import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { ToolAiAssist } from "@/components/tools/tool-ai-assist";
import { useAiConfig } from "@/lib/ai/use-ai-config";
import { assistWithInput } from "@/lib/ai/assist-tool";
import { explainToolError } from "@/lib/ai/explain-error";
import { describeDestination } from "@/lib/ai/provider-config";

vi.mock("@/lib/ai/use-ai-config", () => ({
  useAiConfig: vi.fn(),
}));

vi.mock("@/lib/ai/assist-tool", () => ({
  assistWithInput: vi.fn(),
}));

vi.mock("@/lib/ai/explain-error", () => ({
  explainToolError: vi.fn(),
}));

vi.mock("@/lib/ai/provider-config", () => ({
  describeDestination: vi.fn(),
}));

describe("ToolAiAssist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows setup prompt when AI is not configured", () => {
    (useAiConfig as Mock).mockReturnValue({ config: undefined, configured: false });

    render(<ToolAiAssist slug="test-tool" input="test input" />);

    expect(screen.getByText("Optional, bring your own key.")).toBeInTheDocument();

    expect(screen.getByText((content, element) => {
      return content.includes("Add your own AI provider in") && element?.tagName.toLowerCase() === 'p';
    })).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "AI settings" });
    expect(link).toHaveAttribute("href", "/assistant");
    expect(screen.getByText(/Nothing is sent until a key is configured./)).toBeInTheDocument();

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Analyze this input/i })).not.toBeInTheDocument();
  });

  describe("when configured", () => {
    const mockConfig = { provider: "openai", apiKey: "test" };

    beforeEach(() => {
      (useAiConfig as Mock).mockReturnValue({ config: mockConfig, configured: true });
      (describeDestination as Mock).mockReturnValue("OpenAI");
    });

    it("renders the configured state correctly", () => {
      render(<ToolAiAssist slug="test-tool" input="test input" />);

      expect(screen.getByText("Optional. Requests go from this browser to OpenAI.")).toBeInTheDocument();

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();

      expect(screen.getByRole("button", { name: "Analyze this input" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Explain this error" })).toBeDisabled();
    });

    it("disables actions when consent is revoked", async () => {
      const user = userEvent.setup();
      render(<ToolAiAssist slug="test-tool" input="test input" error="test error" />);

      const analyzeBtn = screen.getByRole("button", { name: "Analyze this input" });
      const explainBtn = screen.getByRole("button", { name: "Explain this error" });
      const checkbox = screen.getByRole("checkbox");

      expect(analyzeBtn).not.toBeDisabled();
      expect(explainBtn).not.toBeDisabled();

      await user.click(checkbox);

      expect(checkbox).not.toBeChecked();
      expect(analyzeBtn).toBeDisabled();
      expect(explainBtn).toBeDisabled();
    });

    it("disables analyze button when input is empty", () => {
      render(<ToolAiAssist slug="test-tool" input="   " />);
      expect(screen.getByRole("button", { name: "Analyze this input" })).toBeDisabled();
    });

    it("calls assistWithInput and displays answer on success", async () => {
      const user = userEvent.setup();
      (assistWithInput as Mock).mockResolvedValue({ ok: true, answer: "Mocked AI Answer" });

      render(<ToolAiAssist slug="test-tool" input="valid input" operation="test-op" />);

      const analyzeBtn = screen.getByRole("button", { name: "Analyze this input" });
      await user.click(analyzeBtn);

      expect(assistWithInput).toHaveBeenCalledWith({
        engineId: "test-tool",
        input: "valid input",
        operation: "test-op",
        error: undefined,
        config: mockConfig,
        signal: expect.any(Object),
        onChunk: expect.any(Function),
      });

      await waitFor(() => {
        expect(screen.getByText("Mocked AI Answer")).toBeInTheDocument();
      });
    });

    it("calls assistWithInput and displays error on failure", async () => {
      const user = userEvent.setup();
      (assistWithInput as Mock).mockResolvedValue({ ok: false, error: "Mocked AI Error" });

      render(<ToolAiAssist slug="test-tool" input="valid input" />);

      const analyzeBtn = screen.getByRole("button", { name: "Analyze this input" });
      await user.click(analyzeBtn);

      await waitFor(() => {
        expect(screen.getByText("Mocked AI Error")).toBeInTheDocument();
      });
    });

    it("calls explainToolError and displays explanation on success", async () => {
      const user = userEvent.setup();
      (explainToolError as Mock).mockResolvedValue({ ok: true, explanation: "Mocked Explanation" });

      render(<ToolAiAssist slug="test-tool" input="valid input" error="Something went wrong" />);

      const explainBtn = screen.getByRole("button", { name: "Explain this error" });
      await user.click(explainBtn);

      expect(explainToolError).toHaveBeenCalledWith({
        engineId: "test-tool",
        message: "Something went wrong",
        config: mockConfig,
        signal: expect.any(Object),
        onChunk: expect.any(Function),
      });

      await waitFor(() => {
        expect(screen.getByText("Mocked Explanation")).toBeInTheDocument();
      });
    });

    it("renders Stop button during request and allows cancellation", async () => {
      const user = userEvent.setup();
      let capturedSignal: AbortSignal | undefined;
      (assistWithInput as Mock).mockImplementation(({ signal }: { signal: AbortSignal }) => {
        capturedSignal = signal;
        return new Promise(() => {}); // never resolves until abort
      });

      render(<ToolAiAssist slug="test-tool" input="valid input" />);
      const analyzeBtn = screen.getByRole("button", { name: "Analyze this input" });
      await user.click(analyzeBtn);

      const stopBtn = screen.getByRole("button", { name: "Stop AI request" });
      expect(stopBtn).toBeInTheDocument();

      await user.click(stopBtn);
      expect(capturedSignal?.aborted).toBe(true);
      expect(screen.queryByRole("button", { name: "Stop AI request" })).not.toBeInTheDocument();
    });

    it("calls explainToolError and displays error on failure", async () => {
      const user = userEvent.setup();
      (explainToolError as Mock).mockResolvedValue({ ok: false, error: "Failed to explain" });

      render(<ToolAiAssist slug="test-tool" input="valid input" error="Something went wrong" />);

      const explainBtn = screen.getByRole("button", { name: "Explain this error" });
      await user.click(explainBtn);

      await waitFor(() => {
        expect(screen.getByText("Failed to explain")).toBeInTheDocument();
      });
    });
  });
});
