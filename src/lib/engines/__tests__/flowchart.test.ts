import { describe, expect, it } from "vitest";
import { FLOWCHART_TEMPLATES, parseAndLayoutFlowchart } from "../flowchart";

describe("flowchart engine", () => {
  it("parses valid JSON flowchart and calculates layout positions", () => {
    const input = JSON.stringify(FLOWCHART_TEMPLATES["simple-process"]);
    const { layout, result } = parseAndLayoutFlowchart(input);

    expect(layout.nodes.length).toBe(6);
    expect(layout.edges.length).toBe(6);
    expect(result.meta).toContain("6 nodes");
    expect(result.meta).toContain("6 edges");

    const startNode = layout.nodes.find((n) => n.id === "start");
    expect(startNode).toBeDefined();
    expect(startNode?.x).toBeGreaterThan(0);
    expect(startNode?.y).toBeGreaterThan(0);
  });

  it("handles decision tree template", () => {
    const input = JSON.stringify(FLOWCHART_TEMPLATES["decision-tree"]);
    const { layout } = parseAndLayoutFlowchart(input);

    expect(layout.nodes.length).toBe(7);
    expect(layout.edges.length).toBe(6);
  });

  it("throws clear error on invalid JSON", () => {
    expect(() => parseAndLayoutFlowchart("{ invalid json")).toThrowError(
      "Invalid JSON: Please enter a valid JSON object",
    );
  });

  it("throws error when nodes array is missing or empty", () => {
    expect(() => parseAndLayoutFlowchart(JSON.stringify({ nodes: [] }))).toThrowError(
      "Invalid flowchart: 'nodes' must be a non-empty array",
    );
  });

  it("throws error when a node is missing an id", () => {
    expect(() =>
      parseAndLayoutFlowchart(
        JSON.stringify({
          nodes: [{ label: "Node without id" }],
        }),
      ),
    ).toThrowError("Each node must have a non-empty string 'id'");
  });
});
