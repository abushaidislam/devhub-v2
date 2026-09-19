import { describe, it, expect } from "vitest";
import { isJsonData } from "../curl";

describe("isJsonData", () => {
	it("returns true for valid JSON objects", () => {
		expect(isJsonData('{"key": "value"}')).toBe(true);
		expect(isJsonData('{"number": 123, "boolean": true}')).toBe(true);
		expect(isJsonData('{}')).toBe(true);
	});

	it("returns true for valid JSON arrays", () => {
		expect(isJsonData('["value1", "value2"]')).toBe(true);
		expect(isJsonData('[1, 2, 3]')).toBe(true);
		expect(isJsonData('[]')).toBe(true);
	});

	it("returns false for null or empty strings", () => {
		expect(isJsonData(null)).toBe(false);
		expect(isJsonData("")).toBe(false);
		expect(isJsonData("   ")).toBe(false);
	});

	it("returns false for non-JSON strings", () => {
		expect(isJsonData("just a string")).toBe(false);
		expect(isJsonData("key=value&another=123")).toBe(false);
		expect(isJsonData("<xml></xml>")).toBe(false);
	});

	it("returns false for valid JSON primitives (not object/array)", () => {
		expect(isJsonData("123")).toBe(false);
		expect(isJsonData("true")).toBe(false);
		expect(isJsonData('"string"')).toBe(false);
	});

	it("returns false when parsing fails in catch block (error path)", () => {
		// Starts with '{' but invalid JSON
		expect(isJsonData('{ "key": "value", }')).toBe(false); // Trailing comma
		expect(isJsonData('{ key: "value" }')).toBe(false);    // Unquoted key
		expect(isJsonData('{ "key": value }')).toBe(false);    // Unquoted value
		expect(isJsonData('{ "key" "value" }')).toBe(false);   // Missing colon
		expect(isJsonData('{ "key": "value" ')).toBe(false);   // Missing closing brace

		// Starts with '[' but invalid JSON
		expect(isJsonData('[ "value", ]')).toBe(false);        // Trailing comma
		expect(isJsonData('[ value ]')).toBe(false);           // Unquoted value
		expect(isJsonData('[ "value" ')).toBe(false);          // Missing closing bracket
	});

	it("handles whitespace correctly", () => {
		expect(isJsonData(' \n \t { "key": "value" } \n ')).toBe(true);
		expect(isJsonData(' \n \t [ "value" ] \n ')).toBe(true);
		expect(isJsonData(' \n \t { "key": "value", } \n ')).toBe(false); // Invalid but has whitespace
	});
});
