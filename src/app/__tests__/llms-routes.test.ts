import { describe, it, expect } from "vitest";
import { GET as getLlms } from "../llms.txt/route";
import { GET as getLlmsFull } from "../llms-full.txt/route";
import { tools } from "@/lib/tools";

describe("LLM Discovery Routes", () => {
  it("generates valid /llms.txt with correct content-type and tools", async () => {
    const res = getLlms();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    const text = await res.text();
    expect(text).toContain("# DevHub Toolkit");
    expect(text).toContain("## Categories");
    expect(text).toContain("## Tools");
    expect(text).toContain("JSON Formatter");
    expect(text).toContain("HTML Formatter");
  });

  it("generates rich /llms-full.txt with all tools, FAQs, and use cases", async () => {
    const res = getLlmsFull();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    const text = await res.text();
    expect(text).toContain("# DevHub Toolkit — Full Product Context");
    expect(text).toContain("## Shipped Architecture & Features");
    expect(text).toContain("Smart Input Omnibar");

    // Verify all 35 tools are present with rich context
    for (const tool of tools) {
      expect(text, `Missing tool in full context: ${tool.name}`).toContain(`### ${tool.name}`);
      expect(text).toContain(`- **Canonical URL**:`);
      expect(text).toContain(`**Key Capabilities**:`);
      expect(text).toContain(`**Common Use Cases**:`);
      expect(text).toContain(`**How to Use**:`);
      expect(text).toContain(`**Technical FAQs & Boundaries**:`);
    }
  });
});
