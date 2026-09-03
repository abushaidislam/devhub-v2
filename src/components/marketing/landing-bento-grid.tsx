"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Layers,
  Lock,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";

interface FormatSample {
  name: string;
  filename: string;
  bytes: string;
  speed: string;
  prefix: string;
  highlight: string;
  suffix: string;
  tool: string;
  match: string;
  toolHref: string;
}

const FORMAT_SAMPLES: Record<string, FormatSample> = {
  JWT: {
    name: "JWT",
    filename: "input.raw",
    bytes: "1,420 bytes",
    speed: "0ms ingest",
    prefix: "ey",
    highlight: "JhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
    suffix: ".eyJzdWIiOiIxMjM0NTY3ODkwIi...",
    tool: "JWT Decoder",
    match: "99.8% match",
    toolHref: "/tools/jwt-decoder",
  },
  JSON: {
    name: "JSON",
    filename: "payload.json",
    bytes: "68 bytes",
    speed: "0ms ingest",
    prefix: "{\n  \"",
    highlight: "status",
    suffix: "\": \"healthy\", \"nodes\": 8\n}",
    tool: "JSON Formatter",
    match: "100% match",
    toolHref: "/tools/json-formatter",
  },
  Base64: {
    name: "Base64",
    filename: "encoded.txt",
    bytes: "44 bytes",
    speed: "0ms ingest",
    prefix: "V2Vs",
    highlight: "Y29tZSB0byBEZXZIdWI",
    suffix: "gLSBMb2NhbC1maXJzdA==",
    tool: "Base64 Converter",
    match: "99.4% match",
    toolHref: "/tools/base64",
  },
  YAML: {
    name: "YAML",
    filename: "config.yaml",
    bytes: "58 bytes",
    speed: "0ms ingest",
    prefix: "version: '3.8'\n",
    highlight: "services:",
    suffix: " app: image: node",
    tool: "YAML Formatter",
    match: "98.9% match",
    toolHref: "/tools/yaml-formatter",
  },
  SQL: {
    name: "SQL",
    filename: "query.sql",
    bytes: "78 bytes",
    speed: "0ms ingest",
    prefix: "SELECT ",
    highlight: "id, name, email",
    suffix: " FROM users WHERE active = 1",
    tool: "SQL Formatter",
    match: "99.1% match",
    toolHref: "/tools/sql-formatter",
  },
  Cron: {
    name: "Cron",
    filename: "schedule.cron",
    bytes: "16 bytes",
    speed: "0ms ingest",
    prefix: "*/15 ",
    highlight: "0-6 * * 1-5",
    suffix: " (Mon-Fri 00:00-06:59)",
    tool: "Cron Parser",
    match: "97.8% match",
    toolHref: "/tools/cron-parser",
  },
  XML: {
    name: "XML",
    filename: "dataset.xml",
    bytes: "57 bytes",
    speed: "0ms ingest",
    prefix: "<response><status ",
    highlight: 'code="200"',
    suffix: " /><record id=\"42\"/></response>",
    tool: "XML Formatter",
    match: "98.6% match",
    toolHref: "/tools/xml-formatter",
  },
};

