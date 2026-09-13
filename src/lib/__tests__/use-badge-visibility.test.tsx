// @vitest-environment jsdom
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { useBadgeVisibility } from "@/lib/use-badge-visibility";

const STORAGE_KEY = 'sidebar_new_tools_status';
const EXPIRATION_TIME = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

describe("useBadgeVisibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return isInitiallyNew before mounting", () => {
    const { result } = renderHook(() => useBadgeVisibility("test-tool", true, false));
    expect(result.current).toBe(true);
  });

  it("should hide badge if isInitiallyNew is false", async () => {
    const { result } = renderHook(() => useBadgeVisibility("test-tool", false, false));
    await waitFor(() => expect(result.current).toBe(false));
  });

  it("should persist timestamp and show badge when tool becomes active", async () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const { result } = renderHook(() => useBadgeVisibility("new-tool", true, true));
    await waitFor(() => expect(result.current).toBe(true));

    const storedData = localStorage.getItem(STORAGE_KEY);
    expect(storedData).toBeTruthy();
    const parsed = JSON.parse(storedData!);
    expect(parsed["new-tool"]).toBe(now);
  });

  it("should hide badge if timestamp has expired", async () => {
    const pastTime = Date.now() - (EXPIRATION_TIME + 1000); // More than 3 days ago
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ "expired-tool": pastTime }));

    const { result } = renderHook(() => useBadgeVisibility("expired-tool", true, false));
    await waitFor(() => expect(result.current).toBe(false));
  });

  it("should show badge if timestamp has not expired", async () => {
    const pastTime = Date.now() - (EXPIRATION_TIME - 10000); // Less than 3 days ago
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ "fresh-tool": pastTime }));

    const { result } = renderHook(() => useBadgeVisibility("fresh-tool", true, false));
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("should fallback to isInitiallyNew if localStorage contains malformed JSON", async () => {
    localStorage.setItem(STORAGE_KEY, "invalid-json");

    // We expect console.error to be called, so let's mock it to keep test output clean
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useBadgeVisibility("error-tool", true, false));
    await waitFor(() => expect(result.current).toBe(true));

    consoleErrorSpy.mockRestore();
  });
});
