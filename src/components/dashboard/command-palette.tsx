"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowRight, Command, Search, X} from "lucide-react";
import {tools} from "@/lib/tools";
import {trackActivationEvent} from "@/lib/analytics";
import styles from "./command-palette.module.css";

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
  const wasOpen = useRef(false);
  const router = useRouter();
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      normalizedQuery
        ? tools.filter((tool) =>
            `${tool.name} ${tool.description} ${tool.category}`
              .toLowerCase()
              .includes(normalizedQuery),
          )
        : tools,
    [normalizedQuery],
  );

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        wasOpen.current = false;
        returnFocusRef?.current?.focus();
      }
      return;
    }
    wasOpen.current = true;
    trackActivationEvent({name: "command_palette_opened"});
    setQuery("");
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, returnFocusRef]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
      if (open && event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [open, onOpenChange]);

  if (!open) return null;

  const go = (slug: string) => {
    onOpenChange(false);
    router.push(`/tools/${slug}`);
  };

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
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

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(results.length - 1, value + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(0, value - 1));
    }
    if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active].slug);
    }
  };

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
        <header>
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools, categories, or actions…"
            aria-label="Search tools"
          />
          <kbd>⌘K</kbd>
          <button
            type="button"
            aria-label="Close command palette"
            onClick={() => onOpenChange(false)}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.meta}>
          <span>{normalizedQuery ? `${results.length} results` : `${tools.length} tools`}</span>
          <span>Local-first utilities</span>
        </div>
        <div className={styles.results} role="listbox" aria-label="Tool results">
          {results.length ? (
            results.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <button
                  type="button"
                  key={tool.slug}
                  role="option"
                  aria-selected={active === index}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(tool.slug)}
                >
                  <span className={styles.icon} aria-hidden="true">
                    <Icon size={16} />
                  </span>
                  <span>
                    <strong>{tool.name}</strong>
                    <small>{tool.description}</small>
                  </span>
                  <em>{tool.category}</em>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              );
            })
          ) : (
            <div className={styles.empty} role="status">
              <Command size={22} aria-hidden="true" />
              <strong>No matching tools</strong>
              <span>Try another name, task, or category.</span>
            </div>
          )}
        </div>
        <footer>
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
        </footer>
      </section>
    </div>
  );
}
