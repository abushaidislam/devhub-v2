/**
 * Safe error explanation (Phase 3, BYOK).
 *
 * Only the engine identity and the engine's own error message are sent. Tool
 * input, tool output, stack traces, and clipboard content are excluded by
 * construction, and the message is bounded before it leaves the browser.
 */
import { getEngine } from "../engine-registry";
import { buildExplainerUserPrompt, EXPLAINER_SYSTEM_PROMPT } from "./catalog";
import { requestCompletion, type AiResponse } from "./client";
import {
  AI_ERROR_MESSAGE_LIMIT,
  type AiProviderConfig,
} from "./provider-config";

export type ErrorExplanationPayload = {
  engineId: string;
  message: string;
};

export type ErrorExplanationResult =
  | { ok: true; explanation: string }
  | { ok: false; error: string };

/** Bounded, redaction-checked payload preview shown before any request. */
export function buildErrorPayload(
  engineId: string,
  message: string,
): { ok: true; value: ErrorExplanationPayload } | { ok: false; error: string } {
  if (!getEngine(engineId)) {
    return { ok: false, error: "Select a tool from the registry." };
  }
  const trimmed = message.replace(/\s+/g, " ").trim();
  if (!trimmed) {
    return { ok: false, error: "Paste the error message you received." };
  }
  return {
    ok: true,
    value: { engineId, message: trimmed.slice(0, AI_ERROR_MESSAGE_LIMIT) },
  };
}

export type ExplainErrorInput = {
  engineId: string;
  message: string;
  config: AiProviderConfig;
  signal?: AbortSignal;
  request?: (input: {
    config: AiProviderConfig;
    system: string;
    user: string;
    signal?: AbortSignal;
  }) => Promise<AiResponse>;
};

export async function explainToolError({
  engineId,
  message,
  config,
  signal,
  request = requestCompletion,
}: ExplainErrorInput): Promise<ErrorExplanationResult> {
  const payload = buildErrorPayload(engineId, message);
  if (!payload.ok) return { ok: false, error: payload.error };

  const response = await request({
    config,
    system: EXPLAINER_SYSTEM_PROMPT,
    user: buildExplainerUserPrompt(
      payload.value.engineId,
      payload.value.message,
    ),
    signal,
  });
  if (!response.ok) return { ok: false, error: response.error };
  return { ok: true, explanation: response.text.slice(0, 1200) };
}
