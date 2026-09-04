import { EngineResult, ensureBatchInput } from "./utils";

interface ParsedLine {
  indent: number;
  content: string;
  lineNum: number;
}

function stripComment(line: string): string {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && !inSingle && (i === 0 || line[i - 1] !== "\\")) {
      inDouble = !inDouble;
    } else if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === "#" && !inDouble && !inSingle) {
      if (i === 0 || /\s/.test(line[i - 1])) {
        return line.slice(0, i).trimEnd();
      }
    }
  }
  return line.trimEnd();
}

function findKeyValueSplit(str: string): number {
  let inDouble = false;
  let inSingle = false;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"' && !inSingle && (i === 0 || str[i - 1] !== "\\")) {
      inDouble = !inDouble;
    } else if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
    } else if (ch === ":" && !inDouble && !inSingle) {
      if (i === str.length - 1 || str[i + 1] === " ") {
        return i;
      }
    }
  }
  return -1;
}

function splitFlow(str: string): string[] {
  const res: string[] = [];
  let cur = "";
  let inDouble = false;
  let inSingle = false;
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '"' && !inSingle && (i === 0 || str[i - 1] !== "\\")) inDouble = !inDouble;
    else if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if ((ch === "[" || ch === "{") && !inDouble && !inSingle) depth++;
    else if ((ch === "]" || ch === "}") && !inDouble && !inSingle) depth--;
    else if (ch === "," && !inDouble && !inSingle && depth === 0) {
      if (cur.trim()) res.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) res.push(cur.trim());
  return res;
}

function parseScalar(str: string): unknown {
  const val = str.trim();
  if (!val || val === "~" || val.toLowerCase() === "null") return null;
  if (/^(true|yes|on)$/i.test(val)) return true;
  if (/^(false|no|off)$/i.test(val)) return false;
  if (/^-?\d+$/.test(val)) {
    const n = Number(val);
    if (Number.isSafeInteger(n)) return n;
  }
  if (/^-?\d+\.\d+$/.test(val)) {
    const n = parseFloat(val);
    if (!Number.isNaN(n)) return n;
  }
  if (/^0x[0-9a-f]+$/i.test(val)) return parseInt(val, 16);
  if (/^0o[0-7]+$/i.test(val)) return parseInt(val.slice(2), 8);

  if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
    try {
      return JSON.parse(val);
    } catch {
      return val.slice(1, -1).replace(/\\"/g, '"');
    }
  }

  if (val.startsWith("'") && val.endsWith("'") && val.length >= 2) {
    return val.slice(1, -1).replace(/''/g, "'");
  }

  if (val.startsWith("[") && val.endsWith("]")) {
    try {
      return JSON.parse(val);
    } catch {
      return splitFlow(val.slice(1, -1)).map((it) => parseScalar(it));
    }
  }

  if (val.startsWith("{") && val.endsWith("}")) {
    try {
      return JSON.parse(val);
    } catch {
      const items = splitFlow(val.slice(1, -1));
      const obj: Record<string, unknown> = {};
      for (const item of items) {
        const split = findKeyValueSplit(item);
        if (split === -1) continue;
        const k = parseScalar(item.slice(0, split));
        const v = parseScalar(item.slice(split + 1));
        obj[String(k)] = v;
      }
      return obj;
    }
  }

  return val;
}

