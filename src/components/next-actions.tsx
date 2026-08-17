"use client";
import Link from "next/link";
import {ArrowUpRight,Compass} from "lucide-react";
import {recommendNextActions} from "@/lib/next-actions";
import {tools} from "@/lib/tools";
import {useFavorites} from "@/lib/use-favorites";
import {useHistory} from "@/lib/use-history";
import styles from "./next-actions.module.css";
export function NextActions({currentSlug}:{currentSlug?:string}){
	const {favorites}=useFavorites();
	const {entries}=useHistory();
	const recommendations=recommendNextActions({tools,currentSlug,recentSlugs:entries.map(entry=>entry.slug),favorites});
	if(!recommendations.length)return null;
	return <section className={styles.next} aria-labelledby="next-actions">
		<h2 id="next-actions"><Compass size={14}/>Recommended next</h2>
		<ul>
			{recommendations.map(item=>{
				const tool=tools.find(candidate=>candidate.slug===item.slug);
				if(!tool)return null;
				const Icon=tool.icon;
				return <li key={item.slug}><Link href={`/tools/${tool.slug}`}><span className={styles.icon}><Icon size={16}/></span><span className={styles.copy}><strong>{tool.name}</strong><small>{item.reason}</small></span><ArrowUpRight size={13}/></Link></li>;
			})}
		</ul>
	</section>;
}
