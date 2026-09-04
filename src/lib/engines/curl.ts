import { EngineResult, ensureBatchInput } from "./utils";

export interface ParsedCurl {
	url: string;
	method: string;
	headers: Record<string, string>;
	data: string | null;
	auth: { username: string; password?: string } | null;
	cookies: string[];
	unsupportedFetchFlags: string[];
}

/**
 * Tokenize a cURL command string into an array of command arguments,
 * properly handling single quotes, double quotes, escape sequences,
 * and line continuations.
 */
export function tokenizeCurl(command: string): string[] {
	// Normalize line continuation backslashes
	const cleaned = command.replace(/\\\r?\n/g, " ").trim();
	const tokens: string[] = [];
	let current = "";
	let inSingle = false;
	let inDouble = false;
	let escaping = false;

	for (let i = 0; i < cleaned.length; i++) {
		const char = cleaned[i];

		if (escaping) {
			current += char;
			escaping = false;
			continue;
		}

		if (char === "\\") {
			if (inSingle) {
				current += char;
			} else {
				escaping = true;
			}
			continue;
		}

		if (char === "'" && !inDouble) {
			inSingle = !inSingle;
			continue;
		}

		if (char === '"' && !inSingle) {
			inDouble = !inDouble;
			continue;
		}

		if (!inSingle && !inDouble && /\s/.test(char)) {
			if (current.length > 0) {
				tokens.push(current);
				current = "";
			}
			continue;
		}

		current += char;
	}

	if (current.length > 0) {
		tokens.push(current);
	}

	return tokens;
}

/**
 * Parse a raw cURL command into structured HTTP request components.
 */
