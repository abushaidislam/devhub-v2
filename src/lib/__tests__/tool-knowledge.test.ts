import { describe, it, expect } from "vitest";
import { tools } from "../tools";
import { toolKnowledgeBase, getToolKnowledge } from "../tool-knowledge";

describe("tool-knowledge", () => {
  it("provides comprehensive knowledge for every registered tool", () => {
    for (const tool of tools) {
      const knowledge = toolKnowledgeBase[tool.slug];
      expect(knowledge, `Missing knowledge entry for tool: ${tool.slug}`).toBeDefined();
      expect(knowledge.features.length).toBeGreaterThanOrEqual(2);
      expect(knowledge.useCases.length).toBeGreaterThanOrEqual(2);
      expect(knowledge.howTo.length).toBeGreaterThanOrEqual(2);
      expect(knowledge.faqs.length).toBeGreaterThanOrEqual(1);

      for (const faq of knowledge.faqs) {
        expect(faq.question.trim().length).toBeGreaterThan(5);
        expect(faq.answer.trim().length).toBeGreaterThan(10);
      }
    }
  });

  it("returns fallback knowledge for unknown tool slugs", () => {
    const fallback = getToolKnowledge("non-existent-tool");
    expect(fallback).toBeDefined();
    expect(fallback.features.length).toBeGreaterThan(0);
    expect(fallback.faqs.length).toBeGreaterThan(0);
  });
});
