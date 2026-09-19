import { describe, expect, it, vi } from "vitest";
import {
  formatBlogContent,
  BLOG_FORMAT_INPUT_LIMIT,
  BLOG_FORMATTER_SYSTEM_PROMPT,
} from "../format-blog";
import { createDefaultAiConfig } from "../provider-config";

const config = { ...createDefaultAiConfig("openai"), apiKey: "sk-test-key" };

describe("formatBlogContent", () => {
  it("rejects empty or whitespace-only content", async () => {
    const result = await formatBlogContent({
      content: "   ",
      config,
    });
    expect(result).toEqual({
      ok: false,
      error: "Paste or type some content before formatting.",
    });
  });

  it("rejects content exceeding the character limit", async () => {
    const hugeContent = "a".repeat(BLOG_FORMAT_INPUT_LIMIT + 10);
    const result = await formatBlogContent({
      content: hugeContent,
      config,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("character limit");
    }
  });

  it("formats content with default smart style", async () => {
    const request = vi.fn(async (_args: { system: string; user: string }) => ({
      ok: true as const,
      text: "# Getting Started\n\nWelcome to DevHub.\n\n## Overview\n\nDevHub is fast.",
    }));

    const result = await formatBlogContent({
      content: "Getting started with DevHub. It is fast.",
      config,
      request,
    });

    expect(result).toEqual({
      ok: true,
      mdx: "# Getting Started\n\nWelcome to DevHub.\n\n## Overview\n\nDevHub is fast.",
    });

    expect(request).toHaveBeenCalledOnce();
    const callArgs = request.mock.calls[0]![0];
    expect(callArgs.system).toBe(BLOG_FORMATTER_SYSTEM_PROMPT);
    expect(callArgs.user).toContain("Smart (auto-detect)");
    expect(callArgs.user).toContain("Getting started with DevHub.");
  });

  it("applies requested style preset", async () => {
    const request = vi.fn(async (_args: { user: string }) => ({
      ok: true as const,
      text: "# Tutorial\n\n## Step 1: Install\n\nRun npm install.",
    }));

    const result = await formatBlogContent({
      content: "Step 1 install npm",
      style: "tutorial",
      config,
      request,
    });

    expect(result.ok).toBe(true);
    const callArgs = request.mock.calls[0]![0];
    expect(callArgs.user).toContain("Tutorial");
    expect(callArgs.user).toContain("step-by-step");
  });

  it("strips wrapping markdown code fences from AI response", async () => {
    const rawMdx = "---\ntitle: Hello\n---\n\n# Hello World";
    const wrappedText = "```mdx\n" + rawMdx + "\n```";

    const request = vi.fn(async () => ({
      ok: true as const,
      text: wrappedText,
    }));

    const result = await formatBlogContent({
      content: "Hello world blog post",
      config,
      request,
    });

    expect(result).toEqual({
      ok: true,
      mdx: rawMdx,
    });
  });

  it("propagates streaming chunks through onChunk", async () => {
    const onChunk = vi.fn();
    const request = vi.fn(
      async (args: { onChunk?: (c: string, a: string) => void }) => {
        args.onChunk?.("chunk1", "chunk1");
        args.onChunk?.("chunk2", "chunk1chunk2");
        return { ok: true as const, text: "chunk1chunk2" };
      },
    );

    const result = await formatBlogContent({
      content: "Stream this content",
      config,
      onChunk,
      request,
    });

    expect(result.ok).toBe(true);
    expect(onChunk).toHaveBeenCalledTimes(2);
  });

  it("surfaces provider errors gracefully", async () => {
    const request = vi.fn(async () => ({
      ok: false as const,
      error: "The provider rejected your API key. Check the key in AI settings.",
    }));

    const result = await formatBlogContent({
      content: "Valid input content",
      config,
      request,
    });

    expect(result).toEqual({
      ok: false,
      error: "The provider rejected your API key. Check the key in AI settings.",
    });
  });
});
