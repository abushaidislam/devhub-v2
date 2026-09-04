"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LifeBuoy, Loader2, Square } from "lucide-react";
import { explainToolError } from "@/lib/ai/explain-error";
import {
  AI_ERROR_MESSAGE_LIMIT,
  describeDestination,
} from "@/lib/ai/provider-config";
import { useAiConfig } from "@/lib/ai/use-ai-config";
import { engines } from "@/lib/engine-registry";
import { tools } from "@/lib/tools";
import { Select } from "../ui/select";
import styles from "../workflows/workflow-planner.module.css";

export function ErrorExplainer() {
  const fieldId = useId();
  const { config, configured } = useAiConfig();
  const [engineId, setEngineId] = useState(engines[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [explanation, setExplanation] = useState<string>();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const destination = config ? describeDestination(config) : undefined;
  const canSubmit = configured && consent && !pending && message.trim().length > 0;

  function cancelRequest() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPending(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!config || !canSubmit) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setPending(true);
    setError(undefined);
    setExplanation("");
    const result = await explainToolError({
      engineId,
      message,
      config,
      signal: controller.signal,
      onChunk: (_delta, accumulated) => {
        setExplanation(accumulated);
      },
    });
    if (abortControllerRef.current === controller) {
      abortControllerRef.current = null;
      setPending(false);
      setConsent(false);
      if (!result.ok) {
        if (result.error !== "Request cancelled.") setError(result.error);
        return;
      }
      setExplanation(result.explanation);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby={`${fieldId}-title`}>
      <header>
        <span className={styles.icon}>
          <LifeBuoy size={16} />
        </span>
        <div>
          <h2 id={`${fieldId}-title`}>Explain a tool error</h2>
          <p>
            Paste the error message a tool returned. Only the tool identity and
            that message are sent — never the input that produced it.
          </p>
        </div>
      </header>

      {!configured ? (
        <p className={styles.gate} role="status">
          Add your own AI provider above to enable error explanations.
        </p>
      ) : null}

      <form onSubmit={submit} className={styles.form}>
        <label htmlFor={`${fieldId}-tool`}>
          <span>Tool</span>
          <span className={styles.selectField}>
            <Select
              id={`${fieldId}-tool`}
              value={engineId}
              disabled={!configured}
              aria-label="Tool"
              searchable={true}
              searchPlaceholder="Search tools…"
              options={engines.map((engine) => {
                const tool = tools.find((t) => t.slug === engine.id);
                const IconComp = tool?.icon;
                return {
                  value: engine.id,
                  label: tool?.name ?? engine.id,
                  group: tool?.category,
                  icon: IconComp ? <IconComp size={13} /> : undefined,
                };
              })}
              onChange={setEngineId}
              fullWidth={true}
            />
          </span>
        </label>

        <label htmlFor={`${fieldId}-message`}>
          <span>Error message</span>
          <textarea
            id={`${fieldId}-message`}
            value={message}
            rows={3}
            maxLength={AI_ERROR_MESSAGE_LIMIT}
            disabled={!configured}
            placeholder="Unexpected token } in JSON at position 42"
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        <p className={styles.counter}>
          {message.length}/{AI_ERROR_MESSAGE_LIMIT} characters
        </p>

        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={consent}
            disabled={!configured}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            Send the tool name and this error message
            {destination ? ` to ${destination}` : ""}. Remove anything private
            from the message first.
          </span>
        </label>

        {pending ? (
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className={styles.primary} disabled>
              <Loader2 className={styles.spin} size={15} />
              Asking…
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={cancelRequest}
              aria-label="Cancel explanation request"
            >
              <Square size={14} fill="currentColor" />
              Cancel
            </button>
          </div>
        ) : (
          <button type="submit" className={styles.primary} disabled={!canSubmit}>
            <LifeBuoy size={15} />
            Explain error
          </button>
        )}
      </form>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      {explanation ? (
        <div className={styles.result}>
          <h3>Explanation</h3>
          <p>
            {explanation}
            {pending ? <span className={styles.cursor} aria-hidden="true">▍</span> : null}
          </p>
          <p className={styles.meta}>
            Generated by your provider. Verify before acting on it.
          </p>
        </div>
      ) : null}
    </section>
  );
}
