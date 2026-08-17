import { getEngine } from "../engine-registry";
import type { ToolEngine } from "../engine-types";
import {
  MAX_WORKFLOW_STEPS,
  WORKFLOW_SCHEMA_VERSION,
  type JsonObject,
  type JsonValue,
  type Workflow,
} from "./types";

export type WorkflowValidationIssueCode =
  | "invalid_schema"
  | "unsupported_version"
  | "unknown_engine"
  | "incompatible_steps";

export type WorkflowValidationIssue = {
  code: WorkflowValidationIssueCode;
  path: string;
  message: string;
};

export type WorkflowValidationResult =
  | { valid: true; workflow: Workflow }
  | { valid: false; issues: WorkflowValidationIssue[] };

const MAX_JSON_DEPTH = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isJsonValue(
  value: unknown,
  seen: WeakSet<object>,
  depth = 0,
): value is JsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  if (depth >= MAX_JSON_DEPTH || typeof value !== "object") {
    return false;
  }

  if (seen.has(value)) {
    return false;
  }
  seen.add(value);

  const valid = Array.isArray(value)
    ? value.every((item) => isJsonValue(item, seen, depth + 1))
    : isRecord(value) &&
      Object.values(value).every((item) => isJsonValue(item, seen, depth + 1));

  seen.delete(value);
  return valid;
}

function addIssue(
  issues: WorkflowValidationIssue[],
  code: WorkflowValidationIssueCode,
  path: string,
  message: string,
) {
  issues.push({ code, path, message });
}

function validateOptions(
  value: unknown,
  path: string,
  issues: WorkflowValidationIssue[],
): value is JsonObject | undefined {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value) || !isJsonValue(value, new WeakSet())) {
    addIssue(
      issues,
      "invalid_schema",
      path,
      "Step options must be a JSON-serializable object.",
    );
    return false;
  }

  return true;
}

function validateCompatibility(
  engines: Array<ToolEngine | undefined>,
  issues: WorkflowValidationIssue[],
) {
  for (let index = 1; index < engines.length; index += 1) {
    const previous = engines[index - 1];
    const current = engines[index];
    if (!previous || !current || current.accepts.includes(previous.produces)) {
      continue;
    }

    addIssue(
      issues,
      "incompatible_steps",
      `$.steps[${index}].engineId`,
      `${current.id} does not accept ${previous.produces} output from ${previous.id}.`,
    );
  }
}

function validateWorkflowDefinition(
  value: unknown,
  checkCompatibility: boolean,
): WorkflowValidationResult {
  const issues: WorkflowValidationIssue[] = [];
  if (!isRecord(value)) {
    return {
      valid: false,
      issues: [
        {
          code: "invalid_schema",
          path: "$",
          message: "Workflow must be an object.",
        },
      ],
    };
  }

  if (value.version !== WORKFLOW_SCHEMA_VERSION) {
    addIssue(
      issues,
      "unsupported_version",
      "$.version",
      `Workflow version must be ${WORKFLOW_SCHEMA_VERSION}.`,
    );
  }

  if (!Array.isArray(value.steps)) {
    addIssue(
      issues,
      "invalid_schema",
      "$.steps",
      "Workflow steps must be an array.",
    );
    return { valid: false, issues };
  }

  if (value.steps.length === 0 || value.steps.length > MAX_WORKFLOW_STEPS) {
    addIssue(
      issues,
      "invalid_schema",
      "$.steps",
      `Workflow must contain between 1 and ${MAX_WORKFLOW_STEPS} steps.`,
    );
  }

  const engines: Array<ToolEngine | undefined> = [];
  for (const [index, step] of value.steps.entries()) {
    const path = `$.steps[${index}]`;
    if (!isRecord(step)) {
      addIssue(
        issues,
        "invalid_schema",
        path,
        "Each workflow step must be an object.",
      );
      engines.push(undefined);
      continue;
    }

    if (typeof step.engineId !== "string" || step.engineId.trim() === "") {
      addIssue(
        issues,
        "invalid_schema",
        `${path}.engineId`,
        "Step engineId must be a non-empty string.",
      );
      engines.push(undefined);
    } else {
      const engine = getEngine(step.engineId);
      engines.push(engine);
      if (!engine) {
        addIssue(
          issues,
          "unknown_engine",
          `${path}.engineId`,
          `Unknown workflow engine "${step.engineId}".`,
        );
      }
    }

    validateOptions(step.options, `${path}.options`, issues);
  }

  if (checkCompatibility) {
    validateCompatibility(engines, issues);
  }

  return issues.length > 0
    ? { valid: false, issues }
    : { valid: true, workflow: value as Workflow };
}

/** Validate only the versioned workflow shape and registered engine IDs. */
export function validateWorkflowSchema(value: unknown): WorkflowValidationResult {
  return validateWorkflowDefinition(value, false);
}

/**
 * Validate an unknown workflow definition without executing any engine.
 *
 * In addition to schema checks, this legacy convenience validator verifies
 * adjacent accepts/produces compatibility. Use validateWorkflowCompatibility
 * when the initial input type and structured step diagnostics are required.
 */
export function validateWorkflow(value: unknown): WorkflowValidationResult {
  return validateWorkflowDefinition(value, true);
}
