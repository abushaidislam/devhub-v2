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
});
