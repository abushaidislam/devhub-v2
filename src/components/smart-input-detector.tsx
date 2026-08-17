"use client";
import {useCallback,useDeferredValue,useEffect,useMemo,useRef,useState,type KeyboardEvent as ReactKeyboardEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowUpRight,ScanSearch,ShieldCheck,X} from "lucide-react";
import {detectInput,DETECTION_INPUT_LIMIT} from "@/lib/detection";
import {setDetectionHandoff} from "@/lib/detection-handoff";
import {getTool} from "@/lib/tools";
import styles from "./smart-input-detector.module.css";

const sampleInputs=[
	{label:"JSON",value:'{\n  "service": "devhub",\n  "ready": true\n}'},
	{label:"JWT",value:"eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZXZodWIiLCJyb2xlIjoiZGV2ZWxvcGVyIn0."},
	{label:"SQL",value:"select id, name from users where active = true order by name"},
	{label:"Cron",value:"0 9 * * 1"}
];

export function SmartInputDetector(){
	const router=useRouter();
	const textareaRef=useRef<HTMLTextAreaElement>(null);
	const [input,setInput]=useState("");
	const [trimmed,setTrimmed]=useState(false);
	const deferredInput=useDeferredValue(input);
	const detections=useMemo(()=>detectInput(deferredInput),[deferredInput]);
	const topDetection=detections[0];
	const hasQuery=Boolean(deferredInput.trim());
	const matchSummary=!hasQuery?"":detections.length===1?"1 matching tool found":detections.length?`${detections.length} matching tools found`:"No confident match found";

	const applyInput=useCallback((value:string)=>{
		setTrimmed(value.length>DETECTION_INPUT_LIMIT);
		setInput(value.slice(0,DETECTION_INPUT_LIMIT));
	},[]);

	const clearInput=useCallback(()=>{
		setInput("");
		setTrimmed(false);
		textareaRef.current?.focus();
	},[]);

	useEffect(()=>{
		function onGlobalKeyDown(event:KeyboardEvent){
			if(event.key!=="/"||event.metaKey||event.ctrlKey||event.altKey)return;
			const target=event.target;
			if(target instanceof HTMLElement&&(target.tagName==="INPUT"||target.tagName==="TEXTAREA"||target.tagName==="SELECT"||target.isContentEditable))return;
			event.preventDefault();
			textareaRef.current?.focus();
		}
		window.addEventListener("keydown",onGlobalKeyDown);
		return()=>window.removeEventListener("keydown",onGlobalKeyDown);
	},[]);

	const handOff=useCallback((slug:string)=>{
		if(input)setDetectionHandoff(slug,input);
	},[input]);

	function onTextareaKeyDown(event:ReactKeyboardEvent<HTMLTextAreaElement>){
		if(event.key==="Escape"&&input){
			event.preventDefault();
			clearInput();
			return;
		}
		if(event.key==="Enter"&&(event.metaKey||event.ctrlKey)&&topDetection){
			event.preventDefault();
			handOff(topDetection.slug);
			router.push(`/tools/${topDetection.slug}`);
		}
	}

	return <section className={styles.panel} aria-labelledby="smart-detect-title">
		<header>
			<div className={styles.icon}><ScanSearch size={18}/></div>
			<div>
				<h2 id="smart-detect-title">Smart input detection</h2>
				<p>Paste data to find the best matching local tool.</p>
			</div>
			<span><ShieldCheck size={13}/>Local only</span>
		</header>
		<div className={styles.inputWrap}>
			<label htmlFor="smart-detect-input">Input to detect</label>
			<div className={styles.field}>
				<textarea id="smart-detect-input" ref={textareaRef} value={input} onChange={event=>applyInput(event.target.value)} onKeyDown={onTextareaKeyDown} placeholder="Paste JSON, JWT, URL, Base64, SQL, cron, HEX, or Markdown…"/>
				<small>{input.length.toLocaleString("en-US")} / {DETECTION_INPUT_LIMIT.toLocaleString("en-US")}</small>
				{input&&<button type="button" aria-label="Clear detected input" onClick={clearInput}><X size={14}/></button>}
			</div>
			<div className={styles.footerRow}>
				{input?(trimmed?<p className={styles.warning} role="status">Input was trimmed to {DETECTION_INPUT_LIMIT.toLocaleString("en-US")} characters.</p>:null):<div className={styles.samples} role="group" aria-label="Example inputs">
					<span>Try</span>
					{sampleInputs.map(sample=><button key={sample.label} type="button" onClick={()=>{applyInput(sample.value);textareaRef.current?.focus()}}>{sample.label}</button>)}
				</div>}
				<p className={styles.hints}><kbd>/</kbd> focus<span>·</span><kbd>Esc</kbd> clear<span>·</span><kbd>⌘/Ctrl</kbd>+<kbd>Enter</kbd> top match</p>
			</div>
		</div>
		<p className={styles.srOnly} role="status">{matchSummary}</p>
		<div className={styles.results}>
			{hasQuery?detections.length?<ul>{detections.slice(0,4).map(detection=>{const tool=getTool(detection.slug);if(!tool)return null;const Icon=tool.icon;return <li key={detection.slug}><Link href={`/tools/${tool.slug}`} onClick={()=>handOff(detection.slug)}><span className={styles.toolIcon}><Icon size={16}/></span><span><strong>{tool.name}</strong><small>{detection.reason}</small></span><em title="Heuristic match, not validation">{Math.round(detection.confidence*100)}%</em><ArrowUpRight size={14}/></Link></li>})}</ul>:<p className={styles.empty}>No confident match. Try a larger or more structured sample.</p>:<p className={styles.empty}>Nothing is stored or sent. Detection runs as you type.</p>}
		</div>
	</section>;
}
