"use client";
import {useRef,useState} from "react";
import {Download,Upload} from "lucide-react";
import {tools} from "@/lib/tools";
import {useFavorites} from "@/lib/use-favorites";
import {buildWorkspaceExport,parseWorkspaceImport,serializeWorkspaceExport,WORKSPACE_IMPORT_LIMIT} from "@/lib/workspace-transfer";
import styles from "./workspace-transfer.module.css";
const knownSlugs=tools.map(tool=>tool.slug);
export function WorkspaceTransfer(){
	const {favorites,merge}=useFavorites();
	const fileInputRef=useRef<HTMLInputElement>(null);
	const [message,setMessage]=useState("");
	const [error,setError]=useState("");
	const exportFavorites=()=>{const count=favorites.length;const payload=serializeWorkspaceExport(buildWorkspaceExport(favorites,knownSlugs));const blob=new Blob([payload],{type:"application/json"});const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;anchor.download="devhub-workspace.json";document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);setError("");setMessage(`Exported ${count} favorite${count===1?"":"s"} to devhub-workspace.json.`)};
	const importFavorites=(file:File)=>{
		if(file.size>WORKSPACE_IMPORT_LIMIT){setMessage("");setError("Import file is too large to be a DevHub workspace export.");return}
		const reader=new FileReader();
		reader.onload=()=>{try{const result=parseWorkspaceImport(String(reader.result??""),knownSlugs);const added=merge(result.favorites);setError("");setMessage(`Imported ${added} new favorite${added===1?"":"s"}${result.skipped?`; skipped ${result.skipped} unknown entr${result.skipped===1?"y":"ies"}`:""}.`)}catch(cause){setMessage("");setError(cause instanceof Error?cause.message:"Import failed.")}};
		reader.onerror=()=>{setMessage("");setError("Import file could not be read.")};
		reader.readAsText(file);
	};
	return <section className={styles.transfer} aria-labelledby="workspace-transfer">
		<div className={styles.row}>
			<div><h2 id="workspace-transfer">Import and export</h2><p>Move favorites between browsers with a local JSON file. It contains tool slugs only — never tool inputs or outputs.</p></div>
			<div className={styles.actions}>
				<button type="button" onClick={exportFavorites} disabled={!favorites.length}><Download size={14}/>Export favorites</button>
				<button type="button" onClick={()=>fileInputRef.current?.click()}><Upload size={14}/>Import favorites</button>
				<input ref={fileInputRef} className={styles.srOnly} type="file" accept="application/json,.json" aria-label="Import workspace file" onChange={event=>{const file=event.target.files?.[0];if(file)importFavorites(file);event.target.value=""}}/>
			</div>
		</div>
		{message?<p className={styles.status} role="status">{message}</p>:null}
		{error?<p className={styles.warning} role="alert">{error}</p>:null}
	</section>
}
