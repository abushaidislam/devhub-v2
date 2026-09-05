"use client";
import {useCallback,useDeferredValue,useEffect,useMemo,useRef,useState,type KeyboardEvent as ReactKeyboardEvent} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowUpRight,ClipboardPaste,ScanSearch,X} from "lucide-react";
import {detectInput,DETECTION_INPUT_LIMIT} from "@/lib/detection";
import {setDetectionHandoff} from "@/lib/detection-handoff";
import {getTool} from "@/lib/tools";
import styles from "./smart-input-detector.module.css";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

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

	const handlePaste=useCallback(async()=>{
		try{
			if(typeof navigator!=="undefined"&&navigator.clipboard?.readText){
				const text=await navigator.clipboard.readText();
				if(text){
					applyInput(text);
					textareaRef.current?.focus();
					return;
				}
			}
		}catch{
			// Clipboard read blocked or unsupported
		}
		textareaRef.current?.focus();
	},[applyInput]);

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

	const rows=input?Math.min(5,Math.max(2,input.split("\n").length)):1;

	return <section className={styles.omnibar} aria-labelledby="smart-detect-title">
		<h2 id="smart-detect-title" className={styles.srOnly}>Smart input detection</h2>
		<label htmlFor="smart-detect-input" className={styles.srOnly}>Input to detect</label>

		<div className={styles.inputRow}>
			<div className={styles.searchIcon} aria-hidden="true">
				<ScanSearch size={16} />
			</div>
			<textarea
				id="smart-detect-input"
				ref={textareaRef}
				value={input}
				onChange={event=>applyInput(event.target.value)}
				onKeyDown={onTextareaKeyDown}
				rows={rows}
				placeholder="Paste JSON, JWT, SQL, Cron, URL, Base64 to detect matching tool…"
				aria-label="Input to detect"
				className={styles.textarea}
			/>
			<div className={styles.actions}>
				{input?(
					<>
						<span className={styles.charCount}>{input.length.toLocaleString("en-US")} / {DETECTION_INPUT_LIMIT.toLocaleString("en-US")}</span>
						<Button
							className={styles.clearBtn}
							type="button"
							variant="tertiary"
							size="tiny"
							shape="square"
							aria-label="Clear detected input"
							onClick={clearInput}
							prefix={<X size={13} />}
						/>
					</>
				):(
					<>
						<button
							type="button"
							className={styles.pasteBtn}
							onClick={handlePaste}
							title="Paste from clipboard"
						>
							<ClipboardPaste size={12} aria-hidden="true" />
							<span>Paste</span>
						</button>
						<span className={styles.localTag} title="Runs locally in browser">
							<span className={styles.dot} />
							Local
						</span>
					</>
				)}
			</div>
		</div>

		<div className={styles.footer}>
			<div className={styles.samples} role="group" aria-label="Example inputs">
				<span className={styles.tryLabel}>Try:</span>
				{sampleInputs.map(sample=>(
					<button
						key={sample.label}
						type="button"
						className={styles.chip}
						onClick={()=>{applyInput(sample.value);textareaRef.current?.focus()}}
					>
						{sample.label}
					</button>
				))}
			</div>

			<div className={styles.footerRight}>
				{trimmed&&(
					<span className={styles.warning} role="status">
						Input was trimmed to {DETECTION_INPUT_LIMIT.toLocaleString("en-US")} characters.
					</span>
				)}
				<span className={styles.privacy}>Nothing is stored or sent. Detection runs as you type.</span>
				<div className={styles.hints} aria-hidden="true">
					<span><kbd>/</kbd> focus</span>
					<span><kbd>Esc</kbd> clear</span>
					<span><kbd>⌘↵</kbd> open</span>
				</div>
			</div>
		</div>

		<p className={styles.srOnly} role="status">{matchSummary}</p>

		{hasQuery&&(
			<div className={styles.resultsDrop}>
				{detections.length?(
					<div className={styles.matchWrap}>
						<div className={styles.matchHeader}>
							<span className={styles.matchCount}>
								{detections.length===1?"1 matching tool found":`${detections.length} matching tools found`}
							</span>
							<span className={styles.matchHint}>Press ⌘/Ctrl + Enter to open top match</span>
						</div>
						<ul className={styles.matchList}>
							{detections.slice(0,4).map(detection=>{
								const tool=getTool(detection.slug);
								if(!tool)return null;
								const Icon=tool.icon;
								return (
									<li key={detection.slug}>
										<Link
											href={`/tools/${tool.slug}`}
											onClick={()=>handOff(detection.slug)}
											className={styles.matchLink}
										>
											<span className={styles.toolIcon}><Icon size={15} /></span>
											<span className={styles.toolMeta}>
												<strong>{tool.name}</strong>
												<small>{detection.reason}</small>
											</span>
											<Badge variant={detection.confidence >= .8 ? "green" : "gray"} size="sm">
												{Math.round(detection.confidence*100)}%
											</Badge>
											<ArrowUpRight size={13} className={styles.arrow} />
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				):(
					<p className={styles.empty}>No confident match. Try a larger or more structured sample.</p>
				)}
			</div>
		)}
	</section>;
}
