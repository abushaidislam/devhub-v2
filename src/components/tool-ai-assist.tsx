"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
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
}: {
  slug: string;
  input: string;
  error?: string;
}) {
  const { config, configured } = useAiConfig();
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState<"assist" | "error" | undefined>();
  const [answer, setAnswer] = useState<string>();
  const [failure, setFailure] = useState<string>();

  useEffect(() => {
    setAnswer(undefined);
    setFailure(undefined);
  }, [slug]);

  const destination = config ? describeDestination(config) : undefined;

  async function runAssist() {
    if (!config || !consent) return;
    setPending("assist");
    setAnswer(undefined);
    setFailure(undefined);
    const result = await assistWithInput({ engineId: slug, input, config });
    setPending(undefined);
    setConsent(false);
    if (result.ok) setAnswer(result.answer);
    else setFailure(result.error);
  }

  async function runExplain() {
    if (!config || !error) return;
    setPending("error");
    setAnswer(undefined);
    setFailure(undefined);
    const result = await explainToolError({
      engineId: slug,
      message: error,
      config,
    });
    setPending(undefined);
    if (result.ok) setAnswer(result.explanation);
    else setFailure(result.error);
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
              Send this tool&apos;s name and the current input (first 1200
              characters){destination ? ` to ${destination}` : ""}. Remove
              anything private first.
            </span>
          </label>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={runAssist}
              disabled={!consent || Boolean(pending) || !input.trim()}
            >
              {pending === "assist" ? (
                <Loader2 className={styles.spin} size={14} />
              ) : (
                <Sparkles size={14} />
              )}
              {pending === "assist" ? "Asking…" : "Run AI on this input"}
            </button>
            <button
              type="button"
              onClick={runExplain}
              disabled={!error || Boolean(pending)}
              title={
                error
                  ? "Sends only the tool name and the error message"
                  : "Available after a tool error"
              }
            >
              {pending === "error" ? (
                <Loader2 className={styles.spin} size={14} />
              ) : null}
              Explain this error
            </button>
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
        </div>
      ) : null}
    </div>
  );
}
