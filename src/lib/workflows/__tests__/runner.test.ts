import { describe, expect, it, vi } from "vitest";
import { getEngine } from "../../engine-registry";
import { WORKFLOW_SCHEMA_VERSION, type Workflow } from "../types";
import { runWorkflow } from "../runner";

const textWorkflow: Workflow = {
  version: WORKFLOW_SCHEMA_VERSION,
  steps: [
    { engineId: "base64", options: { mode: "encode" } },
    { engineId: "url-encoder", options: { mode: "encode" } },
  ],
};

describe("runWorkflow", () => {
  it("executes compatible engines sequentially and preserves typed values", async () => {
    let tick = 0;
    const result = await runWorkflow(
      textWorkflow,
      { type: "text", value: "hello" },
      { now: () => (tick += 5) },
    );

    expect(result.status).toBe("completed");
    expect(result.output).toEqual({ type: "text", value: "aGVsbG8%3D" });
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0]).toMatchObject({
      stepIndex: 0,
      engineId: "base64",
      inputType: "text",
      output: { type: "text", value: "aGVsbG8=" },
      warnings: [],
      durationMs: 5,
      processingBoundary: "local",
    });
    expect(result.steps[1]).toMatchObject({
      stepIndex: 1,
      engineId: "url-encoder",
      inputType: "text",
      output: { type: "text", value: "aGVsbG8%3D" },
      durationMs: 5,
    });
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("passes each step's serializable options to its engine", async () => {
    const result = await runWorkflow(
      {
        version: WORKFLOW_SCHEMA_VERSION,
        steps: [{ engineId: "base64", options: { mode: "decode" } }],
      },
      { type: "text", value: "RGV2SHVi" },
    );

    expect(result.status).toBe("completed");
    expect(result.output).toEqual({ type: "text", value: "DevHub" });
  });

  it("rejects an incompatible preflight without running any engine", async () => {
    const engine = getEngine("base64")!;
    const run = vi.spyOn(engine, "run");

    const result = await runWorkflow(textWorkflow, {
      type: "json",
      value: "{}",
    });

    expect(result.status).toBe("invalid");
    expect(result.preflight.compatible).toBe(false);
    expect(result.steps).toEqual([]);
    expect(run).not.toHaveBeenCalled();
  });

  it("stops at the first engine error and returns completed steps", async () => {
    const secondEngine = getEngine("url-encoder")!;
    const secondRun = vi.spyOn(secondEngine, "run");

    const result = await runWorkflow(
      {
        version: WORKFLOW_SCHEMA_VERSION,
        steps: [
          { engineId: "base64", options: { mode: "decode" } },
          { engineId: "url-encoder" },
        ],
      },
      { type: "text", value: "%%%" },
    );

    expect(result.status).toBe("failed");
    expect(result.steps).toEqual([]);
    expect(result.error).toMatchObject({
      code: "engine_error",
      stepIndex: 0,
      engineId: "base64",
    });
    expect(secondRun).not.toHaveBeenCalled();
  });

  it("cancels before execution when the signal is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const engine = getEngine("base64")!;
    const run = vi.spyOn(engine, "run");

    const result = await runWorkflow(
      textWorkflow,
      { type: "text", value: "hello" },
      { signal: controller.signal },
    );

    expect(result.status).toBe("cancelled");
    expect(result.steps).toEqual([]);
    expect(run).not.toHaveBeenCalled();
  });

  it("stops between steps when cancellation is requested", async () => {
    const controller = new AbortController();
    const firstEngine = getEngine("base64")!;
    const secondEngine = getEngine("url-encoder")!;
    vi.spyOn(firstEngine, "run").mockImplementation(async () => {
      controller.abort();
      return {
        output: { type: "text", value: "completed-first-step" },
        warnings: ["test warning"],
      };
    });
    const secondRun = vi.spyOn(secondEngine, "run");

    const result = await runWorkflow(
      textWorkflow,
      { type: "text", value: "hello" },
      { signal: controller.signal },
    );

    expect(result.status).toBe("cancelled");
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].warnings).toEqual(["test warning"]);
    expect(result.output).toEqual({
      type: "text",
      value: "completed-first-step",
    });
    expect(secondRun).not.toHaveBeenCalled();
  });

  it("fails closed when an engine violates its declared output contract", async () => {
    const engine = getEngine("base64")!;
    vi.spyOn(engine, "run").mockResolvedValue({
      output: { type: "json", value: "{}" },
    });

    const result = await runWorkflow(
      {
        version: WORKFLOW_SCHEMA_VERSION,
        steps: [{ engineId: "base64" }],
      },
      { type: "text", value: "hello" },
    );

    expect(result.status).toBe("failed");
    expect(result.error).toEqual({
      code: "engine_contract_error",
      stepIndex: 0,
      engineId: "base64",
      message:
        "base64 returned an output that does not match its declared contract.",
    });
  });
});