export function parseCurl(command: string): ParsedCurl {
	const normalized = ensureBatchInput(command, "Enter a valid cURL command.");
	const tokens = tokenizeCurl(normalized);

	if (tokens.length === 0) {
		throw new Error("Enter a valid cURL command.");
	}

	// First non-comment token must be 'curl'
	let startIndex = 0;
	while (startIndex < tokens.length && tokens[startIndex].startsWith("#")) {
		startIndex++;
	}

	if (startIndex >= tokens.length || tokens[startIndex].toLowerCase() !== "curl") {
		throw new Error("cURL command must start with 'curl'.");
	}

	let url = "";
	let method: string | null = null;
	const headers: Record<string, string> = {};
	const dataParts: string[] = [];
	let auth: { username: string; password?: string } | null = null;
	const cookies: string[] = [];
	const unsupportedFetchFlags: string[] = [];

	for (let i = startIndex + 1; i < tokens.length; i++) {
		const token = tokens[i];

		// Method flags
		if (token === "-X" || token === "--request") {
			if (i + 1 < tokens.length) {
				method = tokens[++i].toUpperCase();
			}
			continue;
		}
		if (token.startsWith("--request=")) {
			method = token.slice("--request=".length).toUpperCase();
			continue;
		}

		// HEAD shorthand
		if (token === "-I" || token === "--head") {
			method = "HEAD";
			continue;
		}

		// URL flag
		if (token === "--url") {
			if (i + 1 < tokens.length) {
				url = tokens[++i];
			}
			continue;
		}
		if (token.startsWith("--url=")) {
			url = token.slice("--url=".length);
			continue;
		}

		// Header flags
		if (token === "-H" || token === "--header") {
			if (i + 1 < tokens.length) {
				const headerLine = tokens[++i];
				const colonIdx = headerLine.indexOf(":");
				if (colonIdx > 0) {
					const name = headerLine.slice(0, colonIdx).trim();
					const val = headerLine.slice(colonIdx + 1).trim();
					headers[name] = val;
				}
			}
			continue;
		}
		if (token.startsWith("-H") && token.length > 2) {
			const headerLine = token.slice(2);
			const colonIdx = headerLine.indexOf(":");
			if (colonIdx > 0) {
				const name = headerLine.slice(0, colonIdx).trim();
				const val = headerLine.slice(colonIdx + 1).trim();
				headers[name] = val;
			}
			continue;
		}
		if (token.startsWith("--header=")) {
			const headerLine = token.slice("--header=".length);
			const colonIdx = headerLine.indexOf(":");
			if (colonIdx > 0) {
				const name = headerLine.slice(0, colonIdx).trim();
				const val = headerLine.slice(colonIdx + 1).trim();
				headers[name] = val;
			}
			continue;
		}

		// Cookie flags (-b, --cookie)
		if (token === "-b" || token === "--cookie") {
			if (i + 1 < tokens.length) {
				cookies.push(tokens[++i]);
			}
			continue;
		}
		if (token.startsWith("-b") && token.length > 2) {
			cookies.push(token.slice(2));
			continue;
		}
		if (token.startsWith("--cookie=")) {
			cookies.push(token.slice("--cookie=".length));
			continue;
		}

		// Advanced network flags (--retry, --connect-timeout, --compressed)
		if (token === "--retry") {
			if (!unsupportedFetchFlags.includes("--retry")) unsupportedFetchFlags.push("--retry");
			if (i + 1 < tokens.length && !tokens[i + 1].startsWith("-")) {
				i++;
			}
			continue;
		}
		if (token.startsWith("--retry=")) {
			if (!unsupportedFetchFlags.includes("--retry")) unsupportedFetchFlags.push("--retry");
			continue;
		}
		if (token === "--connect-timeout") {
			if (!unsupportedFetchFlags.includes("--connect-timeout")) unsupportedFetchFlags.push("--connect-timeout");
			if (i + 1 < tokens.length && !tokens[i + 1].startsWith("-")) {
				i++;
			}
			continue;
		}
		if (token.startsWith("--connect-timeout=")) {
			if (!unsupportedFetchFlags.includes("--connect-timeout")) unsupportedFetchFlags.push("--connect-timeout");
			continue;
		}
		if (token === "--compressed") {
			if (!unsupportedFetchFlags.includes("--compressed")) unsupportedFetchFlags.push("--compressed");
			continue;
		}

		// Data / Body flags
		if (
			token === "-d" ||
			token === "--data" ||
			token === "--data-raw" ||
			token === "--data-binary" ||
			token === "--data-urlencode"
		) {
			if (i + 1 < tokens.length) {
				dataParts.push(tokens[++i]);
			}
			continue;
		}
		if (token.startsWith("-d") && token.length > 2) {
			dataParts.push(token.slice(2));
			continue;
		}
		if (
			token.startsWith("--data=") ||
			token.startsWith("--data-raw=") ||
			token.startsWith("--data-binary=") ||
			token.startsWith("--data-urlencode=")
		) {
			const eqIdx = token.indexOf("=");
			dataParts.push(token.slice(eqIdx + 1));
			continue;
		}

		// Basic Auth flag
		if (token === "-u" || token === "--user") {
			if (i + 1 < tokens.length) {
				const creds = tokens[++i];
				const colonIdx = creds.indexOf(":");
				if (colonIdx >= 0) {
					auth = {
						username: creds.slice(0, colonIdx),
						password: creds.slice(colonIdx + 1),
					};
				} else {
					auth = { username: creds };
				}
			}
			continue;
		}
		if (token.startsWith("--user=")) {
			const creds = token.slice("--user=".length);
			const colonIdx = creds.indexOf(":");
			if (colonIdx >= 0) {
				auth = {
					username: creds.slice(0, colonIdx),
					password: creds.slice(colonIdx + 1),
				};
			} else {
				auth = { username: creds };
			}
			continue;
		}

		// Other common options that take an argument we should skip
		if (
			[
				"-A",
				"--user-agent",
				"-c",
				"--cookie-jar",
				"-e",
				"--referer",
				"-o",
				"--output",
				"-m",
				"--max-time",
				"-x",
				"--proxy",
			].includes(token)
		) {
			i++;
			continue;
		}

		// Skip common boolean flags
		if (
			token.startsWith("-") &&
			(token.length === 2 || token.startsWith("--"))
		) {
			continue;
		}

		// If no URL yet and token does not start with dash, it is the positional URL
		if (!url && !token.startsWith("-")) {
			url = token;
		}
	}

	if (!url) {
		throw new Error("No URL found in cURL command.");
	}

	// Clean quotes from URL if any
	url = url.replace(/^['"]|['"]$/g, "");

	// Default method logic: if data was supplied and method wasn't explicitly set, default to POST; otherwise GET
	const data = dataParts.length > 0 ? dataParts.join("&") : null;
	if (!method) {
		method = data !== null ? "POST" : "GET";
	}

	// If auth is present and Authorization header is missing, add basic auth
	if (auth && !headers["Authorization"] && !headers["authorization"]) {
		const encoded = btoa(`${auth.username}:${auth.password ?? ""}`);
		headers["Authorization"] = `Basic ${encoded}`;
	}

	// Inject extracted cookies into headers as Cookie
	if (cookies.length > 0) {
		const cookieValue = cookies.join("; ");
		headers["Cookie"] = headers["Cookie"] ? `${headers["Cookie"]}; ${cookieValue}` : cookieValue;
	}

	return {
		url,
		method,
		headers,
		data,
		auth,
		cookies,
		unsupportedFetchFlags,
	};
}

function isJsonData(data: string | null): boolean {
	if (!data) return false;
	const trimmed = data.trim();
	if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return false;
	try {
		JSON.parse(trimmed);
		return true;
	} catch {
		return false;
	}
}

/**
 * Generate JavaScript Fetch code
 */
function toFetch(parsed: ParsedCurl): string {
	const isJson = isJsonData(parsed.data);
	const hasHeaders = Object.keys(parsed.headers).length > 0;
	const isSimpleGet = parsed.method === "GET" && !hasHeaders && !parsed.data;
	let output = "";

	if (isSimpleGet) {
		output = `const response = await fetch(${JSON.stringify(parsed.url)});\nconst data = await response.json();\nconsole.log(data);`;
	} else {
		const options: string[] = [];
		options.push(`  method: ${JSON.stringify(parsed.method)}`);

		if (hasHeaders) {
			const headerLines = Object.entries(parsed.headers)
				.map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
				.join(",\n");
			options.push(`  headers: {\n${headerLines}\n  }`);
		}

		if (parsed.data !== null) {
			if (isJson) {
				const formatted = JSON.stringify(JSON.parse(parsed.data), null, 4)
					.split("\n")
					.map((line, idx) => (idx === 0 ? line : `    ${line}`))
					.join("\n");
				options.push(`  body: JSON.stringify(${formatted})`);
			} else {
				options.push(`  body: ${JSON.stringify(parsed.data)}`);
			}
		}

		const optionsStr = `{\n${options.join(",\n")}\n}`;
		output = `const response = await fetch(${JSON.stringify(parsed.url)}, ${optionsStr});\nconst data = await response.json();\nconsole.log(data);`;
	}

	if (parsed.unsupportedFetchFlags.length > 0) {
		output +=
			"\n\n// Note: --retry, --connect-timeout, or --compressed flags were detected in your cURL command but are not natively supported by the standard Fetch API.";
	}

	return output;
}

/**
 * Generate JavaScript Axios code
 */
function toAxios(parsed: ParsedCurl): string {
	const isJson = isJsonData(parsed.data);
	const hasHeaders = Object.keys(parsed.headers).length > 0;

	const config: string[] = [];
	config.push(`  method: ${JSON.stringify(parsed.method.toLowerCase())}`);
	config.push(`  url: ${JSON.stringify(parsed.url)}`);

	if (hasHeaders) {
		const headerLines = Object.entries(parsed.headers)
			.map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
			.join(",\n");
		config.push(`  headers: {\n${headerLines}\n  }`);
	}

	if (parsed.data !== null) {
		if (isJson) {
			const formatted = JSON.stringify(JSON.parse(parsed.data), null, 4)
				.split("\n")
				.map((line, idx) => (idx === 0 ? line : `  ${line}`))
				.join("\n");
			config.push(`  data: ${formatted}`);
		} else {
			config.push(`  data: ${JSON.stringify(parsed.data)}`);
		}
	}

	return `import axios from "axios";\n\nconst response = await axios({\n${config.join(",\n")}\n});\n\nconsole.log(response.data);`;
}

/**
 * Generate Python Requests code
 */
function toPythonRequests(parsed: ParsedCurl): string {
	const lines: string[] = ["import requests", ""];
	lines.push(`url = ${JSON.stringify(parsed.url)}`);

	const hasHeaders = Object.keys(parsed.headers).length > 0;
	if (hasHeaders) {
		lines.push("headers = {");
		for (const [k, v] of Object.entries(parsed.headers)) {
			lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
		}
		lines.push("}");
	}

	const isJson = isJsonData(parsed.data);
	if (parsed.data !== null) {
		if (isJson) {
			lines.push(`data = ${JSON.stringify(JSON.parse(parsed.data), null, 4)}`);
		} else {
			lines.push(`data = ${JSON.stringify(parsed.data)}`);
		}
	}

	lines.push("");
	const args: string[] = ["url"];
	if (hasHeaders) args.push("headers=headers");
	if (parsed.data !== null) {
		args.push(isJson ? "json=data" : "data=data");
	}

	const methodFunc = parsed.method.toLowerCase();
	if (["get", "post", "put", "delete", "patch", "head"].includes(methodFunc)) {
		lines.push(`response = requests.${methodFunc}(${args.join(", ")})`);
	} else {
		lines.push(
			`response = requests.request(${JSON.stringify(parsed.method)}, ${args.join(", ")})`,
		);
	}

	lines.push("print(response.json())");
	return lines.join("\n");
}

/**
 * Generate Node.js native fetch / HTTP code
 */
function toNodeFetch(parsed: ParsedCurl): string {
	const fetchCode = toFetch(parsed);
	return `// Node.js v18+ native fetch\n${fetchCode}`;
}

/**
 * Generate Go net/http code
 */
function toGolang(parsed: ParsedCurl): string {
	const lines: string[] = [
		"package main",
		"",
		"import (",
		'\t"fmt"',
		'\t"io"',
		'\t"net/http"',
	];

	if (parsed.data !== null) {
		lines.push('\t"strings"');
	}
	lines.push(")", "", "func main() {", `\turl := ${JSON.stringify(parsed.url)}`);

	if (parsed.data !== null) {
		lines.push(
			`\tpayload := strings.NewReader(${JSON.stringify(parsed.data)})`,
		);
		lines.push(
			`\treq, err := http.NewRequest(${JSON.stringify(parsed.method)}, url, payload)`,
		);
	} else {
		lines.push(
			`\treq, err := http.NewRequest(${JSON.stringify(parsed.method)}, url, nil)`,
		);
	}

	lines.push("\tif err != nil {", "\t\tpanic(err)", "\t}", "");

	for (const [k, v] of Object.entries(parsed.headers)) {
		lines.push(`\treq.Header.Add(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
	}

	lines.push(
		"",
		"\tres, err := http.DefaultClient.Do(req)",
		"\tif err != nil {",
		"\t\tpanic(err)",
		"\t}",
		"\tdefer res.Body.Close()",
		"",
		"\tbody, _ := io.ReadAll(res.Body)",
		"\tfmt.Println(string(body))",
		"}",
	);

	return lines.join("\n");
}

/**
 * Generate PHP cURL code
 */
function toPhp(parsed: ParsedCurl): string {
	const lines: string[] = ["<?php", "", "$curl = curl_init();", "", "curl_setopt_array($curl, ["];
	lines.push(`  CURLOPT_URL => ${JSON.stringify(parsed.url)},`);
	lines.push("  CURLOPT_RETURNTRANSFER => true,");
	lines.push("  CURLOPT_ENCODING => '',");
	lines.push("  CURLOPT_MAXREDIRS => 10,");
	lines.push("  CURLOPT_TIMEOUT => 30,");
	lines.push("  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,");
	lines.push(`  CURLOPT_CUSTOMREQUEST => ${JSON.stringify(parsed.method)},`);

	if (parsed.data !== null) {
		lines.push(`  CURLOPT_POSTFIELDS => ${JSON.stringify(parsed.data)},`);
	}

	if (Object.keys(parsed.headers).length > 0) {
		lines.push("  CURLOPT_HTTPHEADER => [");
		for (const [k, v] of Object.entries(parsed.headers)) {
			lines.push(`    ${JSON.stringify(`${k}: ${v}`)},`);
		}
		lines.push("  ],");
	}

	lines.push(
		"]);",
		"",
		"$response = curl_exec($curl);",
		"$err = curl_error($curl);",
		"",
		"curl_close($curl);",
		"",
		"if ($err) {",
		'  echo "cURL Error #:" . $err;',
		"} else {",
		"  echo $response;",
		"}",
	);

	return lines.join("\n");
}

/**
 * Main cURL to Code Converter Engine entry point.
 */
export function curlToCode(
	input: string,
	options?: { target?: string } | string,
): EngineResult {
	const target =
		(typeof options === "string" ? options : options?.target)?.toLowerCase() ??
		"fetch";

	const parsed = parseCurl(input);
	let output = "";

	switch (target) {
		case "axios":
		case "javascript (axios)":
			output = toAxios(parsed);
			break;
		case "python":
		case "python (requests)":
			output = toPythonRequests(parsed);
			break;
		case "node":
		case "node.js":
			output = toNodeFetch(parsed);
			break;
		case "go":
		case "go (net/http)":
		case "golang":
			output = toGolang(parsed);
			break;
		case "php":
		case "php (curl)":
			output = toPhp(parsed);
			break;
		case "fetch":
		case "javascript (fetch)":
		default:
			output = toFetch(parsed);
			break;
	}

	const headerCount = Object.keys(parsed.headers).length;
	return {
		output,
		meta: `Converted to ${target} — ${parsed.method} ${parsed.url.replace(/^https?:\/\//, "").slice(0, 30)} (${headerCount} header${headerCount === 1 ? "" : "s"})`,
	};
}
