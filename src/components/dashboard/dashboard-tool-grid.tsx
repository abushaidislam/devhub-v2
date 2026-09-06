"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { AnimatedHeart } from "../ui/animated-heart";
import { tools } from "@/lib/tools";
import { useFavorites } from "@/lib/use-favorites";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import styles from "./dashboard-tool-grid.module.css";

const starterTools = tools.filter((tool) => tool.featured).slice(0, 3);

export function DashboardToolGrid({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const { favorites, toggle } = useFavorites();
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const visibleTools = useMemo(() => {
    if (!favoritesOnly) return tools;
    return tools.filter((tool) => favoriteSet.has(tool.slug));
  }, [favoritesOnly, favoriteSet]);

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
        const active = favoriteSet.has(tool.slug);
        return (
          <article key={tool.slug} className={styles.card}>
            <Link href={`/tools/${tool.slug}`} aria-label={`Open ${tool.name}`}>
              <span className={styles.icon}><Icon size={19} /></span>
              <div>
                <strong>{tool.name}</strong>
                <p>{tool.description}</p>
                <span className={styles.meta}><Badge variant="gray" size="sm">{tool.category}</Badge><ArrowUpRight size={12} aria-hidden="true" /></span>
              </div>
            </Link>
            <Button
              className={styles.favoriteButton}
              type="button"
              variant="tertiary"
              size="small"
              shape="square"
              data-active={active}
              aria-pressed={active}
              aria-label={active ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
              title={active ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
              onClick={() => toggle(tool.slug)}
              prefix={<AnimatedHeart filled={active} size={17} />}
            />
          </article>
        );
      })}
    </div>
  );
}
