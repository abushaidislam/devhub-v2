// @vitest-environment jsdom
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlowchartEditorView } from "../flowchart-editor";
import { FLOWCHART_TEMPLATES, parseAndLayoutFlowchart } from "@/lib/engines/flowchart";

describe("FlowchartEditorView", () => {
  const rawJson = JSON.stringify(FLOWCHART_TEMPLATES["simple-process"], null, 2);
  const layout = parseAndLayoutFlowchart(rawJson).layout;

  it("renders flowchart canvas, nodes, and controls correctly", () => {
    const handleImportJson = vi.fn();
    const handleSelectTemplate = vi.fn();

    render(
      <FlowchartEditorView
        layout={layout}
        rawJson={rawJson}
        onImportJson={handleImportJson}
        onSelectTemplate={handleSelectTemplate}
      />,
    );

    expect(screen.getByRole("toolbar", { name: /flowchart editor toolbar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload json file/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /load flowchart template preset/i })).toBeInTheDocument();

    // Check node rendering
    expect(screen.getByRole("button", { name: /flowchart node: user visits sign-up page/i })).toBeInTheDocument();
  });

  it("allows selecting a node and displays inspector details", () => {
    render(
      <FlowchartEditorView
        layout={layout}
        rawJson={rawJson}
        onImportJson={vi.fn()}
        onSelectTemplate={vi.fn()}
      />,
    );

    const nodeBtn = screen.getByRole("button", { name: /flowchart node: user visits sign-up page/i });
    fireEvent.click(nodeBtn);

    expect(screen.getByText("Selected Node")).toBeInTheDocument();
    expect(screen.getByText("start")).toBeInTheDocument();
    expect(screen.getByText("User visits sign-up page")).toBeInTheDocument();
  });

  it("triggers template preset selection callback", () => {
    const handleSelectTemplate = vi.fn();

    render(
      <FlowchartEditorView
        layout={layout}
        rawJson={rawJson}
        onImportJson={vi.fn()}
        onSelectTemplate={handleSelectTemplate}
      />,
    );

    const select = screen.getByRole("combobox", { name: /load flowchart template preset/i });
    fireEvent.change(select, { target: { value: "decision-tree" } });

    expect(handleSelectTemplate).toHaveBeenCalledWith("decision-tree");
  });
});
