"use client";
import {useMemo} from "react";
import Link from "next/link";
import {ArrowUpRight,Compass} from "lucide-react";
import {recommendNextActions} from "@/lib/next-actions";
import {getTool,tools} from "@/lib/tools";
import {useFavorites} from "@/lib/use-favorites";
import {useHistory} from "@/lib/use-history";
import styles from "./next-actions.module.css";
export function NextActions({currentSlug}:{currentSlug?:string}){
	const {favorites}=useFavorites();
	const {entries}=useHistory();
	const recentSlugs=useMemo(()=>entries.map(entry=>entry.slug),[entries]);
	const recommendations=useMemo(()=>recommendNextActions({tools,currentSlug,recentSlugs,favorites}),[currentSlug,recentSlugs,favorites]);
	if(!recommendations.length)return null;
	return <section className={styles.next} aria-labelledby="next-actions">
		<h2 id="next-actions"><Compass size={14}/>Recommended next</h2>
		<ul>
			{recommendations.map(item=>{
				const tool=getTool(item.slug);
				if(!tool)return null;
				const Icon=tool.icon;
				return <li key={item.slug}><Link href={`/tools/${tool.slug}`}><span className={styles.icon}><Icon size={16}/></span><span className={styles.copy}><strong>{tool.name}</strong><small>{item.reason}</small></span><ArrowUpRight size={13}/></Link></li>;
			})}
		</ul>
	</section>;
}
