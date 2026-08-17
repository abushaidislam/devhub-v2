/**
 * Direct browser-to-provider chat request (BYOK).
 *
 * The request is issued from the user's browser to the endpoint the user
 * configured. DevHub has no server component in this path and stores no
 * request or response.
 */
import type { AiProviderConfig } from "./provider-config";

export type AiRequest = {
  config: AiProviderConfig;
  system: string;
  user: string;
  signal?: AbortSignal;
  maxOutputTokens?: number;
};

export type AiResponse =
  | { ok: true; text: string }
  | { ok: false; error: string };

function messageForStatus(status: number): string {
  if (status === 401 || status === 403) {
    return "The provider rejected your API key. Check the key in AI settings.";
  }
  if (status === 402) {
    return "Your provider account has no remaining credit for this model.";
  }
  if (status === 404) {
    return "The provider did not recognise this endpoint or model name.";
  }
  if (status === 429) {
    return "The provider rate-limited this request. Try again shortly.";
  }
  if (status >= 500) {
    return "The provider returned a server error. Try again shortly.";
  }
  return `The provider rejected the request (HTTP ${status}).`;
}

export async function requestCompletion({
  config,
  system,
  user,
  signal,
  maxOutputTokens = 700,
}: AiRequest): Promise<AiResponse> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (config.apiKey) headers.authorization = `Bearer ${config.apiKey}`;

  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      signal,
      body: JSON.stringify({
        model: config.model,
        temperature: 0,
        max_tokens: maxOutputTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
  } catch (error) {
    if (signal?.aborted) return { ok: false, error: "Request cancelled." };
    return {
      ok: false,
      error:
        error instanceof Error && error.message
          ? `The provider could not be reached: ${error.message}`
          : "The provider could not be reached from this browser.",
    };
  }

  if (!response.ok) {
    return { ok: false, error: messageForStatus(response.status) };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, error: "The provider returned an unreadable response." };
  }

  const text = extractText(payload);
  if (!text) {
    return { ok: false, error: "The provider returned an empty response." };
  }
  return { ok: true, text };
}

function extractText(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return undefined;
  const message = (choices[0] as { message?: { content?: unknown } }).message;
  const content = message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const joined = content
      .map((part) =>
        part && typeof part === "object" && typeof (part as { text?: unknown }).text === "string"
          ? (part as { text: string }).text
          : "",
      )
      .join("")
      .trim();
    return joined || undefined;
  }
  return undefined;
}
