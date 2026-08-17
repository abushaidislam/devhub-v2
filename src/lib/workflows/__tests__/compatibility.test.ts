import { describe, expect, it, vi } from "vitest";
import { getEngine } from "../../engine-registry";
import { WORKFLOW_SCHEMA_VERSION, type Workflow } from "../types";
import { validateWorkflowCompatibility } from "../compatibility";

const textWorkflow: Workflow = {
  version: WORKFLOW_SCHEMA_VERSION,
  steps: [
    { engineId: "base64", options: { mode: "encode" } },
    { engineId: "url-encoder", options: { mode: "encode" } },
  ],
};

describe("validateWorkflowCompatibility", () => {
  it("returns a complete compatible execution plan", () => {
    const result = validateWorkflowCompatibility(textWorkflow, "text");

    expect(result.compatible).toBe(true);
    expect(result.initialInputType).toBe("text");
    expect(result.finalOutputType).toBe("text");
    expect(result.issues).toEqual([]);
    expect(result.steps).toEqual([
      {
        stepIndex: 0,
        engineId: "base64",
        inputType: "text",
        accepts: ["text"],
        produces: "text",
        processingBoundary: "local",
        compatible: true,
      },
      {
        stepIndex: 1,
        engineId: "url-encoder",
        inputType: "text",
        accepts: ["text"],
        produces: "text",
        processingBoundary: "local",
        compatible: true,
      },
    ]);
  });

  it("reports an incompatible initial input on the first step", () => {
    const result = validateWorkflowCompatibility(textWorkflow, "json");

    expect(result.compatible).toBe(false);
    expect(result.steps[0]).toMatchObject({
      stepIndex: 0,
      engineId: "base64",
      inputType: "json",
      compatible: false,
    });
    expect(result.issues[0]).toEqual({
      code: "incompatible_input",
      path: "$.steps[0].engineId",
      message: "base64 does not accept json input.",
      stepIndex: 0,
      engineId: "base64",
      actualType: "json",
      acceptedTypes: ["text"],
    });
  });

  it("reports adjacent mismatches with full step diagnostics", () => {
    const result = validateWorkflowCompatibility(
      {
        version: WORKFLOW_SCHEMA_VERSION,
        steps: [
          { engineId: "json-formatter" },
          { engineId: "base64" },
        ],
      },
      "text",
    );

    expect(result.compatible).toBe(false);
    expect(result.finalOutputType).toBe("text");
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]).toMatchObject({
      inputType: "text",
      produces: "json",
      compatible: true,
    });
    expect(result.steps[1]).toMatchObject({
      inputType: "json",
      produces: "text",
      compatible: false,
    });
  });

  it("exposes every engine processing boundary without executing engines", () => {
    const engine = getEngine("base64")!;
    const run = vi.spyOn(engine, "run");

    const result = validateWorkflowCompatibility(textWorkflow, "text");

    expect(result.steps.every((step) => step.processingBoundary === "local")).toBe(
      true,
    );
    expect(run).not.toHaveBeenCalled();
  });

  it("rejects unsupported initial value types", () => {
    const result = validateWorkflowCompatibility(textWorkflow, "xml");

    expect(result).toMatchObject({
      compatible: false,
      steps: [],
      issues: [
        {
          code: "invalid_initial_input",
          path: "$.initialInputType",
        },
      ],
    });
  });

  it("reuses workflow schema validation before compatibility analysis", () => {
    const result = validateWorkflowCompatibility(
      {
        version: WORKFLOW_SCHEMA_VERSION,
        steps: [{ engineId: "unknown-engine" }],
      },
      "text",
    );

    expect(result).toMatchObject({
      compatible: false,
      steps: [],
      issues: [
        {
          code: "unknown_engine",
          path: "$.steps[0].engineId",
        },
      ],
    });
  });
});
