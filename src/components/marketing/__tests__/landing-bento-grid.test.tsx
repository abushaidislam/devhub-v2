import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingBentoGrid } from "@/components/marketing/landing-bento-grid";
import { LandingComparison } from "@/components/marketing/landing-comparison";

describe("LandingBentoGrid", () => {
  it("renders capabilities section with heading and all 5 capability cards", () => {
    render(<LandingBentoGrid />);

    expect(screen.getByRole("region", { name: /engineered for velocity/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /engineered for velocity/i })).toBeInTheDocument();

    // Verify 5 capability headings
    expect(screen.getByRole("heading", { name: /sub-millisecond smart routing/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /zero-egress privacy sandbox/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /composable recipe pipelines/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /live interface extraction/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /instant keyboard velocity/i })).toBeInTheDocument();

    // Verify footer explore link
    expect(screen.getByRole("link", { name: /explore all 30 local tools/i })).toHaveAttribute("href", "/tools");
  });
});

describe("LandingComparison", () => {
  it("renders architectural comparison with traditional and DevHub columns", () => {
    render(<LandingComparison />);

    expect(screen.getByRole("region", { name: /built different by definition/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /built different by definition/i })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /cloud-dependent wrappers/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /local-first workbench/i })).toBeInTheDocument();

    // Verify key architectural dimensions
    expect(screen.getByText(/100% in-browser sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/< 1ms instantaneous/i)).toBeInTheDocument();
    expect(screen.getByText(/zero network egress/i)).toBeInTheDocument();
  });
});
