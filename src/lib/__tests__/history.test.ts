import { beforeEach, describe, expect, it, vi } from "vitest";
import { historyEnabled, readHistory, recordHistory, setHistoryEnabled } from "@/lib/history";

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
});
