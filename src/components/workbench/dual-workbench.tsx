"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type KeyboardEvent } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  Columns2,
  Copy,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { tools, getTool } from "@/lib/tools";
import { getEngine } from "@/lib/engine-registry";
import { parseCurl } from "@/lib/engines/curl";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, type SelectOption } from "../ui/select";
import styles from "./dual-workbench.module.css";

const TOOL_SELECT_OPTIONS: SelectOption[] = tools.map((t) => {
  const IconComp = t.icon;
  return {
    value: t.slug,
    label: t.name,
    group: t.category,
    icon: <IconComp size={13} />,
  };
});

type Preset = {
  id: string;
  name: string;
  leftSlug: string;
  rightSlug: string;
  leftOption?: string;
  rightOption?: string;
  initialLeftInput: string;
};

const WORKBENCH_PRESETS: Preset[] = [
  {
    id: "curl-to-ts",
    name: "cURL → TypeScript",
    leftSlug: "curl-converter",
    rightSlug: "json-to-typescript",
    leftOption: "fetch",
    initialLeftInput:
      'curl -X POST https://api.example.com/items \\\n  -H "Content-Type: application/json" \\\n  -d \'{"id": 101, "name": "DevHub Toolkit", "active": true, "tags": ["local", "speed"]}\'',
  },
  {
    id: "b64-to-json",
    name: "Base64 → JSON Formatter",
    leftSlug: "base64",
    rightSlug: "json-formatter",
    leftOption: "decode",
    initialLeftInput:
      "eyJuYW1lIjoiRGV2SHViIiwidmVyc2lvbiI6Mi4wLCJsb2NhbEZpcnN0Ijp0cnVlfQ==",
  },
  {
    id: "json-to-yaml",
    name: "JSON → YAML",
    leftSlug: "json-formatter",
    rightSlug: "json-to-yaml",
    initialLeftInput:
      '{\n  "service": "devhub-workspace",\n  "port": 3000,\n  "local": true,\n  "features": ["zero-network", "instant-sync"]\n}',
  },
  {
    id: "url-to-query",
    name: "URL Parser → Query Parser",
    leftSlug: "url-parser",
    rightSlug: "query-parser",
    initialLeftInput:
      "https://devhub.dev/tools?format=json&mode=local&tags=fast&tags=private#workspace",
  },
  {
    id: "diff-compare",
    name: "Case Converter → Text Diff",
    leftSlug: "case-converter",
    rightSlug: "text-diff",
    initialLeftInput: "devhub developer workspace toolkit",
  },
];

const DEFAULT_SAMPLES: Record<string, string> = {
  "json-formatter": '{\n  "status": "ok",\n  "data": [1, 2, 3]\n}',
  base64: "Developer tools, engineered for speed.",
  "jwt-decoder":
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZXZodWIiLCJyb2xlIjoiZGV2ZWxvcGVyIn0.",
  "curl-converter":
    'curl https://api.example.com/v1/users -H "Accept: application/json" -d \'{"role": "admin"}\'',
  "json-to-typescript":
    '{\n  "userId": 42,\n  "username": "coder",\n  "roles": ["admin", "editor"]\n}',
  "json-to-yaml": '{\n  "name": "DevHub",\n  "tools": 31\n}',
  "url-parser": "https://devhub.dev/search?q=local-first&safe=true",
  "query-parser": "https://devhub.dev/search?q=local-first&safe=true",
  "text-diff": "version one\nversion two\n---\nversion one\nversion two modified",
  "case-converter": "devhub split workbench",
};

