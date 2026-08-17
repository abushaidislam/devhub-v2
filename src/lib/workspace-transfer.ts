export type WorkspaceExport={format:"devhub-workspace";version:1;exportedAt:string;containsUserInputs:false;favorites:string[]};
export const WORKSPACE_FORMAT="devhub-workspace";
export const WORKSPACE_VERSION=1;
export const WORKSPACE_IMPORT_LIMIT=100_000;
export function buildWorkspaceExport(favorites:readonly string[],knownSlugs:readonly string[]):WorkspaceExport{const known=new Set(knownSlugs);const seen=new Set<string>();const clean:string[]=[];for(const slug of favorites){if(known.has(slug)&&!seen.has(slug)){seen.add(slug);clean.push(slug)}}return {format:WORKSPACE_FORMAT,version:WORKSPACE_VERSION,exportedAt:new Date().toISOString(),containsUserInputs:false,favorites:clean}}
export function serializeWorkspaceExport(data:WorkspaceExport){return JSON.stringify(data,null,2)}
export type WorkspaceImportResult={favorites:string[];skipped:number};
export function parseWorkspaceImport(raw:string,knownSlugs:readonly string[]):WorkspaceImportResult{
	if(raw.length>WORKSPACE_IMPORT_LIMIT)throw new Error("Import file is too large to be a DevHub workspace export.");
	let parsed:unknown;
	try{parsed=JSON.parse(raw)}catch{throw new Error("Import file is not valid JSON.")}
	if(typeof parsed!=="object"||parsed===null||Array.isArray(parsed))throw new Error("Import file is not a DevHub workspace export.");
	const record=parsed as Record<string,unknown>;
	if(record.format!==WORKSPACE_FORMAT)throw new Error("Import file is not a DevHub workspace export.");
	if(record.version!==WORKSPACE_VERSION)throw new Error(`Unsupported workspace export version. This app supports version ${WORKSPACE_VERSION}.`);
	if(!Array.isArray(record.favorites))throw new Error("Workspace export is missing a favorites list.");
	const known=new Set(knownSlugs);const seen=new Set<string>();const favorites:string[]=[];let skipped=0;
	for(const item of record.favorites){if(typeof item!=="string"||!known.has(item)){skipped+=1;continue}if(seen.has(item))continue;seen.add(item);favorites.push(item)}
	return {favorites,skipped}
}
