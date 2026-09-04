"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import styles from "./select.module.css";

export type SelectOption = {
  value: string;
  label: string;
  group?: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  "aria-label"?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  size?: "small" | "medium";
  className?: string;
  align?: "left" | "right";
  fullWidth?: boolean;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select option…",
  label,
  "aria-label": ariaLabel,
  id,
  name,
  disabled = false,
  searchable,
  searchPlaceholder = "Search…",
  size = "medium",
  className,
  align = "left",
  fullWidth = false,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const accessibleName = ariaLabel ?? label ?? "Select";

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-enable search if option count > 7 unless explicitly set to false
  const isSearchable = searchable ?? options.length > 7;

  // Filter options
  const filteredOptions = options.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query) ||
      (opt.group && opt.group.toLowerCase().includes(query))
    );
  });

  const selectedOption = options.find((opt) => opt.value === value);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      const selectedIdx = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIdx >= 0 ? selectedIdx : 0);
      if (isSearchable) {
        requestAnimationFrame(() => {
          searchInputRef.current?.focus();
        });
      }
    } else {
      setSearchQuery("");
      setHighlightedIndex(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, value, isSearchable]);

  // Click outside to dismiss
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  function handleSelect(optionValue: string, isDisabled?: boolean) {
    if (isDisabled) return;
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const currentOpt = filteredOptions[highlightedIndex];
      if (currentOpt && !currentOpt.disabled) {
        handleSelect(currentOpt.value);
      }
    }
  }

  function scrollIndexIntoView(index: number) {
    const list = listRef.current;
    if (!list) return;
    const items = list.querySelectorAll<HTMLElement>(`[data-option-index]`);
    const target = items[index];
    if (target && typeof target.scrollIntoView === "function") {
      target.scrollIntoView({ block: "nearest" });
    }
  }

  // Render grouped options
  function renderOptions() {
    if (filteredOptions.length === 0) {
      return <div className={styles.emptyResults}>No matching options</div>;
    }

    // Check if any options have a group
    const hasGroups = filteredOptions.some((opt) => opt.group);

    if (!hasGroups) {
      return filteredOptions.map((opt, idx) => {
        const isSelected = opt.value === value;
        const isHighlighted = idx === highlightedIndex;

        return (
          <div
            key={opt.value}
            data-option-index={idx}
            role="option"
            aria-selected={isSelected}
            className={[
              styles.optionItem,
              isSelected ? styles.optionSelected : "",
              isHighlighted ? styles.optionHighlighted : "",
              opt.disabled ? styles.optionDisabled : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => handleSelect(opt.value, opt.disabled)}
            onMouseEnter={() => setHighlightedIndex(idx)}
          >
            <span className={styles.optionLeft}>
              {opt.icon ? <span className={styles.optionIcon}>{opt.icon}</span> : null}
              <span className={styles.optionLabel}>{opt.label}</span>
            </span>
            {isSelected ? <Check size={14} className={styles.checkIcon} /> : null}
          </div>
        );
      });
    }

    // Grouping logic
    const groups: { name: string; items: { opt: SelectOption; originalIdx: number }[] }[] = [];
    const groupMap = new Map<string, { opt: SelectOption; originalIdx: number }[]>();

    filteredOptions.forEach((opt, idx) => {
      const gName = opt.group || "Other";
      if (!groupMap.has(gName)) {
        groupMap.set(gName, []);
        groups.push({ name: gName, items: groupMap.get(gName)! });
      }
      groupMap.get(gName)!.push({ opt, originalIdx: idx });
    });

    return groups.map((group, gIdx) => (
      <div key={group.name} role="group" aria-label={group.name}>
        {gIdx > 0 ? <div className={styles.groupDivider} /> : null}
        <div className={styles.groupHeader}>{group.name}</div>
        {group.items.map(({ opt, originalIdx }) => {
          const isSelected = opt.value === value;
          const isHighlighted = originalIdx === highlightedIndex;

          return (
            <div
              key={opt.value}
              data-option-index={originalIdx}
              role="option"
              aria-selected={isSelected}
              className={[
                styles.optionItem,
                isSelected ? styles.optionSelected : "",
                isHighlighted ? styles.optionHighlighted : "",
                opt.disabled ? styles.optionDisabled : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelect(opt.value, opt.disabled)}
              onMouseEnter={() => setHighlightedIndex(originalIdx)}
            >
              <span className={styles.optionLeft}>
                {opt.icon ? <span className={styles.optionIcon}>{opt.icon}</span> : null}
                <span className={styles.optionLabel}>{opt.label}</span>
              </span>
              {isSelected ? <Check size={14} className={styles.checkIcon} /> : null}
            </div>
          );
        })}
      </div>
    ));
  }

  return (
    <div
      ref={containerRef}
      className={[
        styles.container,
        fullWidth ? styles.fullWidth : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden native select for form, test, and screen reader compatibility */}
      <select
        id={selectId}
        name={name}
        value={value}
        disabled={disabled}
        aria-label={accessibleName}
        className={styles.srOnlySelect}
        tabIndex={-1}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled Rich Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={accessibleName}
        data-state={isOpen ? "open" : "closed"}
        className={[
          styles.trigger,
          size === "small" ? styles.sizeSmall : styles.sizeMedium,
          fullWidth ? styles.fullWidth : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <span className={styles.triggerContent}>
          {selectedOption?.icon ? (
            <span className={styles.triggerIcon}>{selectedOption.icon}</span>
          ) : null}
          <span className={styles.triggerLabel}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          size={size === "small" ? 12 : 14}
          className={[styles.chevron, isOpen ? styles.chevronOpen : ""].filter(Boolean).join(" ")}
        />
      </button>

      {/* Custom Floating Popover */}
      {isOpen ? (
        <div
          className={[
            styles.popover,
            align === "right" ? styles.alignRight : "",
          ]
            .filter(Boolean)
            .join(" ")}
          role="listbox"
          aria-label={accessibleName}
        >
          {isSearchable ? (
            <div className={styles.searchBox}>
              <Search size={13} className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  className={styles.searchClear}
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    searchInputRef.current?.focus();
                  }}
                >
                  <X size={11} />
                </button>
              ) : null}
            </div>
          ) : null}

          <div ref={listRef} className={styles.optionsList}>
            {renderOptions()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
