import {track} from "@vercel/analytics";
import {tools} from "./tools";
/**
 * Privacy-safe activation and retention events (ADR-017).
 *
 * Event names are a fixed allowlist and the only property an event may carry
 * is a tool slug validated against the registry. Unknown names, unknown
 * slugs, and any extra fields are dropped before sending, so raw input,
 * output, URLs, clipboard content, detector samples, and history contents
 * are structurally excluded from every event. Transmission happens in
 * production builds only; development and test builds send nothing.
 */
export const TOOL_EVENTS=["tool_opened","tool_run_succeeded","tool_run_failed","favorite_added","favorite_removed"] as const;
export const GLOBAL_EVENTS=["command_palette_opened"] as const;
export type ToolEventName=(typeof TOOL_EVENTS)[number];
export type GlobalEventName=(typeof GLOBAL_EVENTS)[number];
export type ActivationEvent={name:ToolEventName;tool:string}|{name:GlobalEventName};
export type SanitizedEvent={name:string;properties?:{tool:string}};
const knownSlugs=new Set(tools.map(tool=>tool.slug));
export function sanitizeActivationEvent(event:ActivationEvent):SanitizedEvent|null{
	const name=event.name;
	if((TOOL_EVENTS as readonly string[]).includes(name)){
		const tool="tool" in event&&typeof event.tool==="string"?event.tool:null;
		if(!tool||!knownSlugs.has(tool))return null;
		return {name,properties:{tool}};
	}
	if((GLOBAL_EVENTS as readonly string[]).includes(name))return {name};
	return null;
}
export function trackActivationEvent(event:ActivationEvent):boolean{
	const sanitized=sanitizeActivationEvent(event);
	if(!sanitized)return false;
	if(process.env.NODE_ENV!=="production")return false;
	try{track(sanitized.name,sanitized.properties)}catch{return false}
	return true;
}