export function DualWorkbench() {
  const [activePreset, setActivePreset] = useState<string>("curl-to-ts");
  const [leftSlug, setLeftSlug] = useState<string>("curl-converter");
  const [rightSlug, setRightSlug] = useState<string>("json-to-typescript");

  const [leftOption, setLeftOption] = useState<string>("fetch");
  const [rightOption, setRightOption] = useState<string>("encode");

  const [leftInput, setLeftInput] = useState<string>(
    WORKBENCH_PRESETS[0]?.initialLeftInput ?? "",
  );
  const [rightInput, setRightInput] = useState<string>("");

  const [leftOutput, setLeftOutput] = useState<string>("");
  const [rightOutput, setRightOutput] = useState<string>("");

  const [leftError, setLeftError] = useState<string>("");
  const [rightError, setRightError] = useState<string>("");

  const [leftMeta, setLeftMeta] = useState<string>("Ready");
  const [rightMeta, setRightMeta] = useState<string>("Ready");

  const [leftRunning, setLeftRunning] = useState<boolean>(false);
  const [rightRunning, setRightRunning] = useState<boolean>(false);

  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isResizing, setIsResizing] = useState<boolean>(false);

  const [leftCopied, setLeftCopied] = useState<boolean>(false);
  const [rightCopied, setRightCopied] = useState<boolean>(false);

  const leftExecCount = useRef(0);
  const rightExecCount = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const leftTool = getTool(leftSlug);
  const rightTool = getTool(rightSlug);

  function getToolOptions(slug: string, optionVal: string): unknown {
    if (slug === "base64" || slug === "url-encoder" || slug === "html-entities") return { mode: optionVal };
    if (slug === "hash-generator") return { algorithm: optionVal };
    if (slug === "curl-converter") return { target: optionVal };
    return undefined;
  }

  async function runTool(
    slug: string,
    val: string,
    opt: string,
  ): Promise<{ ok: boolean; output: string; meta: string }> {
    const engine = getEngine(slug);
    if (!engine) return { ok: false, output: "", meta: "Engine not found" };
    try {
      const res = await engine.run(
        { type: "text", value: val },
        getToolOptions(slug, opt),
      );
      const desc =
        typeof res.meta?.description === "string"
          ? res.meta.description
          : "Complete";
      return { ok: true, output: res.output.value, meta: desc };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Processing failed";
      return { ok: false, output: "", meta: msg };
    }
  }

  async function executeLeft(
    currentVal = leftInput,
    currentOpt = leftOption,
    currentSlug = leftSlug,
    targetRightSlug = rightSlug,
    targetRightOpt = rightOption,
  ) {
    const execId = ++leftExecCount.current;
    setLeftRunning(true);
    setLeftError("");

    const res = await runTool(currentSlug, currentVal, currentOpt);
    if (execId !== leftExecCount.current) return;
    setLeftRunning(false);

    if (res.ok) {
      setLeftOutput(res.output);
      setLeftMeta(res.meta);

      if (autoSync && res.output.trim()) {
        pipeToRight(res.output, targetRightSlug, targetRightOpt, currentVal);
      }
    } else {
      setLeftError(res.meta);
      setLeftMeta("Error");
    }
  }

  async function executeRight(
    currentVal = rightInput,
    currentOpt = rightOption,
    currentSlug = rightSlug,
  ) {
    const execId = ++rightExecCount.current;
    setRightRunning(true);
    setRightError("");

    const res = await runTool(currentSlug, currentVal, currentOpt);
    if (execId !== rightExecCount.current) return;
    setRightRunning(false);

    if (res.ok) {
      setRightOutput(res.output);
      setRightMeta(res.meta);
    } else {
      setRightError(res.meta);
      setRightMeta("Error");
    }
  }

  function extractJsonPayload(text: string, sourceInput: string): string {
    try {
      JSON.parse(text);
      return text;
    } catch {}

    // 1. If source is cURL command, use parseCurl to robustly extract body
    if (sourceInput && sourceInput.trim().toLowerCase().startsWith("curl")) {
      try {
        const parsed = parseCurl(sourceInput);
        if (parsed.data) {
          try {
            JSON.parse(parsed.data);
            return parsed.data;
          } catch {}
        }
      } catch {}
    }

    // 2. Extract body from fetch/axios JSON.stringify(...) code
    const stringifyMatch = text.match(/body:\s*JSON\.stringify\((\s*[\{\[][\s\S]*?[\}\]]\s*)\)/);
    if (stringifyMatch && stringifyMatch[1]) {
      try {
        JSON.parse(stringifyMatch[1].trim());
        return stringifyMatch[1].trim();
      } catch {}
    }

    // 3. Fallback regex for -d or --data flags
    const curlDataMatch = sourceInput.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]({[\s\S]*?}|\[[\s\S]*?\])['"]/);
    if (curlDataMatch && curlDataMatch[1]) {
      try {
        JSON.parse(curlDataMatch[1]);
        return curlDataMatch[1];
      } catch {}
    }

    return text;
  }

  function pipeToRight(
    textToPipe = leftOutput,
    currentRightSlug = rightSlug,
    currentRightOpt = rightOption,
    currentLeftInput = leftInput,
  ) {
    if (!textToPipe) return;

    let payload = textToPipe;
    if (
      currentRightSlug === "json-to-typescript" ||
      currentRightSlug === "json-formatter" ||
      currentRightSlug === "json-to-yaml" ||
      currentRightSlug === "json-to-csv"
    ) {
      payload = extractJsonPayload(textToPipe, currentLeftInput);
    }

    setRightInput(payload);
    void executeRight(payload, currentRightOpt, currentRightSlug);
  }

  function swapPanes() {
    setLeftSlug(rightSlug);
    setRightSlug(leftSlug);

    setLeftOption(rightOption);
    setRightOption(leftOption);

    setLeftInput(rightInput);
    setRightInput(leftInput);

    setLeftOutput(rightOutput);
    setRightOutput(leftOutput);

    setLeftError("");
    setRightError("");
    setActivePreset("");
  }

  function applyPreset(preset: Preset) {
    setActivePreset(preset.id);
    setLeftSlug(preset.leftSlug);
    setRightSlug(preset.rightSlug);
    const newLeftOpt = preset.leftOption ?? "fetch";
    const newRightOpt = preset.rightOption ?? "encode";
    setLeftOption(newLeftOpt);
    setRightOption(newRightOpt);

    setLeftInput(preset.initialLeftInput);
    setRightInput("");
    setLeftOutput("");
    setRightOutput("");
    setLeftError("");
    setRightError("");

    void executeLeft(
      preset.initialLeftInput,
      newLeftOpt,
      preset.leftSlug,
      preset.rightSlug,
      newRightOpt,
    );
  }

  // Initial execution on mount
  useEffect(() => {
    void executeLeft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Splitter Drag Handlers
  function updateSplitSize(clientX: number) {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (!rect.width) return;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setSplitPercent(Math.round(Math.min(Math.max(percent, 25), 75)));
  }

  function handleSplitterDown(e: PointerEvent<HTMLDivElement>) {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(max-width: 860px)").matches
    ) {
      return;
    }
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsResizing(true);
    updateSplitSize(e.clientX);
  }

  function handleSplitterUp(e: PointerEvent<HTMLDivElement>) {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsResizing(false);
  }

  function handleSplitterKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSplitPercent((v) => Math.max(25, v - 5));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSplitPercent((v) => Math.min(75, v + 5));
    }
  }

  async function copyText(text: string, isLeft: boolean) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    if (isLeft) {
      setLeftCopied(true);
      setTimeout(() => setLeftCopied(false), 1200);
    } else {
      setRightCopied(true);
      setTimeout(() => setRightCopied(false), 1200);
    }
  }

  function renderToolOptions(
    slug: string,
    currentOption: string,
    setOpt: (val: string) => void,
  ) {
    if (slug === "base64" || slug === "url-encoder" || slug === "html-entities") {
      return (
        <Select
          size="small"
          value={currentOption}
          aria-label="Operation mode"
          options={[
            { value: "encode", label: "Encode" },
            { value: "decode", label: "Decode" },
          ]}
          onChange={setOpt}
        />
      );
    }
    if (slug === "hash-generator") {
      return (
        <Select
          size="small"
          value={currentOption}
          aria-label="Hash algorithm"
          options={[
            { value: "SHA-1", label: "SHA-1" },
            { value: "SHA-256", label: "SHA-256" },
            { value: "SHA-512", label: "SHA-512" },
          ]}
          onChange={setOpt}
        />
      );
    }
    if (slug === "curl-converter") {
      return (
        <Select
          size="small"
          value={currentOption}
          aria-label="cURL target"
          options={[
            { value: "fetch", label: "JavaScript (Fetch)" },
            { value: "axios", label: "JavaScript (Axios)" },
            { value: "python", label: "Python (Requests)" },
            { value: "node", label: "Node.js" },
            { value: "go", label: "Go" },
          ]}
          onChange={setOpt}
        />
      );
    }
    return null;
  }

  return (
    <div className={styles.workbench}>
      {/* Top Controls & Presets */}
      <div className={styles.topBar}>
        <div className={styles.topBarHeader}>
          <div className={styles.lead}>
            <div className={styles.titleRow}>
              <Columns2 size={16} />
              <h2>Dual Split Workbench</h2>
              <Badge variant="teal" size="sm">0ms local pipeline</Badge>
            </div>
            <p>Run two tools side-by-side. Pipe outputs instantaneously without network calls.</p>
          </div>

          <div className={styles.topBarActions}>
            <label className={styles.syncToggle} title="Automatically pass Left output to Right input and run">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
              />
              <Zap size={13} fill={autoSync ? "currentColor" : "none"} />
              <span>Auto-sync</span>
            </label>

            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={swapPanes}
              prefix={<ArrowLeftRight size={14} />}
              title="Swap Left and Right Panes"
            >
              Swap sides
            </Button>
          </div>
        </div>

        <div className={styles.presetBar} role="group" aria-label="Workflow presets">
          <span className={styles.presetsLabel}>Presets:</span>
          <div className={styles.presetScroll}>
            {WORKBENCH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.presetBtn}
                data-active={activePreset === preset.id}
                onClick={() => applyPreset(preset)}
              >
                <Sparkles size={11} />
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dual Panes */}
      <div
        ref={containerRef}
        className={styles.panesWrapper}
        onPointerMove={isResizing ? (e) => updateSplitSize(e.clientX) : undefined}
        onPointerUp={isResizing ? handleSplitterUp : undefined}
      >
        {/* LEFT PANE */}
        <section
          className={styles.pane}
          style={{ flex: `0 0 ${splitPercent}%` } as CSSProperties}
          aria-label="Left Tool Pane"
        >
          <header className={styles.paneHeader}>
            <div className={styles.toolSelectWrapper}>
              <span className={styles.toolBadge}>Left Pane</span>
              <Select
                size="small"
                value={leftSlug}
                aria-label="Select left tool"
                searchable={true}
                searchPlaceholder="Search 31 tools…"
                options={TOOL_SELECT_OPTIONS}
                onChange={(newSlug) => {
                  setLeftSlug(newSlug);
                  setActivePreset("");
                  const sample = DEFAULT_SAMPLES[newSlug] ?? "";
                  setLeftInput(sample);
                  void executeLeft(sample, leftOption, newSlug);
                }}
              />
              {renderToolOptions(leftSlug, leftOption, (val) => {
                setLeftOption(val);
                void executeLeft(leftInput, val);
              })}
            </div>

            <div className={styles.paneHeaderActions}>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => {
                  setLeftInput("");
                  setLeftOutput("");
                  setLeftError("");
                }}
                prefix={<RotateCcw size={13} />}
              >
                Clear
              </Button>
            </div>
          </header>

          <div className={styles.paneBody}>
            <div className={styles.inputSection}>
              <div className={styles.sectionBar}>
                <span>Input ({leftTool?.name ?? leftSlug})</span>
                <span className={styles.charCount}>{leftInput.length} chars</span>
              </div>
              <textarea
                className={styles.textarea}
                value={leftInput}
                placeholder={`Enter ${leftTool?.name ?? "input"} here…`}
                onChange={(e) => setLeftInput(e.target.value)}
                aria-label="Left tool input"
              />
            </div>

            <div className={styles.outputSection}>
              <div className={styles.sectionBar}>
                <span>Output</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    disabled={!leftOutput}
                    onClick={() => void copyText(leftOutput, true)}
                    prefix={leftCopied ? <Check size={12} /> : <Copy size={12} />}
                  >
                    {leftCopied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    disabled={!leftOutput}
                    onClick={() => pipeToRight(leftOutput, rightSlug, rightOption, leftInput)}
                    prefix={<ArrowRight size={12} />}
                    title="Send to Right Pane"
                  >
                    Pipe →
                  </Button>
                </div>
              </div>
              {leftOutput ? (
                <pre className={styles.outputArea} tabIndex={0} aria-label="Left tool output">
                  {leftOutput}
                </pre>
              ) : (
                <div className={styles.outputPlaceholder}>Run this tool to see output</div>
              )}
              {leftError && (
                <div className={styles.errorBanner} role="alert">
                  {leftError}
                </div>
              )}
            </div>
          </div>

          <footer className={styles.paneFooter}>
            <div className={styles.footerLeft}>
              <span className={styles.statusText}>{leftMeta}</span>
            </div>
            <Button
              type="button"
              variant="default"
              size="small"
              loading={leftRunning}
              onClick={() => void executeLeft()}
              prefix={<Play size={14} />}
            >
              Run Left
            </Button>
          </footer>
        </section>

        {/* DRAGGABLE SPLITTER & CENTER PIPE BUTTON */}
        <div
          className={styles.splitter}
          tabIndex={0}
          role="separator"
          aria-label="Resize dual panes"
          aria-valuenow={splitPercent}
          aria-valuemin={25}
          aria-valuemax={75}
          data-resizing={isResizing}
          onPointerDown={handleSplitterDown}
          onKeyDown={handleSplitterKey}
        >
          <div className={styles.splitterHandle} />
          <button
            type="button"
            className={styles.pipeButtonCenter}
            onClick={() => pipeToRight(leftOutput, rightSlug, rightOption, leftInput)}
            disabled={!leftOutput}
            title="Pipe Left Output to Right Input"
            aria-label="Pipe Left Output to Right Input"
          >
            <ArrowRight size={14} />
          </button>
        </div>

        {/* RIGHT PANE */}
        <section
          className={styles.pane}
          style={{ flex: `0 0 ${100 - splitPercent}%` } as CSSProperties}
          aria-label="Right Tool Pane"
        >
          <header className={styles.paneHeader}>
            <div className={styles.toolSelectWrapper}>
              <span className={styles.toolBadge}>Right Pane</span>
              <Select
                size="small"
                value={rightSlug}
                aria-label="Select right tool"
                searchable={true}
                searchPlaceholder="Search 31 tools…"
                options={TOOL_SELECT_OPTIONS}
                onChange={(newSlug) => {
                  setRightSlug(newSlug);
                  setActivePreset("");
                  if (rightInput) {
                    void executeRight(rightInput, rightOption, newSlug);
                  }
                }}
              />
              {renderToolOptions(rightSlug, rightOption, (val) => {
                setRightOption(val);
                void executeRight(rightInput, val);
              })}
            </div>

            <div className={styles.paneHeaderActions}>
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => {
                  setRightInput("");
                  setRightOutput("");
                  setRightError("");
                }}
                prefix={<RotateCcw size={13} />}
              >
                Clear
              </Button>
            </div>
          </header>

          <div className={styles.paneBody}>
            <div className={styles.inputSection}>
              <div className={styles.sectionBar}>
                <span>Input ({rightTool?.name ?? rightSlug})</span>
                <span className={styles.charCount}>{rightInput.length} chars</span>
              </div>
              <textarea
                className={styles.textarea}
                value={rightInput}
                placeholder={`Enter ${rightTool?.name ?? "input"} here, or pipe from left…`}
                onChange={(e) => {
                  const val = e.target.value;
                  setRightInput(val);
                  if (autoSync) void executeRight(val, rightOption);
                }}
                aria-label="Right tool input"
              />
            </div>

            <div className={styles.outputSection}>
              <div className={styles.sectionBar}>
                <span>Output</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  disabled={!rightOutput}
                  onClick={() => void copyText(rightOutput, false)}
                  prefix={rightCopied ? <Check size={12} /> : <Copy size={12} />}
                >
                  {rightCopied ? "Copied" : "Copy"}
                </Button>
              </div>
              {rightOutput ? (
                <pre className={styles.outputArea} tabIndex={0} aria-label="Right tool output">
                  {rightOutput}
                </pre>
              ) : (
                <div className={styles.outputPlaceholder}>Run this tool to see output</div>
              )}
              {rightError && (
                <div className={styles.errorBanner} role="alert">
                  {rightError}
                </div>
              )}
            </div>
          </div>

          <footer className={styles.paneFooter}>
            <div className={styles.footerLeft}>
              <span className={styles.statusText}>{rightMeta}</span>
            </div>
            <Button
              type="button"
              variant="default"
              size="small"
              loading={rightRunning}
              onClick={() => void executeRight()}
              prefix={<Play size={14} />}
            >
              Run Right
            </Button>
          </footer>
        </section>
      </div>
    </div>
  );
}
