// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DashboardShell,
  _resetDashboardShellCacheForTests,
} from "@/components/dashboard/dashboard-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe("DashboardShell", () => {
  beforeEach(() => {
    _resetDashboardShellCacheForTests();
    localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it("renders the sidebar with Toolkit badge in header and New badge next to newly added tools", () => {
    render(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    // Header badge
    expect(screen.getByText("Toolkit")).toBeInTheDocument();

    // cURL Converter link and New badge
    const curlLink = screen.getByRole("link", { name: /cURL Converter/i });
    expect(curlLink).toBeInTheDocument();
    expect(curlLink).toHaveTextContent("New");
  });

  it("renders the resizer with accessible separator role and handles keyboard and double-click resize", async () => {
    const { fireEvent } = await import("@testing-library/react");
    render(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    const resizer = screen.getByRole("separator", { name: /Resize sidebar/i });
    expect(resizer).toBeInTheDocument();
    expect(resizer).toHaveAttribute("aria-orientation", "vertical");
    expect(resizer).toHaveAttribute("aria-valuenow", "256");

    // Keyboard ArrowRight (+10)
    fireEvent.keyDown(resizer, { key: "ArrowRight" });
    expect(resizer).toHaveAttribute("aria-valuenow", "266");

    // Keyboard ArrowLeft (-10)
    fireEvent.keyDown(resizer, { key: "ArrowLeft" });
    expect(resizer).toHaveAttribute("aria-valuenow", "256");

    // Keyboard End (max: 420)
    fireEvent.keyDown(resizer, { key: "End" });
    expect(resizer).toHaveAttribute("aria-valuenow", "420");

    // Keyboard Home (min: 200)
    fireEvent.keyDown(resizer, { key: "Home" });
    expect(resizer).toHaveAttribute("aria-valuenow", "200");

    // Double click resets to default (256)
    fireEvent.doubleClick(resizer);
    expect(resizer).toHaveAttribute("aria-valuenow", "256");
  });

  it("snaps to collapse when dragging to the left below threshold or pressing ArrowLeft at minimum width", async () => {
    const { fireEvent, waitFor } = await import("@testing-library/react");
    const { container } = render(
      <DashboardShell>
        <div>Content</div>
      </DashboardShell>
    );

    const resizer = screen.getByRole("separator", { name: /Resize sidebar/i });

    // Drag past collapse threshold (e.g. clientX: 120)
    fireEvent.pointerDown(resizer, { pointerId: 1, clientX: 256 });
    fireEvent.pointerMove(resizer, { pointerId: 1, clientX: 120 });
    await waitFor(() => expect(resizer).toHaveAttribute("data-will-collapse", "true"));

    // Releasing pointer collapses the sidebar
    fireEvent.pointerUp(resizer, { pointerId: 1 });
    await waitFor(() => {
      const cls = (container.firstChild as HTMLElement)?.className || "";
      expect(cls).toContain("noSidebar");
    });

    // Show navigation button opens it again
    const toggleBtn = screen.getByRole("button", { name: /Show navigation/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);
    await waitFor(() => {
      const cls = (container.firstChild as HTMLElement)?.className || "";
      expect(cls).not.toContain("noSidebar");
    });

    // Keyboard ArrowLeft at min width collapses as well
    fireEvent.keyDown(resizer, { key: "Home" }); // at min width (200)
    expect(resizer).toHaveAttribute("aria-valuenow", "200");
    fireEvent.keyDown(resizer, { key: "ArrowLeft" });
    const finalCls = (container.firstChild as HTMLElement)?.className || "";
    expect(finalCls).toContain("noSidebar");
  });

  it("preserves open categories across navigations and renders without collapsing existing ones", () => {
    // First render with Formatters open by default
    const { unmount, container } = render(
      <DashboardShell activeSlug="json-formatter">
        <div>Page 1</div>
      </DashboardShell>
    );

    const detailsList = container.querySelectorAll("details");
    const formatters = Array.from(detailsList).find((d) =>
      d.querySelector("summary")?.textContent?.includes("Formatters")
    );
    const converters = Array.from(detailsList).find((d) =>
      d.querySelector("summary")?.textContent?.includes("Converters")
    );

    expect(formatters).toHaveAttribute("open");
    expect(converters).not.toHaveAttribute("open");

    // User toggles Converters open
    if (converters) {
      converters.open = true;
      fireEvent(converters, new Event("toggle"));
    }

    unmount();

    // Now navigate to a Security tool (e.g. jwt-decoder)
    const { container: container2 } = render(
      <DashboardShell activeSlug="jwt-decoder">
        <div>Page 2</div>
      </DashboardShell>
    );

    const detailsList2 = container2.querySelectorAll("details");
    const formatters2 = Array.from(detailsList2).find((d) =>
      d.querySelector("summary")?.textContent?.includes("Formatters")
    );
    const converters2 = Array.from(detailsList2).find((d) =>
      d.querySelector("summary")?.textContent?.includes("Converters")
    );
    const security2 = Array.from(detailsList2).find((d) =>
      d.querySelector("summary")?.textContent?.includes("Security")
    );

    // Active tool's category (Security) is open
    expect(security2).toHaveAttribute("open");
    // Previously open categories (Formatters, Converters) STAY open (no jumping/collapsing!)
    expect(formatters2).toHaveAttribute("open");
    expect(converters2).toHaveAttribute("open");
  });

  it("preserves sidebar collapsed state across re-renders/navigations", async () => {
    const { waitFor } = await import("@testing-library/react");
    const { unmount, container } = render(
      <DashboardShell>
        <div>Page 1</div>
      </DashboardShell>
    );

    const collapseBtn = screen.getByRole("button", { name: /Hide navigation/i });
    fireEvent.click(collapseBtn);

    await waitFor(() => {
      const cls = (container.firstChild as HTMLElement)?.className || "";
      expect(cls).toContain("noSidebar");
    });

    unmount();

    // Re-mount on a new page (simulating navigation)
    const { container: container2 } = render(
      <DashboardShell activeSlug="jwt-decoder">
        <div>Page 2</div>
      </DashboardShell>
    );

    // Should remain collapsed!
    const cls2 = (container2.firstChild as HTMLElement)?.className || "";
    expect(cls2).toContain("noSidebar");
  });
});