export function LandingBentoGrid() {
  const [selectedFormat, setSelectedFormat] = useState<string>("JWT");
  const [tsCopied, setTsCopied] = useState<boolean>(false);

  const activeFormat = FORMAT_SAMPLES[selectedFormat] || FORMAT_SAMPLES.JWT;

  const handleTsCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `interface UserResponse {\n  id: number;\n  email: string;\n  verified: boolean;\n}`
      );
      setTsCopied(true);
      setTimeout(() => setTsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="relative py-24 border-t border-[var(--hairline)] bg-[var(--canvas)]" id="capabilities" aria-labelledby="bento-title">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-4 font-mono text-[11px] font-medium leading-none tracking-[0.05em] text-zinc-500 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.16)] animate-pulse" />
            Capabilities Architecture
          </div>
          <h2 id="bento-title" className="m-0 mb-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-100">
            Engineered for velocity.
          </h2>
          <p className="m-0 text-base leading-relaxed text-zinc-400 max-w-2xl">
            Every layer of DevHub is designed to eliminate developer friction. From sub-millisecond input heuristics to zero-network memory sandboxes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          {/* Card 1: Deterministic Smart Detection (Span 7) */}
          <article className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-12 lg:col-span-7">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-medium text-zinc-500">01 / Dual-Stage Detection</span>
              <span className="px-2 py-0.5 border border-zinc-800 rounded bg-zinc-900 text-zinc-400 font-mono text-[10px] leading-tight">Heuristic Engine</span>
            </div>
            <h3 className="m-0 mb-2 text-lg font-semibold tracking-tight text-zinc-100">Sub-millisecond smart routing</h3>
            <p className="m-0 mb-6 text-sm leading-relaxed text-zinc-400">
              Paste any raw blob—JSON, JWT, SQL, Cron, YAML, or Base64. Bounded O(1) fast-guards inspect syntax patterns and route to the exact tool with confidence scoring in under 1ms.
            </p>

            {/* Interactive Visual Graphic */}
            <div className="mt-auto flex flex-col border border-zinc-800 rounded-lg bg-black overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                  <Terminal size={12} />
                  <span>{activeFormat.filename}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{activeFormat.bytes}</span>
                  <span className="font-mono text-[10px] text-cyan-400">{activeFormat.speed}</span>
                </div>
              </div>

              <div className="p-4 font-mono text-xs leading-relaxed break-all bg-black" key={activeFormat.name}>
                <code>
                  <span className="text-zinc-600">{activeFormat.prefix}</span>
                  <span className="text-zinc-300">{activeFormat.highlight}</span>
                  <span className="text-zinc-600">{activeFormat.suffix}</span>
                </code>
              </div>

              <Link href={activeFormat.toolHref} className="flex items-center justify-between p-3 border-t border-zinc-800 bg-zinc-900/30 transition-colors hover:bg-zinc-900/80 group" title={`Open ${activeFormat.tool}`}>
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                  <strong>{activeFormat.tool}</strong>
                  <span className="px-1.5 py-0.5 border border-cyan-900/50 rounded bg-cyan-950/30 font-mono text-[10px] text-cyan-400">{activeFormat.match}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 opacity-70 group-hover:opacity-100 transition-opacity">
                  <span>Press</span>
                  <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 border border-zinc-700 rounded bg-zinc-800 font-mono text-[10px] font-medium text-zinc-300 shadow-sm transition-all group-hover:-translate-y-px group-hover:border-zinc-600 group-hover:shadow-md">⌘</kbd>
                  <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 border border-zinc-700 rounded bg-zinc-800 font-mono text-[10px] font-medium text-zinc-300 shadow-sm transition-all group-hover:-translate-y-px group-hover:border-zinc-600 group-hover:shadow-md">↵</kbd>
                  <span>to jump</span>
                  <ArrowRight size={11} className="text-zinc-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>

              {/* Interactive Format Pills */}
              <div className="flex p-2 border-t border-zinc-800 bg-zinc-900/50 overflow-x-auto gap-1" role="tablist" aria-label="Detection format samples">
                {Object.keys(FORMAT_SAMPLES).map((fmt) => {
                  const isActive = fmt === selectedFormat;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`px-3 py-1.5 border rounded border-transparent bg-transparent font-mono text-xs text-zinc-500 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-1 ${isActive ? "!border-cyan-500/30 !bg-cyan-950/40 !text-cyan-400 !font-semibold shadow-[0_0_8px_rgba(34,211,238,0.15)]" : ""}`}
                      onClick={() => setSelectedFormat(fmt)}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          {/* Card 2: Zero-Egress Privacy Sandbox (Span 5) */}
          <article className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-12 lg:col-span-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-medium text-zinc-500">02 / Memory Boundary</span>
              <span className="px-2 py-0.5 border border-zinc-800 rounded bg-zinc-900 text-zinc-400 font-mono text-[10px] leading-tight">Zero Egress</span>
            </div>
            <h3 className="m-0 mb-2 text-lg font-semibold tracking-tight text-zinc-100">Zero-egress privacy sandbox</h3>
            <p className="m-0 mb-6 text-sm leading-relaxed text-zinc-400">
              Deterministic processing runs strictly in your browser&apos;s V8 memory. No server uploads, no backend telemetry, and zero payload retention.
            </p>

            {/* Visual Graphic */}
            <div className="mt-auto flex flex-col gap-4">
              <div className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg bg-black transition-all hover:border-cyan-900/50 hover:shadow-[0_0_16px_rgba(34,211,238,0.1)] hover:-translate-y-px">
                <div className="grid place-items-center w-10 h-10 border border-zinc-800 rounded-md bg-zinc-900 text-cyan-400 shadow-sm">
                  <ShieldCheck size={22} />
                </div>
                <div className="grid gap-0.5">
                  <strong className="text-[13px] font-semibold text-zinc-100">100% In-Browser Execution</strong>
                  <small className="font-mono text-[11px] text-zinc-500">WebCrypto &amp; Pure TypeScript</small>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-black font-mono text-xs transition-all hover:bg-zinc-900 hover:border-zinc-700 hover:-translate-y-px">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Cpu size={13} /> Local RAM Processing
                  </span>
                  <span className="font-semibold text-cyan-400">&lt; 0.2ms latency</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-black font-mono text-xs transition-all hover:bg-zinc-900 hover:border-zinc-700 hover:-translate-y-px">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Lock size={13} /> External Network Egress
                  </span>
                  <span className="font-semibold text-zinc-100">0 bytes sent</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 p-2 font-mono text-xs text-zinc-500">
                <span>Client-Only</span>
                <span>•</span>
                <span>No Cookies</span>
                <span>•</span>
                <span>Offline-Safe</span>
              </div>
            </div>
          </article>

          {/* Card 3: Multi-Step Recipe Pipelines (Span 4) */}
          <article className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-6 lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-medium text-zinc-500">03 / Workflow Pipelines</span>
              <Workflow size={15} className="text-zinc-500" />
            </div>
            <h3 className="m-0 mb-2 text-lg font-semibold tracking-tight text-zinc-100">Composable recipe pipelines</h3>
            <p className="m-0 mb-6 text-sm leading-relaxed text-zinc-400">
              Pipe transformations sequentially. Compose reusable developer recipes and export schema definitions without storing sensitive run values.
            </p>

            {/* Visual Graphic */}
            <div className="mt-auto flex flex-col gap-4 p-5 border border-zinc-800 rounded-lg bg-black">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col items-center gap-1.5 cursor-default group" title="Step 1: Raw JSON">
                  <span className="grid place-items-center w-6 h-6 border border-zinc-800 rounded-full bg-zinc-900 font-mono text-[10px] font-semibold text-zinc-300 transition-all group-hover:border-cyan-500/40 group-hover:bg-cyan-950/30 group-hover:text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]">1</span>
                  <span className="font-mono text-[10px] text-zinc-500 transition-colors group-hover:text-zinc-300">Raw JSON</span>
                </div>
                <div className="flex-1 h-px bg-zinc-800 relative -top-[9px]" />
                <div className="flex flex-col items-center gap-1.5 cursor-default group" title="Step 2: YAML Parse">
                  <span className="grid place-items-center w-6 h-6 border border-zinc-800 rounded-full bg-zinc-900 font-mono text-[10px] font-semibold text-zinc-300 transition-all group-hover:border-cyan-500/40 group-hover:bg-cyan-950/30 group-hover:text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]">2</span>
                  <span className="font-mono text-[10px] text-zinc-500 transition-colors group-hover:text-zinc-300">YAML Parse</span>
                </div>
                <div className="flex-1 h-px bg-zinc-800 relative -top-[9px]" />
                <div className="flex flex-col items-center gap-1.5 cursor-default group" title="Step 3: SHA-256">
                  <span className="grid place-items-center w-6 h-6 border border-zinc-800 rounded-full bg-zinc-900 font-mono text-[10px] font-semibold text-zinc-300 transition-all group-hover:border-cyan-500/40 group-hover:bg-cyan-950/30 group-hover:text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]">3</span>
                  <span className="font-mono text-[10px] text-zinc-500 transition-colors group-hover:text-zinc-300">SHA-256</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 pt-3 border-t border-zinc-800 font-mono text-[10px] text-zinc-500">
                <span>3 steps</span>
                <span>•</span>
                <span>Zero Payload Storage</span>
              </div>
            </div>
          </article>

          {/* Card 4: Type & Interface Inference (Span 4) */}
          <article className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-6 lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-medium text-zinc-500">04 / Type Inference</span>
              <Layers size={15} className="text-zinc-500" />
            </div>
            <h3 className="m-0 mb-2 text-lg font-semibold tracking-tight text-zinc-100">Live interface extraction</h3>
            <p className="m-0 mb-6 text-sm leading-relaxed text-zinc-400">
              Transform chaotic API responses into strictly typed TypeScript interfaces, Markdown tables, or CSV datasets in a single keystroke.
            </p>

            {/* Visual Graphic */}
            <div className="mt-auto">
              <div className="border border-zinc-800 rounded-lg bg-black overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 font-mono text-[10px] font-medium text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span>JSON Payload</span>
                    <ArrowRight size={11} />
                    <span>TypeScript</span>
                  </div>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 h-6 px-2 border border-zinc-800 rounded bg-zinc-900 font-mono text-[9px] font-medium text-zinc-400 cursor-pointer transition-all hover:bg-zinc-800 hover:text-zinc-300 hover:border-zinc-700 hover:-translate-y-px active:translate-y-0 active:scale-95 ${tsCopied ? "!border-cyan-500/40 !bg-cyan-950/30 !text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.2)]" : ""}`}
                    onClick={handleTsCopy}
                    aria-label="Copy TypeScript interface"
                  >
                    {tsCopied ? <Check size={11} className="text-cyan-400" /> : <Copy size={11} />}
                    <span>{tsCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="p-4 bg-zinc-950">
                  <div className="font-mono text-[11px] leading-relaxed text-zinc-300">
                    <span className="font-medium text-cyan-400">interface</span>{" "}
                    <span className="font-semibold text-zinc-100">UserResponse</span> &#123;
                    <br />
                    &nbsp;&nbsp;<span className="text-zinc-400">id</span>:{" "}
                    <span className="font-medium text-cyan-400">number</span>;
                    <br />
                    &nbsp;&nbsp;<span className="text-zinc-400">email</span>:{" "}
                    <span className="font-medium text-cyan-400">string</span>;
                    <br />
                    &nbsp;&nbsp;<span className="text-zinc-400">verified</span>:{" "}
                    <span className="font-medium text-cyan-400">boolean</span>;
                    <br />
                    &#125;
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Card 5: Keyboard Ergonomics & Offline PWA (Span 4) */}
          <article className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-12 lg:col-span-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs font-medium text-zinc-500">05 / Speed &amp; Ergonomics</span>
              <Zap size={15} className="text-zinc-500" />
            </div>
            <h3 className="m-0 mb-2 text-lg font-semibold tracking-tight text-zinc-100">Instant keyboard velocity</h3>
            <p className="m-0 mb-6 text-sm leading-relaxed text-zinc-400">
              Trigger any tool in milliseconds with ⌘K, switch operations via tactile shortcuts, and work uninterrupted with full offline Service Worker caching.
            </p>

            {/* Visual Graphic */}
            <div className="mt-auto flex flex-col gap-4">
              <div className="flex flex-col gap-3 p-4 border border-zinc-800 rounded-lg bg-black">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-semibold text-zinc-500">&gt;</span>
                  <span className="font-medium text-zinc-100">base64 encode</span>
                  <span className="inline-block w-1.5 h-3.5 bg-zinc-300 opacity-70 animate-pulse" />
                </div>
                <div className="flex items-center justify-between px-2.5 py-1.5 border border-zinc-800 rounded bg-zinc-900 text-[11px] text-zinc-300">
                  <span>Base64 String Converter</span>
                  <span className="font-mono text-[10px] text-cyan-400">0.4ms</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-black group hover:bg-zinc-900 transition-colors">
                <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                  <CheckCircle2 size={13} className="text-cyan-400" />
                  <span>Service Worker Precached</span>
                </div>
                <div className="flex gap-1">
                  <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 border border-zinc-700 rounded bg-zinc-800 font-mono text-[10px] font-medium text-zinc-300 shadow-sm transition-all group-hover:-translate-y-px group-hover:border-zinc-600 group-hover:shadow-md">⌘</kbd>
                  <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 border border-zinc-700 rounded bg-zinc-800 font-mono text-[10px] font-medium text-zinc-300 shadow-sm transition-all group-hover:-translate-y-px group-hover:border-zinc-600 group-hover:shadow-md">K</kbd>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className="flex justify-center mt-10">
          <Link href="/tools" className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-400 no-underline transition-all hover:text-zinc-100 hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:rounded group">
            Explore all 30 local tools in DevHub <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
