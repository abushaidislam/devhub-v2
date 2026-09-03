// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, Mock } from "vitest";
import { RecentWorkspace } from "@/components/dashboard/recent-workspace";
import { useHistory } from "@/lib/use-history";

// Mock the useHistory hook to control the state
vi.mock("@/lib/use-history", () => ({
  useHistory: vi.fn(),
}));

const mockUseHistory = useHistory as Mock;

describe("RecentWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup a default mock implementation for useHistory
    mockUseHistory.mockReturnValue({
      entries: [],
      enabled: true,
      available: true,
      loading: false,
      setEnabled: vi.fn(),
      clear: vi.fn(),
    });
  });

  it("shows the loading state", () => {
    mockUseHistory.mockReturnValue({
      entries: [],
      enabled: true,
      available: true,
      loading: true,
      setEnabled: vi.fn(),
      clear: vi.fn(),
    });

    render(<RecentWorkspace />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Loading activity" })).toBeInTheDocument();
  });

  it("shows empty state when no recent activity and history is available and enabled", () => {
    render(<RecentWorkspace />);
    expect(screen.getByRole("heading", { name: "No recent activity" })).toBeInTheDocument();
    expect(screen.getByText("Open a tool to add it here.")).toBeInTheDocument();
  });

  it("shows empty state when no recent activity and history is available but disabled", () => {
    mockUseHistory.mockReturnValue({
      entries: [],
      enabled: false,
      available: true,
      loading: false,
      setEnabled: vi.fn(),
      clear: vi.fn(),
    });
    render(<RecentWorkspace />);
    expect(screen.getByRole("heading", { name: "No recent activity" })).toBeInTheDocument();
    expect(screen.getByText("Turn on history, then open a tool to start tracking locally.")).toBeInTheDocument();
  });

  it("shows empty state when browser storage is unavailable", () => {
    mockUseHistory.mockReturnValue({
      entries: [],
      enabled: false,
      available: false,
      loading: false,
      setEnabled: vi.fn(),
      clear: vi.fn(),
    });
    render(<RecentWorkspace />);
    expect(screen.getByRole("heading", { name: "No recent activity" })).toBeInTheDocument();
    expect(screen.getByText("This browser context does not allow local storage.")).toBeInTheDocument();
    expect(screen.getByText("Browser storage is unavailable in this context.")).toBeInTheDocument();
  });

  it("renders a list of recent tools", () => {
    mockUseHistory.mockReturnValue({
      entries: [
        { id: "1", slug: "jwt-decoder", visitedAt: Date.now() - 10000 },
        { id: "2", slug: "json-formatter", visitedAt: Date.now() - 3600000 },
      ],
      enabled: true,
      available: true,
      loading: false,
      setEnabled: vi.fn(),
      clear: vi.fn(),
    });

    render(<RecentWorkspace />);
    expect(screen.getByRole("heading", { name: "Recently opened" })).toBeInTheDocument();
    expect(screen.getByText("JWT Decoder")).toBeInTheDocument();
    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
    // Check relative time strings
    expect(screen.getByText("10s ago")).toBeInTheDocument();
    expect(screen.getByText("1h ago")).toBeInTheDocument();
  });

  it("filters tools based on search query", async () => {
    const user = userEvent.setup();
    mockUseHistory.mockReturnValue({
      entries: [
        { id: "1", slug: "jwt-decoder", visitedAt: Date.now() },
        { id: "2", slug: "json-formatter", visitedAt: Date.now() },
      ],
      enabled: true,
      available: true,
      loading: false,
      setEnabled: vi.fn(),
      clear: vi.fn(),
    });

    render(<RecentWorkspace />);

    const searchInput = screen.getByPlaceholderText("Filter tools…");
    await user.type(searchInput, "json");

    expect(screen.queryByText("JWT Decoder")).not.toBeInTheDocument();
    expect(screen.getByText("JSON Formatter")).toBeInTheDocument();
  });

  it("shows no matches message when filter yields no results", async () => {
    const user = userEvent.setup();
    mockUseHistory.mockReturnValue({
      entries: [
        { id: "1", slug: "jwt-decoder", visitedAt: Date.now() },
      ],
      enabled: true,
      available: true,
      loading: false,
      setEnabled: vi.fn(),
      clear: vi.fn(),
    });

    render(<RecentWorkspace />);

    const searchInput = screen.getByPlaceholderText("Filter tools…");
    await user.type(searchInput, "unknown-tool");

    expect(screen.queryByText("JWT Decoder")).not.toBeInTheDocument();
    expect(screen.getByText("No recent tools match “unknown-tool”.")).toBeInTheDocument();
  });

  it("handles settings actions (enable/disable and clear)", async () => {
    const user = userEvent.setup();
    const setEnabledMock = vi.fn();
    const clearMock = vi.fn();

    mockUseHistory.mockReturnValue({
      entries: [
        { id: "1", slug: "jwt-decoder", visitedAt: Date.now() },
      ],
      enabled: true,
      available: true,
      loading: false,
      setEnabled: setEnabledMock,
      clear: clearMock,
    });

    render(<RecentWorkspace />);

    const switchBtn = screen.getByRole("switch", { name: "Save recent tool visits" });
    await user.click(switchBtn);
    expect(setEnabledMock).toHaveBeenCalledWith(false);

    const clearBtn = screen.getByRole("button", { name: "Clear" });
    await user.click(clearBtn);
    expect(clearMock).toHaveBeenCalled();
  });

  it("skips rendering entries that don't match known tools", () => {
    mockUseHistory.mockReturnValue({
      entries: [
        { id: "1", slug: "jwt-decoder", visitedAt: Date.now() },
        { id: "2", slug: "unknown-tool-slug", visitedAt: Date.now() }, // Should be skipped
      ],
      enabled: true,
      available: true,
      loading: false,
      setEnabled: vi.fn(),
      clear: vi.fn(),
    });

    render(<RecentWorkspace />);
    expect(screen.getByText("JWT Decoder")).toBeInTheDocument();
    // Ensure unknown tool isn't throwing errors and isn't rendered
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(1);
  });
});
