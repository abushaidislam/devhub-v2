// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  THEME_EVENT,
  THEME_STORAGE_KEY,
  writeThemePreference,
} from "@/lib/theme";

describe("theme", () => {
  beforeEach(() => {
    // Reset DOM
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.removeProperty("color-scheme");
    document.head.innerHTML = "";

    // Reset localStorage
    localStorage.clear();

    // Reset window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("resolveTheme", () => {
    it("returns explicit preferences immediately", () => {
      expect(resolveTheme("light")).toBe("light");
      expect(resolveTheme("dark")).toBe("dark");
    });

    it("returns light when window is undefined", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      expect(resolveTheme("system")).toBe("light");
      global.window = originalWindow;
    });

    it("returns dark when matchMedia matches dark", () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-color-scheme: dark)",
      }));
      expect(resolveTheme("system")).toBe("dark");
    });

    it("returns light when matchMedia matches light", () => {
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
      }));
      expect(resolveTheme("system")).toBe("light");
    });

    it("returns light when matchMedia throws", () => {
      window.matchMedia = vi.fn().mockImplementation(() => {
        throw new Error("Not supported");
      });
      expect(resolveTheme("system")).toBe("light");
    });
  });

  describe("readThemePreference", () => {
    it("returns system when window is undefined", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      expect(readThemePreference()).toBe("system");
      global.window = originalWindow;
    });

    it("reads light/dark/system from localStorage", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "light");
      expect(readThemePreference()).toBe("light");

      localStorage.setItem(THEME_STORAGE_KEY, "dark");
      expect(readThemePreference()).toBe("dark");

      localStorage.setItem(THEME_STORAGE_KEY, "system");
      expect(readThemePreference()).toBe("system");
    });

    it("returns system if nothing is in localStorage", () => {
      expect(readThemePreference()).toBe("system");
    });

    it("returns system if invalid value is in localStorage", () => {
      localStorage.setItem(THEME_STORAGE_KEY, "invalid");
      expect(readThemePreference()).toBe("system");
    });

    it("returns system if localStorage throws", () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("Storage disabled");
      });
      expect(readThemePreference()).toBe("system");
      getItemSpy.mockRestore();
    });
  });

  describe("writeThemePreference", () => {
    it("writes to localStorage and dispatches event", () => {
      const dispatchEventSpy = vi.spyOn(window, "dispatchEvent");
      writeThemePreference("dark");
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls[0][0] as Event;
      expect(event.type).toBe(THEME_EVENT);
    });
  });

  describe("applyTheme", () => {
    it("applies light theme to document element", () => {
      applyTheme("light");
      expect(document.documentElement.dataset.theme).toBe("light");
      expect(document.documentElement.style.colorScheme).toBe("light");
    });

    it("applies dark theme to document element", () => {
      applyTheme("dark");
      expect(document.documentElement.dataset.theme).toBe("dark");
      expect(document.documentElement.style.colorScheme).toBe("dark");
    });

    it("updates theme-color meta tag if it exists", () => {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "#ffffff";
      document.head.appendChild(meta);

      applyTheme("dark");
      expect(meta.getAttribute("content")).toBe("#000000");

      applyTheme("light");
      expect(meta.getAttribute("content")).toBe("#fafafa");
    });

    it("does not throw if theme-color meta tag is missing", () => {
      expect(() => applyTheme("dark")).not.toThrow();
    });
  });
});