export function yamlToJson(input: string): EngineResult {
  const rawInput = ensureBatchInput(input, "Enter YAML content to convert.");
  const rawLines = rawInput.split(/\r?\n/);
  const lines: ParsedLine[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    if (/^\s*\t/.test(raw)) {
      throw new Error(`Line ${i + 1}: YAML indentation must use spaces, not tabs.`);
    }
    const trimmed = raw.trim();
    if (trimmed === "---" || trimmed === "...") {
      continue;
    }
    const indent = raw.match(/^ */)?.[0].length ?? 0;
    const stripped = stripComment(raw.slice(indent));
    if (!stripped) continue;
    lines.push({ indent, content: stripped, lineNum: i + 1 });
  }

  if (lines.length === 0) {
    return { output: "{}", meta: "Empty YAML document" };
  }

  let cursor = 0;

  function parseBlock(minIndent: number): unknown {
    if (cursor >= lines.length) return null;

    const currentLine = lines[cursor];
    if (currentLine.indent < minIndent) return null;

    const currentIndent = currentLine.indent;

    // Sequence (list)
    if (currentLine.content.startsWith("- ") || currentLine.content === "-") {
      const arr: unknown[] = [];
      while (cursor < lines.length && lines[cursor].indent === currentIndent) {
        const line = lines[cursor];
        if (!line.content.startsWith("- ") && line.content !== "-") {
          break;
        }
        cursor++;
        const itemContent = line.content === "-" ? "" : line.content.slice(2).trim();

        if (!itemContent) {
          if (cursor < lines.length && lines[cursor].indent > currentIndent) {
            arr.push(parseBlock(lines[cursor].indent));
          } else {
            arr.push(null);
          }
        } else {
          const split = findKeyValueSplit(itemContent);
          if (split > -1) {
            const key = parseScalar(itemContent.slice(0, split));
            const rest = itemContent.slice(split + 1).trim();
            const obj: Record<string, unknown> = {};
            const keyStr = String(key);
            if (!rest) {
              if (cursor < lines.length && lines[cursor].indent > currentIndent) {
                obj[keyStr] = parseBlock(lines[cursor].indent);
              } else {
                obj[keyStr] = null;
              }
            } else {
              obj[keyStr] = parseScalar(rest);
            }

            while (
              cursor < lines.length &&
              lines[cursor].indent > currentIndent &&
              !lines[cursor].content.startsWith("-")
            ) {
              const subLine = lines[cursor];
              const subSplit = findKeyValueSplit(subLine.content);
              if (subSplit === -1) break;
              cursor++;
              const subKey = String(parseScalar(subLine.content.slice(0, subSplit)));
              const subRest = subLine.content.slice(subSplit + 1).trim();
              if (!subRest) {
                if (cursor < lines.length && lines[cursor].indent > subLine.indent) {
                  obj[subKey] = parseBlock(lines[cursor].indent);
                } else {
                  obj[subKey] = null;
                }
              } else {
                obj[subKey] = parseScalar(subRest);
              }
            }
            arr.push(obj);
          } else {
            arr.push(parseScalar(itemContent));
          }
        }
      }
      return arr;
    }

    // Mapping (object)
    const split = findKeyValueSplit(currentLine.content);
    if (split > -1) {
      const obj: Record<string, unknown> = {};
      while (cursor < lines.length && lines[cursor].indent === currentIndent) {
        const line = lines[cursor];
        const lineSplit = findKeyValueSplit(line.content);
        if (lineSplit === -1) {
          throw new Error(
            `Line ${line.lineNum}: Expected mapping key-value pair, got "${line.content}".`,
          );
        }
        cursor++;
        const rawKey = line.content.slice(0, lineSplit);
        const key = String(parseScalar(rawKey));
        const rest = line.content.slice(lineSplit + 1).trim();

        if (rest === "|" || rest === ">") {
          const isFolded = rest === ">";
          const textLines: string[] = [];
          const textIndent = cursor < lines.length ? lines[cursor].indent : 0;
          if (textIndent > currentIndent) {
            while (cursor < lines.length && lines[cursor].indent >= textIndent) {
              textLines.push(lines[cursor].content);
              cursor++;
            }
          }
          obj[key] = isFolded ? textLines.join(" ") : textLines.join("\n");
        } else if (!rest) {
          if (cursor < lines.length && lines[cursor].indent > currentIndent) {
            obj[key] = parseBlock(lines[cursor].indent);
          } else {
            obj[key] = null;
          }
        } else {
          obj[key] = parseScalar(rest);
        }
      }
      return obj;
    }

    cursor++;
    return parseScalar(currentLine.content);
  }

  const result = parseBlock(0);
  const formatted = JSON.stringify(result ?? {}, null, 2);

  const meta = Array.isArray(result)
    ? `JSON generated locally — ${result.length} item${result.length === 1 ? "" : "s"}`
    : typeof result === "object" && result !== null
      ? `JSON generated locally — ${Object.keys(result).length} key${Object.keys(result).length === 1 ? "" : "s"}`
      : "JSON generated locally";

  return { output: formatted, meta };
}
