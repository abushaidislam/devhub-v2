"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Command, Search, X } from "lucide-react";
import { tools } from "@/lib/tools";
import { trackActivationEvent } from "@/lib/analytics";
import styles from "./command-palette.module.css";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
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
    if (!open) return;
    trackActivationEvent({ name: "command_palette_opened" });
    setQuery("");
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

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
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Search developer tools"
      >
        <header>
          <Search size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search tools, categories, or actions…"
            aria-label="Search tools"
          />
          <kbd>⌘K</kbd>
          <button aria-label="Close command palette" onClick={() => onOpenChange(false)}>
            <X size={16} />
          </button>
        </header>
        <div className={styles.meta}>
          <span>{normalizedQuery ? `${results.length} results` : `${tools.length} tools`}</span>
          <span>Local-first utilities</span>
        </div>
        <div className={styles.results} role="listbox">
          {results.length ? (
            results.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.slug}
                  role="option"
                  aria-selected={active === index}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(tool.slug)}
                >
                  <span className={styles.icon}>
                    <Icon size={16} />
                  </span>
                  <span>
                    <strong>{tool.name}</strong>
                    <small>{tool.description}</small>
                  </span>
                  <em>{tool.category}</em>
                  <ArrowRight size={15} />
                </button>
              );
            })
          ) : (
            <div className={styles.empty}>
              <Command size={22} />
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
