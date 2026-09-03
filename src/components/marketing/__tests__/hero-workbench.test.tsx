import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroWorkbench } from "@/components/marketing/hero-workbench";

describe("HeroWorkbench", () => {
  it("renders interactive workbench with all sample tabs and default JWT view", () => {
    render(<HeroWorkbench />);

    // Verify all 4 tabs are present
    expect(screen.getByRole("tab", { name: "JWT Token" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "JSON ➔ TypeScript" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Base64 String" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Cron Parser" })).toBeInTheDocument();

    // Default tab is JWT
    expect(screen.getByRole("tab", { name: "JWT Token" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("JWT Decoder")).toBeInTheDocument();
    expect(screen.getByText("99.8%")).toBeInTheDocument();

    // Verify bottom command link
    expect(screen.getByRole("link", { name: /search all 30 local developer tools/i })).toHaveAttribute("href", "/tools");
  });

  it("switches tabs and updates code content when a different tab is clicked", () => {
    render(<HeroWorkbench />);

    const jsonTab = screen.getByRole("tab", { name: "JSON ➔ TypeScript" });
    fireEvent.click(jsonTab);

    expect(jsonTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("JSON to TypeScript")).toBeInTheDocument();
    expect(screen.getByText("98.5%")).toBeInTheDocument();
    expect(screen.getByText(/export interface ApiGatewayResponse/i)).toBeInTheDocument();
  });

  it("handles copy button click and shows temporary copied state", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<HeroWorkbench />);

    const copyBtn = screen.getByRole("button", { name: /copy output to clipboard/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });
});
