import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd } from "@/components/core/json-ld";

describe("JsonLd", () => {
  it("renders a script tag with application/ld+json and correctly serialized data", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "DevHub Toolkit",
    };

    const { container } = render(<JsonLd data={data} />);
    const scriptTag = container.querySelector("script");

    expect(scriptTag).toBeInTheDocument();
    expect(scriptTag).toHaveAttribute("type", "application/ld+json");
    expect(scriptTag?.innerHTML).toBe('{"@context":"https://schema.org","@type":"WebSite","name":"DevHub Toolkit"}');
  });

  it("escapes '<' characters in the serialized data to prevent XSS", () => {
    const data = {
      "description": "This is a <script>alert('XSS')</script> test",
    };

    const { container } = render(<JsonLd data={data} />);
    const scriptTag = container.querySelector("script");

    expect(scriptTag?.innerHTML).toBe('{"description":"This is a \\u003cscript>alert(\'XSS\')\\u003c/script> test"}');
  });
});
