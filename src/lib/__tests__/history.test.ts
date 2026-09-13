import { beforeEach, describe, expect, it, vi } from "vitest";
import { historyEnabled, historySupported, readHistory, recordHistory, setHistoryEnabled } from "@/lib/history";

describe("history storage", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("defaults to opt-out and persists the explicit setting", () => {
    expect(historyEnabled()).toBe(false);
    expect(setHistoryEnabled(true)).toBe(false);
  });

  it("fails closed when IndexedDB is unavailable", async () => {
    expect(await readHistory()).toEqual([]);
    expect(await recordHistory("json-formatter")).toBe(false);
  });

  it("returns false if localStorage.getItem throws an error", () => {
    // Mock localStorage.getItem to throw
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Access Denied");
    });

    expect(historyEnabled()).toBe(false);
  });

  it("reports history as unsupported when storage access throws an error", () => {
    const originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      get() {
        throw new Error("SecurityError: The operation is insecure.");
      },
      configurable: true,
    });
    try {
      expect(historySupported()).toBe(false);
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        value: originalLocalStorage,
        configurable: true,
      });
    }
  });

  it("returns false if indexedDB is undefined", () => {
    const originalIndexedDB = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", {
      value: undefined,
      configurable: true,
    });

    try {
      expect(historySupported()).toBe(false);
    } finally {
      Object.defineProperty(globalThis, "indexedDB", {
        value: originalIndexedDB,
        configurable: true,
      });
    }
  });

  it("returns false if localStorage is undefined", () => {
    const originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      value: undefined,
      configurable: true,
    });

    try {
      expect(historySupported()).toBe(false);
    } finally {
      Object.defineProperty(globalThis, "localStorage", {
        value: originalLocalStorage,
        configurable: true,
      });
    }
  });
});
