import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ThemeToggle } from "../theme-toggle";
import * as useThemeHook from "@/lib/use-theme";

// Mock the lucide-react icons since we just need to verify they render
vi.mock("lucide-react", () => ({
  Moon: () => <div data-testid="moon-icon" />,
  Sun: () => <div data-testid="sun-icon" />,
}));

describe("ThemeToggle", () => {
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.spyOn(useThemeHook, "useTheme").mockReturnValue({
      theme: "light",
      preference: "system",
      setThemePreference: vi.fn(),
      toggleTheme: mockToggleTheme,
      isDark: false,
    });
  });

  it("renders with light theme correctly", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");

    // Moon icon should be rendered for light theme (indicating switch to dark)
    expect(screen.getByTestId("moon-icon")).toBeInTheDocument();
  });

  it("renders with dark theme correctly", () => {
    vi.spyOn(useThemeHook, "useTheme").mockReturnValue({
      theme: "dark",
      preference: "system",
      setThemePreference: vi.fn(),
      toggleTheme: mockToggleTheme,
      isDark: true,
    });

    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Switch to light theme" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");

    // Sun icon should be rendered for dark theme (indicating switch to light)
    expect(screen.getByTestId("sun-icon")).toBeInTheDocument();
  });

  it("calls toggleTheme when clicked", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("applies custom className and size props", () => {
    const { container } = render(<ThemeToggle className="custom-class" size="tiny" />);

    const button = screen.getByRole("button");
    // Depending on how Button component is implemented, it might append these classes
    // We check if the custom class is present
    expect(button.className).toContain("custom-class");
  });
});
