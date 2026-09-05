import { EngineResult, ensureBatchInput } from './utils';

const SQL_KEYWORDS = ["SELECT","FROM","WHERE","LEFT JOIN","RIGHT JOIN","INNER JOIN","JOIN","GROUP BY","ORDER BY","HAVING","LIMIT","INSERT INTO","VALUES","UPDATE","SET","DELETE FROM","AND","OR"] as const;

const SQL_KEYWORD_RULES = SQL_KEYWORDS.map((keyword) => ({
  regex: new RegExp(`\\s+${keyword.replace(" ", "\\s+")}\\s+`, "gi"),
  replacement: keyword === "AND" || keyword === "OR" ? `\n  ${keyword} ` : `\n${keyword} `,
}));

export function formatSql(input:string):EngineResult{let output=input.trim().replace(/\s+/g," ");for(let i=0;i<SQL_KEYWORD_RULES.length;i++){output=output.replace(SQL_KEYWORD_RULES[i].regex,SQL_KEYWORD_RULES[i].replacement)}return {output:output.trim(),meta:"Formatted locally"}}
export function formatYaml(input:string):EngineResult{const value=ensureBatchInput(input,"Enter YAML content to format.");const lines=value.split("\n");const output:string[]=[];const levels=[0];let previousIndent=0;for(const raw of lines){if(/^(?: |\t)*$/.test(raw)){if(output.length&&output[output.length-1]!=="")output.push("");continue}if(/^\s*\t/.test(raw))throw new Error("YAML indentation must use spaces, not tabs.");const trimmed=raw.trimEnd();const indent=(trimmed.match(/^ */)?.[0].length??0);if(indent%2!==0)throw new Error("YAML indentation must use two-space levels.");if(indent>previousIndent+2)throw new Error("YAML indentation jumps more than one level.");while(levels.length&&indent<levels[levels.length-1])levels.pop();if(indent>previousIndent)levels.push(indent);const content=trimmed.trimStart();if(content.startsWith("-")&&!/^-(?:\s|$)/.test(content))throw new Error("YAML list items must start with '- ' or '-'.");if(/^---+$/.test(content)||/^\.\.\.$/.test(content)||content.startsWith("#")){output.push(" ".repeat(indent)+content)}else{const colon=content.indexOf(":");if(colon===0)throw new Error("YAML mapping keys cannot be empty.");if(colon>0&&content.startsWith("-")&&content[1]!==" "){throw new Error("YAML list syntax is invalid.")}output.push(" ".repeat(indent)+content)}previousIndent=indent}while(output.length&&output[output.length-1]==="")output.pop();return {output:output.join("\n"),meta:`Formatted YAML locally — ${output.length} lines`}}
export function formatXml(input:string):EngineResult{const value=ensureBatchInput(input,"Enter XML content to format.");const tokens=value.match(/<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<[^>]+>|[^<]+/gi)??[];const output:string[]=[];const stack:string[]=[];let level=0;let rootSeen=false;let rootClosed=false;for(const token of tokens){const piece=token.trim();if(!piece)continue;if(piece.startsWith("<!--")||piece.startsWith("<?")||/^<!DOCTYPE/i.test(piece)){output.push("  ".repeat(level)+piece);continue}if(piece.startsWith("<![CDATA[")){output.push("  ".repeat(level)+piece);continue}if(piece.startsWith("</")){const match=piece.match(/^<\/\s*([^\s>]+)\s*>$/);if(!match)throw new Error("Invalid XML closing tag.");const name=match[1];if(stack.pop()!==name)throw new Error(`XML closing tag </${name}> does not match the open tag.`);level=Math.max(0,level-1);output.push("  ".repeat(level)+piece);if(!stack.length)rootClosed=true;continue}if(piece.startsWith("<")){const match=piece.match(/^<\s*([^\s/>]+)/);if(!match)throw new Error("Invalid XML tag.");if(!stack.length){if(rootSeen)throw new Error("XML must contain exactly one root element.");rootSeen=true}const selfClosing=/\/\s*>$/.test(piece);output.push("  ".repeat(level)+piece);if(!selfClosing){stack.push(match[1]);level+=1}else if(!stack.length)rootClosed=true;continue}if(!stack.length&&piece.replace(/\s/g,""))throw new Error("Text is not allowed outside the XML root element.");output.push("  ".repeat(level)+piece)}if(!rootSeen)throw new Error("Enter XML with one root element.");if(stack.length)throw new Error(`Close the XML tag <${stack[stack.length-1]}>.`);if(!rootClosed)throw new Error("XML root element is not closed.");return {output:output.join("\n"),meta:`Formatted XML locally — ${output.length} lines`}}
export function describeCron(input:string):EngineResult{const parts=input.trim().split(/\s+/);if(parts.length!==5)throw new Error("Use a standard five-field cron expression.");const [minute,hour,day,month,weekday]=parts;const value=(v:string,label:string)=>v==="*"?`every ${label}`:`${label} ${v}`;return {output:`Runs at ${value(minute,"minute")}, ${value(hour,"hour")}; ${value(day,"day of month")}; ${value(month,"month")}; ${value(weekday,"weekday")}.`,meta:"Five-field cron"}}
export function convertTimestamp(input:string):EngineResult{const value=input.trim();if(!value)throw new Error("Enter a Unix timestamp or an ISO 8601 date.");let date:Date;let meta:string;if(/^-?\d{1,15}$/.test(value)){const numeric=Number(value);const ms=Math.abs(numeric)>=1e12?numeric:numeric*1000;date=new Date(ms);meta=Math.abs(numeric)>=1e12?"Parsed as milliseconds":"Parsed as seconds"}else{date=new Date(value);meta="Parsed as date string"}if(Number.isNaN(date.getTime()))throw new Error("That value is not a valid timestamp or date.");const seconds=Math.floor(date.getTime()/1000);const lines=[`Unix seconds: ${seconds}`,`Unix milliseconds: ${date.getTime()}`,`ISO 8601 (UTC): ${date.toISOString()}`,`UTC: ${date.toUTCString()}`,`Local: ${date.toString()}`];return {output:lines.join("\n"),meta}}
export function convertNumberBase(input:string):EngineResult{const value=input.trim().toLowerCase().replace(/_/g,"");if(!value)throw new Error("Enter a number in decimal, hex (0x), octal (0o) or binary (0b).");let parsed:number;if(value.startsWith("0x"))parsed=parseInt(value.slice(2),16);else if(value.startsWith("0o"))parsed=parseInt(value.slice(2),8);else if(value.startsWith("0b"))parsed=parseInt(value.slice(2),2);else if(/^-?\d+$/.test(value))parsed=Number(value);else throw new Error("Use a decimal number or prefix with 0x, 0o or 0b.");if(!Number.isFinite(parsed)||Number.isNaN(parsed))throw new Error("That value is not a valid number.");if(!Number.isSafeInteger(parsed))throw new Error("Value must be a safe integer.");const abs=Math.abs(parsed),sign=parsed<0?"-":"";const lines=[`Decimal: ${parsed}`,`Hex: ${sign}0x${abs.toString(16).toUpperCase()}`,`Octal: ${sign}0o${abs.toString(8)}`,`Binary: ${sign}0b${abs.toString(2)}`];return {output:lines.join("\n"),meta:"Converted locally"}}

