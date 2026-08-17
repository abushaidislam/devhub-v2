/**
 * BYOK AI provider configuration (Phase 3).
 *
 * DevHub never hosts an AI key. The user supplies their own provider endpoint,
 * model, and key. The configuration is stored in this browser only and is used
 * for direct browser-to-provider requests. No DevHub server is involved.
 */

export const AI_CONFIG_STORAGE_KEY = "devhub:ai-provider:v1";
export const AI_CONFIG_CHANGED = "devhub:ai-provider:changed";
export const AI_CONFIG_SCHEMA_VERSION = 1 as const;

export const AI_GOAL_LIMIT = 600;
export const AI_ERROR_MESSAGE_LIMIT = 400;

export type AiProviderId = "openai" | "openrouter" | "gemini" | "ollama" | "custom";

export type AiProviderPreset = {
  id: AiProviderId;
  label: string;
  baseUrl: string;
  defaultModel: string;
  /** True when the endpoint is a hosted third-party service. */
  hosted: boolean;
  keyRequired: boolean;
  hint: string;
};

export const AI_PROVIDER_PRESETS: readonly AiProviderPreset[] = [
  {
    id: "openai",
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    hosted: true,
    keyRequired: true,
    hint: "Your own OpenAI API key. Requests go from this browser to OpenAI.",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    hosted: true,
    keyRequired: true,
    hint: "Your own OpenRouter key. OpenRouter routes the request to the selected model provider.",
  },
  {
    id: "gemini",
    label: "Google Gemini (AI Studio)",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-flash-latest",
    hosted: true,
    keyRequired: true,
    hint: "Use a Gemini API key from Google AI Studio. Free-tier quota applies.",
  },
  {
    id: "ollama",
    label: "Local model (Ollama)",
    baseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.1",
    hosted: false,
    keyRequired: false,
    hint: "A model running on your machine. Requests never leave your device.",
  },
  {
    id: "custom",
    label: "Custom OpenAI-compatible endpoint",
    baseUrl: "",
    defaultModel: "",
    hosted: true,
    keyRequired: false,
    hint: "Any endpoint that implements POST /chat/completions.",
  },
];

export type AiProviderConfig = {
  schemaVersion: typeof AI_CONFIG_SCHEMA_VERSION;
  providerId: AiProviderId;
  baseUrl: string;
  model: string;
  apiKey: string;
};

export type AiConfigResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function getProviderPreset(id: string): AiProviderPreset | undefined {
  return AI_PROVIDER_PRESETS.find((preset) => preset.id === id);
}

export function createDefaultAiConfig(
  providerId: AiProviderId = "openai",
): AiProviderConfig {
  const preset = getProviderPreset(providerId) ?? AI_PROVIDER_PRESETS[0];
  return {
    schemaVersion: AI_CONFIG_SCHEMA_VERSION,
    providerId: preset.id,
    baseUrl: preset.baseUrl,
    model: preset.defaultModel,
    apiKey: "",
  };
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateAiConfig(
  value: unknown,
): AiConfigResult<AiProviderConfig> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { ok: false, error: "Provider configuration is invalid." };
  }
  const candidate = value as Record<string, unknown>;
  const preset = getProviderPreset(String(candidate.providerId));
  if (!preset) {
    return { ok: false, error: "Select a supported provider." };
  }

  const baseUrl =
    typeof candidate.baseUrl === "string" ? candidate.baseUrl.trim() : "";
  if (!isHttpUrl(baseUrl)) {
    return { ok: false, error: "Endpoint must be a valid http(s) URL." };
  }

  const model =
    typeof candidate.model === "string" ? candidate.model.trim() : "";
  if (!model || model.length > 120) {
    return { ok: false, error: "Model name is required." };
  }

  const apiKey =
    typeof candidate.apiKey === "string" ? candidate.apiKey.trim() : "";
  if (preset.keyRequired && !apiKey) {
    return { ok: false, error: `${preset.label} requires your own API key.` };
  }
  if (apiKey.length > 400) {
    return { ok: false, error: "API key looks too long to be valid." };
  }
  if (preset.id === "gemini" && apiKey.length > 40 && apiKey.length % 2 === 0) {
    const midpoint = apiKey.length / 2;
    if (apiKey.slice(0, midpoint) === apiKey.slice(midpoint)) {
      return { ok: false, error: "This Gemini API key appears to be pasted twice. Keep only one key." };
    }
  }

  return {
    ok: true,
    value: {
      schemaVersion: AI_CONFIG_SCHEMA_VERSION,
      providerId: preset.id,
      baseUrl: baseUrl.replace(/\/+$/, ""),
      model,
      apiKey,
    },
  };
}

function storage(): Storage | undefined {
  try {
    if (typeof localStorage === "undefined") return undefined;
    return localStorage;
  } catch {
    return undefined;
  }
}

/** Read the stored configuration, or undefined when none is usable. */
export function readAiConfig(): AiProviderConfig | undefined {
  const store = storage();
  if (!store) return undefined;
  try {
    const raw = store.getItem(AI_CONFIG_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    const result = validateAiConfig(parsed);
    if (!result.ok) return undefined;
    // Keep older saved Gemini setups working as model aliases change.
    if (result.value.providerId === "gemini" && result.value.model === "gemini-2.5-flash") {
      return { ...result.value, model: "gemini-flash-latest" };
    }
    return result.value;
  } catch {
    return undefined;
  }
}

export function saveAiConfig(value: unknown): AiConfigResult<AiProviderConfig> {
  const validated = validateAiConfig(value);
  if (!validated.ok) return validated;
  const store = storage();
  if (!store) {
    return { ok: false, error: "This browser blocked local settings storage." };
  }
  try {
    store.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(validated.value));
  } catch {
    return { ok: false, error: "Provider settings could not be saved locally." };
  }
  notifyConfigChanged();
  return validated;
}

export function clearAiConfig() {
  const store = storage();
  try {
    store?.removeItem(AI_CONFIG_STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
  notifyConfigChanged();
}

function notifyConfigChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AI_CONFIG_CHANGED));
  }
}

/** Human-readable destination of a request for consent copy. */
export function describeDestination(config: AiProviderConfig): string {
  const preset = getProviderPreset(config.providerId);
  let host = config.baseUrl;
  try {
    host = new URL(config.baseUrl).host;
  } catch {
    /* keep raw value */
  }
  if (preset && !preset.hosted) {
    return `${config.model} on ${host} (your machine)`;
  }
  return `${config.model} at ${host}`;
}
