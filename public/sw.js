/*
 DevHub offline app shell service worker (ADR-016).
 The cache name and precache list mirror src/lib/pwa.ts and are validated by src/lib/__tests__/pwa.test.ts.
 Cache Storage only ever holds pages and static assets: tool inputs, outputs, favorites, recipes, and history are never written here,
 and this worker adds no network path beyond the requests the page already makes.
*/
const CACHE_NAME="devhub-shell-v2";
const OFFLINE_PATH="/offline";
const PRECACHE_PATHS=[
	"/",
	"/dashboard",
	"/favorites",
	"/recent",
	"/recipes",
	"/tools",
	"/offline",
	"/tools/json-formatter",
	"/tools/base64",
	"/tools/jwt-decoder",
	"/tools/uuid-generator",
	"/tools/regex-tester",
	"/tools/qr-generator",
	"/tools/color-converter",
	"/tools/markdown-preview",
	"/tools/hash-generator",
	"/tools/sql-formatter",
	"/tools/cron-parser",
	"/tools/url-encoder",
	"/tools/timestamp-converter",
	"/tools/case-converter",
	"/tools/slug-generator",
	"/tools/text-diff",
	"/tools/text-stats",
	"/tools/json-to-csv",
	"/tools/csv-to-json",
	"/tools/json-to-yaml",
	"/tools/number-base",
	"/tools/html-entities",
	"/tools/query-parser",
		"/tools/password-generator",
		"/tools/yaml-formatter",
		"/tools/xml-formatter",
		"/tools/markdown-linter",
		"/tools/url-parser",
		"/tools/gitignore-generator",
		"/tools/json-to-typescript",
		"/tools/curl-converter",
		"/tools/yaml-to-json",
		"/tools/lorem-ipsum",
		"/tools/chmod-calculator",
		"/tools/html-formatter",
		"/favicon.png",
	"/icon.png",
	"/icon-maskable.png"
];
self.addEventListener("install",event=>{
	event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(PRECACHE_PATHS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
	event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
function cachePut(request,response){
	const copy=response.clone();
	caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)).catch(()=>{});
}
self.addEventListener("fetch",event=>{
	const request=event.request;
	if(request.method!=="GET")return;
	const url=new URL(request.url);
	if(url.origin!==self.location.origin)return;
	if(request.mode==="navigate"){
		event.respondWith(
			fetch(request)
				.then(response=>{if(response.ok)cachePut(request,response);return response})
				.catch(()=>caches.match(request,{ignoreSearch:true}).then(cached=>cached||caches.match(OFFLINE_PATH)))
		);
		return;
	}
	if(url.pathname.startsWith("/_next/static/")||url.pathname.endsWith(".svg")){
		event.respondWith(
			caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok)cachePut(request,response);return response}))
		);
	}
});
