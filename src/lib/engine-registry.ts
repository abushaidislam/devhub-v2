/**
 * Engine registry (ADR-018).
 *
 * Each entry wraps an existing pure engine function from tool-engines.ts into
 * the typed ToolEngine contract. All 30 tools are registered here; the map is
 * the single source of truth for which engines exist at runtime.
 *
 * Pure engine functions must not import React (enforced by tool-engines.ts).
 * This module may import non-React third-party libraries (e.g. qrcode).
 */
import QRCode from "qrcode";
import {
	analyzeText,
	convertCase,
	convertColor,
	convertNumberBase,
	convertTimestamp,
	csvToJson,
	generatePassword,
	jsonToCsv,
	jsonToYaml,
	parseQueryString,
	transformHtmlEntities,
	diffLines,
	decodeJwt,
	describeCron,
	formatJson,
	formatSql,
	generateHash,
	generateUuids,
	markdownToHtml,
	slugify,
	testRegex,
	transformBase64,
		transformUrl,
		formatYaml,
		formatXml,
		lintMarkdown,
		parseUrl,
		generateGitignore,
		jsonToTypescript,
	} from "./tool-engines";
import type {ToolEngine, ToolResult} from "./engine-types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function makeText(
	value: string,
	description?: string,
	warnings?: string[],
): ToolResult {
	return {
		output: {type: "text", value},
		...(description ? {meta: {description}} : {}),
		...(warnings?.length ? {warnings} : {}),
	};
}

function makeJson(
	value: string,
	description?: string,
	warnings?: string[],
): ToolResult {
	return {
		output: {type: "json", value},
		...(description ? {meta: {description}} : {}),
		...(warnings?.length ? {warnings} : {}),
	};
}

function makeImage(value: string, description?: string): ToolResult {
	return {
		output: {type: "image", value},
		...(description ? {meta: {description}} : {}),
	};
}

// ---------------------------------------------------------------------------
// Engine definitions
// ---------------------------------------------------------------------------

const engineList: ToolEngine[] = [
	{
		id: "json-formatter",
		accepts: ["text"],
		produces: "json",
		sensitivity: "local",
		async run(input) {
			const r = formatJson(input.value);
			return makeJson(r.output, r.meta);
		},
	},
	{
		id: "base64",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input, options) {
			const mode =
				(options as {mode?: string} | undefined)?.mode === "decode"
					? "decode"
					: "encode";
			const r = transformBase64(input.value, mode);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "jwt-decoder",
		accepts: ["text"],
		produces: "json",
		sensitivity: "local",
		async run(input) {
			const r = decodeJwt(input.value);
			return makeJson(r.output, r.meta);
		},
	},
	{
		id: "uuid-generator",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = generateUuids(Number(input.value));
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "regex-tester",
		accepts: ["text"],
		produces: "json",
		sensitivity: "local",
		async run(input, options) {
			const opts = options as {pattern?: string; flags?: string} | undefined;
			const pattern = opts?.pattern ?? "";
			const flags = opts?.flags ?? "gi";
			const r = testRegex(pattern, flags, input.value);
			return makeJson(r.output, r.meta);
		},
	},
	{
		id: "qr-generator",
		accepts: ["text"],
		produces: "image",
		sensitivity: "local",
		async run(input) {
			const dataUrl = await QRCode.toDataURL(input.value, {
				width: 512,
				margin: 2,
				errorCorrectionLevel: "M",
				color: {dark: "#000000", light: "#ffffff"},
			});
			return makeImage(dataUrl, "512px PNG \u2014 generated locally");
		},
	},
	{
		id: "color-converter",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = convertColor(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "markdown-preview",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = markdownToHtml(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "hash-generator",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input, options) {
			const requested = (options as {algorithm?: string} | undefined)
				?.algorithm;
			const algorithm = (["SHA-1", "SHA-256", "SHA-512"] as const).includes(
				requested as "SHA-1" | "SHA-256" | "SHA-512",
			)
				? (requested as "SHA-1" | "SHA-256" | "SHA-512")
				: "SHA-256";
			const r = await generateHash(input.value, algorithm);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "sql-formatter",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = formatSql(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "cron-parser",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = describeCron(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "url-encoder",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input, options) {
			const mode =
				(options as {mode?: string} | undefined)?.mode === "decode"
					? "decode"
					: "encode";
			const r = transformUrl(input.value, mode);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "timestamp-converter",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = convertTimestamp(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "case-converter",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = convertCase(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "slug-generator",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = slugify(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "text-diff",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = diffLines(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "text-stats",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = analyzeText(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "json-to-csv",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = jsonToCsv(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "csv-to-json",
		accepts: ["text"],
		produces: "json",
		sensitivity: "local",
		async run(input) {
			const r = csvToJson(input.value);
			return makeJson(r.output, r.meta);
		},
	},
	{
		id: "json-to-yaml",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = jsonToYaml(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "number-base",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input) {
			const r = convertNumberBase(input.value);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "html-entities",
		accepts: ["text"],
		produces: "text",
		sensitivity: "local",
		async run(input, options) {
			const mode =
				(options as {mode?: string} | undefined)?.mode === "decode"
					? "decode"
					: "encode";
			const r = transformHtmlEntities(input.value, mode);
			return makeText(r.output, r.meta);
		},
	},
	{
		id: "query-parser",
		accepts: ["text"],
		produces: "json",
		sensitivity: "local",
		async run(input) {
			const r = parseQueryString(input.value);
			return makeJson(r.output, r.meta);
		},
	},
		{
			id: "password-generator",
			accepts: ["text"],
			produces: "text",
			sensitivity: "local",
			async run(input) {
				const r = generatePassword(input.value);
				return makeText(r.output, r.meta);
			},
		},
		{
			id: "yaml-formatter",
			accepts: ["text"],
			produces: "text",
			sensitivity: "local",
			async run(input) { const r = formatYaml(input.value); return makeText(r.output, r.meta); },
		},
		{
			id: "xml-formatter",
			accepts: ["text"],
			produces: "text",
			sensitivity: "local",
			async run(input) { const r = formatXml(input.value); return makeText(r.output, r.meta); },
		},
		{
			id: "markdown-linter",
			accepts: ["text"],
			produces: "text",
			sensitivity: "local",
			async run(input) { const r = lintMarkdown(input.value); return makeText(r.output, r.meta); },
		},
		{
			id: "url-parser",
			accepts: ["text"],
			produces: "json",
			sensitivity: "local",
			async run(input) { const r = parseUrl(input.value); return makeJson(r.output, r.meta); },
		},
		{
			id: "gitignore-generator",
			accepts: ["text"],
			produces: "text",
			sensitivity: "local",
			async run(input) { const r = generateGitignore(input.value); return makeText(r.output, r.meta); },
		},
		{
			id: "json-to-typescript",
			accepts: ["text"],
			produces: "text",
			sensitivity: "local",
			async run(input) { const r = jsonToTypescript(input.value); return makeText(r.output, r.meta); },
		},
	];

const engineMap = new Map(engineList.map((e) => [e.id, e]));

/** Look up a ToolEngine by its slug. Returns undefined for unknown slugs. */
export function getEngine(id: string): ToolEngine | undefined {
	return engineMap.get(id);
}

/** All registered engines in declaration order. */
export const engines: readonly ToolEngine[] = engineList;

export type {ToolEngine, ToolResult, ToolValue, ToolValueType} from "./engine-types";
