// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ScrollProgress } from "../scroll-progress";

describe("ScrollProgress", () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, "scrollTop", { value: 0, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 1000, writable: true, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 500, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly with initial 0 progress", () => {
    render(<ScrollProgress />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");

    // Test the fill element's transform
    // The fill is a child element, let's find it.
    // It has className="scroll-progress-fill", but testing library encourages testing by role/text.
    // We can just verify it renders without crashing.
  });

  it("calculates 50% scroll progress correctly", () => {
    window.scrollY = 250; // (1000 - 500) = 500 scrollable area. 250 / 500 = 0.5
    render(<ScrollProgress />);

    // Initial update is called on mount
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
  });

  it("calculates 100% scroll progress correctly", () => {
    window.scrollY = 500; // 500 / 500 = 1.0
    render(<ScrollProgress />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
  });

  it("updates progress when scrolling", () => {
    window.scrollY = 0;
    render(<ScrollProgress />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");

    // Change scrollY and fire scroll event
    window.scrollY = 250;
    fireEvent.scroll(window);

    expect(progressbar).toHaveAttribute("aria-valuenow", "50");
  });

  it("handles edge case where scrollHeight === clientHeight gracefully", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 500, configurable: true });
    window.scrollY = 100; // Should not crash, and should cap at 0

    render(<ScrollProgress />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
  });

  it("adds and removes event listeners on mount and unmount", () => {
    const { unmount } = render(<ScrollProgress />);

    expect(addEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
    expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function), { passive: true });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
