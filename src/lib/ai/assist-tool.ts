/**
 * Inline tool assistance (Phase 3, BYOK).
 *
 * Two request shapes are supported from inside the tool runtime:
 * - "explain-error": only the tool identity and the engine's own error message
 *   are sent (see explain-error.ts).
 * - "assist-input": the tool identity plus a bounded snippet of the current
 *   input, sent only after an explicit per-request consent.
 *
 * Nothing is sent automatically, nothing is stored, and no DevHub server is
 * involved: the request goes from this browser to the endpoint the user
 * configured.
 */
import { getEngine } from "../engine-registry";
import { tools } from "../tools";
import { requestCompletion, type AiResponse } from "./client";
import type { AiProviderConfig } from "./provider-config";

export const AI_ASSIST_INPUT_LIMIT = 1200;

export const ASSIST_SYSTEM_PROMPT = [
  "You assist developers using a local-first developer toolkit.",
  "You receive one tool identity and a bounded snippet of the user's current input.",
  "Explain what the tool will do with this input, flag anything that will fail, and suggest the next step.",
  "Answer in at most 5 short sentences. No code fences unless a short corrected snippet is required.",
  "Never invent tool features and never ask the user to paste secrets or tokens.",
].join("\n");

export function buildAssistUserPrompt(engineId: string, input: string): string {
  const tool = tools.find((item) => item.slug === engineId);
  return [
    `Tool: ${tool?.name ?? engineId} (${engineId})`,
    `Purpose: ${tool?.description ?? "Local developer tool."}`,
    "Current input snippet:",
    input.slice(0, AI_ASSIST_INPUT_LIMIT),
  ].join("\n");
}

export type AssistResult =
  | { ok: true; answer: string }
  | { ok: false; error: string };

export type AssistToolInput = {
  engineId: string;
  input: string;
  config: AiProviderConfig;
  signal?: AbortSignal;
  request?: (value: {
    config: AiProviderConfig;
    system: string;
    user: string;
    signal?: AbortSignal;
  }) => Promise<AiResponse>;
};

export async function assistWithInput({
  engineId,
  input,
  config,
  signal,
  request = requestCompletion,
}: AssistToolInput): Promise<AssistResult> {
  if (!getEngine(engineId)) {
    return { ok: false, error: "Select a tool from the registry." };
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Add some input before asking the model." };
  }
  const response = await request({
    config,
    system: ASSIST_SYSTEM_PROMPT,
    user: buildAssistUserPrompt(engineId, trimmed),
    signal,
  });
  if (!response.ok) return { ok: false, error: response.error };
  return { ok: true, answer: response.text.slice(0, 1200) };
}
