"use client";
import {Star} from "lucide-react";import {useFavorites} from "@/lib/use-favorites";import styles from "./favorite-button.module.css";
export function FavoriteButton({slug}:{slug:string}){const {isFavorite,toggle}=useFavorites();const active=isFavorite(slug);return <button type="button" className={styles.button} data-active={active} aria-pressed={active} onClick={()=>toggle(slug)}><Star size={15} fill={active?"currentColor":"none"}/>{active?"Favorited":"Add to favorites"}</button>}
