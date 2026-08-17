"use client";

import { useEffect, useId, useState } from "react";
import { Check, KeyRound, Trash2 } from "lucide-react";
import {
  AI_PROVIDER_PRESETS,
  createDefaultAiConfig,
  describeDestination,
  getProviderPreset,
  type AiProviderId,
} from "@/lib/ai/provider-config";
import { useAiConfig } from "@/lib/ai/use-ai-config";
import styles from "./ai-provider-settings.module.css";

export function AiProviderSettings() {
  const fieldId = useId();
  const { config, loading, error, save, clear } = useAiConfig();
  const [providerId, setProviderId] = useState<AiProviderId>("openai");
  const [baseUrl, setBaseUrl] = useState(AI_PROVIDER_PRESETS[0].baseUrl);
  const [model, setModel] = useState(AI_PROVIDER_PRESETS[0].defaultModel);
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!config) return;
    setProviderId(config.providerId);
    setBaseUrl(config.baseUrl);
    setModel(config.model);
    setApiKey(config.apiKey);
  }, [config]);

  const preset = getProviderPreset(providerId);

  function selectProvider(next: AiProviderId) {
    setProviderId(next);
    setSaved(false);
    const defaults = createDefaultAiConfig(next);
    setBaseUrl(defaults.baseUrl);
    setModel(defaults.model);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const ok = save({ providerId, baseUrl, model, apiKey });
    setSaved(ok);
  }

  return (
    <section className={styles.panel} aria-labelledby={`${fieldId}-title`}>
      <header>
        <span className={styles.icon}>
          <KeyRound size={16} />
        </span>
        <div>
          <h2 id={`${fieldId}-title`}>Bring your own AI provider</h2>
          <p>
            DevHub ships no AI key and runs no AI server. Your endpoint, model,
            and key are stored in this browser only and are used for direct
            browser-to-provider requests.
          </p>
        </div>
      </header>

      <form onSubmit={submit} className={styles.form}>
        <fieldset className={styles.providers}>
          <legend>Provider</legend>
          {AI_PROVIDER_PRESETS.map((item) => (
            <label key={item.id} data-selected={providerId === item.id}>
              <input
                type="radio"
                name="ai-provider"
                value={item.id}
                checked={providerId === item.id}
                onChange={() => selectProvider(item.id)}
              />
              <strong>{item.label}</strong>
              <small>{item.hint}</small>
            </label>
          ))}
        </fieldset>

        <div className={styles.grid}>
          <label htmlFor={`${fieldId}-url`}>
            <span>Endpoint base URL</span>
            <input
              id={`${fieldId}-url`}
              value={baseUrl}
              onChange={(event) => {
                setBaseUrl(event.target.value);
                setSaved(false);
              }}
              placeholder="https://api.openai.com/v1"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label htmlFor={`${fieldId}-model`}>
            <span>Model</span>
            <input
              id={`${fieldId}-model`}
              value={model}
              onChange={(event) => {
                setModel(event.target.value);
                setSaved(false);
              }}
              placeholder="gpt-4o-mini"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        </div>

        <label className={styles.key} htmlFor={`${fieldId}-key`}>
          <span>
            API key {preset?.keyRequired ? "(required)" : "(optional)"}
          </span>
          <input
            id={`${fieldId}-key`}
            type="password"
            value={apiKey}
            onChange={(event) => {
              setApiKey(event.target.value);
              setSaved(false);
            }}
            placeholder={
              preset?.keyRequired ? "sk-…" : "Leave empty for local models"
            }
            autoComplete="off"
          />
        </label>

        <p className={styles.disclosure}>
          Keys live in this browser&apos;s local storage. Anyone with access to
          this browser profile can read them, and clearing site data removes
          them. DevHub never uploads the key.
        </p>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        {saved && !error ? (
          <p className={styles.saved} role="status">
            <Check size={13} /> Saved locally.
          </p>
        ) : null}

        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            Save provider
          </button>
          <button
            type="button"
            onClick={() => {
              clear();
              setApiKey("");
              setSaved(false);
            }}
            disabled={loading || !config}
          >
            <Trash2 size={14} /> Remove from browser
          </button>
        </div>
      </form>

      <p className={styles.status} role="status">
        {config
          ? `Configured: requests go to ${describeDestination(config)}.`
          : "No provider configured. AI assistance stays disabled until you add one."}
      </p>
    </section>
  );
}