const HTML_VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

export function formatHtml(input: string, options?: { mode?: "format" | "minify" }): EngineResult {
  const value = ensureBatchInput(input, "Enter HTML markup to format.");
  const mode = options?.mode ?? "format";

  if (mode === "minify") {
    let minified = value.replace(/<!--(?!\[if)[\s\S]*?-->/g, "");
    minified = minified.replace(/\s+/g, " ");
    minified = minified.replace(/>\s+</g, "><");
    minified = minified.replace(/\s+>/g, ">");
    minified = minified.replace(/<\s+/g, "<");
    minified = minified.trim();
    const saved = Math.max(0, Math.round(((value.length - minified.length) / (value.length || 1)) * 100));
    return {
      output: minified,
      meta: `Minified HTML — saved ${saved}% (${minified.length} chars)`,
    };
  }

  const tokens = value.match(/<!DOCTYPE[^>]*>|<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<pre[\s\S]*?<\/pre>|<[^>]+>|[^<]+/gi) ?? [];
  const output: string[] = [];
  let indent = 0;

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<!--")) {
      output.push("  ".repeat(indent) + trimmed);
      continue;
    }

    if (trimmed.startsWith("</")) {
      indent = Math.max(0, indent - 1);
      output.push("  ".repeat(indent) + trimmed);
      continue;
    }

    if (trimmed.startsWith("<")) {
      const tagMatch = trimmed.match(/^<([a-zA-Z0-9:-]+)/);
      const tagName = tagMatch ? tagMatch[1].toLowerCase() : "";
      const isSelfClosing = trimmed.endsWith("/>") || HTML_VOID_TAGS.has(tagName);

      output.push("  ".repeat(indent) + trimmed);
      if (!isSelfClosing && !trimmed.startsWith("<script") && !trimmed.startsWith("<style") && !trimmed.startsWith("<pre")) {
        const hasMatchingClose = new RegExp(`</${tagName}>$`, "i").test(trimmed);
        if (!hasMatchingClose) {
          indent += 1;
        }
      }
      continue;
    }

    output.push("  ".repeat(indent) + trimmed);
  }

  const result = output.join("\n");
  return {
    output: result,
    meta: `Formatted HTML locally — ${output.length} lines`,
  };
}

