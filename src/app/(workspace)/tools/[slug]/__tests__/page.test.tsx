import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { notFound } from "next/navigation";
import ToolPage, { generateMetadata, generateStaticParams } from "../page";
import { tools } from "@/lib/tools";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Mock subcomponents

vi.mock("@/components/dashboard/favorite-button", () => ({
  FavoriteButton: () => <button data-testid="fav-btn">Favorite</button>,
}));
vi.mock("@/components/tools/tool-runtime", () => ({
  ToolRuntime: () => <div data-testid="tool-runtime">Runtime</div>,
}));
vi.mock("@/components/tools/next-actions", () => ({
  NextActions: () => <div data-testid="next-actions">Next</div>,
}));

describe("ToolPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateStaticParams", () => {
    it("returns static params for all registered tools", () => {
      const params = generateStaticParams();
      expect(params.length).toBe(tools.length);
      expect(params).toEqual(tools.map((t) => ({ slug: t.slug })));
    });
  });

  describe("generateMetadata", () => {
    it("returns metadata for a valid tool slug", async () => {
      const tool = tools[0];
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: tool.slug }),
      });

      expect(metadata.title).toBe(tool.name);
      expect(metadata.description).toBe(tool.metaDescription);
      expect(metadata.alternates?.canonical).toBe(`/tools/${tool.slug}`);
      expect(metadata.openGraph?.title).toBe(`${tool.name} — DevHub`);
    });

    it("returns empty object for unknown tool slug", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "unknown-tool" }),
      });
      expect(metadata).toEqual({});
    });
  });

  describe("Page component rendering", () => {
    it("renders tool guide, how-to, and FAQs for a valid tool", async () => {
      const tool = tools[0];
      const result = await ToolPage({
        params: Promise.resolve({ slug: tool.slug }),
      });

      render(result);

      expect(screen.getByText(`${tool.name} Developer Guide`)).toBeDefined();
      expect(screen.getByText("Key capabilities")).toBeDefined();
      expect(screen.getByText("Common use cases")).toBeDefined();
      expect(screen.getByText(`How to use ${tool.name}`)).toBeDefined();
      expect(screen.getByText("Frequently asked questions")).toBeDefined();
      expect(screen.getByText("100% Client-Side & Private")).toBeDefined();
      expect(notFound).not.toHaveBeenCalled();
    });

    it("triggers notFound() when tool slug does not exist", async () => {
      vi.mocked(notFound).mockImplementationOnce(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      await expect(
        ToolPage({
          params: Promise.resolve({ slug: "non-existent-tool" }),
        })
      ).rejects.toThrow("NEXT_NOT_FOUND");

      expect(notFound).toHaveBeenCalledTimes(1);
    });
  });
});
