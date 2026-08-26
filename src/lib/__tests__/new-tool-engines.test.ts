import {describe, expect, it} from "vitest";
import {
	convertNumberBase,
	csvToJson,
	generatePassword,
	jsonToCsv,
	jsonToYaml,
	parseQueryString,
		transformHtmlEntities,
		formatYaml,
		formatXml,
		lintMarkdown,
		parseUrl,
		generateGitignore,
		jsonToTypescript,
	} from "../tool-engines";

describe("jsonToCsv", () => {
	it("converts an array of objects", () => {
		expect(jsonToCsv('[{"a":1,"b":"x, y"}]').output).toBe('a,b\n1,"x, y"');
	});
	it("rejects non-arrays", () => {
		expect(() => jsonToCsv("{}")).toThrow();
	});
});

describe("csvToJson", () => {
	it("parses quoted fields", () => {
		expect(JSON.parse(csvToJson('a,b\n1,"x, y"').output)).toEqual([
			{a: "1", b: "x, y"},
		]);
	});
	it("requires a data row", () => {
		expect(() => csvToJson("a,b")).toThrow();
	});
});

describe("jsonToYaml", () => {
	it("renders nested values", () => {
		expect(jsonToYaml('{"name":"DevHub","tags":["a","b"]}').output).toBe(
			"name: DevHub\ntags:\n  - a\n  - b",
		);
	});
});

describe("convertNumberBase", () => {
	it("converts hex input", () => {
		expect(convertNumberBase("0xff").output).toContain("Decimal: 255");
	});
	it("rejects invalid input", () => {
		expect(() => convertNumberBase("zz")).toThrow();
	});
});

describe("transformHtmlEntities", () => {
	it("round-trips", () => {
		const encoded = transformHtmlEntities("<a> & 'b'", "encode").output;
		expect(encoded).toBe("&lt;a&gt; &amp; &#39;b&#39;");
		expect(transformHtmlEntities(encoded, "decode").output).toBe("<a> & 'b'");
	});
});

describe("parseQueryString", () => {
	it("groups repeated keys", () => {
		expect(JSON.parse(parseQueryString("https://x.dev/?t=a&t=b&q=1").output)).toEqual({
			t: ["a", "b"],
			q: "1",
		});
	});
});

describe("generatePassword", () => {
	it("respects bounded length", () => {
		expect(generatePassword("20").output).toHaveLength(20);
		expect(generatePassword("1").output).toHaveLength(8);
	});
});

describe("formatYaml", () => {
	it("normalizes line endings and preserves two-space nesting", () => {
		expect(formatYaml("name: DevHub\r\nfeatures:\r\n  - local\r\n  - fast").output).toBe("name: DevHub\nfeatures:\n  - local\n  - fast");
	});
	it("rejects tabs and uneven indentation", () => {
		expect(() => formatYaml("name: DevHub\n\tfeatures: true")).toThrow(/spaces/);
		expect(() => formatYaml("name: DevHub\n features: true")).toThrow(/two-space/);
	});
});

describe("formatXml", () => {
	it("pretty-prints nested XML", () => {
		expect(formatXml("<root><item id=\"1\">DevHub</item><empty /></root>").output).toBe("<root>\n  <item id=\"1\">\n    DevHub\n  </item>\n  <empty />\n</root>");
	});
	it("rejects mismatched closing tags", () => {
		expect(() => formatXml("<root><item></root>")).toThrow(/does not match/);
	});
});

describe("lintMarkdown", () => {
	it("reports common style issues with line numbers", () => {
		const result = lintMarkdown("# Title\n\n\n### Skipped\n\n[Empty]()");
		expect(result.output).toContain("MD012");
		expect(result.output).toContain("MD001");
		expect(result.output).toContain("MD042");
		expect(result.meta).toContain("3 issues");
	});
	it("accepts a clean document", () => {
		expect(lintMarkdown("# Title\n\n## Section\n\nText.").output).toBe("No Markdown lint issues found.");
	});
});

describe("parseUrl", () => {
	it("returns URL parts and groups repeated query values", () => {
		const result = JSON.parse(parseUrl("https://devhub.dev/tools?tag=local&tag=fast#readme").output);
		expect(result).toMatchObject({hostname: "devhub.dev", pathname: "/tools", hash: "#readme", query: {tag: ["local", "fast"]}});
	});
	it("accepts a query string and rejects empty input", () => {
		expect(JSON.parse(parseUrl("?q=devhub").output).query).toEqual({q: "devhub"});
		expect(() => parseUrl("   ")).toThrow(/URL or query/);
	});
});

describe("generateGitignore", () => {
	it("combines templates without duplicate rules", () => {
		const output = generateGitignore("node, next, env").output;
		expect(output).toContain("node_modules/");
		expect(output).toContain(".next/");
		expect(output).toContain(".env");
		expect(output.match(/^\.env$/gm)).toHaveLength(1);
	});
	it("rejects unknown templates", () => {
		expect(() => generateGitignore("rust")).toThrow(/Unknown template/);
	});
});

describe("jsonToTypescript", () => {
	it("generates nested interfaces and array types", () => {
		const output = jsonToTypescript('{"name":"DevHub","tools":["json","yaml"]}').output;
		expect(output).toContain("export interface Root");
		expect(output).toContain("name: string;");
		expect(output).toContain("tools: string[];");
	});
	it("rejects invalid JSON", () => {
		expect(() => jsonToTypescript("not-json")).toThrow(/valid JSON/);
	});
});
