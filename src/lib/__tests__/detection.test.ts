import { describe, expect, it } from "vitest";
import { detectInput, DETECTION_INPUT_LIMIT } from "@/lib/detection";

function segment(value: unknown) {
  return btoa(JSON.stringify(value))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

describe("smart input detection", () => {
  it.each([
    ['{"ready":true}', "json-formatter"],
    ['{"ready":true}', "json-to-typescript"],
    [`${segment({ alg: "HS256" })}.${segment({ sub: "devhub" })}.signature`, "jwt-decoder"],
    ["https://devhub.tools/path?q=json", "url-encoder"],
    ["https://devhub.tools/path?q=json", "url-parser"],
    ["name: DevHub\nfeatures:\n  - local\n  - fast", "yaml-formatter"],
    ["name: DevHub\nfeatures:\n  - local\n  - fast", "yaml-to-json"],
    ["<root><item>DevHub</item></root>", "xml-formatter"],
    ["<!DOCTYPE html><html><body><h1>DevHub</h1></body></html>", "html-formatter"],
    ["755", "chmod-calculator"],
    ["-rwxr-xr-x", "chmod-calculator"],
    ["node_modules/\n.env\n.next/", "gitignore-generator"],
    ["SELECT id FROM users WHERE active = true", "sql-formatter"],
    ["0 9 * * 1", "cron-parser"],
    ["#ff00aa", "color-converter"],
    ["# Title\n\n- one\n- two", "markdown-preview"],
    ["# Title\n\n- one\n- two", "markdown-linter"],
    ["RGV2SHVi", "base64"],
    ["curl -X POST https://api.devhub.tools/items -H 'Content-Type: application/json'", "curl-converter"],
    ["c35d5b0e-35de-46a7-be7c-501add2d169f", "uuid-generator"],
    ["1735689600", "timestamp-converter"],
    ["id,name\n1,dev\n2,user", "csv-to-json"],
  ])("detects %s", (input, slug) => {
    expect(detectInput(input).some((result) => result.slug === slug)).toBe(true);
  });

  it("returns ranked reasons without guessing plain text", () => {
    expect(detectInput("hello developer")).toEqual([]);
    expect(detectInput('{"url":"https://devhub.tools"}')[0]).toMatchObject({
      slug: "json-formatter",
      confidence: 1,
      reason: expect.any(String),
    });
  });

  it("handles large inputs efficiently without false positives or lag", () => {
    const largePlainText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(1500); // ~85k chars
    expect(detectInput(largePlainText)).toEqual([]);

    const largeMarkdown = "# Large Document\n\n" + "- Item\n".repeat(2000);
    const detections = detectInput(largeMarkdown);
    expect(detections.some((d) => d.slug === "markdown-preview")).toBe(true);
  });

  it("rejects oversized input", () => {
    expect(() => detectInput("x".repeat(DETECTION_INPUT_LIMIT + 1))).toThrow(/100,000/);
  });
});
