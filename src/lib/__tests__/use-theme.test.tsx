// @vitest-environment jsdom
import {act, renderHook, waitFor} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {THEME_STORAGE_KEY} from "@/lib/theme";
import {useTheme} from "@/lib/use-theme";

describe("useTheme", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.removeProperty("color-scheme");
  });

  it("defaults to the system theme and applies it to the document", async () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    const {result} = renderHook(() => useTheme());

    await waitFor(() => expect(result.current.theme).toBe("dark"));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(result.current.preference).toBe("system");
  });

  it("persists an explicit light/dark preference", async () => {
    const {result} = renderHook(() => useTheme());

    await waitFor(() => expect(result.current.theme).toBeTruthy());

    act(() => result.current.setThemePreference("dark"));
    expect(result.current.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
