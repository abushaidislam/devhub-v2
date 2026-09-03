import re

with open("src/components/marketing/landing-bento-grid.tsx", "r") as f:
    content = f.read()

# Remove CSS module import
content = re.sub(r'import styles from "./landing-bento-grid.module.css";\n', '', content)

# 1. Update visual hierarchy and contrast
# 2. Add spatial polish and depth
# 3. Typography & Micro-spacing (8pt grid)

replacements = {
    r'className={styles.section}': 'className="relative py-24 border-t border-[var(--hairline)] bg-[var(--canvas)]"',
    r'className="container"': 'className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"',
    r'className={styles.header}': 'className="mb-12 max-w-3xl"',
    r'className={styles.eyebrow}': 'className="inline-flex items-center gap-2 mb-4 font-mono text-[11px] font-medium leading-none tracking-[0.05em] text-zinc-500 uppercase"',
    r'className={styles.pulseDot}': 'className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_0_3px_rgba(34,211,238,0.16)] animate-pulse"',
    r'className={styles.title}': 'className="m-0 mb-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-100"',
    r'className={styles.subtitle}': 'className="m-0 text-base leading-relaxed text-zinc-400 max-w-2xl"',
    r'className={styles.grid}': 'className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6"',

    r'className={`\${styles.card} \${styles.cardDetection}`\}': 'className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-12 lg:col-span-7"',
    r'className={`\${styles.card} \${styles.cardPrivacy}`\}': 'className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-12 lg:col-span-5"',
    r'className={`\${styles.card} \${styles.cardRecipes}`\}': 'className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-6 lg:col-span-4"',
    r'className={`\${styles.card} \${styles.cardInference}`\}': 'className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-6 lg:col-span-4"',
    r'className={`\${styles.card} \${styles.cardVelocity}`\}': 'className="relative flex flex-col p-6 lg:p-8 border border-white/10 rounded-xl bg-zinc-950/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-8px_rgba(0,0,0,0.2)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-zinc-800 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)] md:col-span-12 lg:col-span-4"',

    r'className={styles.cardMeta}': 'className="flex items-center justify-between mb-4"',
    r'className={styles.kicker}': 'className="font-mono text-xs font-medium text-zinc-500"',
    r'className={styles.tag}': 'className="px-2 py-0.5 border border-zinc-800 rounded bg-zinc-900 text-zinc-400 font-mono text-[10px] leading-tight"',
    r'className={styles.metaIcon}': 'className="text-zinc-500"',
    r'className={styles.cardHeading}': 'className="m-0 mb-2 text-lg font-semibold tracking-tight text-zinc-100"',
    r'className={styles.cardCopy}': 'className="m-0 mb-6 text-sm leading-relaxed text-zinc-400"',

    r'className={styles.previewWindow}': 'className="mt-auto flex flex-col border border-zinc-800 rounded-lg bg-black overflow-hidden shadow-sm"',
    r'className={styles.windowBar}': 'className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50"',
    r'className={styles.windowTitle}': 'className="flex items-center gap-2 font-mono text-[10px] text-zinc-500"',
    r'className={styles.windowStats}': 'className="flex items-center gap-3"',
    r'className={styles.statusLive}': 'className="font-mono text-[10px] text-cyan-400"',
    r'className={styles.codeLine}': 'className="p-4 font-mono text-xs leading-relaxed break-all bg-black"',
    r'className={styles.tokenMuted}': 'className="text-zinc-600"',
    r'className={styles.tokenHighlight}': 'className="text-zinc-300"',
    r'className={styles.detectedRow}': 'className="flex items-center justify-between p-3 border-t border-zinc-800 bg-zinc-900/30 transition-colors hover:bg-zinc-900/80 group"',
    r'className={styles.detectedMatch}': 'className="flex items-center gap-2.5"',
    r'className={styles.cyanDot}': 'className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]"',
    r'className={styles.matchScore}': 'className="px-1.5 py-0.5 border border-cyan-900/50 rounded bg-cyan-950/30 font-mono text-[10px] text-cyan-400"',
    r'className={styles.actionHint}': 'className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 opacity-70 group-hover:opacity-100 transition-opacity"',
    r'className={styles.jumpArrow}': 'className="text-zinc-400 transition-transform group-hover:translate-x-0.5"',
    r'className={styles.formatPills}': 'className="flex p-2 border-t border-zinc-800 bg-zinc-900/50 overflow-x-auto gap-1"',
    r'className={`\${styles.formatPillBtn} \${isActive \? styles.activePill : ""}`\}': 'className={`px-3 py-1.5 border rounded border-transparent bg-transparent font-mono text-xs text-zinc-500 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-1 ${isActive ? "!border-cyan-500/30 !bg-cyan-950/40 !text-cyan-400 !font-semibold shadow-[0_0_8px_rgba(34,211,238,0.15)]" : ""}`}',

    r'className={styles.privacyVisual}': 'className="mt-auto flex flex-col gap-4"',
    r'className={styles.shieldLockup}': 'className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg bg-black transition-all hover:border-cyan-900/50 hover:shadow-[0_0_16px_rgba(34,211,238,0.1)] hover:-translate-y-px"',
    r'className={styles.shieldIcon}': 'className="grid place-items-center w-10 h-10 border border-zinc-800 rounded-md bg-zinc-900 text-cyan-400 shadow-sm"',
    r'className={styles.shieldCopy}': 'className="grid gap-0.5"',
    r'className={styles.telemetryMatrix}': 'className="flex flex-col gap-2"',
    r'className={styles.telemetryRow}': 'className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-black font-mono text-xs transition-all hover:bg-zinc-900 hover:border-zinc-700 hover:-translate-y-px"',
    r'className={styles.telemetryLabel}': 'className="flex items-center gap-2 text-zinc-400"',
    r'className={styles.metricCyan}': 'className="font-semibold text-cyan-400"',
    r'className={styles.metricBlocked}': 'className="font-semibold text-zinc-100"',
    r'className={styles.complianceRow}': 'className="flex items-center justify-center gap-3 p-2 font-mono text-xs text-zinc-500"',

    r'className={styles.pipelineVisual}': 'className="mt-auto flex flex-col gap-4 p-5 border border-zinc-800 rounded-lg bg-black"',
    r'className={styles.pipelineSteps}': 'className="flex items-center justify-between gap-2"',
    r'className={styles.pipelineStep}': 'className="flex flex-col items-center gap-1.5 cursor-default group"',
    r'className={styles.stepNum}': 'className="grid place-items-center w-6 h-6 border border-zinc-800 rounded-full bg-zinc-900 font-mono text-[10px] font-semibold text-zinc-300 transition-all group-hover:border-cyan-500/40 group-hover:bg-cyan-950/30 group-hover:text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.2)]"',
    r'className={styles.stepName}': 'className="font-mono text-[10px] text-zinc-500 transition-colors group-hover:text-zinc-300"',
    r'className={styles.pipelineConnector}': 'className="flex-1 h-px bg-zinc-800 relative -top-[9px]"',
    r'className={styles.pipelineMeta}': 'className="flex items-center justify-center gap-2 pt-3 border-t border-zinc-800 font-mono text-[10px] text-zinc-500"',

    r'className={styles.inferenceVisual}': 'className="mt-auto"',
    r'className={styles.miniEditor}': 'className="border border-zinc-800 rounded-lg bg-black overflow-hidden"',
    r'className={styles.editorHead}': 'className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 font-mono text-[10px] font-medium text-zinc-500"',
    r'className={styles.editorHeadTitle}': 'className="flex items-center gap-2"',
    r'className={`\${styles.miniCopyBtn} \${tsCopied \? styles.miniCopyBtnCopied : ""}`\}': 'className={`inline-flex items-center gap-1.5 h-6 px-2 border border-zinc-800 rounded bg-zinc-900 font-mono text-[9px] font-medium text-zinc-400 cursor-pointer transition-all hover:bg-zinc-800 hover:text-zinc-300 hover:border-zinc-700 hover:-translate-y-px active:translate-y-0 active:scale-95 ${tsCopied ? "!border-cyan-500/40 !bg-cyan-950/30 !text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.2)]" : ""}`}',
    r'className={styles.checkIcon}': 'className="text-cyan-400"',
    r'className={styles.editorBody}': 'className="p-4 bg-zinc-950"',
    r'className={styles.codeSnippetMono}': 'className="font-mono text-[11px] leading-relaxed text-zinc-300"',
    r'className={styles.tokenKeyword}': 'className="font-medium text-cyan-400"',
    r'className={styles.tokenType}': 'className="font-semibold text-zinc-100"',
    r'className={styles.tokenProp}': 'className="text-zinc-400"',

    r'className={styles.velocityVisual}': 'className="mt-auto flex flex-col gap-4"',
    r'className={styles.commandMockup}': 'className="flex flex-col gap-3 p-4 border border-zinc-800 rounded-lg bg-black"',
    r'className={styles.commandInputRow}': 'className="flex items-center gap-2 font-mono text-xs"',
    r'className={styles.commandPrompt}': 'className="font-semibold text-zinc-500"',
    r'className={styles.commandText}': 'className="font-medium text-zinc-100"',
    r'className={styles.commandCursor}': 'className="inline-block w-1.5 h-3.5 bg-zinc-300 opacity-70 animate-pulse"',
    r'className={styles.commandResult}': 'className="flex items-center justify-between px-2.5 py-1.5 border border-zinc-800 rounded bg-zinc-900 text-[11px] text-zinc-300"',
    r'className={styles.badgeSubtle}': 'className="font-mono text-[10px] text-cyan-400"',
    r'className={styles.pwaRow}': 'className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-black group hover:bg-zinc-900 transition-colors"',
    r'className={styles.pwaStatus}': 'className="flex items-center gap-2 font-mono text-[11px] text-zinc-400"',
    r'className={styles.pwaIcon}': 'className="text-cyan-400"',
    r'className={styles.keycaps}': 'className="flex gap-1"',

    # We replace <kbd> classes inside keycaps by string replace directly if not caught, or just style kbd tags
    r'<kbd>': '<kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 border border-zinc-700 rounded bg-zinc-800 font-mono text-[10px] font-medium text-zinc-300 shadow-sm transition-all group-hover:-translate-y-px group-hover:border-zinc-600 group-hover:shadow-md">',

    r'className={styles.footerLinkRow}': 'className="flex justify-center mt-10"',
    r'className={styles.exploreLink}': 'className="inline-flex items-center gap-2 text-[13px] font-medium text-zinc-400 no-underline transition-all hover:text-zinc-100 hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:rounded group"',
    r'className={styles.exploreArrow}': 'className="transition-transform group-hover:translate-x-1"',

    # shieldCopy bold and small text tags inside
    r'<strong>100% In-Browser Execution</strong>': '<strong className="text-[13px] font-semibold text-zinc-100">100% In-Browser Execution</strong>',
    r'<small>WebCrypto &amp; Pure TypeScript</small>': '<small className="font-mono text-[11px] text-zinc-500">WebCrypto &amp; Pure TypeScript</small>',
}

for old, new in replacements.items():
    content = re.sub(old, new, content)

with open("src/components/marketing/landing-bento-grid.tsx", "w") as f:
    f.write(content)
