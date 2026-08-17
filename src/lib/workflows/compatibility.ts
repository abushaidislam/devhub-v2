import { getEngine } from "../engine-registry";
import type { ToolEngine, ToolValueType } from "../engine-types";
import type { Workflow } from "./types";
import {
  validateWorkflowSchema,
  type WorkflowValidationIssue,
} from "./validator";

const TOOL_VALUE_TYPES: readonly ToolValueType[] = [
  "text",
  "json",
  "binary",
  "image",
];

export type WorkflowStepCompatibility = {
  stepIndex: number;
  engineId: string;
  inputType: ToolValueType;
  accepts: ToolValueType[];
  produces: ToolValueType;
  processingBoundary: ToolEngine["sensitivity"];
  compatible: boolean;
};

export type WorkflowCompatibilityIssue =
  | WorkflowValidationIssue
  | {
      code: "invalid_initial_input";
      path: "$.initialInputType";
      message: string;
    }
  | {
      code: "incompatible_input";
      path: string;
      message: string;
      stepIndex: number;
      engineId: string;
      actualType: ToolValueType;
      acceptedTypes: ToolValueType[];
    };

export type WorkflowCompatibilityResult = {
  compatible: boolean;
  workflow?: Workflow;
  initialInputType?: ToolValueType;
  finalOutputType?: ToolValueType;
  steps: WorkflowStepCompatibility[];
  issues: WorkflowCompatibilityIssue[];
};

function isToolValueType(value: unknown): value is ToolValueType {
  return TOOL_VALUE_TYPES.includes(value as ToolValueType);
}

/**
 * Build a local execution compatibility plan without running any engine.
 *
 * The schema is validated first. Each step then reports its incoming type,
 * accepted and produced types, processing boundary, and compatibility. A type
 * mismatch does not stop analysis, so callers receive diagnostics for the full
 * declared chain.
 */
export function validateWorkflowCompatibility(
  value: unknown,
  initialInputType: unknown,
): WorkflowCompatibilityResult {
  const schema = validateWorkflowSchema(value);
  if (!schema.valid) {
    return {
      compatible: false,
      steps: [],
      issues: schema.issues,
    };
  }

  if (!isToolValueType(initialInputType)) {
    return {
      compatible: false,
      workflow: schema.workflow,
      steps: [],
      issues: [
        {
          code: "invalid_initial_input",
          path: "$.initialInputType",
          message: `Initial input type must be one of: ${TOOL_VALUE_TYPES.join(", ")}.`,
        },
      ],
    };
  }

  const issues: WorkflowCompatibilityIssue[] = [];
  const steps: WorkflowStepCompatibility[] = [];
  let currentType = initialInputType;

  for (const [stepIndex, step] of schema.workflow.steps.entries()) {
    const engine = getEngine(step.engineId)!;
    const compatible = engine.accepts.includes(currentType);
    const accepts = [...engine.accepts];

    steps.push({
      stepIndex,
      engineId: engine.id,
      inputType: currentType,
      accepts,
      produces: engine.produces,
      processingBoundary: engine.sensitivity,
      compatible,
    });

    if (!compatible) {
      issues.push({
        code: "incompatible_input",
        path: `$.steps[${stepIndex}].engineId`,
        message: `${engine.id} does not accept ${currentType} input.`,
        stepIndex,
        engineId: engine.id,
        actualType: currentType,
        acceptedTypes: accepts,
      });
    }

    currentType = engine.produces;
  }

  return {
    compatible: issues.length === 0,
    workflow: schema.workflow,
    initialInputType,
    finalOutputType: currentType,
    steps,
    issues,
  };
}
