"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Clock3, Search, Trash2 } from "lucide-react";
import { Switch } from "@/components/switch";
import { tools } from "@/lib/tools";
import { HISTORY_LIMIT } from "@/lib/history";
import { useHistory } from "@/lib/use-history";
import styles from "./recent-workspace.module.css";

function relativeTime(value: number) {
  const seconds = Math.max(1, Math.floor((Date.now() - value) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RecentWorkspace() {
  const { entries, enabled, available, loading, setEnabled, clear } = useHistory();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEntries = useMemo(
    () =>
      normalizedQuery
        ? entries.filter((entry) => {
            const tool = tools.find((item) => item.slug === entry.slug);
            return tool?.name.toLowerCase().includes(normalizedQuery) || entry.slug.includes(normalizedQuery);
          })
        : entries,
    [entries, normalizedQuery],
  );

  const retentionCopy = !available
    ? "Browser storage is unavailable in this context."
    : enabled
      ? `New tool visits are saved locally, up to ${HISTORY_LIMIT} entries.`
      : "History is off. Existing local entries remain until cleared.";

  return (
    <div className={styles.workspace}>
      <header className={styles.intro}>
        <div>
          <span className="label">Private workspace</span>
          <h2>Recent activity</h2>
        </div>
        <p>Recent tools are stored only in this browser.</p>
      </header>

      <section className={styles.settings} aria-labelledby="history-settings">
        <div>
          <h3 id="history-settings">Save recent tools</h3>
          <p>{retentionCopy}</p>
        </div>
        <div className={styles.actions}>
          <Switch checked={enabled} onCheckedChange={setEnabled} label="Save recent tool visits" disabled={!available} />
          <button type="button" onClick={() => void clear()} disabled={!available || !entries.length}>
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </section>

      {loading ? (
        <div className={styles.empty} role="status">
          <Clock3 size={22} />
          <h3>Loading activity</h3>
          <p>Reading your local browser history.</p>
        </div>
      ) : entries.length ? (
        <section className={styles.activity} aria-labelledby="recent-list">
          <header>
            <div>
              <h3 id="recent-list">Recently opened</h3>
              <span>{entries.length} of {HISTORY_LIMIT}</span>
            </div>
            <label className={styles.search} htmlFor="recent-tools-search">
              <Search size={14} aria-hidden="true" />
              <span className={styles.srOnly}>Filter recent tools</span>
              <input id="recent-tools-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter tools…" />
            </label>
          </header>
          {visibleEntries.length ? (
            <ul>
              {visibleEntries.map((entry) => {
                const tool = tools.find((item) => item.slug === entry.slug);
                if (!tool) return null;
                const Icon = tool.icon;
                return (
                  <li key={entry.id}>
                    <Link href={`/tools/${tool.slug}`}>
                      <span className={styles.toolIcon}><Icon size={15} /></span>
                      <span className={styles.tool}>
                        <strong>{tool.name}</strong>
                        <small>{tool.description}</small>
                      </span>
                      <span className={styles.category}>{tool.category}</span>
                      <time dateTime={new Date(entry.visitedAt).toISOString()} title={new Date(entry.visitedAt).toLocaleString()}>
                        {relativeTime(entry.visitedAt)}
                      </time>
                      <ChevronRight className={styles.arrow} size={16} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.noMatches}>No recent tools match “{query}”.</div>
          )}
        </section>
      ) : (
        <div className={styles.empty}>
          <Clock3 size={22} />
          <h3>No recent activity</h3>
          <p>{available ? (enabled ? "Open a tool to add it here." : "Turn on history, then open a tool to start tracking locally.") : "This browser context does not allow local storage."}</p>
          <Link href="/dashboard" className={styles.emptyAction}>Browse tools <ArrowUpRight size={14} /></Link>
        </div>
      )}
    </div>
  );
}
