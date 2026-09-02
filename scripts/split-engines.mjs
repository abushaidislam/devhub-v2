import fs from 'fs/promises';
import path from 'path';

const SRC = './src/lib/tool-engines.ts';
const DEST = './src/lib/engines';

const CATEGORIES = {
  json: ['formatJson', 'jsonToCsv', 'csvToJson', 'jsonToYaml', 'jsonToTypescript'],
  crypto: ['transformBase64', 'decodeJwt', 'generateUuids', 'generateHash', 'generatePassword'],
  text: ['testRegex', 'convertCase', 'slugify', 'diffLines', 'analyzeText', 'lintMarkdown', 'markdownToHtml'],
  web: ['transformUrl', 'parseQueryString', 'parseUrl', 'transformHtmlEntities', 'convertColor'],
  formatters: ['formatSql', 'formatYaml', 'formatXml', 'describeCron', 'convertTimestamp', 'convertNumberBase'],
  generators: ['generateGitignore']
};

async function run() {
  await fs.mkdir(DEST, { recursive: true });
  const content = await fs.readFile(SRC, 'utf8');
  
  // We don't want to use line numbers. Let's just create 6 category files.
  // We'll put ALL shared utils into a `utils.ts` file, and then each category file will just import EVERYTHING from utils.ts to be safe!
  
  // Find all non-exported top-level declarations
  const lines = content.split('\n');
  const utilsLines = [];
  const exportLines = [];
  
  for (const line of lines) {
    if (line.startsWith('export type') || line.startsWith('export interface')) {
      utilsLines.push(line);
    } else if (line.startsWith('export function') || line.startsWith('export async function')) {
      exportLines.push(line);
    } else if (line.trim() !== '') {
      // It's a top-level const or function used as util
      // Convert it to export so category files can use it
      if (line.startsWith('const ')) {
        utilsLines.push(line.replace(/^const /, 'export const '));
      } else if (line.startsWith('function ')) {
        utilsLines.push(line.replace(/^function /, 'export function '));
      } else {
        utilsLines.push(line);
      }
    }
  }

  // Create utils.ts
  await fs.writeFile(path.join(DEST, 'utils.ts'), utilsLines.join('\n'));
  
  // Create category files
  for (const [category, funcNames] of Object.entries(CATEGORIES)) {
    const categoryExports = [];
    for (const funcName of funcNames) {
      const funcLine = exportLines.find(l => l.includes(` ${funcName}(`));
      if (funcLine) {
        categoryExports.push(funcLine);
      }
    }
    
    // Import everything from utils to be safe
    const imports = `import * as Utils from './utils';\n` + 
                    `// Destructure what we need (or just use Utils.)\n` +
                    `// Actually, since the lines might use the util functions directly, we should just import them all:\n` +
                    `import { ${utilsLines.map(l => {
                      const match = l.match(/^export (?:const|function|type|interface|async function) ([a-zA-Z0-9_]+)/);
                      return match ? match[1] : null;
                    }).filter(Boolean).join(', ')} } from './utils';\n\n`;
                    
    await fs.writeFile(path.join(DEST, `${category}.ts`), imports + categoryExports.join('\n'));
  }
  
  // Create index.ts
  const index = 
    `export type { EngineResult } from './engines/utils';\n` +
    Object.keys(CATEGORIES).map(c => `export * from './engines/${c}';`).join('\n');
    
  await fs.writeFile(SRC, index);
  console.log('Done splitting engines!');
}

run().catch(console.error);
