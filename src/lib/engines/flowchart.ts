import { EngineResult, ensureBatchInput } from "./utils";

export type FlowchartNodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "ellipse"
  | "pill"
  | "cylinder";

export interface FlowchartNode {
  id: string;
  label: string;
  shape?: FlowchartNodeShape;
  color?: string;
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  style?: "solid" | "dashed";
}

export interface FlowchartData {
  title?: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface PositionedNode extends FlowchartNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionedEdge extends FlowchartEdge {
  fromNode: PositionedNode;
  toNode: PositionedNode;
}

export interface LayoutedFlowchart {
  title?: string;
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  bounds: { width: number; height: number; minX: number; minY: number };
}

export const FLOWCHART_TEMPLATES: Record<string, FlowchartData> = {
  "simple-process": {
    title: "Simple User Sign-Up Flow",
    nodes: [
      { id: "start", label: "User visits sign-up page", shape: "pill", color: "#3b82f6" },
      { id: "input", label: "Enter email & password", shape: "rectangle" },
      { id: "check", label: "Is email valid?", shape: "diamond", color: "#eab308" },
      { id: "create", label: "Create account in DB", shape: "rectangle" },
      { id: "error", label: "Show error message", shape: "rectangle", color: "#ef4444" },
      { id: "done", label: "Redirect to Dashboard", shape: "pill", color: "#22c55e" },
    ],
    edges: [
      { from: "start", to: "input" },
      { from: "input", to: "check" },
      { from: "check", to: "create", label: "Yes" },
      { from: "check", to: "error", label: "No" },
      { from: "error", to: "input", style: "dashed" },
      { from: "create", to: "done" },
    ],
  },
  "decision-tree": {
    title: "Incident Triage Decision Tree",
    nodes: [
      { id: "alert", label: "Alert Triggered", shape: "pill", color: "#a855f7" },
      { id: "sev", label: "Is High Severity?", shape: "diamond", color: "#eab308" },
      { id: "pager", label: "Page On-Call Engineer", shape: "rectangle", color: "#ef4444" },
      { id: "log", label: "Log ticket in backlog", shape: "rectangle" },
      { id: "ack", label: "Engineer Acknowledged?", shape: "diamond", color: "#eab308" },
      { id: "resolve", label: "Investigate & Resolve", shape: "rectangle", color: "#22c55e" },
      { id: "escalate", label: "Escalate to Team Lead", shape: "rectangle", color: "#f97316" },
    ],
    edges: [
      { from: "alert", to: "sev" },
      { from: "sev", to: "pager", label: "Yes" },
      { from: "sev", to: "log", label: "No" },
      { from: "pager", to: "ack" },
      { from: "ack", to: "resolve", label: "Yes (< 15m)" },
      { from: "ack", to: "escalate", label: "No response" },
    ],
  },
  "system-architecture": {
    title: "Web Request Flow Architecture",
    nodes: [
      { id: "client", label: "Client Browser", shape: "ellipse", color: "#3b82f6" },
      { id: "cdn", label: "Cloudflare CDN", shape: "rectangle" },
      { id: "lb", label: "Load Balancer", shape: "diamond", color: "#06b6d4" },
      { id: "app1", label: "App Server A", shape: "rectangle" },
      { id: "app2", label: "App Server B", shape: "rectangle" },
      { id: "db", label: "Primary Database", shape: "cylinder", color: "#a855f7" },
    ],
    edges: [
      { from: "client", to: "cdn", label: "HTTPS Request" },
      { from: "cdn", to: "lb", label: "Origin Fetch" },
      { from: "lb", to: "app1", label: "Route A" },
      { from: "lb", to: "app2", label: "Route B" },
      { from: "app1", to: "db", label: "Query" },
      { from: "app2", to: "db", label: "Query" },
    ],
  },
};

export function parseAndLayoutFlowchart(input: string): {
  layout: LayoutedFlowchart;
  result: EngineResult;
} {
  const rawInput = ensureBatchInput(input, "Enter a JSON flowchart object.");

  let data: FlowchartData;
  try {
    data = JSON.parse(rawInput);
  } catch {
    throw new Error("Invalid JSON: Please enter a valid JSON object with 'nodes' and 'edges'.");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Invalid JSON structure: Expected a root object.");
  }

  if (!Array.isArray(data.nodes) || data.nodes.length === 0) {
    throw new Error("Invalid flowchart: 'nodes' must be a non-empty array.");
  }

  if (!Array.isArray(data.edges)) {
    data.edges = [];
  }

  // Sanitize and validate nodes
  const nodeMap = new Map<string, FlowchartNode>();
  for (const rawNode of data.nodes) {
    if (!rawNode || typeof rawNode.id !== "string" || !rawNode.id.trim()) {
      throw new Error("Each node must have a non-empty string 'id'.");
    }
    const node: FlowchartNode = {
      id: rawNode.id.trim(),
      label: typeof rawNode.label === "string" && rawNode.label.trim() ? rawNode.label.trim() : rawNode.id,
      shape: ["rectangle", "diamond", "circle", "ellipse", "pill", "cylinder"].includes(
        rawNode.shape as string,
      )
        ? rawNode.shape
        : "rectangle",
      color: typeof rawNode.color === "string" ? rawNode.color : undefined,
    };
    nodeMap.set(node.id, node);
  }

  // Calculate in-degree and graph adjacency
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of nodeMap.keys()) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  const validEdges: FlowchartEdge[] = [];
  for (const rawEdge of data.edges) {
    if (
      rawEdge &&
      typeof rawEdge.from === "string" &&
      typeof rawEdge.to === "string" &&
      nodeMap.has(rawEdge.from.trim()) &&
      nodeMap.has(rawEdge.to.trim())
    ) {
      const from = rawEdge.from.trim();
      const to = rawEdge.to.trim();
      validEdges.push({
        from,
        to,
        label: typeof rawEdge.label === "string" ? rawEdge.label : undefined,
        style: rawEdge.style === "dashed" ? "dashed" : "solid",
      });
      adj.get(from)?.push(to);
      inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
    }
  }

