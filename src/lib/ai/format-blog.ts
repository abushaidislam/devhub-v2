/**
 * AI Blog Formatter (BYOK, browser-only).
 *
 * Transforms raw or loosely formatted text into beautifully structured MDX
 * with proper headings, bold, italic, lists, blockquotes, code blocks, and
 * YAML frontmatter — ready for blog publishing.
 *
 * This is DevHub's first AI-primary tool. The full user content is sent to
 * the configured provider after explicit per-action consent. Nothing is sent
 * automatically, nothing is stored, and no DevHub server is involved.
 */
import { requestCompletion, type AiResponse } from "./client";
import type { AiProviderConfig } from "./provider-config";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum input length in characters (~20 000 words). */
export const BLOG_FORMAT_INPUT_LIMIT = 100_000;

/** Maximum output tokens requested from the provider. */
const MAX_OUTPUT_TOKENS = 4096;

// ---------------------------------------------------------------------------
// Style presets
// ---------------------------------------------------------------------------

export type BlogStyle =
  | "smart"
  | "technical"
  | "personal"
  | "documentation"
  | "tutorial";

export const BLOG_STYLE_LABELS: Record<BlogStyle, string> = {
  smart: "Smart (auto-detect)",
  technical: "Technical Blog",
  personal: "Personal Blog",
  documentation: "Documentation",
  tutorial: "Tutorial",
};

const STYLE_INSTRUCTIONS: Record<BlogStyle, string> = {
  smart:
    "Detect the content's tone and topic automatically and apply the most appropriate formatting style.",
  technical:
    "Use a structured, professional tone. Prefer definition lists for terminology, fenced code blocks with language tags, and admonition-style callouts (> **Note:** …). Keep paragraphs concise.",
  personal:
    "Use a warm, conversational flow. Add pull-quote blockquotes for memorable lines. Keep formatting light — fewer subheadings, more flowing paragraphs with natural bold and italic emphasis.",
  documentation:
    "Use a formal, reference-style hierarchy. Include tables where data is tabular. Use > **Warning:** and > **Tip:** admonitions. Number sequences of steps. Be precise and complete.",
  tutorial:
    "Structure as a step-by-step guide with numbered H2 sections (## Step 1: …). Include > **Tip:** callouts, prerequisites lists, and expected-output code blocks after each step.",
};

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

export const BLOG_FORMATTER_SYSTEM_PROMPT = `You are an expert content formatter and MDX specialist. Your sole task is to take raw or poorly formatted content and transform it into beautifully structured MDX that is ready for blog publication.

STRICT RULES — follow every one:
1. Analyze the content SEMANTICALLY — understand the meaning, topics, logical sections, and argument flow.
2. Start with a YAML frontmatter block: title, description (1–2 sentences), date (today), and 3–6 relevant tags.
3. Use a proper heading hierarchy: ONE H1 (# Title) matching the frontmatter title, H2 (##) for major sections, H3 (###) for subsections. Never skip levels.
4. Apply **bold** for key terms, definitions, and critical points. Apply *italic* for emphasis, foreign words, and first-mention technical terms.
5. Create proper lists — unordered (- ) for categorical items, ordered (1. ) for sequential steps or ranked items.
6. Use blockquotes (>) for notable quotes, important callouts, or highlighted statements.
7. Use fenced code blocks with language tags (\`\`\`language) for any code, commands, or structured data found in the content.
8. Add horizontal rules (---) between major thematic shifts when appropriate.
9. PRESERVE the original meaning and ALL information — restructure and format, but do NOT add new claims, remove content, or change the author's intent.
10. Output ONLY valid MDX. Do NOT include any explanation, commentary, or wrapper outside the MDX content itself.
11. Use proper paragraph spacing — one blank line between paragraphs, headings, and block elements.
12. If the content contains inline links or references, preserve them as proper Markdown links.`;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildUserPrompt(content: string, style: BlogStyle): string {
  return [
    `FORMATTING STYLE: ${BLOG_STYLE_LABELS[style]}`,
    STYLE_INSTRUCTIONS[style],
    "",
    "RAW CONTENT TO FORMAT:",
    "",
    content.slice(0, BLOG_FORMAT_INPUT_LIMIT),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type BlogFormatInput = {
  content: string;
  style?: BlogStyle;
  config: AiProviderConfig;
  signal?: AbortSignal;
  onChunk?: (chunk: string, accumulated: string) => void;
  /** Dependency-injectable request function for testing. */
  request?: (args: {
    config: AiProviderConfig;
    system: string;
    user: string;
    signal?: AbortSignal;
    maxOutputTokens?: number;
    onChunk?: (chunk: string, accumulated: string) => void;
  }) => Promise<AiResponse>;
};

export type BlogFormatResult =
  | { ok: true; mdx: string }
  | { ok: false; error: string };

export async function formatBlogContent({
  content,
  style = "smart",
  config,
  signal,
  onChunk,
  request = requestCompletion,
}: BlogFormatInput): Promise<BlogFormatResult> {
  const trimmed = content.trim();

  if (!trimmed) {
    return { ok: false, error: "Paste or type some content before formatting." };
  }

  if (trimmed.length > BLOG_FORMAT_INPUT_LIMIT) {
    return {
      ok: false,
      error: `Content exceeds the ${(BLOG_FORMAT_INPUT_LIMIT / 1000).toFixed(0)}K character limit. Shorten the text and try again.`,
    };
  }

  const response = await request({
    config,
    system: BLOG_FORMATTER_SYSTEM_PROMPT,
    user: buildUserPrompt(trimmed, style),
    signal,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    onChunk,
  });

  if (!response.ok) return { ok: false, error: response.error };

  // Strip any accidental markdown code fence wrapping the AI might add
  let mdx = response.text;
  const fenceMatch = mdx.match(/^```(?:mdx|markdown|md)?\s*\n([\s\S]*?)\n```\s*$/);
  if (fenceMatch) {
    mdx = fenceMatch[1];
  }

  return { ok: true, mdx: mdx.trim() };
}
