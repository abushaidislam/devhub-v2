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

  it("switches detected format preview when a format pill is clicked", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(<LandingBentoGrid />);

    // Default is JWT
    expect(screen.getByText("JWT Decoder")).toBeInTheDocument();
    expect(screen.getByText("99.8% match")).toBeInTheDocument();

    // Click JSON pill
    const jsonPill = screen.getByRole("tab", { name: "JSON" });
    fireEvent.click(jsonPill);

    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
    expect(screen.getByText("100% match")).toBeInTheDocument();

    // Click SQL pill
    const sqlPill = screen.getByRole("tab", { name: "SQL" });
    fireEvent.click(sqlPill);

    expect(screen.getByText("SQL Formatter")).toBeInTheDocument();
    expect(screen.getByText("99.1% match")).toBeInTheDocument();
  });

  it("copies TypeScript interface and displays Copied state", async () => {
    const { fireEvent } = await import("@testing-library/react");
    const { vi } = await import("vitest");
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<LandingBentoGrid />);

    const copyBtn = screen.getByRole("button", { name: /copy typescript interface/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining("interface UserResponse")
    );
    expect(await screen.findByText("Copied")).toBeInTheDocument();
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
