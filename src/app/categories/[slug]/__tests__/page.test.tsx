import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { notFound } from "next/navigation";
import CategoryPage, { generateMetadata, generateStaticParams } from "../page";
import { categories, categoryDescriptions, tools } from "@/lib/tools";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Mock the components used in the page to simplify testing
vi.mock("@/components/core/site-header", () => ({
  SiteHeader: () => <header data-testid="site-header">Header</header>,
}));
vi.mock("@/components/core/site-footer", () => ({
  SiteFooter: () => <footer data-testid="site-footer">Footer</footer>,
}));
vi.mock("@/components/tools/tool-card", () => ({
  ToolCard: ({ tool }: { tool: any }) => (
    <div data-testid={`tool-card-${tool.slug}`}>{tool.name}</div>
  ),
}));

describe("CategoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateStaticParams", () => {
    it("returns an array of lowercase category slugs", () => {
      const params = generateStaticParams();
      expect(params.length).toBe(categories.length);
      expect(params).toEqual(
        categories.map((slug) => ({ slug: slug.toLowerCase() }))
      );
    });
  });

  describe("generateMetadata", () => {
    it("returns metadata for a valid category slug", async () => {
      const validCategory = categories[0];
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: validCategory.toLowerCase() }),
      });

      expect(metadata.title).toBe(`${validCategory} Developer Tools`);
      expect(metadata.description).toContain(`Browse`);
      expect(metadata.description).toContain(`free ${validCategory.toLowerCase()} developer tools`);
      expect(metadata.alternates?.canonical).toBe(`/categories/${validCategory.toLowerCase()}`);
      expect(metadata.openGraph?.title).toBe(`${validCategory} Developer Tools — DevHub`);
      expect(metadata.openGraph?.url).toBe(`/categories/${validCategory.toLowerCase()}`);
    });

    it("returns empty object for an invalid category slug", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "invalid-category" }),
      });

      expect(metadata).toEqual({});
    });
  });

  describe("CategoryPage Component", () => {
    it("renders category details and tools for a valid slug", async () => {
      // Pick a valid category that has tools
      const validCategory = categories[0];
      const validSlug = validCategory.toLowerCase();

      const expectedTools = tools.filter(t => t.category === validCategory);
      const expectedDescription = categoryDescriptions[validCategory] ?? `Explore ${validCategory.toLowerCase()} utilities for recurring developer workflows.`;

      // Render the async server component
      const PageComponent = await CategoryPage({
        params: Promise.resolve({ slug: validSlug }),
      });

      render(PageComponent);

      // Check header and footer
      expect(screen.getByTestId("site-header")).toBeInTheDocument();
      expect(screen.getByTestId("site-footer")).toBeInTheDocument();

      // Check category title and description
      expect(screen.getByRole("heading", { name: validCategory })).toBeInTheDocument();
      expect(screen.getByText(expectedDescription)).toBeInTheDocument();

      // Check section title
      expect(screen.getByRole("heading", { name: `${validCategory} tools for focused work` })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`${expectedTools.length} browser-based utilities`, "i"))).toBeInTheDocument();

      // Check tool cards
      expectedTools.forEach(tool => {
        expect(screen.getByTestId(`tool-card-${tool.slug}`)).toBeInTheDocument();
        expect(screen.getByText(tool.name)).toBeInTheDocument();
      });

      expect(notFound).not.toHaveBeenCalled();
    });

    it("calls notFound() for an invalid slug", async () => {
      vi.mocked(notFound).mockImplementationOnce(() => {
        throw new Error("NEXT_NOT_FOUND");
      });

      await expect(CategoryPage({
        params: Promise.resolve({ slug: "invalid-category" }),
      })).rejects.toThrow("NEXT_NOT_FOUND");

      expect(notFound).toHaveBeenCalledTimes(1);
    });
  });
});
