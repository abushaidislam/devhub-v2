"use client";

import { useFavorites } from "@/lib/use-favorites";
import { AnimatedHeart } from "./ui/animated-heart";
import styles from "./favorite-button.module.css";

export function FavoriteButton({ slug }: { slug: string }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      className={styles.button}
      data-active={active}
      aria-pressed={active}
      onClick={() => toggle(slug)}
    >
      <AnimatedHeart filled={active} size={16} />
      {active ? "Favorited" : "Add to favorites"}
    </button>
  );
}
