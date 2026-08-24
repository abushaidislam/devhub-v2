import { describe, expect, it, vi } from "vitest";
import { buildEngineCatalog, buildPlannerUserPrompt } from "@/lib/ai/catalog";
import { parsePlannerResponse, planWorkflow } from "@/lib/ai/planner";
import { createDefaultAiConfig } from "@/lib/ai/provider-config";

const config = { ...createDefaultAiConfig("openai"), apiKey: "key" };

function reply(text: string) {
  return vi.fn(async (_input: { user: string }) => ({ ok: true as const, text }));
}

describe("workflow planner", () => {
  it("describes every engine deterministically", () => {
    const catalog = buildEngineCatalog();
    expect(catalog.length).toBeGreaterThan(0);
    for (const entry of catalog) {
      expect(entry.engineId).toBeTruthy();
      expect(entry.accepts.length).toBeGreaterThan(0);
    }
    expect(buildPlannerUserPrompt("decode a jwt")).toContain("decode a jwt");
  });

  it("parses a fenced JSON plan into a compatible workflow", () => {
    const result = parsePlannerResponse(
      '```json\n{"name":"Format JSON","description":"Pretty print","inputType":"text","steps":[{"engineId":"json-formatter"}]}\n```',
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plan.workflow.steps[0].engineId).toBe("json-formatter");
      expect(result.plan.compatibility.compatible).toBe(true);
    }
  });

  it("rejects non-JSON replies", () => {
    expect(parsePlannerResponse("I cannot help").ok).toBe(false);
  });

  it("rejects plans using unknown engines", () => {
    const result = parsePlannerResponse(
      '{"name":"x","inputType":"text","steps":[{"engineId":"not-a-tool"}]}',
    );
    expect(result.ok).toBe(false);
  });

  it("requires a goal and bounds its length", async () => {
    const request = reply("{}");
    expect(await planWorkflow({ goal: "   ", config, request })).toMatchObject({
      ok: false,
    });
    expect(
      await planWorkflow({ goal: "a".repeat(5000), config, request }),
    ).toMatchObject({ ok: false });
    expect(request).not.toHaveBeenCalled();
  });

  it("surfaces provider errors", async () => {
    const request = vi.fn(async () => ({
      ok: false as const,
      error: "rate limited",
    }));
    expect(await planWorkflow({ goal: "format json", config, request })).toEqual(
      { ok: false, error: "rate limited" },
    );
  });

  it("sends only the goal and catalog", async () => {
    const request = reply(
      '{"name":"Format","inputType":"text","steps":[{"engineId":"json-formatter"}]}',
    );
    const result = await planWorkflow({
      goal: "pretty print json",
      config,
      request,
    });
    expect(result.ok).toBe(true);
    const sent = request.mock.calls[0]![0];
    expect(sent.user).toContain("pretty print json");
    expect(sent.user).not.toContain("apiKey");
  });
});
