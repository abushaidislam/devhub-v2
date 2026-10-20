"use client";

import React, { useRef, useState } from "react";
import { Download, Upload, FileJson, ZoomIn, ZoomOut, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LayoutedFlowchart, PositionedNode, PositionedEdge } from "@/lib/engines/flowchart";
import styles from "./flowchart-editor.module.css";

interface FlowchartEditorProps {
  layout: LayoutedFlowchart;
  onImportJson: (jsonString: string) => void;
  onSelectTemplate: (templateKey: string) => void;
  rawJson: string;
}

export function FlowchartEditorView({
  layout,
  onImportJson,
  onSelectTemplate,
  rawJson,
}: FlowchartEditorProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedNode = layout.nodes.find((n) => n.id === selectedNodeId);

  // Find edges related to selected node
  const connectedEdges = layout.edges.filter(
    (e) => e.from === selectedNodeId || e.to === selectedNodeId,
  );

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        onImportJson(content);
      }
    };
    reader.readAsText(file);
    // Reset file input value so re-uploading same file triggers change
    event.target.value = "";
  }

  function exportSvg() {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(layout.title || "flowchart").toLowerCase().replace(/\s+/g, "-")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPng() {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const URLObject = window.URL || window.webkitURL || window;
    const svgUrl = URLObject.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = layout.bounds.width * 2; // 2x resolution
      canvas.height = layout.bounds.height * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = "#090d16"; // Fill background
        ctx.fillRect(0, 0, layout.bounds.width, layout.bounds.height);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${(layout.title || "flowchart").toLowerCase().replace(/\s+/g, "-")}.png`;
        a.click();
      }
      URLObject.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  }

  function exportJson() {
    const blob = new Blob([rawJson], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(layout.title || "flowchart").toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function renderNodeShape(node: PositionedNode) {
    const isSelected = node.id === selectedNodeId;
    const fillColor = node.color || "#1e293b";
    const strokeColor = isSelected ? "#3b82f6" : "#475569";
    const strokeWidth = isSelected ? 3 : 1.5;

    switch (node.shape) {
      case "diamond": {
        const cx = node.x + node.width / 2;
        const cy = node.y + node.height / 2;
        const points = `${cx},${node.y} ${node.x + node.width},${cy} ${cx},${node.y + node.height} ${node.x},${cy}`;
        return (
          <polygon
            points={points}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={4}
          />
        );
      }
      case "pill":
        return (
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={node.height / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case "circle":
      case "ellipse":
        return (
          <ellipse
            cx={node.x + node.width / 2}
            cy={node.y + node.height / 2}
            rx={node.width / 2}
            ry={node.height / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
      case "cylinder": {
        const ry = 8;
        return (
          <g>
            <rect
              x={node.x}
              y={node.y + ry}
              width={node.width}
              height={node.height - ry * 2}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <ellipse
              cx={node.x + node.width / 2}
              cy={node.y + ry}
              rx={node.width / 2}
              ry={ry}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            <ellipse
              cx={node.x + node.width / 2}
              cy={node.y + node.height - ry}
              rx={node.width / 2}
              ry={ry}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }
      case "rectangle":
      default:
        return (
          <rect
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            rx={8}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
    }
  }

  function calculateEdgePath(edge: PositionedEdge) {
    const fromX = edge.fromNode.x + edge.fromNode.width / 2;
    const fromY = edge.fromNode.y + edge.fromNode.height;
    const toX = edge.toNode.x + edge.toNode.width / 2;
    const toY = edge.toNode.y;

    // Curved bezier connection
    const deltaY = Math.abs(toY - fromY);
    const controlPointOffset = Math.max(30, deltaY * 0.4);

    if (toY >= fromY) {
      return `M ${fromX} ${fromY} C ${fromX} ${fromY + controlPointOffset}, ${toX} ${toY - controlPointOffset}, ${toX} ${toY}`;
    } else {
      // Loop or upward connection
      return `M ${fromX} ${fromY} C ${fromX + 80} ${fromY + 50}, ${toX + 80} ${toY - 50}, ${toX} ${toY}`;
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls} role="toolbar" aria-label="Flowchart Editor Toolbar">
        <div className={styles.controlsGroup}>
          <Button
            type="button"
            variant="secondary"
            size="small"
            prefix={<Upload size={14} />}
            aria-label="Upload JSON file"
            onClick={() => fileInputRef.current?.click()}
          >
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            aria-hidden="true"
          />

          <div className="selectField">
            <select
              className="select"
              aria-label="Load flowchart template preset"
              onChange={(e) => {
                if (e.target.value) onSelectTemplate(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled>
                Presets...
              </option>
              <option value="simple-process">Simple Process</option>
              <option value="decision-tree">Decision Tree</option>
              <option value="system-architecture">System Architecture</option>
            </select>
          </div>
        </div>

        <div className={styles.controlsGroup}>
          <Button
            type="button"
            variant="secondary"
            size="small"
            prefix={<ZoomIn size={14} />}
            aria-label="Zoom in flowchart"
            onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
          >
            Zoom In
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="small"
            prefix={<ZoomOut size={14} />}
            aria-label="Zoom out flowchart"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.15))}
          >
            Zoom Out
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="small"
            prefix={<RefreshCw size={14} />}
            aria-label="Reset zoom"
            onClick={() => setZoom(1)}
          >
            Reset
          </Button>
        </div>

        <div className={styles.controlsGroup}>
          <Button
            type="button"
            variant="secondary"
            size="small"
            prefix={<Download size={14} />}
            aria-label="Export flowchart as SVG"
            onClick={exportSvg}
          >
            SVG
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="small"
            prefix={<Download size={14} />}
            aria-label="Export flowchart as PNG"
            onClick={exportPng}
          >
            PNG
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="small"
            prefix={<FileJson size={14} />}
            aria-label="Export flowchart as JSON"
            onClick={exportJson}
          >
            JSON
          </Button>
        </div>
      </div>

      <div className={styles.canvasWrapper}>
        <svg
          ref={svgRef}
          className={styles.svgCanvas}
          viewBox={`0 0 ${layout.bounds.width} ${layout.bounds.height}`}
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          onClick={() => setSelectedNodeId(null)}
        >
          <defs>
            <marker
              id="flowchart-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255, 255, 255, 0.5)" />
            </marker>
            <marker
              id="flowchart-arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Render Edges */}
          {layout.edges.map((edge, idx) => {
            const isHighlighted =
              selectedNodeId === edge.from || selectedNodeId === edge.to;
            const pathData = calculateEdgePath(edge);

            const midX = (edge.fromNode.x + edge.toNode.x) / 2 + edge.fromNode.width / 2;
            const midY = (edge.fromNode.y + edge.toNode.y) / 2 + edge.fromNode.height / 2;

            return (
              <g key={`edge-${edge.from}-${edge.to}-${idx}`}>
                <path
                  d={pathData}
                  fill="none"
                  className={styles.edgeLine}
                  data-dashed={edge.style === "dashed"}
                  data-highlighted={isHighlighted}
                  markerEnd={
                    isHighlighted
                      ? "url(#flowchart-arrow-active)"
                      : "url(#flowchart-arrow)"
                  }
                />
                {edge.label && (
                  <g>
                    <rect
                      x={midX - (edge.label.length * 3.5 + 6)}
                      y={midY - 9}
                      width={edge.label.length * 7 + 12}
                      height={18}
                      className={styles.edgeLabelBg}
                    />
                    <text x={midX} y={midY} className={styles.edgeLabel}>
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {layout.nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            return (
              <g
                key={node.id}
                className={styles.nodeGroup}
                data-selected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Flowchart node: ${node.label}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedNodeId(node.id);
                  }
                }}
              >
                {renderNodeShape(node)}
                <text
                  x={node.x + node.width / 2}
                  y={node.y + node.height / 2}
                  className={styles.nodeText}
                >
                  {node.label.length > 20
                    ? `${node.label.substring(0, 18)}…`
                    : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        <div className={styles.inspector} aria-live="polite">
          {selectedNode ? (
            <div className={styles.inspectorContent}>
              <span className={styles.inspectorBadge}>Selected Node</span>
              <span className={styles.inspectorMeta}>
                ID: <strong>{selectedNode.id}</strong>
              </span>
              <span className={styles.inspectorMeta}>
                Label: <strong>{selectedNode.label}</strong>
              </span>
              <span className={styles.inspectorMeta}>
                Shape: <strong>{selectedNode.shape || "rectangle"}</strong>
              </span>
              <span className={styles.inspectorMeta}>
                Connections: <strong>{connectedEdges.length}</strong>
              </span>
            </div>
          ) : (
            <div className={styles.inspectorContent}>
              <Info size={14} />
              <span>
                Click any node in the flowchart to inspect its details and connections.
              </span>
            </div>
          )}
          <span className={styles.hint}>
            {layout.nodes.length} nodes • {layout.edges.length} edges
          </span>
        </div>
      </div>
    </div>
  );
}
