"use client";
import {useCallback,useEffect,useState} from "react";
import {trackActivationEvent} from "./analytics";
const KEY="devhub:favorites";const EVENT="devhub:favorites:changed";
function read():string[]{if(typeof window==="undefined")return [];try{return JSON.parse(localStorage.getItem(KEY)??"[]") as string[]}catch{return []}}
function write(next:string[]){localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event(EVENT))}
export function useFavorites(){const [favorites,setFavorites]=useState<string[]>([]);useEffect(()=>{const sync=()=>setFavorites(read());sync();window.addEventListener(EVENT,sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener(EVENT,sync);window.removeEventListener("storage",sync)}},[]);const toggle=useCallback((slug:string)=>{const current=read();const removing=current.includes(slug);const next=removing?current.filter(item=>item!==slug):[slug,...current];write(next);setFavorites(next);trackActivationEvent({name:removing?"favorite_removed":"favorite_added",tool:slug})},[]);const merge=useCallback((slugs:readonly string[])=>{const current=read();const additions=slugs.filter(slug=>!current.includes(slug));if(additions.length){const next=[...current,...additions];write(next);setFavorites(next)}return additions.length},[]);return {favorites,toggle,merge,isFavorite:(slug:string)=>favorites.includes(slug)}}
