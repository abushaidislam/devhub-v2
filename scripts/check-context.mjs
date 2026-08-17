import {access,readFile} from "node:fs/promises";
const required=["AGENTS.md","docs/README.md","docs/ARCHITECTURE.md","docs/DESIGN-SYSTEM.md","docs/TOOL-CONTRACT.md","docs/PRODUCT-STRATEGY.md","docs/TRUST-AND-PRIVACY.md","docs/TESTING.md","docs/DECISIONS.md","docs/ROADMAP.md","docs/AI-HANDOFF.md","src/app/AGENTS.md","src/components/AGENTS.md","src/lib/AGENTS.md"];
const failures=[];
for(const file of required){try{await access(file)}catch{failures.push(`Missing required context file: ${file}`)}}
const toolsSource=await readFile("src/lib/tools.ts","utf8");const slugs=[...toolsSource.matchAll(/slug:\s*"([^"]+)"/g)].map(match=>match[1]);const duplicates=slugs.filter((slug,index)=>slugs.indexOf(slug)!==index);if(duplicates.length)failures.push(`Duplicate tool slugs: ${[...new Set(duplicates)].join(", ")}`);if(slugs.length===0)failures.push("No tool slugs found in src/lib/tools.ts");
const handoff=await readFile("docs/AI-HANDOFF.md","utf8");for(const heading of ["## Known gaps","## Next recommended task"]){if(!handoff.includes(heading))failures.push(`AI handoff is missing: ${heading}`)}
if(failures.length){console.error("Context validation failed:\n- "+failures.join("\n- "));process.exit(1)}
console.log(`Context validation passed: ${required.length} documents, ${slugs.length} unique tools.`);
