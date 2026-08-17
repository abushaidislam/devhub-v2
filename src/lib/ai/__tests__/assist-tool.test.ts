import { describe, expect, it, vi } from "vitest";
import { assistWithInput, buildAssistUserPrompt } from "../assist-tool";
import { createDefaultAiConfig } from "../provider-config";

const config = { ...createDefaultAiConfig("openai"), apiKey: "key" };

describe("tool AI assistance", () => {
  it("builds a contextual prompt with operation and local error", () => {
    const prompt = buildAssistUserPrompt("hash-generator", "DevHub Toolkit", {
      operation: "SHA-256 hash",
      error: "Input is invalid",
    });
    expect(prompt).toContain("Tool: Hash Generator (hash-generator)");
    expect(prompt).toContain("Operation: SHA-256 hash");
    expect(prompt).toContain("Current input snippet:");
    expect(prompt).toContain("Local tool error:");
  });

  it("sends tool context instead of a generic input-only prompt", async () => {
    const request = vi.fn(async (value: { user: string }) => {
      void value;
      return { ok: true as const, text: "Use SHA-256 for a stable digest." };
    });
    const result = await assistWithInput({
      engineId: "hash-generator",
      input: "DevHub Toolkit",
      operation: "SHA-256 hash",
      error: "",
      config,
      request,
    });
    expect(result).toMatchObject({ ok: true });
    expect(request.mock.calls[0]![0].user).toContain("SHA-256 hash");
    expect(request.mock.calls[0]![0].user).toContain("DevHub Toolkit");
  });
});
