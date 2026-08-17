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

  useEffect(() => {
    setAnswer(undefined);
    setFailure(undefined);
    setConsent(Boolean(config));
  }, [config, slug]);

  const destination = config ? describeDestination(config) : undefined;

  async function runAssist() {
    if (!config || !consent) return;
    setPending("assist");
    setAnswer(undefined);
    setFailure(undefined);
    const result = await assistWithInput({
      engineId: slug,
      input,
      operation,
      error,
      config,
    });
    setPending(undefined);
    setConsent(Boolean(config));
    if (result.ok) setAnswer(result.answer);
    else setFailure(result.error);
  }

  async function runExplain() {
    // Error explanations are also browser-to-provider requests. Keep them
    // behind the same explicit consent gate as input analysis so unchecking
    // the disclosure checkbox reliably prevents *all* outbound requests.
    if (!config || !consent || !error) return;
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
              Allow AI to analyze this tool&apos;s context, operation, input, and
              local error (up to 1200 characters){destination ? ` with ${destination}` : ""}.
              Nothing is sent until you click Analyze.
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
              {pending === "assist" ? "Analyzing…" : "Analyze this input"}
            </button>
            <button
              type="button"
              onClick={runExplain}
              disabled={!consent || !error || Boolean(pending)}
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
