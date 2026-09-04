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
		curlToCode,
		yamlToJson,
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
	it("prevents prototype pollution from unsafe keys", () => {
		const result = JSON.parse(parseQueryString("?__proto__=polluted&constructor=polluted&prototype=polluted&valid=1").output);
		expect(result).toEqual({ valid: "1" });
		expect(({} as Record<string, unknown>).__proto__).not.toBe("polluted");
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
	it("prevents prototype pollution from unsafe keys in query", () => {
		const result = JSON.parse(parseUrl("https://devhub.dev/tools?__proto__=polluted&constructor=polluted&prototype=polluted&valid=1").output);
		expect(result.query).toEqual({ valid: "1" });
		expect(({} as Record<string, unknown>).__proto__).not.toBe("polluted");
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

describe("curlToCode", () => {
	it("converts simple GET to fetch", () => {
		const res = curlToCode("curl https://api.devhub.tools/users");
		expect(res.output).toContain('fetch("https://api.devhub.tools/users")');
		expect(res.output).toContain("await response.json()");
	});

	it("converts POST with headers and JSON body to fetch", () => {
		const cmd = `curl -X POST https://api.devhub.tools/items \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer my-token" \\
  -d '{"name": "test", "active": true}'`;
		const res = curlToCode(cmd, "fetch");
		expect(res.output).toContain('method: "POST"');
		expect(res.output).toContain('"Content-Type": "application/json"');
		expect(res.output).toContain('"Authorization": "Bearer my-token"');
		expect(res.output).toContain('JSON.stringify');
		expect(res.output).toContain('"name": "test"');
	});

	it("converts to Axios", () => {
		const cmd = `curl -X POST https://api.devhub.tools/items -H "Content-Type: application/json" -d '{"val": 123}'`;
		const res = curlToCode(cmd, "axios");
		expect(res.output).toContain('import axios from "axios";');
		expect(res.output).toContain('method: "post"');
		expect(res.output).toContain('url: "https://api.devhub.tools/items"');
		expect(res.output).toContain('"val": 123');
	});

	it("converts to Python Requests", () => {
		const cmd = `curl -X PUT https://api.devhub.tools/items/1 -H "Content-Type: application/json" -d '{"val": 456}'`;
		const res = curlToCode(cmd, "python");
		expect(res.output).toContain("import requests");
		expect(res.output).toContain('url = "https://api.devhub.tools/items/1"');
		expect(res.output).toContain("requests.put(url, headers=headers, json=data)");
	});

	it("converts to Go net/http", () => {
		const cmd = `curl -X POST https://api.devhub.tools/login -d 'user=admin&pass=123'`;
		const res = curlToCode(cmd, "go");
		expect(res.output).toContain("package main");
		expect(res.output).toContain('http.NewRequest("POST", url, payload)');
	});

	it("converts to PHP cURL", () => {
		const cmd = `curl https://api.devhub.tools/health`;
		const res = curlToCode(cmd, "php");
		expect(res.output).toContain("<?php");
		expect(res.output).toContain("curl_init()");
		expect(res.output).toContain('CURLOPT_URL => "https://api.devhub.tools/health"');
	});

	it("handles basic auth with -u", () => {
		const cmd = `curl -u admin:secret https://api.devhub.tools/secure`;
		const res = curlToCode(cmd, "fetch");
		expect(res.output).toContain('"Authorization": "Basic ');
	});

	it("rejects commands that do not start with curl", () => {
		expect(() => curlToCode("wget https://api.devhub.tools")).toThrow(/must start with 'curl'/);
	});

	it("rejects command with missing URL", () => {
		expect(() => curlToCode("curl -X POST -H 'Content-Type: application/json'")).toThrow(/No URL found/);
	});

	it("extracts cookies via -b and --cookie into Cookie header", () => {
		const cmd = `curl -b "session_id=xyz123; theme=dark" --cookie "auth_token=abc" https://api.devhub.tools/profile`;
		const res = curlToCode(cmd, "fetch");
		expect(res.output).toContain('"Cookie": "session_id=xyz123; theme=dark; auth_token=abc"');
	});

	it("detects advanced network flags (--retry, --connect-timeout, --compressed) and appends warning comment in fetch", () => {
		const cmd = `curl --retry 3 --connect-timeout 10 --compressed https://api.devhub.tools/data`;
		const res = curlToCode(cmd, "fetch");
		expect(res.output).toContain(
			"// Note: --retry, --connect-timeout, or --compressed flags were detected in your cURL command but are not natively supported by the standard Fetch API.",
		);
	});
});

describe("yamlToJson", () => {
	it("converts basic key-value mappings and scalar types", () => {
		const yaml = `
name: DevHub
version: 2
active: true
ratio: 3.14
notes: null
`;
		const res = yamlToJson(yaml);
		expect(JSON.parse(res.output)).toEqual({
			name: "DevHub",
			version: 2,
			active: true,
			ratio: 3.14,
			notes: null,
		});
		expect(res.meta).toContain("5 keys");
	});

	it("converts sequences (lists)", () => {
		const yaml = `
- apple
- banana
- cherry
`;
		const res = yamlToJson(yaml);
		expect(JSON.parse(res.output)).toEqual(["apple", "banana", "cherry"]);
		expect(res.meta).toContain("3 items");
	});

	it("converts sequences of objects", () => {
		const yaml = `
- id: 1
  name: Alice
- id: 2
  name: Bob
`;
		const res = yamlToJson(yaml);
		expect(JSON.parse(res.output)).toEqual([
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
		]);
	});

	it("converts nested structures and objects", () => {
		const yaml = `
database:
  host: localhost
  port: 5432
  auth:
    enabled: yes
`;
		const res = yamlToJson(yaml);
		expect(JSON.parse(res.output)).toEqual({
			database: {
				host: "localhost",
				port: 5432,
				auth: {
					enabled: true,
				},
			},
		});
	});

	it("handles comments and document markers", () => {
		const yaml = `
---
# Main config
title: "DevHub #1" # inline comment
status: ok
...
`;
		const res = yamlToJson(yaml);
		expect(JSON.parse(res.output)).toEqual({
			title: "DevHub #1",
			status: "ok",
		});
	});

	it("handles flow sequences and flow mappings", () => {
		const yaml = `
tags: [fast, local, private]
config: { port: 8080, debug: false }
`;
		const res = yamlToJson(yaml);
		expect(JSON.parse(res.output)).toEqual({
			tags: ["fast", "local", "private"],
			config: { port: 8080, debug: false },
		});
	});

	it("rejects tab indentation with descriptive error", () => {
		const yaml = "key:\n\tvalue: 1";
		expect(() => yamlToJson(yaml)).toThrow(/spaces, not tabs/);
	});

	it("rejects empty input", () => {
		expect(() => yamlToJson("")).toThrow(/Enter YAML content/);
	});
});

