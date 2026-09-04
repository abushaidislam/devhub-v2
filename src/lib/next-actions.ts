export type NextActionSource="pairing"|"recent"|"favorite"|"featured";
export type NextAction={slug:string;reason:string;source:NextActionSource};
export type NextActionTool={slug:string;name:string;featured?:boolean};
export const NEXT_ACTION_LIMIT=3;
const MAX_LIMIT=6;
const RECENT_SIGNAL_LIMIT=20;
export const TOOL_PAIRINGS:Record<string,readonly string[]>={
	"json-formatter":["jwt-decoder","base64","sql-formatter"],
	"base64":["json-formatter","jwt-decoder","url-encoder"],
	"jwt-decoder":["base64","json-formatter","hash-generator"],
	"uuid-generator":["hash-generator","json-formatter","qr-generator"],
	"regex-tester":["url-encoder","sql-formatter","markdown-preview"],
	"qr-generator":["url-encoder","uuid-generator","color-converter"],
	"color-converter":["qr-generator","markdown-preview","regex-tester"],
	"markdown-preview":["regex-tester","color-converter","json-formatter"],
	"hash-generator":["jwt-decoder","uuid-generator","base64"],
	"sql-formatter":["json-formatter","regex-tester","cron-parser"],
	"cron-parser":["sql-formatter","regex-tester","uuid-generator"],
	"url-encoder":["base64","qr-generator","regex-tester"],
	"yaml-formatter":["json-to-yaml","json-formatter","markdown-linter"],
	"xml-formatter":["html-entities","json-formatter","markdown-preview"],
	"markdown-linter":["markdown-preview","yaml-formatter","text-diff"],
	"url-parser":["url-encoder","query-parser","json-to-typescript"],
	"gitignore-generator":["yaml-formatter","markdown-preview","text-diff"],
	"json-to-typescript":["json-formatter","json-to-yaml","csv-to-json"],
	"curl-converter":["url-parser","json-formatter","base64"]
};
export function recommendNextActions({tools,currentSlug,recentSlugs=[],favorites=[],limit=NEXT_ACTION_LIMIT}:{tools:readonly NextActionTool[];currentSlug?:string;recentSlugs?:readonly string[];favorites?:readonly string[];limit?:number}):NextAction[]{
	const bounded=Math.min(Math.max(Math.trunc(limit),0),MAX_LIMIT);
	if(bounded===0)return [];
	const bySlug=new Map(tools.map(tool=>[tool.slug,tool]));
	const used=new Set<string>();
	if(currentSlug)used.add(currentSlug);
	const picks:NextAction[]=[];
	const add=(slug:string,reason:string,source:NextActionSource)=>{if(picks.length>=bounded||!bySlug.has(slug)||used.has(slug))return;used.add(slug);picks.push({slug,reason,source})};
	const current=currentSlug?bySlug.get(currentSlug):undefined;
	if(current){for(const slug of TOOL_PAIRINGS[current.slug]??[])add(slug,`Pairs well with ${current.name}.`,"pairing")}
	for(const recentSlug of recentSlugs.slice(0,RECENT_SIGNAL_LIMIT)){
		if(recentSlug===currentSlug)continue;
		const recent=bySlug.get(recentSlug);
		if(!recent)continue;
		for(const slug of TOOL_PAIRINGS[recentSlug]??[])add(slug,`Follows your recent ${recent.name} activity.`,"recent");
	}
	for(const slug of favorites)add(slug,"Saved in your favorites.","favorite");
	for(const tool of tools){if(tool.featured)add(tool.slug,"Popular in the toolkit.","featured")}
	for(const tool of tools)add(tool.slug,"Popular in the toolkit.","featured");
	return picks;
}
