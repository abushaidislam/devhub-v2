import {site} from "@/lib/site";import {categories,tools} from "@/lib/tools";
export const dynamic="force-static";

const toolsByCategory = tools.reduce((acc, tool) => {
  if (!acc[tool.category]) {
    acc[tool.category] = 0;
  }
  acc[tool.category]++;
  return acc;
}, {} as Record<string, number>);

export function GET(){const categoryLines=categories.map(category=>`- ${category}: ${toolsByCategory[category] || 0} tools`).join("\n");const toolLines=tools.map(tool=>`- [${tool.name}](${site.url}/tools/${tool.slug}): ${tool.description}`).join("\n");const content=`# DevHub Toolkit\n\n> A free, local-first browser workspace for focused developer data transformations.\n\nDevHub provides independently implemented utilities with a shared keyboard-friendly interface. The current deterministic tools process input in the browser. No account is required.\n\n## Canonical pages\n\n- [Home](${site.url}/)\n- [Developer tools](${site.url}/tools)\n- [Source repository](https://github.com/abushaidislam/devhub-v2)\n- [Full LLM context](${site.url}/llms-full.txt)\n\n## Categories\n\n${categoryLines}\n\n## Tools\n\n${toolLines}\n\n## Important boundaries\n\n- Current registered tools run locally in the browser with zero remote data transfer.\n- JWT Decoder does not verify signatures.\n- Hash Generator provides SHA digests, not password hashing.\n- DevHub does not require accounts or cloud sync; workflows, recipes, and preferences are stored locally in the browser.\n- Workflow chaining, smart input detection, recommended next actions, and saved recipes are shipped and run entirely client-side.\n- Browser extension, VS Code extension, and CLI distribution are planned roadmap directions.\n`;
return new Response(content,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=0, s-maxage=86400"}})}
