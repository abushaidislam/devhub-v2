import { EngineResult, escapeHtml, MAX_REGEX_PATTERN_LENGTH, MAX_REGEX_TEXT_LENGTH, MAX_REGEX_MATCHES, nestedQuantifier, MAX_MARKDOWN_LENGTH, formatInlineMarkdown, splitMarkdownTableRow, isMarkdownTableSeparator, renderMarkdownTable, ensureBatchInput } from './utils';

const REGEX_TRAILING_WHITESPACE = /[ \t]+$/;
const REGEX_TWO_TRAILING_SPACES = / {2}$/;
const REGEX_HEADING_NO_SPACE = /^\s*#{1,6}(?!#)\S/;
const REGEX_HEADING_MARKER = /^\s*(#{1,6})\s+/;
const REGEX_CODE_FENCE_START = /^\s*```/;
const REGEX_EMPTY_LINK = /\[[^\]]*\]\(\s*\)/;
const REGEX_EMPTY_ALT = /!\[\s*\]\(/;
const REGEX_LIST_ITEM = /^\s*([-+*]|\d+[.)])\s+/;

export function testRegex(pattern:string,flags:string,text:string):EngineResult{if(pattern.length>MAX_REGEX_PATTERN_LENGTH)throw new Error(`Regex patterns are limited to ${MAX_REGEX_PATTERN_LENGTH} characters.`);if(text.length>MAX_REGEX_TEXT_LENGTH)throw new Error(`Regex input is limited to ${MAX_REGEX_TEXT_LENGTH.toLocaleString("en-US")} characters.`);if(nestedQuantifier.test(pattern))throw new Error("This pattern contains nested quantifiers that may cause excessive backtracking.");const regex=new RegExp(pattern,flags.includes("g")?flags:`${flags}g`);const matches:Array<{match:string;index:number;groups:string[]}>=[];let match:RegExpExecArray|null;while((match=regex.exec(text))!==null){if(matches.length===MAX_REGEX_MATCHES)throw new Error(`Results are limited to ${MAX_REGEX_MATCHES.toLocaleString("en-US")} matches. Narrow the pattern or input.`);matches.push({match:match[0],index:match.index,groups:match.slice(1)});if(match[0]==="")regex.lastIndex+=1}return {output:JSON.stringify(matches,null,2),meta:`${matches.length} match${matches.length===1?"":"es"}`}}
export function convertCase(input:string):EngineResult{const value=input.trim();if(!value)throw new Error("Enter some text to convert.");const words=value.replace(/[_-]+/g," ").replace(/([a-z0-9])([A-Z])/g,"$1 $2").split(/\s+/).filter(Boolean).map(word=>word.toLowerCase());const camel=words.map((word,index)=>index===0?word:word[0].toUpperCase()+word.slice(1)).join("");const pascal=words.map(word=>word[0].toUpperCase()+word.slice(1)).join("");const lines=[`lower: ${value.toLowerCase()}`,`UPPER: ${value.toUpperCase()}`,`Title Case: ${words.map(word=>word[0].toUpperCase()+word.slice(1)).join(" ")}`,`camelCase: ${camel}`,`PascalCase: ${pascal}`,`snake_case: ${words.join("_")}`,`kebab-case: ${words.join("-")}`,`CONSTANT_CASE: ${words.join("_").toUpperCase()}`];return {output:lines.join("\n"),meta:`${words.length} words`}}
export function slugify(input:string):EngineResult{const value=input.trim();if(!value)throw new Error("Enter text to turn into a slug.");const slug=value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");if(!slug)throw new Error("This text contains no characters usable in a URL slug.");return {output:slug,meta:`${slug.length} characters`}}
export function diffLines(input:string):EngineResult{const separator=/^\s*---\s*$/m;if(!separator.test(input))throw new Error("Separate the two versions with a line containing only ---.");const [left="",right=""]=input.split(separator);const a=left.replace(/^\n+|\n+$/g,"").split("\n");const b=right.replace(/^\n+|\n+$/g,"").split("\n");const lines:string[]=[];let added=0;let removed=0;const max=Math.max(a.length,b.length);for(let index=0;index<max;index+=1){const before=a[index];const after=b[index];if(before===after){lines.push(`  ${before??""}`);continue}if(before!==undefined){lines.push(`- ${before}`);removed+=1}if(after!==undefined){lines.push(`+ ${after}`);added+=1}}return {output:lines.join("\n"),meta:`${added} added, ${removed} removed`}}
export function analyzeText(input:string):EngineResult{const value=input;const words=value.trim()?value.trim().split(/\s+/).length:0;const lines=value?value.split("\n").length:0;const sentences=(value.match(/[^.!?]+[.!?]+/g)??[]).length;const characters=[...value].length;const readingMinutes=Math.max(1,Math.round(words/200));const output=[`Characters: ${characters}`,`Characters (no spaces): ${[...value.replace(/\s/g,"")].length}`,`Words: ${words}`,`Lines: ${lines}`,`Sentences: ${sentences}`,`Reading time: ~${readingMinutes} min at 200 wpm`].join("\n");return {output,meta:`${words} words`}}
export function lintMarkdown(input:string):EngineResult{const value=ensureBatchInput(input,"Enter Markdown content to lint.");const lines=value.split("\n");const findings:Array<{line:number;rule:string;message:string}>=[];let previousHeading=0;let fence=false;let blankRun=0;for(let index=0;index<lines.length;index+=1){const line=lines[index];const lineNumber=index+1;if(REGEX_TRAILING_WHITESPACE.test(line)&&!REGEX_TWO_TRAILING_SPACES.test(line))findings.push({line:lineNumber,rule:"MD009",message:"Remove trailing whitespace."});if(line.length>120)findings.push({line:lineNumber,rule:"MD013",message:"Keep lines at or below 120 characters."});if(REGEX_HEADING_NO_SPACE.test(line))findings.push({line:lineNumber,rule:"MD018",message:"Add a space after the heading marker."});const heading=line.match(REGEX_HEADING_MARKER);if(heading){const level=heading[1].length;if(previousHeading&&level>previousHeading+1)findings.push({line:lineNumber,rule:"MD001",message:`Heading level skips from H${previousHeading} to H${level}.`});previousHeading=level}if(REGEX_CODE_FENCE_START.test(line))fence=!fence;if(REGEX_EMPTY_LINK.test(line))findings.push({line:lineNumber,rule:"MD042",message:"Link destination cannot be empty."});if(REGEX_EMPTY_ALT.test(line))findings.push({line:lineNumber,rule:"MD045",message:"Images need descriptive alt text."});if(!line.trim()){blankRun+=1;if(blankRun>1)findings.push({line:lineNumber,rule:"MD012",message:"Avoid multiple consecutive blank lines."})}else blankRun=0;if(REGEX_LIST_ITEM.test(line)&&index>0&&lines[index-1]?.trim()==="")continue}if(fence)findings.push({line:lines.length,rule:"MD040",message:"Close the fenced code block."});const output=findings.length?findings.map(f=>`Line ${f.line} ${f.rule}: ${f.message}`).join("\n")+`\n\n${findings.length} issue${findings.length===1?"":"s"} found.`:"No Markdown lint issues found.";return {output,meta:`Markdown lint — ${findings.length} issue${findings.length===1?"":"s"}`}}
export function markdownToHtml(input:string):EngineResult{if(input.length>MAX_MARKDOWN_LENGTH)throw new Error(`Markdown input is limited to ${MAX_MARKDOWN_LENGTH.toLocaleString("en-US")} characters.`);const lines=input.replace(/\r\n?/g,"\n").split("\n");const output:string[]=[];const listItems:string[]=[];let listType:"ul"|"ol"|null=null;let codeLines:string[]|null=null;let codeLanguage="";let paragraph:string[]=[];let quote:string[]=[];const flushParagraph=()=>{if(paragraph.length){output.push(`<p>${formatInlineMarkdown(paragraph.join("\n"))}</p>`);paragraph=[]}};const flushQuote=()=>{if(quote.length){output.push(`<blockquote>${formatInlineMarkdown(quote.join("\n"))}</blockquote>`);quote=[]}};const flushList=()=>{if(!listItems.length)return;const tag=listType??"ul";output.push(`<${tag}>${listItems.join("")}</${tag}>`);listItems.length=0;listType=null};const flushFlow=()=>{flushParagraph();flushQuote();flushList()};for(let index=0;index<lines.length;index+=1){const line=lines[index];if(codeLines){if(/^\s*```\s*$/.test(line)){const language=codeLanguage?` data-language="${escapeHtml(codeLanguage)}"`:"";output.push(`<pre${language}><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);codeLines=null;codeLanguage=""}else codeLines.push(line);continue}const fence=line.match(/^\s*```\s*([\w+-]*)\s*$/);if(fence){flushFlow();codeLanguage=fence[1]??"";codeLines=[];continue}const nextLine=lines[index+1]??"";if(line.trim()&&isMarkdownTableSeparator(nextLine)&&splitMarkdownTableRow(line).length===splitMarkdownTableRow(nextLine).length){flushFlow();const body:string[]=[];index+=2;while(index<lines.length&&lines[index].trim()&&lines[index].includes("|")){body.push(lines[index]);index+=1}index-=1;output.push(renderMarkdownTable(line,nextLine,body));continue}const heading=line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);if(heading){flushFlow();const level=heading[1].length;output.push(`<h${level}>${formatInlineMarkdown(heading[2])}</h${level}>`);continue}if(/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)){flushFlow();output.push("<hr />");continue}const listItem=line.match(/^\s*([-+*]|\d+[.)])\s+(.+)$/);if(listItem){flushParagraph();flushQuote();const type=/^\d/.test(listItem[1])?"ol":"ul";if(listType&&listType!==type)flushList();listType=type;const task=listItem[2].match(/^\[([ xX])\]\s+(.+)$/);const marker=task?`<input type="checkbox" disabled ${task[1].toLowerCase()==="x"?"checked ":""}aria-label="${task[1].toLowerCase()==="x"?"Completed":"Incomplete"} task" /> `:"";listItems.push(`<li>${marker}${formatInlineMarkdown(task?task[2]:listItem[2])}</li>`);continue}flushList();const quoteLine=line.match(/^\s*>\s?(.*)$/);if(quoteLine){flushParagraph();quote.push(quoteLine[1]);continue}if(!line.trim()){flushParagraph();flushQuote();continue}flushQuote();paragraph.push(line.trim())}flushFlow();if(codeLines)throw new Error("Close the fenced code block with ```.");const blockCount=output.length;return {output:output.join("\n"),meta:`Safe preview — ${blockCount} block${blockCount===1?"":"s"}; raw HTML escaped`}}

