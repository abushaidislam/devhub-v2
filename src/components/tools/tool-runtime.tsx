"use client";
import Image from "next/image";
import {useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent} from "react";
import {ArrowLeftRight, Check, Copy, Download, Play, RotateCcw} from "lucide-react";
import {Badge, StatusDot} from "../ui/badge";
import {Button} from "../ui/button";
import {consumeDetectionHandoff} from "@/lib/detection-handoff";
import {getEngine} from "@/lib/engine-registry";
import {trackActivationEvent} from "@/lib/analytics";
import {ToolAiAssist} from "./tool-ai-assist";
import {Switch} from "../ui/switch";
import styles from "./tool-runtime.module.css";

const MIN_PANEL_PERCENT = 25;
const MAX_PANEL_PERCENT = 75;
const PANEL_STEP = 5;

const defaults: Record<string, string> = {
	"json-formatter": '{\n  "name": "DevHub",\n  "ready": true\n}',
	base64: "Developer tools, engineered for speed.",
	"jwt-decoder":
		"eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZXZodWIiLCJyb2xlIjoiZGV2ZWxvcGVyIn0.",
	"uuid-generator": "5",
	"regex-tester": "Ship faster with DevHub. DevHub keeps tools focused.",
	"qr-generator": "https://devlove.flinkeo.online",
	"color-converter": "#5E9FE8",
"markdown-preview":
			"# DevHub Markdown Preview\n\n**Developer tools**, engineered for speed.\n\n> A fast, local-first workspace for everyday transformations.\n\n- [x] Private by default\n- [x] Live preview\n- [ ] Share the workflow\n\n| Feature | Status |\n| :--- | ---: |\n| Tables | Ready |\n| HTML export | Ready |\n\n```ts\nconst local = true;\n```",
	"hash-generator": "DevHub Toolkit",
	"sql-formatter":
		"select id, name from users where active = true and role = 'developer' order by name",
	"cron-parser": "0 9 * * 1",
	"url-encoder": "https://devhub.dev/tools?q=json formatter",
	"timestamp-converter": "1735689600",
	"case-converter": "devhub toolkit workspace",
	"slug-generator": "DevHub Toolkit — Local First Tools",
	"text-diff": "line one\nline two\nline three\n---\nline one\nline two changed\nline three",
	"text-stats": "DevHub keeps developer tools local, fast and keyboard-first.",
	"json-to-csv": '[\n  {"id": 1, "name": "DevHub"},\n  {"id": 2, "name": "Toolkit"}\n]',
	"csv-to-json": "id,name\n1,DevHub\n2,Toolkit",
	"json-to-yaml": '{\n  "name": "DevHub",\n  "tools": ["json", "yaml"]\n}',
	"number-base": "255",
	"html-entities": '<a href="/tools">Tools & more</a>',
	"query-parser": "https://devhub.dev/tools?q=json&tag=local&tag=fast",
		"password-generator": "20",
		"yaml-formatter": "name: DevHub\nfeatures:\n  - local\n  - fast",
		"xml-formatter": "<project><name>DevHub</name><private>true</private></project>",
		"markdown-linter": "# DevHub\n\n\n### Skipped heading\n\n[Empty link]()",
		"url-parser": "https://devhub.dev/tools?tag=local&tag=fast#readme",
		"gitignore-generator": "node\nnext\nvscode\nenv",
		"json-to-typescript": '{\n  "name": "DevHub",\n  "tools": ["json", "yaml"]\n}',
		"curl-converter": 'curl -X POST https://api.example.com/items \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer token123" \\\n  -d \'{"name": "Widget", "price": 42}\'',
	};

