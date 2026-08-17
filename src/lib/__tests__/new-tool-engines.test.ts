import {describe, expect, it} from "vitest";
import {
	convertNumberBase,
	csvToJson,
	generatePassword,
	jsonToCsv,
	jsonToYaml,
	parseQueryString,
	transformHtmlEntities,
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
