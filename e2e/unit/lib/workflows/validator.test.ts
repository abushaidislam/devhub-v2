import { describe, expect, it } from "vitest";
import {
  MAX_WORKFLOW_STEPS,
  WORKFLOW_SCHEMA_VERSION,
  type Workflow,
} from "@/lib/workflows/types";
import { validateWorkflow } from "@/lib/workflows/validator";

const validWorkflow: Workflow = {
  version: WORKFLOW_SCHEMA_VERSION,
  steps: [
    { engineId: "base64", options: { mode: "encode" } },
    { engineId: "url-encoder", options: { mode: "encode" } },
  ],
};

describe("validateWorkflow", () => {
  it("accepts a versioned compatible workflow without mutating it", () => {
    const original = structuredClone(validWorkflow);
    const result = validateWorkflow(validWorkflow);

    expect(result).toEqual({ valid: true, workflow: validWorkflow });
    expect(validWorkflow).toEqual(original);
  });

  it.each([null, [], "workflow", 1])(
    "rejects a non-object workflow: %j",
    (value) => {
      const result = validateWorkflow(value);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.issues[0]).toMatchObject({
          code: "invalid_schema",
          path: "$",
        });
      }
    },
  );

  it("rejects an unsupported schema version", () => {
    const result = validateWorkflow({ ...validWorkflow, version: 2 });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: "unsupported_version",
          path: "$.version",
        }),
      );
    }
  });

  it("requires a non-empty, bounded steps array", () => {
    const empty = validateWorkflow({
      version: WORKFLOW_SCHEMA_VERSION,
      steps: [],
    });
    const oversized = validateWorkflow({
      version: WORKFLOW_SCHEMA_VERSION,
      steps: Array.from({ length: MAX_WORKFLOW_STEPS + 1 }, () => ({
        engineId: "base64",
      })),
    });

    expect(empty.valid).toBe(false);
    expect(oversized.valid).toBe(false);
  });

  it("rejects malformed and unknown engine IDs", () => {
    const result = validateWorkflow({
      version: WORKFLOW_SCHEMA_VERSION,
      steps: [{ engineId: "" }, { engineId: "not-a-real-engine" }],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.map((issue) => issue.code)).toEqual([
        "invalid_schema",
        "unknown_engine",
      ]);
    }
  });

  it("requires options to be a JSON-serializable object", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    for (const options of [
      [],
      { value: undefined },
      { value: Number.NaN },
      circular,
    ]) {
      const result = validateWorkflow({
        version: WORKFLOW_SCHEMA_VERSION,
        steps: [{ engineId: "base64", options }],
      });
      expect(result.valid).toBe(false);
    }
  });

  it("accepts nested JSON-safe options", () => {
    const result = validateWorkflow({
      version: WORKFLOW_SCHEMA_VERSION,
      steps: [
        {
          engineId: "base64",
          options: { mode: "encode", flags: [true, null, { count: 2 }] },
        },
      ],
    });

    expect(result.valid).toBe(true);
  });

  it("rejects adjacent engines with incompatible value types", () => {
    const result = validateWorkflow({
      version: WORKFLOW_SCHEMA_VERSION,
      steps: [
        { engineId: "json-formatter" },
        { engineId: "base64", options: { mode: "encode" } },
      ],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContainEqual({
        code: "incompatible_steps",
        path: "$.steps[1].engineId",
        message: "base64 does not accept json output from json-formatter.",
      });
    }
  });

  it("reports all independent issues in one pass", () => {
    const result = validateWorkflow({
      version: 99,
      steps: [
        { engineId: "json-formatter", options: "invalid" },
        { engineId: "base64" },
      ],
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.map((issue) => issue.code)).toEqual([
        "unsupported_version",
        "invalid_schema",
        "incompatible_steps",
      ]);
    }
  });
});
