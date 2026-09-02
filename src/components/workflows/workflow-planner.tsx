"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Save, Sparkles } from "lucide-react";
import { planWorkflow, type PlannedWorkflow } from "@/lib/ai/planner";
import {
  AI_GOAL_LIMIT,
  describeDestination,
} from "@/lib/ai/provider-config";
import { useAiConfig } from "@/lib/ai/use-ai-config";
import { useSavedRecipes } from "@/lib/workflows/use-saved-recipes";
import { tools } from "@/lib/tools";
import styles from "./workflow-planner.module.css";

export function WorkflowPlanner() {
  const fieldId = useId();
  const { config, configured } = useAiConfig();
  const { create } = useSavedRecipes();
  const [goal, setGoal] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [plan, setPlan] = useState<PlannedWorkflow>();
  const [savedId, setSavedId] = useState(false);

  const destination = config ? describeDestination(config) : undefined;
  const canSubmit =
    configured && consent && !pending && goal.trim().length > 0;

  const stepNames = useMemo(
    () =>
      plan
        ? plan.workflow.steps.map(
            (step) =>
              tools.find((tool) => tool.slug === step.engineId)?.name ??
              step.engineId,
          )
        : [],
    [plan],
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!config || !canSubmit) return;
    setPending(true);
    setError(undefined);
    setPlan(undefined);
    setSavedId(false);
    const result = await planWorkflow({ goal, config });
    setPending(false);
    setConsent(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPlan(result.plan);
  }

  async function savePlan() {
    if (!plan) return;
    const ok = await create({
      name: plan.name,
      description: plan.description,
      inputType: plan.inputType,
      workflow: plan.workflow,
    });
    setSavedId(ok);
    if (!ok) setError("The plan could not be saved to local recipe storage.");
  }

  return (
    <section className={styles.panel} aria-labelledby={`${fieldId}-title`}>
      <header>
        <span className={styles.icon}>
          <Sparkles size={16} />
        </span>
        <div>
          <h2 id={`${fieldId}-title`}>Plan a workflow from a description</h2>
          <p>
            Describe the outcome you want. Your provider proposes a chain of
            local DevHub tools; nothing runs until you save it as a recipe and
            run it yourself.
          </p>
        </div>
      </header>

      {!configured ? (
        <p className={styles.gate} role="status">
          Add your own AI provider above to enable planning. Every other DevHub
          feature keeps working without it.
        </p>
      ) : null}

      <form onSubmit={submit} className={styles.form}>
        <label htmlFor={`${fieldId}-goal`}>
          <span>Goal</span>
          <textarea
            id={`${fieldId}-goal`}
            value={goal}
            maxLength={AI_GOAL_LIMIT}
            rows={4}
            disabled={!configured}
            placeholder="Decode a JWT and pretty-print the payload"
            onChange={(event) => {
              setGoal(event.target.value);
              setSavedId(false);
            }}
          />
        </label>
        <p className={styles.counter}>
          {goal.length}/{AI_GOAL_LIMIT} characters
        </p>

        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={consent}
            disabled={!configured}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>
            Send this goal text{destination ? ` to ${destination}` : ""}. Only
            the goal above and the DevHub tool catalog leave this browser — no
            tool input, output, history, or saved recipes.
          </span>
        </label>

        <button type="submit" className={styles.primary} disabled={!canSubmit}>
          {pending ? <Loader2 className={styles.spin} size={15} /> : <Sparkles size={15} />}
          {pending ? "Planning…" : "Propose workflow"}
        </button>
      </form>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {plan ? (
        <div className={styles.result}>
          <h3>{plan.name}</h3>
          {plan.description ? <p>{plan.description}</p> : null}
          <p className={styles.meta}>
            Input type: {plan.inputType} · Steps: {plan.workflow.steps.length}
          </p>
          <ol className={styles.steps}>
            {plan.workflow.steps.map((step, index) => (
              <li key={`${step.engineId}-${index}`}>
                <strong>{stepNames[index]}</strong>
                <code>{step.engineId}</code>
                {step.options ? (
                  <span className={styles.options}>
                    {JSON.stringify(step.options)}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <div className={styles.actions}>
            <button type="button" onClick={savePlan} className={styles.primary}>
              <Save size={14} /> Save as recipe
            </button>
            {savedId ? (
              <Link href="/recipes" className={styles.link}>
                Open in Recipes to run it
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
