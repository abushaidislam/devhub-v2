"use client";

import { Search, X } from "lucide-react";
import type { InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import styles from "./search-input.module.css";

type SearchInputSize = "small" | "medium" | "large";

export type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: SearchInputSize;
  label?: string;
  shortcut?: string;
  prefix?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  error?: string;
};

export function SearchInput({
  id,
  label,
  size = "medium",
  shortcut = "⌘K",
  prefix,
  clearable = false,
  onClear,
  error,
  value,
  defaultValue,
  className,
  onKeyDown,
  ...props
}: SearchInputProps) {
  const inputValue = value ?? defaultValue;
  const hasValue = typeof inputValue === "string" && inputValue.length > 0;
  const classes = [styles.root, className ?? ""].filter(Boolean).join(" ");

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && clearable && onClear) {
      event.preventDefault();
      onClear();
    }
  };

  return (
    <div className={classes}>
      {label ? <label className={styles.label} htmlFor={id}>{label}</label> : null}
      <div className={`${styles.field} ${styles[size]} ${error ? styles.invalid : ""}`}>
        <span className={styles.prefix} aria-hidden="true">{prefix ?? <Search size={16} />}</span>
        <input
          {...props}
          id={id}
          type="search"
          value={value}
          defaultValue={defaultValue}
          onKeyDown={handleKeyDown}
          aria-invalid={error ? true : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
        />
        {clearable && hasValue && onClear ? (
          <button className={styles.clear} type="button" aria-label="Clear search" onClick={onClear}>
            <X size={15} aria-hidden="true" />
          </button>
        ) : null}
        {shortcut ? <kbd className={styles.shortcut}>{shortcut}</kbd> : null}
      </div>
      {error ? <p className={styles.error} id={id ? `${id}-error` : undefined} role="alert">{error}</p> : null}
    </div>
  );
}
