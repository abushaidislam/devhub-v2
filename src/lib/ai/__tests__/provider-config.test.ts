import { describe, expect, it } from "vitest";
import {
  AI_CONFIG_STORAGE_KEY,
  clearAiConfig,
  createDefaultAiConfig,
  describeDestination,
  readAiConfig,
  saveAiConfig,
  validateAiConfig,
} from "../provider-config";

describe("ai provider config", () => {
  it("creates provider defaults", () => {
    expect(createDefaultAiConfig("ollama")).toMatchObject({
      providerId: "ollama",
      baseUrl: "http://localhost:11434/v1",
      apiKey: "",
    });
  });

  it("rejects unknown providers and bad urls", () => {
    expect(validateAiConfig({ providerId: "nope" }).ok).toBe(false);
    expect(
      validateAiConfig({ providerId: "openai", baseUrl: "nope", model: "m" })
        .ok,
    ).toBe(false);
  });

  it("requires a key for hosted providers that need one", () => {
    const result = validateAiConfig({
      providerId: "openai",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-4o-mini",
      apiKey: "",
    });
    expect(result.ok).toBe(false);
  });

  it("supports the Gemini AI Studio preset", () => {
    expect(createDefaultAiConfig("gemini")).toMatchObject({
      providerId: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      model: "gemini-flash-latest",
    });
    expect(validateAiConfig({
      providerId: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      model: "gemini-flash-latest",
      apiKey: "gemini-test-key",
    }).ok).toBe(true);
  });

  it("allows keyless local providers and trims trailing slashes", () => {
    const result = validateAiConfig({
      providerId: "ollama",
      baseUrl: "http://localhost:11434/v1/",
      model: "llama3.1",
    });
    expect(result).toMatchObject({
      ok: true,
      value: { baseUrl: "http://localhost:11434/v1" },
    });
  });

  it("round-trips through local storage and clears", () => {
    expect(
      saveAiConfig({
        providerId: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1",
        model: "openai/gpt-4o-mini",
        apiKey: "test-key",
      }).ok,
    ).toBe(true);
    expect(readAiConfig()?.model).toBe("openai/gpt-4o-mini");
    clearAiConfig();
    expect(localStorage.getItem(AI_CONFIG_STORAGE_KEY)).toBeNull();
    expect(readAiConfig()).toBeUndefined();
  });

  it("ignores corrupt stored values", () => {
    localStorage.setItem(AI_CONFIG_STORAGE_KEY, "{not json");
    expect(readAiConfig()).toBeUndefined();
  });

  it("describes local providers as on-device", () => {
    const local = createDefaultAiConfig("ollama");
    expect(describeDestination(local)).toContain("your machine");
    const hosted = { ...createDefaultAiConfig("openai"), apiKey: "k" };
    expect(describeDestination(hosted)).toContain("api.openai.com");
  });
});
