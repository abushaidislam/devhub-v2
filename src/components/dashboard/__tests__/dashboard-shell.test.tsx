// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

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
});
