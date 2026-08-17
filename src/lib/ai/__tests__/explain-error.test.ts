import { describe, expect, it, vi } from "vitest";
import { buildErrorPayload, explainToolError } from "../explain-error";
import { AI_ERROR_MESSAGE_LIMIT, createDefaultAiConfig } from "../provider-config";

const config = { ...createDefaultAiConfig("openai"), apiKey: "key" };

describe("error explainer", () => {
  it("rejects unknown engines and empty messages", () => {
    expect(buildErrorPayload("nope", "boom").ok).toBe(false);
    expect(buildErrorPayload("json-formatter", "   ").ok).toBe(false);
  });

  it("bounds the message length", () => {
    const payload = buildErrorPayload("json-formatter", "x".repeat(2000));
    expect(payload.ok).toBe(true);
    if (payload.ok) {
      expect(payload.value.message.length).toBe(AI_ERROR_MESSAGE_LIMIT);
    }
  });

  it("sends only the tool identity and message", async () => {
    const request = vi.fn(async (_input: { user: string }) => ({
      ok: true as const,
      text: "The payload is not valid JSON.",
    }));
    const result = await explainToolError({
      engineId: "json-formatter",
      message: "Unexpected token }",
      config,
      request,
    });
    expect(result).toMatchObject({ ok: true });
    const sent = request.mock.calls[0]![0];
    expect(sent.user).toContain("json-formatter");
    expect(sent.user).toContain("Unexpected token }");
    expect(sent.user).not.toContain("key");
  });

  it("surfaces provider errors", async () => {
    const request = vi.fn(async () => ({
      ok: false as const,
      error: "offline",
    }));
    expect(
      await explainToolError({
        engineId: "json-formatter",
        message: "boom",
        config,
        request,
      }),
    ).toEqual({ ok: false, error: "offline" });
  });
});
