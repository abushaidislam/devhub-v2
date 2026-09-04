"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Square, Workflow } from "lucide-react";
import Link from "next/link";
import { assistWithInput } from "@/lib/ai/assist-tool";
import { explainToolError } from "@/lib/ai/explain-error";
import { describeDestination } from "@/lib/ai/provider-config";
import { useAiConfig } from "@/lib/ai/use-ai-config";
import styles from "./tool-ai-assist.module.css";

export function ToolAiAssist({
  slug,
  input,
  error,
  operation,
}: {
  slug: string;
  input: string;
  error?: string;
  operation?: string;
}) {
  const { config, configured } = useAiConfig();
  const [consent, setConsent] = useState(true);
  const [pending, setPending] = useState<"assist" | "error" | undefined>();
  const [answer, setAnswer] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setAnswer(undefined);
    setFailure(undefined);
    setConsent(Boolean(config));
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPending(undefined);
  }, [config, slug]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const destination = config ? describeDestination(config) : undefined;

  function stopRequest() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPending(undefined);
  }

  async function runAssist() {
    if (!config || !consent) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setPending("assist");
    setAnswer("");
    setFailure(undefined);
    const result = await assistWithInput({
      engineId: slug,
      input,
      operation,
      error,
      config,
      signal: controller.signal,
      onChunk: (_delta, accumulated) => {
        setAnswer(accumulated);
      },
    });
    if (abortControllerRef.current === controller) {
      abortControllerRef.current = null;
      setPending(undefined);
      setConsent(Boolean(config));
      if (result.ok) setAnswer(result.answer);
      else if (result.error !== "Request cancelled.") setFailure(result.error);
    }
  }

  async function runExplain() {
    if (!config || !consent || !error) return;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setPending("error");
    setAnswer("");
    setFailure(undefined);
    const result = await explainToolError({
      engineId: slug,
      message: error,
      config,
      signal: controller.signal,
      onChunk: (_delta, accumulated) => {
        setAnswer(accumulated);
      },
    });
    if (abortControllerRef.current === controller) {
      abortControllerRef.current = null;
      setPending(undefined);
      if (result.ok) setAnswer(result.explanation);
      else if (result.error !== "Request cancelled.") setFailure(result.error);
    }
  }

  return (
    <div className={styles.assist}>
      <div className={styles.head}>
        <Sparkles size={14} />
        <span>Run AI</span>
        <small>
          {configured
            ? `Optional. Requests go from this browser to ${destination}.`
            : "Optional, bring your own key."}
        </small>
      </div>

      {!configured ? (
        <p className={styles.gate}>
          Add your own AI provider in{" "}
          <Link href="/assistant">AI settings</Link> to enable AI help for this
          tool. Nothing is sent until a key is configured.
        </p>
      ) : (
        <>
          <label className={styles.consent}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              Allow AI to analyze this tool&apos;s context, operation, input, and
              local error (up to 1200 characters){destination ? ` with ${destination}` : ""}.
              Nothing is sent until you click Analyze.
            </span>
          </label>

          <div className={styles.actions}>
            {pending ? (
              <button
                type="button"
                className={styles.stopButton}
                onClick={stopRequest}
                aria-label="Stop AI request"
              >
                <Square size={13} fill="currentColor" />
                Stop
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={runAssist}
                  disabled={!consent || !input.trim()}
                >
                  <Sparkles size={14} />
                  Analyze this input
                </button>
                <button
                  type="button"
                  onClick={runExplain}
                  disabled={!consent || !error}
                  title={
                    error
                      ? "Sends only the tool name and the error message"
                      : "Available after a tool error"
                  }
                >
                  Explain this error
                </button>
                <Link
                  href="/assistant#assistant-step-plan"
                  className={styles.planLink}
                  title="Plan a multi-step workflow in AI Assistant"
                >
                  <Workflow size={14} />
                  Plan workflow
                </Link>
              </>
            )}
          </div>
        </>
      )}

      {failure ? (
        <p className={styles.error} role="alert">
          {failure}
        </p>
      ) : null}
      {answer ? (
        <div className={styles.result} role="status">
          {answer}
          {pending ? <span className={styles.cursor} aria-hidden="true">▍</span> : null}
        </div>
      ) : null}
    </div>
  );
}

