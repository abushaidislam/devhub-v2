import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingComparison } from "@/components/marketing/landing-comparison";

describe("LandingComparison", () => {
  it("renders the section with correct header content", () => {
    render(<LandingComparison />);

    // Check eyebrow
    expect(screen.getByText("Architectural Philosophy")).toBeInTheDocument();

    // Check main title
    const title = screen.getByRole("heading", { name: "Built different by definition." });
    expect(title).toBeInTheDocument();
    expect(title).toHaveAttribute("id", "comparison-title");

    // Check subtitle
    expect(screen.getByText(/Most online developer utilities are ad-heavy wrappers/i)).toBeInTheDocument();

    // Verify the section uses the title for aria-labelledby
    const section = screen.getByRole("region", { name: "Built different by definition." });
    expect(section).toHaveAttribute("aria-labelledby", "comparison-title");
  });

  it("renders the Traditional Web Utilities column with all items", () => {
    render(<LandingComparison />);

    // Column header
    expect(screen.getByText("Traditional Web Utilities")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cloud-Dependent Wrappers" })).toBeInTheDocument();

    // Check a few dimensions and corresponding traditional titles/descriptions
    // Since dimensions appear in both columns, we use getAllByText
    expect(screen.getAllByText("Execution Boundary").length).toBeGreaterThan(0);
    expect(screen.getByText("Remote Cloud Servers")).toBeInTheDocument();
    expect(screen.getByText(/Data leaves your device and processes on third-party servers/i)).toBeInTheDocument();

    expect(screen.getAllByText("Performance & Latency").length).toBeGreaterThan(0);
    expect(screen.getByText("500ms – 2,000ms Overhead")).toBeInTheDocument();

    expect(screen.getByText("Requires Internet")).toBeInTheDocument();
  });

  it("renders the DevHub Toolkit column with all items", () => {
    render(<LandingComparison />);

    // Column header
    expect(screen.getByText("DevHub Toolkit")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Local-First Workbench" })).toBeInTheDocument();

    // Check a few DevHub titles/descriptions
    expect(screen.getByText("100% In-Browser Sandbox")).toBeInTheDocument();
    expect(screen.getByText(/Deterministic execution in your browser's V8 engine/i)).toBeInTheDocument();

    expect(screen.getByText("< 1ms Instantaneous")).toBeInTheDocument();
    expect(screen.getByText("True Offline PWA")).toBeInTheDocument();
  });
});
