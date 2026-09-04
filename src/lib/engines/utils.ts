export type EngineResult={output:string;meta?:string};
export const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]!));
export const textEncoder=new TextEncoder();
export const fatalTextDecoder=new TextDecoder("utf-8",{fatal:true});
export function bytesToBase64(bytes:Uint8Array){let binary="";const chunkSize=0x8000;for(let index=0;index<bytes.length;index+=chunkSize){binary+=String.fromCharCode(...bytes.subarray(index,index+chunkSize))}return btoa(binary)}
export function decodeBase64Bytes(input:string,urlSafe=false){const value=input.trim();const invalidMessage=urlSafe?"Invalid Base64URL segment.":"Enter valid Base64 data.";const match=urlSafe?value.match(/^([A-Za-z0-9_-]+)$/):value.match(/^([A-Za-z0-9+/]+)(={0,2})$/);if(!match||match[1].length%4===1)throw new Error(invalidMessage);const expectedPadding=(4-match[1].length%4)%4;if(!urlSafe&&match[2]&&match[2].length!==expectedPadding)throw new Error(invalidMessage);const standard=match[1].replace(/-/g,"+").replace(/_/g,"/").padEnd(match[1].length+expectedPadding,"=");try{const binary=atob(standard);return Uint8Array.from(binary,character=>character.charCodeAt(0))}catch{throw new Error(invalidMessage)}}
export function decodeUtf8(bytes:Uint8Array,message:string){try{return fatalTextDecoder.decode(bytes)}catch{throw new Error(message)}}
export function decodeJwtPart(part:string,label:"header"|"payload"){const decoded=decodeUtf8(decodeBase64Bytes(part,true),`JWT ${label} is not valid UTF-8.`);try{const value:unknown=JSON.parse(decoded);if(!value||typeof value!=="object"||Array.isArray(value))throw new Error();return value as Record<string,unknown>}catch{throw new Error(`JWT ${label} must contain a JSON object.`)}}
export const MAX_REGEX_PATTERN_LENGTH=500,MAX_REGEX_TEXT_LENGTH=100_000,MAX_REGEX_MATCHES=1_000;export const nestedQuantifier=/(\([^)]*(?:\+|\*)[^)]*\)|\[[^\]]+\](?:\+|\*))(?:\+|\*|\{\d*,?\d*\})/;
export const MAX_MARKDOWN_LENGTH=200_000;
export const safeMarkdownHref=(value:string)=>{const href=value.replace(/&amp;/g,"&").trim();if(/^(https?:|mailto:|#|\/|\.\.?\/)/i.test(href))return href;return null};
export const formatInlineMarkdown=(value:string)=>{let html=escapeHtml(value);html=html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g,(_,alt:string)=>`<span class="markdown-image" role="img" aria-label="${escapeHtml(alt||"Image")}">Image: ${escapeHtml(alt||"untitled")}</span>`);html=html.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["']([^"']*)["'])?\)/g,(_,label:string,href:string,title?:string)=>{const safeHref=safeMarkdownHref(href);if(!safeHref)return label;const titleAttribute=title?` title="${escapeHtml(title)}"`:"";return `<a href="${escapeHtml(safeHref)}"${titleAttribute} rel="noreferrer">${label}</a>`});return html.replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*(.+?)\*\*|__(.+?)__/g,(_,strong:string,alternate:string)=>`<strong>${strong??alternate}</strong>`).replace(/~~(.+?)~~/g,"<del>$1</del>").replace(/(^|[^*])\*([^*]+)\*/g,"$1<em>$2</em>").replace(/(^|[^_])_([^_]+)_/g,"$1<em>$2</em>").replace(/ {2,}\n/g,"<br />");};
export const splitMarkdownTableRow=(line:string)=>line.trim().replace(/^\|/,"").replace(/\|$/,"").split("|").map(cell=>cell.trim());
export const isMarkdownTableSeparator=(line:string)=>splitMarkdownTableRow(line).length>0&&splitMarkdownTableRow(line).every(cell=>/^:?-{3,}:?$/.test(cell));
export const renderMarkdownTable=(headerLine:string,separatorLine:string,body:string[])=>{const headers=splitMarkdownTableRow(headerLine);const alignments=splitMarkdownTableRow(separatorLine);const align=(cell:string)=>cell.startsWith(":")&&cell.endsWith(":")?"center":cell.endsWith(":")?"right":cell.startsWith(":")?"left":undefined;const cellHtml=(cell:string,tag:"th"|"td",index:number)=>{const alignment=align(alignments[index]??"");const attribute=alignment?` align="${alignment}"`:"";return `<${tag}${attribute}>${formatInlineMarkdown(cell)}</${tag}>`};const rows=body.map(row=>{const cells=splitMarkdownTableRow(row);return `<tr>${headers.map((_,index)=>cellHtml(cells[index]??"", "td", index)).join("")}</tr>`}).join("");return `<table><thead><tr>${headers.map((cell,index)=>cellHtml(cell,"th",index)).join("")}</tr></thead>${rows?`<tbody>${rows}</tbody>`:""}</table>`};
export function parseCsvRows(input:string){const rows:string[][]=[];let row:string[]=[],field="",quoted=false;const text=input.replace(/\r\n?/g,"\n");for(let index=0;index<text.length;index+=1){const char=text[index];if(quoted){if(char==='"'){if(text[index+1]==='"'){field+='"';index+=1}else quoted=false}else field+=char;continue}if(char==='"'){quoted=true;continue}if(char===","){row.push(field);field="";continue}if(char==="\n"){row.push(field);rows.push(row);row=[];field="";continue}field+=char}if(quoted)throw new Error("Close the quoted CSV field with a double quote.");row.push(field);rows.push(row);return rows.filter(entry=>entry.some(value=>value.trim()!==""))}
export const htmlEntityMap:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
export const MAX_BATCH_TOOL_LENGTH=100_000;
export const ensureBatchInput=(input:string,message:string)=>{if(!input.trim())throw new Error(message);if(input.length>MAX_BATCH_TOOL_LENGTH)throw new Error(`Input is limited to ${MAX_BATCH_TOOL_LENGTH.toLocaleString("en-US")} characters.`);return input.replace(/\r\n?/g,"\n")};
export const gitignoreTemplates:Record<string,string[]>={node:["node_modules/","npm-debug.log*","yarn-debug.log*","yarn-error.log*",".npm/"],next:[".next/","out/","next-env.d.ts"],vscode:[".vscode/*","!.vscode/settings.json","!.vscode/tasks.json","!.vscode/launch.json","!.vscode/extensions.json"],macos:[".DS_Store",".AppleDouble",".LSOverride"],windows:["Thumbs.db","ehthumbs.db","Desktop.ini"],env:[".env",".env.*","!.env.example"]};
const gitignoreAliases:Record<string,string>={nodejs:"node",nextjs:"next","visual-studio-code":"vscode",code:"vscode",mac:"macos",osx:"macos",win:"windows",environment:"env"};
export function generateGitignore(input:string):EngineResult{
  const value=ensureBatchInput(input,"Choose one or more gitignore templates.");
  const namesSet=new Set<string>();
  for(const raw of value.split(/[\n,]+/)){
    const trimmed=raw.trim().toLowerCase();
    if(trimmed){
      const clean=trimmed.startsWith(".")?trimmed.slice(1):trimmed;
      namesSet.add(gitignoreAliases[clean]??clean);
    }
  }
  const names=Array.from(namesSet);
  const unknown=names.filter(name=>!gitignoreTemplates[name]);
  if(unknown.length)throw new Error(`Unknown template${unknown.length===1?"":"s"}: ${unknown.join(", ")}. Use node, next, vscode, macos, windows, or env.`);
  const output:string[]=["# Generated by DevHub Gitignore Generator",""];
  const seen=new Set<string>();
  for(const name of names){
    output.push(`# ${name}`);
    for(const line of gitignoreTemplates[name])if(!seen.has(line)){output.push(line);seen.add(line)}
    output.push("");
  }
  while(output.length&&output[output.length-1]==="")output.pop();
  return {output:output.join("\n"),meta:`Generated locally — ${names.length} template${names.length===1?"":"s"}`}
}
export const typeScriptIdentifier=(value:string)=>{const cleaned=value.replace(/[^A-Za-z0-9_$]+/g," ").trim().split(/\s+/).filter(Boolean).map((word,index)=>index===0?word[0]?.toUpperCase()+word.slice(1):word[0]?.toUpperCase()+word.slice(1)).join("")||"Value";return /^[A-Za-z_$]/.test(cleaned)?cleaned:`Value${cleaned}`};
