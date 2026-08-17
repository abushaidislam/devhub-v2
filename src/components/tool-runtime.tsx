"use client";
import {useEffect, useMemo, useState} from "react";
import {Check, Copy, Download, Play, RotateCcw} from "lucide-react";
import {consumeDetectionHandoff} from "@/lib/detection-handoff";
import {getEngine} from "@/lib/engine-registry";
import {trackActivationEvent} from "@/lib/analytics";
import {ToolAiAssist} from "./tool-ai-assist";
import styles from "./tool-runtime.module.css";

const defaults: Record<string, string> = {
	"json-formatter": '{\n  "name": "DevHub",\n  "ready": true\n}',
	base64: "Developer tools, engineered for speed.",
	"jwt-decoder":
		"eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZXZodWIiLCJyb2xlIjoiZGV2ZWxvcGVyIn0.",
	"uuid-generator": "5",
	"regex-tester": "Ship faster with DevHub. DevHub keeps tools focused.",
	"qr-generator": "https://devhub-toolkit-v2.vercel.app",
	"color-converter": "#5E9FE8",
	"markdown-preview":
		"# DevHub\n\n**Developer tools**, engineered for speed.\n\n- Private\n- Fast\n- Keyboard-first",
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
};

export function ToolRuntime({slug, name}: {slug: string; name: string}) {
	const initial = defaults[slug] ?? "";
	const [input, setInput] = useState(initial);
	const [aux, setAux] = useState(slug === "regex-tester" ? "DevHub" : "");
	const [option, setOption] = useState(
		slug === "hash-generator" ? "SHA-256" : "encode",
	);
	const [output, setOutput] = useState("");
	const [meta, setMeta] = useState("Ready");
	const [error, setError] = useState("");
	const [image, setImage] = useState("");
	const [copied, setCopied] = useState(false);

	const needsMode = ["base64", "url-encoder", "hash-generator", "html-entities"].includes(slug);
	const preview = slug === "markdown-preview";

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
					: `${name} input`,
		[slug, name],
	);

	function buildOptions(): unknown {
		if (slug === "base64" || slug === "url-encoder") return {mode: option};
		if (slug === "hash-generator") return {algorithm: option};
		if (slug === "regex-tester") return {pattern: aux, flags: "gi"};
		return undefined;
	}

	async function run() {
		setError("");
		setImage("");
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
			trackActivationEvent({name: "tool_run_succeeded", tool: slug});
		} catch (reason) {
			setError(
				reason instanceof Error
					? reason.message
					: "Unable to process this input.",
			);
			setMeta("Invalid input");
			trackActivationEvent({name: "tool_run_failed", tool: slug});
		}
	}

	async function copy() {
		if (!output || image) return;
		await navigator.clipboard.writeText(output);
		setCopied(true);
		setTimeout(() => setCopied(false), 1200);
	}

	function reset() {
		setInput(initial);
		setAux(slug === "regex-tester" ? "DevHub" : "");
		setOutput("");
		setImage("");
		setError("");
		setMeta("Ready");
	}

	return (
		<div className={styles.runtime}>
			<div className={styles.toolbar}>
				<div>
					<span className={styles.local}>{"\u25cf"} Local processing</span>
					<small>No input is sent to a server.</small>
				</div>
				<div>
					{needsMode && (
						<select
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
							) : (
								<>
									<option value="encode">Encode</option>
									<option value="decode">Decode</option>
								</>
							)}
						</select>
					)}
					<button onClick={reset}>
						<RotateCcw size={14} />
						Reset
					</button>
					<button onClick={copy} disabled={!output || !!image}>
						{copied ? <Check size={14} /> : <Copy size={14} />}
						Copy
					</button>
					<button className={styles.run} onClick={run}>
						<Play size={14} />
						Run
					</button>
				</div>
			</div>

			{slug === "regex-tester" && (
				<label className={styles.pattern}>
					<span>Pattern</span>
					<input
						value={aux}
						onChange={(event) => setAux(event.target.value)}
						placeholder="Regular expression"
					/>
				</label>
			)}

			<div className={styles.panels}>
				<section>
					<header>
						<span>Input</span>
						<small>{input.length} characters</small>
					</header>
					<textarea
						aria-label={placeholder}
						value={input}
						onChange={(event) => setInput(event.target.value)}
						placeholder={placeholder}
					/>
				</section>
				<section>
					<header>
						<span>Output</span>
						<small className={error ? styles.errorText : ""}>
							{error || meta}
						</small>
					</header>
					<div className={styles.output}>
						{error ? (
							<div className={styles.error}>{error}</div>
						) : image ? (
							<div className={styles.qr}>
								<img src={image} alt="Generated QR code" />
								<a href={image} download="devhub-qr.png">
									<Download size={14} />
									Download PNG
								</a>
							</div>
						) : preview && output ? (
							<div
								className={styles.markdown}
								dangerouslySetInnerHTML={{__html: output}}
							/>
						) : (
							<pre>{output || "Run the tool to see the output."}</pre>
						)}
					</div>
				</section>
			</div>

			<ToolAiAssist slug={slug} input={input} error={error || undefined} />
		</div>
	);
}
