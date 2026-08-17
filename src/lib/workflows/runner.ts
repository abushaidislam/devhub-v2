import { getEngine } from "../engine-registry";
import type {
  ToolEngine,
  ToolResult,
  ToolValue,
  ToolValueType,
} from "../engine-types";
import {
  validateWorkflowCompatibility,
  type WorkflowCompatibilityResult,
} from "./compatibility";

export type WorkflowStepRunResult = {
  stepIndex: number;
  engineId: string;
  inputType: ToolValueType;
  output: ToolValue;
  meta?: ToolResult["meta"];
  warnings: string[];
  durationMs: number;
  processingBoundary: ToolEngine["sensitivity"];
};

export type WorkflowRunError = {
  code: "engine_error" | "engine_contract_error";
  stepIndex: number;
  engineId: string;
  message: string;
};

export type WorkflowRunResult = {
  status: "completed" | "invalid" | "failed" | "cancelled";
  preflight: WorkflowCompatibilityResult;
  steps: WorkflowStepRunResult[];
  output?: ToolValue;
  error?: WorkflowRunError;
  durationMs: number;
};

export type WorkflowRunnerOptions = {
  signal?: AbortSignal;
  /** Monotonic clock injection for deterministic tests. */
  now?: () => number;
};

function defaultNow() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function elapsed(start: number, now: () => number) {
  return Math.max(0, now() - start);
}

function copyValue(value: ToolValue): ToolValue {
  return { type: value.type, value: value.value };
}

function cancelledResult(
  preflight: WorkflowCompatibilityResult,
  steps: WorkflowStepRunResult[],
  output: ToolValue | undefined,
  startedAt: number,
  now: () => number,
): WorkflowRunResult {
  return {
    status: "cancelled",
    preflight,
    steps,
    ...(output ? { output: copyValue(output) } : {}),
    durationMs: elapsed(startedAt, now),
  };
}

/**
 * Run a compatible workflow sequentially in memory.
 *
 * The full workflow is preflighted before the first engine runs. Each output is
 * copied into the next typed input and retained only in the returned in-memory
 * result. Cancellation is cooperative between local engine calls.
 */
export async function runWorkflow(
  workflow: unknown,
  input: ToolValue,
  options: WorkflowRunnerOptions = {},
): Promise<WorkflowRunResult> {
  const now = options.now ?? defaultNow;
  const startedAt = now();
  const preflight = validateWorkflowCompatibility(workflow, input.type);

  if (!preflight.compatible || !preflight.workflow) {
    return {
      status: "invalid",
      preflight,
      steps: [],
      durationMs: elapsed(startedAt, now),
    };
  }

  const steps: WorkflowStepRunResult[] = [];
  let currentValue = copyValue(input);

  if (options.signal?.aborted) {
    return cancelledResult(preflight, steps, undefined, startedAt, now);
  }

  for (const [stepIndex, step] of preflight.workflow.steps.entries()) {
    if (options.signal?.aborted) {
      return cancelledResult(
        preflight,
        steps,
        steps.at(-1)?.output,
        startedAt,
        now,
      );
    }

    const engine = getEngine(step.engineId)!;
    const stepStartedAt = now();

    try {
      const result = await engine.run(copyValue(currentValue), step.options);
      const stepDurationMs = elapsed(stepStartedAt, now);

      if (
        result.output.type !== engine.produces ||
        typeof result.output.value !== "string"
      ) {
        return {
          status: "failed",
          preflight,
          steps,
          error: {
            code: "engine_contract_error",
            stepIndex,
            engineId: engine.id,
            message: `${engine.id} returned an output that does not match its declared contract.`,
          },
          durationMs: elapsed(startedAt, now),
        };
      }

      currentValue = copyValue(result.output);
      steps.push({
        stepIndex,
        engineId: engine.id,
        inputType: preflight.steps[stepIndex].inputType,
        output: copyValue(currentValue),
        ...(result.meta ? { meta: { ...result.meta } } : {}),
        warnings: result.warnings ? [...result.warnings] : [],
        durationMs: stepDurationMs,
        processingBoundary: engine.sensitivity,
      });

      if (options.signal?.aborted) {
        return cancelledResult(
          preflight,
          steps,
          currentValue,
          startedAt,
          now,
        );
      }
    } catch (error) {
      if (options.signal?.aborted) {
        return cancelledResult(
          preflight,
          steps,
          steps.at(-1)?.output,
          startedAt,
          now,
        );
      }

      return {
        status: "failed",
        preflight,
        steps,
        error: {
          code: "engine_error",
          stepIndex,
          engineId: engine.id,
          message:
            error instanceof Error && error.message
              ? error.message
              : "Workflow step failed.",
        },
        durationMs: elapsed(startedAt, now),
      };
    }
  }

  return {
    status: "completed",
    preflight,
    steps,
    output: copyValue(currentValue),
    durationMs: elapsed(startedAt, now),
  };
}
