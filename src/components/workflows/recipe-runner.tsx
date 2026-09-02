"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { validateWorkflowCompatibility } from "@/lib/workflows/compatibility";
import { runWorkflow, type WorkflowRunResult } from "@/lib/workflows/runner";
import type { SavedRecipe } from "@/lib/workflows/storage";
import styles from "./recipe-runner.module.css";

export const RECIPE_RUN_INPUT_LIMIT = 100_000;

type RunnableRecipe = Pick<
  SavedRecipe,
  "id" | "name" | "inputType" | "workflow"
>;

type RecipeRunnerPanelProps = {
  recipe: RunnableRecipe;
  runner?: typeof runWorkflow;
};

export function RecipeRunnerPanel({
  recipe,
  runner = runWorkflow,
}: RecipeRunnerPanelProps) {
  const inputId = useId();
  const controllerRef = useRef<AbortController | undefined>(undefined);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<WorkflowRunResult>();
  const preflight = useMemo(
    () => validateWorkflowCompatibility(recipe.workflow, recipe.inputType),
    [recipe.inputType, recipe.workflow],
  );

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function execute() {
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    setResult(undefined);
    setRunning(true);
    const nextResult = await runner(
      recipe.workflow,
      { type: recipe.inputType, value: input },
      { signal: controller.signal },
    );
    if (controllerRef.current === controller) {
      setResult(nextResult);
      setRunning(false);
      controllerRef.current = undefined;
    }
  }

  function cancel() {
    controllerRef.current?.abort();
  }

  return (
    <section className={styles.runner} aria-label={`Run ${recipe.name}`}>
      <div className={styles.plan}>
        <div>
          <span>Compatibility</span>
          <strong data-compatible={preflight.compatible}>
            {preflight.compatible ? "Ready" : "Invalid"}
          </strong>
        </div>
        <ol aria-label="Workflow processing plan">
          {preflight.steps.map((step) => (
            <li key={`${step.stepIndex}-${step.engineId}`}>
              <code>{step.engineId}</code>
              <span>{step.inputType} → {step.produces}</span>
              <em data-boundary={step.processingBoundary}>
                {step.processingBoundary}
              </em>
            </li>
          ))}
        </ol>
      </div>

      {!preflight.compatible && (
        <p className={styles.invalid} role="alert">
          This saved definition is no longer compatible and cannot run.
        </p>
      )}

      <label className={styles.inputLabel} htmlFor={inputId}>
        <span>Runtime input · {recipe.inputType}</span>
        <small>{input.length.toLocaleString()}/{RECIPE_RUN_INPUT_LIMIT.toLocaleString()}</small>
      </label>
      <textarea
        id={inputId}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        maxLength={RECIPE_RUN_INPUT_LIMIT}
        placeholder="Enter input for this run"
        disabled={running}
      />
      <p className={styles.disclosure}>
        Input, step results, and output stay in memory and are cleared when this panel closes.
      </p>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.run}
          onClick={() => void execute()}
          disabled={!preflight.compatible || !input.length || running}
        >
          <Play size={14} />Run workflow
        </button>
        {running && (
          <button type="button" onClick={cancel}>
            <Square size={13} />Cancel
          </button>
        )}
      </div>

      {running && <p className={styles.status} role="status">Running steps locally…</p>}
      {result?.status === "cancelled" && (
        <p className={styles.status} role="status">Run cancelled.</p>
      )}
      {result?.status === "failed" && (
        <p className={styles.failure} role="alert">
          {result.error?.message ?? "Workflow failed."}
        </p>
      )}
      {result?.status === "invalid" && (
        <p className={styles.failure} role="alert">Workflow validation failed.</p>
      )}
      {result?.status === "completed" && result.output && (
        <div className={styles.result}>
          <header>
            <strong>Output</strong>
            <span>{result.steps.length} steps · {Math.round(result.durationMs)} ms</span>
          </header>
          <pre>{result.output.value}</pre>
          {result.steps.some((step) => step.warnings.length) && (
            <ul>
              {result.steps.flatMap((step) =>
                step.warnings.map((warning) => (
                  <li key={`${step.stepIndex}-${warning}`}>{warning}</li>
                )),
              )}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