  // Compute layers using BFS / Topological sorting
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  // Find root nodes (inDegree === 0)
  let roots = Array.from(nodeMap.keys()).filter((id) => inDegree.get(id) === 0);
  if (roots.length === 0) {
    roots = [Array.from(nodeMap.keys())[0]];
  }

  const queue: { id: string; level: number }[] = roots.map((id) => ({ id, level: 0 }));
  for (const root of roots) {
    levels.set(root, 0);
    visited.add(root);
  }

  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const neighbors = adj.get(id) ?? [];
    for (const neighbor of neighbors) {
      const currentLevel = levels.get(neighbor) ?? 0;
      const nextLevel = Math.max(currentLevel, level + 1);
      levels.set(neighbor, nextLevel);
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ id: neighbor, level: nextLevel });
      }
    }
  }

  // Handle any disconnected nodes not reached by BFS
  for (const id of nodeMap.keys()) {
    if (!levels.has(id)) {
      levels.set(id, 0);
    }
  }

  // Group nodes by level
  const levelGroups = new Map<number, FlowchartNode[]>();
  for (const [id, node] of nodeMap.entries()) {
    const lvl = levels.get(id) ?? 0;
    if (!levelGroups.has(lvl)) {
      levelGroups.set(lvl, []);
    }
    levelGroups.get(lvl)!.push(node);
  }

  // Calculate layout coordinates
  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 60;
  const SPACING_X = 220;
  const SPACING_Y = 120;
  const START_X = 100;
  const START_Y = 80;

  const positionedNodesMap = new Map<string, PositionedNode>();

  let maxLayerX = START_X;
  let maxLayerY = START_Y;

  const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);

  for (const lvl of sortedLevels) {
    const group = levelGroups.get(lvl)!;
    const y = START_Y + lvl * SPACING_Y;
    const levelWidth = group.length * SPACING_X;
    const startXForLevel = Math.max(START_X, (800 - levelWidth) / 2 + SPACING_X / 2);

    for (let i = 0; i < group.length; i++) {
      const node = group[i];
      const x = startXForLevel + i * SPACING_X;

      const pNode: PositionedNode = {
        ...node,
        x,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
      };

      positionedNodesMap.set(node.id, pNode);

      if (x + NODE_WIDTH > maxLayerX) maxLayerX = x + NODE_WIDTH;
      if (y + NODE_HEIGHT > maxLayerY) maxLayerY = y + NODE_HEIGHT;
    }
  }

  const positionedNodes = Array.from(positionedNodesMap.values());
  const positionedEdges: PositionedEdge[] = validEdges
    .map((edge) => {
      const fromNode = positionedNodesMap.get(edge.from);
      const toNode = positionedNodesMap.get(edge.to);
      if (!fromNode || !toNode) return null;
      return {
        ...edge,
        fromNode,
        toNode,
      };
    })
    .filter((e): e is PositionedEdge => e !== null);

  const layout: LayoutedFlowchart = {
    title: data.title,
    nodes: positionedNodes,
    edges: positionedEdges,
    bounds: {
      width: Math.max(800, maxLayerX + 100),
      height: Math.max(500, maxLayerY + 100),
      minX: 0,
      minY: 0,
    },
  };

  const outputFormatted = JSON.stringify(data, null, 2);
  const meta = `Flowchart loaded — ${positionedNodes.length} nodes, ${positionedEdges.length} edges`;

  return {
    layout,
    result: { output: outputFormatted, meta },
  };
}
