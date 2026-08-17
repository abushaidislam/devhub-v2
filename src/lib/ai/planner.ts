/**
 * Natural-language workflow planning (Phase 3, BYOK).
 *
 * The model only proposes a workflow definition. Nothing is executed here: the
 * proposal is validated against the local engine registry and compatibility
 * rules, and the user must run or save it explicitly.
 */
import { validateWorkflowCompatibility } from "../workflows/compatibility";
import type { WorkflowCompatibilityResult } from "../workflows/compatibility";
import {
  SAVED_RECIPE_DESCRIPTION_LIMIT,
  SAVED_RECIPE_NAME_LIMIT,
} from "../workflows/storage";
import { WORKFLOW_SCHEMA_VERSION, type Workflow } from "../workflows/types";
import type { ToolValueType } from "../engine-types";
import { buildPlannerUserPrompt, PLANNER_SYSTEM_PROMPT } from "./catalog";
import { requestCompletion, type AiResponse } from "./client";
import { AI_GOAL_LIMIT, type AiProviderConfig } from "./provider-config";

export type PlannedWorkflow = {
  name: string;
  description: string;
  inputType: ToolValueType;
  workflow: Workflow;
  compatibility: WorkflowCompatibilityResult;
};

export type PlannerResult =
  | { ok: true; plan: PlannedWorkflow }
  | { ok: false; error: string };

function extractJsonObject(text: string): unknown {
  const fenced = text.replace(/```(?:json)?/gi, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  try {
    return JSON.parse(fenced.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

/** Validate a raw model reply into a runnable, compatible workflow proposal. */
export function parsePlannerResponse(text: string): PlannerResult {
  const parsed = extractJsonObject(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      error: "The model did not return a workflow object. Try rewording the goal.",
    };
  }

  const candidate = parsed as Record<string, unknown>;
  const rawSteps = candidate.steps;
  if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
    return { ok: false, error: "The proposed plan contained no steps." };
  }

  const steps = rawSteps.map((step) => {
    const entry = (step ?? {}) as Record<string, unknown>;
    const options = entry.options;
    return {
      engineId: typeof entry.engineId === "string" ? entry.engineId : "",
      ...(options && typeof options === "object" && !Array.isArray(options)
        ? { options: options as Workflow["steps"][number]["options"] }
        : {}),
    };
  });

  const workflow: Workflow = { version: WORKFLOW_SCHEMA_VERSION, steps };
  const inputType =
    typeof candidate.inputType === "string" ? candidate.inputType : "text";
  const compatibility = validateWorkflowCompatibility(workflow, inputType);

  if (!compatibility.compatible || !compatibility.initialInputType) {
    const issue = compatibility.issues[0]?.message;
    return {
      ok: false,
      error: issue
        ? `The proposed plan is not runnable: ${issue}`
        : "The proposed plan is not runnable in this browser.",
    };
  }

  const name =
    typeof candidate.name === "string" && candidate.name.trim()
      ? candidate.name.trim().slice(0, SAVED_RECIPE_NAME_LIMIT)
      : "Planned workflow";
  const description =
    typeof candidate.description === "string"
      ? candidate.description.trim().slice(0, SAVED_RECIPE_DESCRIPTION_LIMIT)
      : "";

  return {
    ok: true,
    plan: {
      name,
      description,
      inputType: compatibility.initialInputType,
      workflow: compatibility.workflow ?? workflow,
      compatibility,
    },
  };
}

export type PlanWorkflowInput = {
  goal: string;
  config: AiProviderConfig;
  signal?: AbortSignal;
  /** Injected for tests. */
  request?: (input: {
    config: AiProviderConfig;
    system: string;
    user: string;
    signal?: AbortSignal;
  }) => Promise<AiResponse>;
};

export async function planWorkflow({
  goal,
  config,
  signal,
  request = requestCompletion,
}: PlanWorkflowInput): Promise<PlannerResult> {
  const trimmed = goal.trim();
  if (!trimmed) {
    return { ok: false, error: "Describe the goal before planning." };
  }
  if (trimmed.length > AI_GOAL_LIMIT) {
    return {
      ok: false,
      error: `Keep the goal under ${AI_GOAL_LIMIT} characters.`,
    };
  }

  const response = await request({
    config,
    system: PLANNER_SYSTEM_PROMPT,
    user: buildPlannerUserPrompt(trimmed),
    signal,
  });
  if (!response.ok) return { ok: false, error: response.error };
  return parsePlannerResponse(response.text);
}