export function ToolRuntime({slug, name}: {slug: string; name: string}) {
	const initial = defaults[slug] ?? "";
	const [input, setInput] = useState(initial);
	const [aux, setAux] = useState(slug === "regex-tester" ? "DevHub" : "");
	const [option, setOption] = useState(
		slug === "hash-generator" ? "SHA-256" : slug === "curl-converter" ? "fetch" : "encode",
	);
	const [output, setOutput] = useState("");
	const [meta, setMeta] = useState("Ready");
	const [error, setError] = useState("");
	const [image, setImage] = useState("");
	const [copied, setCopied] = useState(false);
	const [isRunning, setIsRunning] = useState(false);
	const [inputPanelPercent, setInputPanelPercent] = useState(50);
	const [isResizing, setIsResizing] = useState(false);
	const panelsRef = useRef<HTMLDivElement>(null);

	const needsMode = ["base64", "url-encoder", "hash-generator", "html-entities", "curl-converter"].includes(slug);
		const preview = slug === "markdown-preview";
		const [livePreview, setLivePreview] = useState(preview);
		const [markdownView, setMarkdownView] = useState<"preview" | "html">("preview");
		const operation = useMemo(() => {
		if (slug === "regex-tester") return `test the input text against this regular expression pattern: ${aux}`;
		if (slug === "hash-generator") return `${option} hash`;
		if (slug === "curl-converter") return `convert cURL command to ${option}`;
		if (slug === "base64" || slug === "url-encoder") return option;
		const operations: Record<string, string> = {
			"json-formatter": "format and validate JSON",
			"jwt-decoder": "decode the JWT header and payload (signature is not verified)",
			"uuid-generator": "generate the requested number of cryptographically secure UUIDs",
			"qr-generator": "generate a QR code from the input text",
			"color-converter": "parse and convert a color value between HEX, RGB, and HSL",
			"markdown-preview": "render the input as safe Markdown preview",
			"sql-formatter": "format common SQL into readable, indented statements",
			"cron-parser": "interpret the five-field cron expression and explain its schedule",
			"timestamp-converter": "convert a Unix timestamp or ISO date",
			"case-converter": "convert text between supported casing styles",
			"slug-generator": "convert the heading into a URL-friendly slug",
			"text-diff": "compare the two text versions line by line",
			"text-stats": "calculate text statistics such as characters, words, and reading time",
			"json-to-csv": "convert a JSON array of objects into CSV rows",
			"csv-to-json": "convert a header-based CSV document into JSON",
			"json-to-yaml": "convert valid JSON into readable YAML",
			"number-base": "convert the number between decimal, hexadecimal, octal, and binary bases",
			"html-entities": "encode or decode HTML entities",
			"query-parser": "parse URL query parameters into structured key-value pairs",
				"password-generator": "generate a strong random password of the requested length",
				"yaml-formatter": "format and validate common YAML indentation",
				"xml-formatter": "pretty-print and validate well-formed XML",
				"markdown-linter": "find common Markdown structure and style issues",
				"url-parser": "inspect URL parts, query parameters, and fragments",
				"gitignore-generator": "generate .gitignore rules for selected stacks",
				"json-to-typescript": "generate TypeScript interfaces from JSON",
				"curl-converter": "convert cURL command into client code",
			};
		return operations[slug] ?? "analyze and transform input";
	}, [aux, option, slug]);

	useEffect(() => {
		const sample = consumeDetectionHandoff(slug);
		if (sample !== null) {
			setInput(sample);
			setOutput("");
			setImage("");
			setError("");
			setMeta("Detected input loaded");
		}
	}, [slug]);

	useEffect(() => {
		trackActivationEvent({name: "tool_opened", tool: slug});
	}, [slug]);

	const placeholder = useMemo(
		() =>
			slug === "regex-tester"
				? "Text to test"
				: slug === "uuid-generator"
					? "Number of UUIDs"
					: slug === "curl-converter"
						? "cURL command (e.g. curl https://api.example.com)"
						: `${name} input`,
		[slug, name],
	);

	function buildOptions(): unknown {
		if (slug === "base64" || slug === "url-encoder") return {mode: option};
		if (slug === "hash-generator") return {algorithm: option};
		if (slug === "regex-tester") return {pattern: aux, flags: "gi"};
		if (slug === "curl-converter") return {target: option};
		return undefined;
	}

		async function run({silent = false}: {silent?: boolean} = {}) {
			if (isRunning) return;
		setIsRunning(true);
		setError("");
		setImage("");
			if (!silent) setOutput("");
			try {
			const engine = getEngine(slug);
			if (!engine) throw new Error("Tool engine not found.");
			const result = await engine.run(
				{type: "text", value: input},
				buildOptions(),
			);
			const description =
				typeof result.meta?.description === "string"
					? result.meta.description
					: "Complete";
			if (result.output.type === "image") {
				setImage(result.output.value);
			}
			setOutput(result.output.value);
			setMeta(description);
				if (!silent) trackActivationEvent({name: "tool_run_succeeded", tool: slug});
		} catch (reason) {
			setError(
				reason instanceof Error
					? reason.message
					: "Unable to process this input.",
			);
			setMeta("Invalid input");
				if (!silent) trackActivationEvent({name: "tool_run_failed", tool: slug});
		} finally {
			setIsRunning(false);
		}
	}

		useEffect(() => {
			if (!preview || !livePreview) return;
			if (!input.trim()) {
				setOutput("");
				setError("");
				setMeta("Ready");
				return;
			}
			const timer = window.setTimeout(() => {
				void run({silent: true});
			}, 220);
			return () => window.clearTimeout(timer);
		// `run` is intentionally omitted: the effect is keyed to the latest input and mode state.
		// Re-running when the function identity changes would create a live-render loop.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [input, livePreview, preview]);

		async function copy() {
		if (!output || image || isRunning) return;
		await navigator.clipboard.writeText(output);
		setCopied(true);
		setTimeout(() => setCopied(false), 1200);
	}

		function downloadMarkdownHtml() {
			if (!output || !preview) return;
			const documentHtml = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n<title>Markdown export</title>\n</head>\n<body>\n${output}\n</body>\n</html>`;
			const href = URL.createObjectURL(new Blob([documentHtml], {type: "text/html;charset=utf-8"}));
			const link = document.createElement("a");
			link.href = href;
			link.download = "markdown-preview.html";
			link.click();
			URL.revokeObjectURL(href);
		}

		function updatePanelSize(clientX: number) {
			const panels = panelsRef.current;
			if (!panels) return;
			const bounds = panels.getBoundingClientRect();
			if (!bounds.width) return;
			const percentage = ((clientX - bounds.left) / bounds.width) * 100;
			setInputPanelPercent(
				Math.round(Math.min(Math.max(percentage, MIN_PANEL_PERCENT), MAX_PANEL_PERCENT)),
			);
		}

		function handleSplitterPointerDown(event: PointerEvent<HTMLDivElement>) {
			if (window.matchMedia("(max-width: 780px)").matches) return;
			event.preventDefault();
			event.currentTarget.setPointerCapture?.(event.pointerId);
			setIsResizing(true);
			updatePanelSize(event.clientX);
		}

		function handleSplitterPointerUp(event: PointerEvent<HTMLDivElement>) {
			if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			setIsResizing(false);
		}

		function handleSplitterKeyDown(event: KeyboardEvent<HTMLDivElement>) {
			if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
				event.preventDefault();
				setInputPanelPercent((value) => Math.max(MIN_PANEL_PERCENT, value - PANEL_STEP));
			} else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
				event.preventDefault();
				setInputPanelPercent((value) => Math.min(MAX_PANEL_PERCENT, value + PANEL_STEP));
			} else if (event.key === "Home") {
				event.preventDefault();
				setInputPanelPercent(MIN_PANEL_PERCENT);
			} else if (event.key === "End") {
				event.preventDefault();
				setInputPanelPercent(MAX_PANEL_PERCENT);
			}
		}

		useEffect(() => {
			if (!isResizing) return;
			const previousUserSelect = document.body.style.userSelect;
			document.body.style.userSelect = "none";
			return () => {
				document.body.style.userSelect = previousUserSelect;
			};
		}, [isResizing]);

		const [isMac, setIsMac] = useState(false);

		useEffect(() => {
			if (typeof navigator !== "undefined") {
				setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
			}
		}, []);

		function useOutputAsInput() {
			if (!output || Boolean(image) || isRunning || output === input) return;
			setInput(output);
			setMeta("Output copied to input");
		}

		const runRef = useRef(run);
		runRef.current = run;

		const copyRef = useRef(copy);
		copyRef.current = copy;

		const useOutputAsInputRef = useRef(useOutputAsInput);
		useOutputAsInputRef.current = useOutputAsInput;

		useEffect(() => {
			function onKeyDown(event: globalThis.KeyboardEvent) {
				if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
					event.preventDefault();
					void runRef.current();
					return;
				}
				if ((event.metaKey || event.ctrlKey) && event.shiftKey && (event.key === "c" || event.key === "C")) {
					if (output && !image && !isRunning) {
						event.preventDefault();
						void copyRef.current();
						return;
					}
				}
				if (event.altKey && (event.key === "s" || event.key === "S")) {
					if (output && !image && !isRunning) {
						event.preventDefault();
						useOutputAsInputRef.current();
						return;
					}
				}
			}
			window.addEventListener("keydown", onKeyDown);
			return () => window.removeEventListener("keydown", onKeyDown);
		}, [output, image, isRunning]);

		function reset() {
		setInput(initial);
		setAux(slug === "regex-tester" ? "DevHub" : "");
		setOutput("");
		setImage("");
		setError("");
		setMeta("Ready");
	}

	return (
		<div className={styles.runtime} aria-busy={isRunning}>
			<div className={styles.toolbar}>
				<div>
					<Badge className={styles.localBadge} variant="teal" size="sm" icon={<StatusDot status={isRunning ? "warning" : "success"} />}><span className={styles.local}>{isRunning ? "Processing locally…" : "Local processing"}</span></Badge>
					<small>{isRunning ? "Working on this input…" : "No input is sent to a server."}</small>
				</div>
				<div>
						{preview && (
							<div className={styles.markdownControls} role="group" aria-label="Markdown preview controls">
								<Switch checked={livePreview} onCheckedChange={setLivePreview} label="Live preview" disabled={isRunning} />
								<Button type="button" onClick={downloadMarkdownHtml} disabled={!output || isRunning} variant="secondary" size="small" prefix={<Download size={14} />}>
									Export HTML
								</Button>
							</div>
						)}
							{needsMode && (
								<div className={styles.selectField}>
									<select
										className={styles.select}
										disabled={isRunning}
										aria-label="Operation"
										value={option}
										onChange={(event) => setOption(event.target.value)}
									>
										{slug === "hash-generator" ? (
											<>
												<option>SHA-1</option>
												<option>SHA-256</option>
												<option>SHA-512</option>
											</>
										) : slug === "curl-converter" ? (
											<>
												<option value="fetch">JavaScript (Fetch)</option>
												<option value="axios">JavaScript (Axios)</option>
												<option value="python">Python (Requests)</option>
												<option value="node">Node.js</option>
												<option value="go">Go (net/http)</option>
												<option value="php">PHP (cURL)</option>
											</>
										) : (
											<>
												<option value="encode">Encode</option>
												<option value="decode">Decode</option>
											</>
										)}
									</select>
								</div>
							)}
<Button type="button" onClick={reset} disabled={isRunning} variant="secondary" size="small" prefix={<RotateCcw size={14} />}>
							Reset
						</Button>
						<Button
							type="button"
							onClick={useOutputAsInput}
							disabled={!output || Boolean(image) || isRunning || output === input}
							aria-label="Use output as input"
							title={isMac ? "Copy output to input (⌥S)" : "Copy output to input (Alt+S)"}
							variant="secondary"
							size="small"
							prefix={<ArrowLeftRight size={14} />}
						>
							Use as input
						</Button>
<Button
							type="button"
							onClick={copy}
							disabled={!output || !!image || isRunning}
							aria-label={copied ? "Copied output to clipboard" : preview ? "Copy rendered HTML to clipboard" : "Copy output to clipboard"}
							title={isMac ? "Copy output (⌘⇧C)" : "Copy output (Ctrl+Shift+C)"}
							variant="secondary"
							size="small"
							prefix={copied ? <Check size={14} /> : <Copy size={14} />}
						>
								{preview ? "Copy HTML" : "Copy"}
							</Button>
<Button
							type="button"
							className={styles.run}
							onClick={() => void run()}
							disabled={isRunning}
							aria-busy={isRunning}
							title={isMac ? "Run tool (⌘↵)" : "Run tool (Ctrl+↵)"}
							variant="default"
							size="small"
							loading={isRunning}
							prefix={<Play size={14} />}
						>
								Run <kbd className={styles.kbd}>{isMac ? "⌘↵" : "Ctrl+↵"}</kbd>
							</Button>
				</div>
			</div>

			{slug === "regex-tester" && (
				<label className={styles.pattern}>
					<span>Pattern</span>
					<input
value={aux}
							disabled={isRunning}
							onChange={(event) => setAux(event.target.value)}
						placeholder="Regular expression"
					/>
				</label>
			)}

				<div
					ref={panelsRef}
					className={styles.panels}
					style={{
						"--input-panel-size": `${inputPanelPercent}%`,
					} as CSSProperties}
				>
					<section>
					<header>
						<span>Input</span>
						<small>{input.length} characters</small>
					</header>
					<textarea
						aria-label={placeholder}
value={input}
							disabled={isRunning}
							onChange={(event) => setInput(event.target.value)}
						placeholder={placeholder}
					/>
					</section>
					<div
						className={styles.splitter}
						role="separator"
						aria-label="Resize input and output panels"
						aria-orientation="vertical"
						aria-valuemin={MIN_PANEL_PERCENT}
						aria-valuemax={MAX_PANEL_PERCENT}
						aria-valuenow={inputPanelPercent}
						aria-valuetext={`${inputPanelPercent}% input, ${100 - inputPanelPercent}% output`}
						tabIndex={0}
						onKeyDown={handleSplitterKeyDown}
						onPointerDown={handleSplitterPointerDown}
						onPointerMove={(event) => {
							if (isResizing) updatePanelSize(event.clientX);
						}}
						onPointerUp={handleSplitterPointerUp}
						onPointerCancel={handleSplitterPointerUp}
						onDoubleClick={() => setInputPanelPercent(50)}
						data-resizing={isResizing}
						title="Drag to resize. Use arrow keys for precise adjustments. Double-click to reset."
					/>
					<section>
							<header className={preview ? styles.previewHeader : ""}>
							<span>{preview ? "Markdown preview" : "Output"}</span>
							{preview && !error && output && (
								<div className={styles.previewModes} role="tablist" aria-label="Markdown output view">
									<button type="button" role="tab" aria-selected={markdownView === "preview"} className={markdownView === "preview" ? styles.activeTab : ""} onClick={() => setMarkdownView("preview")}>Preview</button>
									<button type="button" role="tab" aria-selected={markdownView === "html"} className={markdownView === "html" ? styles.activeTab : ""} onClick={() => setMarkdownView("html")}>HTML</button>
								</div>
							)}
						<small className={error ? styles.errorText : ""}>
							{isRunning ? "Processing locally…" : error || meta}
						</small>
					</header>
					<div className={styles.output}>
						{error ? (
							<div className={styles.error} role="alert">
								<strong>Could not process this input.</strong>
								<span>{error}</span>
								<div>
<Button type="button" onClick={() => void run()} variant="error" size="small">Try again</Button>
										<Button type="button" onClick={reset} variant="secondary" size="small">Reset sample</Button>
								</div>
							</div>
						) : image ? (
							<div className={styles.qr}>
								<Image src={image} alt="Generated QR code" width={256} height={256} unoptimized />
								<a href={image} download="devhub-qr.png">
									<Download size={14} />
									Download PNG
								</a>
							</div>
							) : preview && output && markdownView === "preview" ? (
								<div
									className={styles.markdown}
									dangerouslySetInnerHTML={{__html: output}}
								/>
							) : preview && output ? (
								<pre className={styles.htmlOutput}>{output}</pre>
							) : (
							<pre>{isRunning ? "Processing locally…" : output || "Add an input and run this tool to see the output."}</pre>
						)}
					</div>
				</section>
			</div>

			<ToolAiAssist
				slug={slug}
				input={input}
				error={error || undefined}
				operation={operation}
			/>
		</div>
	);
}
