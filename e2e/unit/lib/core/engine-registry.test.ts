import {describe, expect, it} from "vitest";
import {engines, getEngine} from "@/lib/engine-registry";
import {tools} from "@/lib/tools";

// ---------------------------------------------------------------------------
// Coverage: registry must mirror the tool registry exactly
// ---------------------------------------------------------------------------

describe("engine registry coverage", () => {
	it("has a ToolEngine for every slug in the tool registry", () => {
		for (const tool of tools) {
			expect(
				getEngine(tool.slug),
				`missing engine for slug "${tool.slug}"`,
			).toBeDefined();
		}
	});

	it("has no extra engines beyond what the tool registry declares", () => {
		const slugs = new Set(tools.map((t) => t.slug));
		for (const engine of engines) {
			expect(
				slugs.has(engine.id),
				`unexpected engine id "${engine.id}" not in tool registry`,
			).toBe(true);
		}
	});

	it("has one engine for every registered tool", () => {
		expect(engines.length).toBe(tools.length);
	});
});

// ---------------------------------------------------------------------------
// Contract: every engine must satisfy the ToolEngine interface invariants
// ---------------------------------------------------------------------------

describe("ToolEngine contract invariants", () => {
	const validTypes = new Set(["text", "json", "binary", "image"]);
	const validSensitivity = new Set(["local", "network", "ai"]);

	it("every engine declares local sensitivity (all current tools are local-first)", () => {
		for (const engine of engines) {
			expect(engine.sensitivity, engine.id).toBe("local");
		}
	});

	it("every engine accepts at least one valid ToolValueType", () => {
		for (const engine of engines) {
			expect(engine.accepts.length, engine.id).toBeGreaterThan(0);
			for (const t of engine.accepts) {
				expect(validTypes.has(t), `${engine.id} accepts unknown type "${t}"`).toBe(true);
			}
		}
	});

	it("every engine declares a valid produces type", () => {
		for (const engine of engines) {
			expect(validTypes.has(engine.produces), engine.id).toBe(true);
		}
	});

	it("every engine declares a valid sensitivity level", () => {
		for (const engine of engines) {
			expect(validSensitivity.has(engine.sensitivity), engine.id).toBe(true);
		}
	});
});

// ---------------------------------------------------------------------------
// Output types: verify produces tag matches actual output at runtime
// ---------------------------------------------------------------------------

