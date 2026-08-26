import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site-footer";

describe("SiteFooter", () => {
  it("renders a labelled footer navigation with functional destinations", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Footer navigation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /make the next task/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open the toolkit/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/Sayed-Saa-new/devhub-toolkit-v2",
    );
  });
});
