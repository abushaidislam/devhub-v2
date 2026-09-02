"use client";
import {Command,Search} from "lucide-react";
export function CommandTrigger({className,count,kind="search"}:{className?:string;count:number;kind?:"search"|"command"}){const Icon=kind==="command"?Command:Search;return <button type="button" className={className} onClick={()=>window.dispatchEvent(new Event("devhub:command"))} aria-label={kind==="command"?"Open command menu":"Search developer tools"}><Icon size={kind==="command"?15:18}/><span>{kind==="command"?"Command menu":`Search ${count} tools…`}</span><kbd>⌘K</kbd></button>}
