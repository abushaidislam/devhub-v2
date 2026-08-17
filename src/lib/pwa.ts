export const PWA_CACHE_VERSION=2;
export const PWA_CACHE_NAME=`devhub-shell-v${PWA_CACHE_VERSION}`;
export const PWA_OFFLINE_PATH="/offline";
export type PrecacheTool={slug:string};
const CORE_APP_PATHS=["/","/dashboard","/favorites","/recent","/recipes","/tools",PWA_OFFLINE_PATH];
const STATIC_ASSET_PATHS=["/favicon.png","/icon.png","/icon-maskable.png"];
/** Canonical offline app-shell precache contract (ADR-016). `public/sw.js` must list exactly these paths; the sync is enforced by `src/lib/__tests__/pwa.test.ts`. */
export function buildPrecachePaths(tools:readonly PrecacheTool[]):string[]{return [...new Set([...CORE_APP_PATHS,...tools.map(tool=>`/tools/${tool.slug}`),...STATIC_ASSET_PATHS])]}