export function calculateChmod(input: string): EngineResult {
  const value = input.trim();
  if (!value) {
    throw new Error("Enter an octal permission (e.g. 755) or symbolic notation (e.g. rwxr-xr-x).");
  }

  let owner = 0;
  let group = 0;
  let others = 0;
  let special = 0;

  if (/^[0-7]{3,4}$/.test(value)) {
    const padded = value.padStart(4, "0");
    special = parseInt(padded[0], 8);
    owner = parseInt(padded[1], 8);
    group = parseInt(padded[2], 8);
    others = parseInt(padded[3], 8);
  } else {
    const cleaned = value.replace(/^[-\bdl]/, "");
    if (/^[r-][w-][x-][r-][w-][x-][r-][w-][x-]$/i.test(cleaned)) {
      const parseTriplet = (triplet: string) => {
        let n = 0;
        if (triplet[0].toLowerCase() === "r") n += 4;
        if (triplet[1].toLowerCase() === "w") n += 2;
        if (triplet[2].toLowerCase() === "x" || triplet[2].toLowerCase() === "s" || triplet[2].toLowerCase() === "t") n += 1;
        return n;
      };
      owner = parseTriplet(cleaned.slice(0, 3));
      group = parseTriplet(cleaned.slice(3, 6));
      others = parseTriplet(cleaned.slice(6, 9));
      if (cleaned[2].toLowerCase() === "s") special += 4;
      if (cleaned[5].toLowerCase() === "s") special += 2;
      if (cleaned[8].toLowerCase() === "t") special += 1;
    } else {
      throw new Error("Invalid permission format. Enter a 3-4 digit octal (e.g. 755) or 9-character symbolic string (e.g. rwxr-xr-x).");
    }
  }

  const tripletToString = (n: number) => {
    return [
      n & 4 ? "r" : "-",
      n & 2 ? "w" : "-",
      n & 1 ? "x" : "-",
    ].join("");
  };

  const toBinary = (n: number) => n.toString(2).padStart(3, "0");

  const describeTriplet = (n: number) => {
    const perms: string[] = [];
    if (n & 4) perms.push("Read");
    if (n & 2) perms.push("Write");
    if (n & 1) perms.push("Execute");
    return perms.length > 0 ? perms.join(", ") : "None";
  };

  const octal3 = `${owner}${group}${others}`;
  const octal4 = `${special}${owner}${group}${others}`;
  const symbolic = `-${tripletToString(owner)}${tripletToString(group)}${tripletToString(others)}`;
  const binary = `${toBinary(owner)} ${toBinary(group)} ${toBinary(others)}`;

  const uStr = tripletToString(owner).replace(/-/g, "") || "-";
  const gStr = tripletToString(group).replace(/-/g, "") || "-";
  const oStr = tripletToString(others).replace(/-/g, "") || "-";

  const lines = [
    `Octal: ${octal3} (4-digit: ${octal4})`,
    `Symbolic: ${symbolic}`,
    `Binary: ${binary}`,
    "",
    "Permissions breakdown:",
    `  Owner (User):   ${describeTriplet(owner)} (${owner})`,
    `  Group:          ${describeTriplet(group)} (${group})`,
    `  Others (World): ${describeTriplet(others)} (${others})`,
    ...(special > 0 ? [`  Special flags:  ${special}`] : []),
    "",
    "Shell commands:",
    `  chmod ${octal3} <file>`,
    `  chmod u=${uStr},g=${gStr},o=${oStr} <file>`,
  ];

  return {
    output: lines.join("\n"),
    meta: `Chmod ${octal3} (${symbolic})`,
  };
}