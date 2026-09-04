import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroWorkbench } from "@/components/marketing/hero-workbench";

describe("HeroWorkbench", () => {
  it("renders interactive workbench with Overview tab by default displaying the marketing image", () => {
    render(<HeroWorkbench />);

    // Verify all 5 tabs are present
    expect(screen.getByRole("tab", { name: "✦ Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "JWT Token" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "JSON ➔ TypeScript" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Base64 String" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Cron Parser" })).toBeInTheDocument();

    // Default tab is Overview
    expect(screen.getByRole("tab", { name: "✦ Overview" })).toHaveAttribute("aria-selected", "true");

    // Marketing image is present
    const image = screen.getByRole("img", {
      name: /devhub toolkit multi-device workspace/i,
    });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", expect.stringContaining("Markiting%20image%20.png"));

    // Verify bottom command link
    expect(screen.getByRole("link", { name: /search all 30 local developer tools/i })).toHaveAttribute("href", "/tools");
  });

  it("switches to interactive sandbox when 'Try live sandbox' button is clicked", () => {
    render(<HeroWorkbench />);

    const trySandboxBtn = screen.getByRole("button", { name: /switch to interactive code sandbox/i });
    fireEvent.click(trySandboxBtn);

    expect(screen.getByRole("tab", { name: "JWT Token" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("JWT Decoder")).toBeInTheDocument();
    expect(screen.getByText("99.8%")).toBeInTheDocument();
  });

  it("switches tabs and updates code content when an interactive tab is clicked", () => {
    render(<HeroWorkbench />);

    const jsonTab = screen.getByRole("tab", { name: "JSON ➔ TypeScript" });
    fireEvent.click(jsonTab);

    expect(jsonTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("JSON to TypeScript")).toBeInTheDocument();
    expect(screen.getByText("98.5%")).toBeInTheDocument();
    expect(screen.getByText(/export interface ApiGatewayResponse/i)).toBeInTheDocument();
  });

  it("handles copy button click and shows temporary copied state in sandbox view", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<HeroWorkbench />);

    // Switch to JWT tab first
    const jwtTab = screen.getByRole("tab", { name: "JWT Token" });
    fireEvent.click(jwtTab);

    const copyBtn = screen.getByRole("button", { name: /copy output to clipboard/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });
});

