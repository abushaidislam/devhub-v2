"use client";

import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowRight, Command, Search, X} from "lucide-react";
import {tools, type Tool} from "@/lib/tools";
import {trackActivationEvent} from "@/lib/analytics";
import styles from "./command-palette.module.css";

/* ------------------------------------------------------------------ */
/*  Multi-token highlight helper                                       */
/* ------------------------------------------------------------------ */

function highlightMatches(text: string, tokens: string[]): React.ReactNode {
  if (!tokens.length) return text;
  const lowerTokens = tokens.map((t) => t.toLowerCase()).filter(Boolean);
  if (!lowerTokens.length) return text;

  // Escape special regex characters
  const escaped = lowerTokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  if (parts.length <= 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        lowerTokens.includes(part.toLowerCase()) ? (
          <mark key={i}>{part}</mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Memoized Result Item Component                                     */
/* ------------------------------------------------------------------ */

const ResultItem = memo(function ResultItem({
  tool,
  isActive,
  tokens,
  onSelect,
  onHover,
  itemRef,
}: {
  tool: Tool;
  isActive: boolean;
  tokens: string[];
  onSelect: (slug: string) => void;
  onHover: (slug: string) => void;
  itemRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const Icon = tool.icon;
  const nameNode = highlightMatches(tool.name, tokens);
  const descNode = highlightMatches(tool.description, tokens);

  return (
    <button
      type="button"
      id={`palette-tool-${tool.slug}`}
      ref={isActive ? itemRef : undefined}
      className={styles.item}
      role="option"
      aria-selected={isActive}
      tabIndex={-1}
      onMouseEnter={() => onHover(tool.slug)}
      onClick={() => onSelect(tool.slug)}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon size={16} />
      </span>
      <span className={styles.itemContent}>
        <strong>{nameNode}</strong>
        <small>{descNode}</small>
      </span>
      <em>{tool.category}</em>
      <ArrowRight className={styles.itemArrow} size={15} aria-hidden="true" />
    </button>
  );
});

/* ------------------------------------------------------------------ */
/*  Multi-token Ranked Search                                          */
/* ------------------------------------------------------------------ */

function searchTools(allTools: Tool[], query: string): { results: Tool[]; tokens: string[] } {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return { results: allTools, tokens: [] };

  const tokens = trimmed.split(/\s+/).filter(Boolean);

  const scored: { tool: Tool; score: number }[] = [];

  for (const tool of allTools) {
    const name = tool.name.toLowerCase();
    const slug = tool.slug.toLowerCase();
    const cat = tool.category.toLowerCase();
    const desc = tool.description.toLowerCase();
    const seo = (tool.seoSummary || "").toLowerCase();

    // All tokens must be present across any searchable field
    const matchesAll = tokens.every(
      (t) =>
        name.includes(t) ||
        slug.includes(t) ||
        cat.includes(t) ||
        desc.includes(t) ||
        seo.includes(t),
    );

    if (!matchesAll) continue;

    let score = 0;
    // Exact or prefix title matches get top priority
    if (name === trimmed) score += 100;
    else if (name.startsWith(trimmed)) score += 50;
    else if (name.includes(trimmed)) score += 30;
    else if (slug.includes(trimmed)) score += 25;
    else if (cat === trimmed || cat.startsWith(trimmed)) score += 20;

    for (const t of tokens) {
      if (name.includes(t)) score += 10;
      if (slug.includes(t)) score += 8;
      if (cat.includes(t)) score += 5;
      if (desc.includes(t)) score += 2;
    }

    scored.push({ tool, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return { results: scored.map((s) => s.tool), tokens };
}

/* ------------------------------------------------------------------ */
/*  Empty state suggestions                                            */
/* ------------------------------------------------------------------ */

const SUGGESTIONS = ["json", "convert", "format", "encode", "generate", "hash"];

/* ------------------------------------------------------------------ */
/*  CommandPalette Component                                           */
/* ------------------------------------------------------------------ */

export function CommandPalette({
  open,
  onOpenChange,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const activeSlugRef = useRef<string>("");
  const router = useRouter();

  const { results, tokens } = useMemo(
    () => searchTools(tools, query),
    [query],
  );

  // Safe active index bounded by results length
  const safeActive = results.length > 0 ? Math.min(active, results.length - 1) : 0;

  // Sync active slug ref for hover deduplication
  useEffect(() => {
    activeSlugRef.current = results[safeActive]?.slug ?? "";
  }, [safeActive, results]);

  // Open/close lifecycle
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        wasOpen.current = false;
        returnFocusRef?.current?.focus();
      }
      return;
    }
    wasOpen.current = true;
    trackActivationEvent({ name: "command_palette_opened" });
    setQuery("");
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, returnFocusRef]);

  // Reset active to 0 whenever search query changes
  useEffect(() => {
    setActive(0);
  }, [query]);

  // Auto-scroll active item into view cleanly
  useEffect(() => {
    if (typeof activeItemRef.current?.scrollIntoView === "function") {
      activeItemRef.current.scrollIntoView({
        block: "nearest",
      });
    }
  }, [safeActive]);

  // Global shortcut (Cmd+K / Ctrl+K) and Escape handler
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (open && event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open, onOpenChange]);

  // Navigation action
  const go = useCallback(
    (slug: string) => {
      onOpenChange(false);
      router.push(`/tools/${slug}`);
    },
    [onOpenChange, router],
  );

  // Hover handler with deduplication
  const handleHover = useCallback(
    (slug: string) => {
      if (slug === activeSlugRef.current) return;
      const idx = results.findIndex((t) => t.slug === slug);
      if (idx !== -1) setActive(idx);
    },
    [results],
  );

  // Click handler for suggestion chips
  const handleSuggestionClick = useCallback((keyword: string) => {
    setQuery(keyword);
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(keyword.length, keyword.length);
      }
    });
  }, []);

  if (!open) return null;

  // Dialog focus trap for Tab key
  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button:not([tabindex="-1"]), [tabindex="0"]',
      ) ?? [],
    );
    if (!focusable.length) {
      event.preventDefault();
      dialogRef.current?.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Keyboard navigation inside input
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!results.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((prev) => (prev + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((prev) => (prev - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selected = results[safeActive];
      if (selected) {
        go(selected.slug);
      }
    }
  };

  const activeTool = results[safeActive];

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        onKeyDown={onDialogKeyDown}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Search developer tools"
      >
        <header className={styles.header}>
          <Search className={styles.searchIcon} size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools, categories, or actions…"
            aria-label="Search tools"
            aria-activedescendant={
              activeTool ? `palette-tool-${activeTool.slug}` : undefined
            }
          />
          <kbd className={styles.headerKbd}>⌘K</kbd>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close command palette"
            onClick={() => onOpenChange(false)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.meta}>
          <span>
            {query.trim()
              ? `${results.length} result${results.length === 1 ? "" : "s"}`
              : `${tools.length} utilities`}
          </span>
          <span>Local-first workspace</span>
        </div>

        <div
          id="command-palette-results"
          className={styles.results}
          role="listbox"
          aria-label="Tool results"
        >
          {results.length > 0 ? (
            results.map((tool, index) => (
              <ResultItem
                key={tool.slug}
                tool={tool}
                isActive={safeActive === index}
                tokens={tokens}
                onSelect={go}
                onHover={handleHover}
                itemRef={activeItemRef}
              />
            ))
          ) : (
            <div className={styles.empty} role="status">
              <Command size={22} aria-hidden="true" />
              <strong>No matching tools</strong>
              <span>Try a different keyword or search query:</span>
              <div className={styles.emptySuggestions}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={styles.suggestionChip}
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer>
          <span>
            <kbd>↑↓</kbd> Navigate
          </span>
          <span>
            <kbd>↵</kbd> Open
          </span>
          <span>
            <kbd>Esc</kbd> Close
          </span>
        </footer>
      </section>
    </div>
  );
}
