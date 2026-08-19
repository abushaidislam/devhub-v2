"use client";

import Link from "next/link";
import {ArrowUpRight, Heart} from "lucide-react";
import {tools} from "@/lib/tools";
import {useFavorites} from "@/lib/use-favorites";
import styles from "./dashboard-tool-grid.module.css";

export function DashboardToolGrid({favoritesOnly = false}: {favoritesOnly?: boolean}) {
  const {favorites, toggle} = useFavorites();
  const visibleTools = favoritesOnly ? tools.filter((tool) => favorites.includes(tool.slug)) : tools;
  const starterTools = tools.filter((tool) => tool.featured).slice(0, 3);

  if (favoritesOnly && visibleTools.length === 0) {
    return (
      <div className={styles.empty}>
        <span><Heart size={22} /></span>
        <h2>No favorite tools yet</h2>
        <p>Save the tools you use most to make this workspace your starting point.</p>
        <div className={styles.emptyActions}>
          <Link href="/dashboard">Browse all tools <ArrowUpRight size={13} /></Link>
          <div className={styles.starters} aria-label="Starter tools">
            {starterTools.map((tool) => <Link key={tool.slug} href={`/tools/${tool.slug}`}>{tool.name}<ArrowUpRight size={12} /></Link>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {visibleTools.map((tool) => {
        const Icon = tool.icon;
        const active = favorites.includes(tool.slug);
        return (
          <article key={tool.slug} className={styles.card}>
            <Link href={`/tools/${tool.slug}`} aria-label={`Open ${tool.name}`}>
              <span className={styles.icon}><Icon size={19} /></span>
              <div><strong>{tool.name}</strong><p>{tool.description}</p><small>{tool.category}<ArrowUpRight size={12} /></small></div>
            </Link>
            <button type="button" data-active={active} aria-pressed={active} aria-label={active ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`} onClick={() => toggle(tool.slug)}>
              <Heart size={15} fill={active ? "currentColor" : "none"} />
            </button>
          </article>
        );
      })}
    </div>
  );
}
