import fs from 'fs/promises';
import path from 'path';

const SRC_COMPONENTS = './src/components';

const CATEGORIES = {
  core: [
    'site-header.tsx', 'site-footer.tsx', 'site-footer.module.css',
    'logo.tsx', 'theme-provider.tsx', 'theme-toggle.tsx',
    'scroll-progress.tsx', 'service-worker-registration.tsx',
    'json-ld.tsx', 'error-explainer.tsx'
  ],
  dashboard: [
    'dashboard-shell.tsx', 'dashboard-shell.module.css',
    'dashboard-tool-grid.tsx', 'dashboard-tool-grid.module.css',
    'recent-workspace.tsx', 'recent-workspace.module.css',
    'command-palette.tsx', 'command-palette.module.css',
    'command-trigger.tsx', 'workspace-transfer.tsx', 'workspace-transfer.module.css',
    'favorite-button.tsx', 'favorite-button.module.css'
  ],
  tools: [
    'tool-card.tsx', 'tool-search.tsx',
    'tool-runtime.tsx', 'tool-runtime.module.css',
    'smart-input-detector.tsx', 'smart-input-detector.module.css',
    'tool-ai-assist.tsx', 'tool-ai-assist.module.css',
    'ai-provider-settings.tsx', 'ai-provider-settings.module.css',
    'next-actions.tsx', 'next-actions.module.css'
  ],
  workflows: [
    'recipe-runner.tsx', 'recipe-runner.module.css',
    'saved-recipe-workspace.tsx', 'saved-recipe-workspace.module.css',
    'workflow-planner.tsx', 'workflow-planner.module.css'
  ],
  marketing: [
    'landing-cta-section.tsx', 'landing-cta-section.module.css',
    'trust-page.tsx', 'trust-page.module.css'
  ],
  ui: [
    'switch.tsx', 'switch.module.css'
  ]
};

const FILE_TO_CATEGORY = {};
for (const [category, files] of Object.entries(CATEGORIES)) {
  for (const file of files) {
    FILE_TO_CATEGORY[file] = category;
  }
}

async function getFiles(dir) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return Array.prototype.concat(...files);
}

async function moveComponents() {
  console.log('Moving components...');
  for (const category of Object.keys(CATEGORIES)) {
    const dir = path.join(SRC_COMPONENTS, category);
    await fs.mkdir(dir, { recursive: true });
  }

  const files = await getFiles(SRC_COMPONENTS);
  for (const file of files) {
    const basename = path.basename(file);
    const category = FILE_TO_CATEGORY[basename];
    if (category) {
      const currentDir = path.dirname(file);
      const isAlreadyInCat = path.basename(currentDir) === category;
      if (!isAlreadyInCat) {
        const dest = path.join(SRC_COMPONENTS, category, basename);
        await fs.rename(file, dest);
        console.log(`Moved ${basename} to ${category}/`);
      }
    }
  }
}

async function fixImports() {
  console.log('Fixing imports...');
  const files = await getFiles('./src');
  
  for (const file of files) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.css')) continue;
    
    let content = await fs.readFile(file, 'utf8');
    let changed = false;

    // 1. Fix absolute @/components/ imports
    for (const [basename, category] of Object.entries(FILE_TO_CATEGORY)) {
      const nameWithoutExt = basename.replace(/\.tsx$|\.ts$|\.module\.css$/, '');
      const oldImport = `@/components/${nameWithoutExt}`;
      const newImport = `@/components/${category}/${nameWithoutExt}`;
      
      const regex = new RegExp(`['"]${oldImport}['"]`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `"${newImport}"`);
        changed = true;
      }
    }

    // 2. Fix relative imports inside components
    const fileBasename = path.basename(file);
    const fileCategory = FILE_TO_CATEGORY[fileBasename];
    
    if (fileCategory) {
      // Find `from "./something"` or `import "./something.module.css"`
      const relativeImportRegex = /from\s+['"](\.\/?[^'"]+)['"]/g;
      const cssImportRegex = /import\s+['"](\.\/?[^'"]+)['"]/g;
      
      const replaceRelative = (match, p1) => {
        let importedBasename = path.basename(p1);
        let importedCategory = null;
        
        for (const [key, cat] of Object.entries(FILE_TO_CATEGORY)) {
            if (key === importedBasename || key.startsWith(importedBasename + '.')) {
                importedCategory = cat;
                break;
            }
        }
        
        if (p1.startsWith('./ui/')) {
           importedCategory = 'ui';
           importedBasename = p1.replace('./ui/', '');
        }

        if (importedCategory) {
          if (importedCategory === fileCategory) {
             return match.replace(p1, `./${importedBasename}`);
          } else {
             return match.replace(p1, `../${importedCategory}/${importedBasename}`);
          }
        }
        
        return match;
      };

      if (content.match(relativeImportRegex)) {
         content = content.replace(relativeImportRegex, replaceRelative);
         changed = true;
      }
      if (content.match(cssImportRegex)) {
         content = content.replace(cssImportRegex, replaceRelative);
         changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(file, content, 'utf8');
      console.log(`Updated imports in ${fileBasename}`);
    }
  }
}

async function run() {
  await moveComponents();
  await fixImports();
}

run().catch(console.error);
