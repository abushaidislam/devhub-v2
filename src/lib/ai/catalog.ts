/**
 * Engine catalog and prompt construction for the BYOK workflow planner.
 *
 * Only engine identities, type contracts, and option shapes are described to a
 * model. Tool input, tool output, favorites, history, and saved recipes are
 * never included.
 */
import { engines } from "../engine-registry";
import { tools } from "../tools";
import { AI_ERROR_MESSAGE_LIMIT, AI_GOAL_LIMIT } from "./provider-config";

export type EngineCatalogEntry = {
  engineId: string;
  name: string;
  purpose: string;
  accepts: string[];
  produces: string;
  options?: string;
};

const OPTION_HINTS: Record<string, string> = {
  base64: '{ "mode": "encode" | "decode" }',
  "url-encoder": '{ "mode": "encode" | "decode" }',
  "hash-generator": '{ "algorithm": "SHA-1" | "SHA-256" | "SHA-512" }',
  "regex-tester": '{ "pattern": string, "flags": string }',
};

/** Deterministic, local description of every runnable engine. */
export function buildEngineCatalog(): EngineCatalogEntry[] {
  return engines.map((engine) => {
    const tool = tools.find((item) => item.slug === engine.id);
    const hint = OPTION_HINTS[engine.id];
    return {
      engineId: engine.id,
      name: tool?.name ?? engine.id,
      purpose: tool?.description ?? engine.id,
      accepts: [...engine.accepts],
      produces: engine.produces,
      ...(hint ? { options: hint } : {}),
    };
  });
}

export const PLANNER_SYSTEM_PROMPT = [
  "You plan deterministic local tool chains for the DevHub developer toolkit.",
  "Reply with a single JSON object and nothing else. No prose, no code fences.",
  'Shape: {"name":string,"description":string,"inputType":"text"|"json"|"image","steps":[{"engineId":string,"options"?:object}]}',
  "Rules:",
  "- Use only engineId values from the provided catalog.",
  "- Each step must accept the value type produced by the previous step; the first step must accept inputType.",
  "- Use at most 6 steps and prefer the shortest chain that satisfies the goal.",
  "- Include options only when the catalog lists an options shape for that engine.",
  "- name is at most 80 characters, description at most 240 characters.",
].join("\n");

export function buildPlannerUserPrompt(goal: string): string {
  const catalog = buildEngineCatalog();
  return [
    "Engine catalog:",
    JSON.stringify(catalog),
    "",
    "Goal:",
    goal.slice(0, AI_GOAL_LIMIT),
  ].join("\n");
}

export const EXPLAINER_SYSTEM_PROMPT = [
  "You explain developer tool error messages.",
  "You receive a tool identifier and an error message only. You never receive the user's data.",
  "Answer in at most 4 short sentences: what the error means, and what to check next.",
  "Never ask the user to paste secrets, tokens, or private payloads.",
].join("\n");

export function buildExplainerUserPrompt(
  engineId: string,
  message: string,
): string {
  const tool = tools.find((item) => item.slug === engineId);
  return [
    `Tool: ${tool?.name ?? engineId} (${engineId})`,
    `Purpose: ${tool?.description ?? "Local developer tool."}`,
    `Error message: ${message.slice(0, AI_ERROR_MESSAGE_LIMIT)}`,
  ].join("\n");
}
