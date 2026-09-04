import { describe, expect, it, vi, beforeEach } from "vitest";
import { requestCompletion } from "../client";
import { createDefaultAiConfig } from "../provider-config";

describe("AI client streaming & completion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles non-streaming OpenAI response", async () => {
    const config = { ...createDefaultAiConfig("openai"), apiKey: "sk-test" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "Formatted JSON output" } }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await requestCompletion({
      config,
      system: "You are a helper",
      user: "format this",
    });

    expect(result).toEqual({ ok: true, text: "Formatted JSON output" });
  });

  it("handles non-streaming Gemini response", async () => {
    const config = { ...createDefaultAiConfig("gemini"), apiKey: "gemini-key" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "Gemini answer" }] } }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await requestCompletion({
      config,
      system: "You are a helper",
      user: "explain",
    });

    expect(result).toEqual({ ok: true, text: "Gemini answer" });
  });

  it("streams SSE chunks for OpenAI provider when onChunk is provided", async () => {
    const config = { ...createDefaultAiConfig("openai"), apiKey: "sk-test" };

    const ssePayload = [
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
      "data: [DONE]\n\n",
    ].join("");

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(ssePayload));
        controller.close();
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(stream, {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      }),
    );

    const chunks: string[] = [];
    const result = await requestCompletion({
      config,
      system: "You are a helper",
      user: "hi",
      onChunk: (delta) => chunks.push(delta),
    });

    expect(result).toEqual({ ok: true, text: "Hello world" });
    expect(chunks).toEqual(["Hello", " world"]);
  });

  it("streams SSE chunks for Gemini provider when onChunk is provided", async () => {
    const config = { ...createDefaultAiConfig("gemini"), apiKey: "gemini-key" };

    const ssePayload = [
      'data: {"candidates":[{"content":{"parts":[{"text":"Step 1"}]}}]}\n\n',
      'data: {"candidates":[{"content":{"parts":[{"text":" -> Step 2"}]}}]}\n\n',
    ].join("");

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(ssePayload));
        controller.close();
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(stream, {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      }),
    );

    const chunks: string[] = [];
    const result = await requestCompletion({
      config,
      system: "You are a helper",
      user: "plan",
      onChunk: (delta) => chunks.push(delta),
    });

    expect(result).toEqual({ ok: true, text: "Step 1 -> Step 2" });
    expect(chunks).toEqual(["Step 1", " -> Step 2"]);
  });

  it("handles abort signal cancellation during streaming", async () => {
    const config = { ...createDefaultAiConfig("openai"), apiKey: "sk-test" };
    const controller = new AbortController();

    const stream = new ReadableStream({
      start(ctrl) {
        ctrl.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hi"}}]}\n\n'));
        // abort before next chunk
        controller.abort();
      },
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(stream, {
        status: 200,
        headers: { "content-type": "text/event-stream" },
      }),
    );

    const result = await requestCompletion({
      config,
      system: "You are a helper",
      user: "hi",
      signal: controller.signal,
      onChunk: () => {},
    });

    expect(result).toEqual({ ok: false, error: "Request cancelled." });
  });

  it("handles 401 provider rejection gracefully", async () => {
    const config = { ...createDefaultAiConfig("openai"), apiKey: "invalid" };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { message: "Incorrect API key provided" } }),
        { status: 401, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await requestCompletion({
      config,
      system: "sys",
      user: "usr",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("rejected your API key");
      expect(result.error).toContain("Incorrect API key provided");
    }
  });
});
