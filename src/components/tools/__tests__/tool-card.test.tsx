import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolCard } from "@/components/tools/tool-card";
import { ArrowUpRight } from "lucide-react";
import type { Tool } from "@/lib/tools";

const mockReadyTool: Tool = {
  slug: "test-tool",
  name: "Test Tool",
  description: "This is a test tool description.",
  category: "Testing",
  icon: ArrowUpRight,
  status: "ready",
  metaDescription: "Test meta",
  seoSummary: "Test seo summary",
  seoPoints: ["Point 1", "Point 2"],
};

const mockSoonTool: Tool = {
  ...mockReadyTool,
  slug: "soon-tool",
  name: "Soon Tool",
  status: "soon",
};

describe("ToolCard", () => {
  it("renders the basic tool information correctly", () => {
    render(<ToolCard tool={mockReadyTool} />);

    // Check link href
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tools/test-tool");

    // Check text content
    expect(screen.getByRole("heading", { level: 3, name: "Test Tool" })).toBeInTheDocument();
    expect(screen.getByText("This is a test tool description.")).toBeInTheDocument();
    expect(screen.getByText("Testing")).toBeInTheDocument();
  });

  it("does not render the 'Soon' badge when status is 'ready'", () => {
    render(<ToolCard tool={mockReadyTool} />);
    expect(screen.queryByText("Soon")).not.toBeInTheDocument();
  });

  it("renders the 'Soon' badge when status is 'soon'", () => {
    render(<ToolCard tool={mockSoonTool} />);
    const badge = screen.getByText("Soon");
    expect(badge).toBeInTheDocument();
    expect(badge.tagName.toLowerCase()).toBe("span");
  });
});
