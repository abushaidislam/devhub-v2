import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/core/site-footer";

describe("SiteFooter", () => {
  it("renders a labelled footer navigation with functional destinations", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Footer navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /make the next task/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse all tools/i })).toHaveAttribute("href", "/tools");
    expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/abushaidislam/devhub-v2",
    );
  });
});