describe("output type tags", () => {
	it("json-formatter produces output.type === 'json'", async () => {
		const engine = getEngine("json-formatter")!;
		const result = await engine.run({type: "text", value: '{"x":1}'});
		expect(result.output.type).toBe("json");
	});

	it("qr-generator produces output.type === 'image' and a data URL", async () => {
		const engine = getEngine("qr-generator")!;
		const result = await engine.run({type: "text", value: "https://example.com"});
		expect(result.output.type).toBe("image");
		expect(result.output.value).toMatch(/^data:image\//);
	});

	it("jwt-decoder produces output.type === 'json'", async () => {
		const engine = getEngine("jwt-decoder")!;
		const token =
			"eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ0ZXN0In0.";
		const result = await engine.run({type: "text", value: token});
		expect(result.output.type).toBe("json");
	});

	it("regex-tester produces output.type === 'json'", async () => {
		const engine = getEngine("regex-tester")!;
		const result = await engine.run(
			{type: "text", value: "hello world"},
			{pattern: "\\w+", flags: "g"},
		);
		expect(result.output.type).toBe("json");
	});

	it("all other engines produce output.type === 'text'", async () => {
		const textSlugs = [
			"base64",
			"uuid-generator",
			"color-converter",
			"markdown-preview",
			"hash-generator",
			"sql-formatter",
			"cron-parser",
			"url-encoder",
		];
		const inputs: Record<string, string> = {
			base64: "hello",
			"uuid-generator": "1",
			"color-converter": "#5E9FE8",
			"markdown-preview": "# Hello",
			"hash-generator": "abc",
			"sql-formatter": "select id from users",
			"cron-parser": "0 9 * * 1",
			"url-encoder": "hello world",
		};
		const options: Record<string, unknown> = {
			base64: {mode: "encode"},
			"hash-generator": {algorithm: "SHA-256"},
			"url-encoder": {mode: "encode"},
		};
		for (const slug of textSlugs) {
			const engine = getEngine(slug)!;
			const result = await engine.run(
				{type: "text", value: inputs[slug]},
				options[slug],
			);
			expect(result.output.type, slug).toBe("text");
		}
	});
});

// ---------------------------------------------------------------------------
// Meta: every run() result carries a description string
// ---------------------------------------------------------------------------

describe("meta.description", () => {
	it("json-formatter result has meta.description string", async () => {
		const engine = getEngine("json-formatter")!;
		const result = await engine.run({type: "text", value: '[1,2,3]'});
		expect(typeof result.meta?.description).toBe("string");
	});

	it("base64 encode result has meta.description string", async () => {
		const engine = getEngine("base64")!;
		const result = await engine.run({type: "text", value: "test"}, {mode: "encode"});
		expect(typeof result.meta?.description).toBe("string");
	});
});

// ---------------------------------------------------------------------------
// Error handling: engines must throw Error with a safe user-facing message
// ---------------------------------------------------------------------------

describe("error handling", () => {
	it("json-formatter throws for invalid JSON", async () => {
		const engine = getEngine("json-formatter")!;
		await expect(
			engine.run({type: "text", value: "not json"}),
		).rejects.toThrow();
	});

	it("color-converter throws for non-hex input", async () => {
		const engine = getEngine("color-converter")!;
		await expect(
			engine.run({type: "text", value: "notacolor"}),
		).rejects.toThrow();
	});

	it("jwt-decoder throws for malformed token", async () => {
		const engine = getEngine("jwt-decoder")!;
		await expect(
			engine.run({type: "text", value: "not.a.jwt"}),
		).rejects.toThrow();
	});

	it("cron-parser throws for wrong field count", async () => {
		const engine = getEngine("cron-parser")!;
		await expect(
			engine.run({type: "text", value: "* * *"}),
		).rejects.toThrow();
	});
});

// ---------------------------------------------------------------------------
// Regression: verify correct values for key engines
// ---------------------------------------------------------------------------

describe("run() regression values", () => {
	it("base64 encode is reversible via decode", async () => {
		const engine = getEngine("base64")!;
		const encoded = await engine.run({type: "text", value: "DevHub"}, {mode: "encode"});
		const decoded = await engine.run(
			{type: "text", value: encoded.output.value},
			{mode: "decode"},
		);
		expect(decoded.output.value).toBe("DevHub");
	});

	it("url-encoder encode is reversible via decode", async () => {
		const engine = getEngine("url-encoder")!;
		const encoded = await engine.run(
			{type: "text", value: "hello world"},
			{mode: "encode"},
		);
		expect(encoded.output.value).toBe("hello%20world");
		const decoded = await engine.run(
			{type: "text", value: encoded.output.value},
			{mode: "decode"},
		);
		expect(decoded.output.value).toBe("hello world");
	});

	it("hash-generator SHA-256 produces a 64-char lowercase hex digest", async () => {
		const engine = getEngine("hash-generator")!;
		const result = await engine.run({type: "text", value: "abc"}, {algorithm: "SHA-256"});
		// SHA-256 always produces a 256-bit (64 hex char) lowercase digest.
		expect(result.output.value).toHaveLength(64);
		expect(result.output.value).toMatch(/^[0-9a-f]+$/);
	});

	it("uuid-generator returns the requested count of UUIDs", async () => {
		const engine = getEngine("uuid-generator")!;
		const result = await engine.run({type: "text", value: "3"});
		const lines = result.output.value.split("\n").filter(Boolean);
		expect(lines).toHaveLength(3);
	});
});

// ---------------------------------------------------------------------------
// getEngine: unknown slug returns undefined
// ---------------------------------------------------------------------------

describe("getEngine", () => {
	it("returns undefined for an unknown slug", () => {
		expect(getEngine("not-a-real-tool")).toBeUndefined();
		expect(getEngine("")).toBeUndefined();
	});
});
