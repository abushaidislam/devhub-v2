import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingFeatureShowcase } from "@/components/marketing/landing-feature-showcase";

describe("LandingFeatureShowcase", () => {
  it("renders all 4 feature sections with their headings and real images", () => {
    render(<LandingFeatureShowcase />);

    // Check headings
    expect(screen.getByRole("heading", { name: /smart input detection/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /chain transformations/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /think through the work/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /pick up where you left off/i })).toBeInTheDocument();

    // Check images with their authentic alt texts
    expect(screen.getByAltText(/devhub all tools dashboard/i)).toBeInTheDocument();
    expect(screen.getByAltText(/devhub saved recipes interface/i)).toBeInTheDocument();
    expect(screen.getByAltText(/devhub ai assistant interface/i)).toBeInTheDocument();
    expect(screen.getByAltText(/devhub recent activity/i)).toBeInTheDocument();

    // Check navigation CTA links
    expect(screen.getByRole("link", { name: /launch live dashboard/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /explore saved recipes/i })).toHaveAttribute("href", "/recipes");
    expect(screen.getByRole("link", { name: /configure ai provider/i })).toHaveAttribute("href", "/assistant");
    expect(screen.getByRole("link", { name: /view recent activity/i })).toHaveAttribute("href", "/recent");
  });
});
