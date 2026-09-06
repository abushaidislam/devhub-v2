import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingCtaSection } from "@/components/marketing/landing-cta-section";
import { categories, tools } from "@/lib/tools";

const readyTools = tools.filter((tool) => tool.status === "ready").length;

describe("LandingCtaSection", () => {
  it("renders the main heading and subtitle", () => {
    render(<LandingCtaSection />);
    expect(screen.getByRole("heading", { name: /Build with velocity./i })).toBeInTheDocument();
    expect(screen.getByText(/Stop stitching together ad-heavy/i)).toBeInTheDocument();
  });

  it("renders the Quick Launch Bar with all tools", () => {
    render(<LandingCtaSection />);
    expect(screen.getByText("Instant Tool Launcher")).toBeInTheDocument();

    const quickLaunchTools = [
      "JSON Formatter",
      "JWT Decoder",
      "Base64 Converter",
      "Cron Parser",
      "SQL Formatter",
      "UUID Generator",
    ];

    quickLaunchTools.forEach((toolName) => {
      expect(screen.getByText(toolName)).toBeInTheDocument();
    });
  });

  it("renders action buttons with correct dynamic tool count", () => {
    render(<LandingCtaSection />);
    expect(screen.getByRole("link", { name: new RegExp(`Browse all ${tools.length} tools`, "i") })).toHaveAttribute("href", "/tools");
    expect(screen.getByRole("link", { name: /Open workspace/i })).toHaveAttribute("href", "/dashboard");
  });

  it("renders the product facts with correct dynamic counts", () => {
    render(<LandingCtaSection />);
    expect(screen.getByText(`${readyTools} ready tools`)).toBeInTheDocument();
    expect(screen.getByText("100% In-Browser Execution")).toBeInTheDocument();
    expect(screen.getByText(`${categories.length} focused categories`)).toBeInTheDocument();
  });
});
