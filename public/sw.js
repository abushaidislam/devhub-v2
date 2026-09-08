/*
 DevHub offline app shell service worker (ADR-016) with advanced caching strategies.
 The cache name and precache list mirror src/lib/pwa.ts and are validated by src/lib/__tests__/pwa.test.ts.
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
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache=>cache.addAll(PRECACHE_PATHS)).then(()=>self.skipWaiting())
	);
});

self.addEventListener("activate",event=>{
	event.waitUntil(
		caches.keys().then(keys=>
			Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))
		).then(()=>self.clients.claim())
	);
});

function cachePut(request,response){
	if(!response || response.status !== 200 || response.type !== 'basic') return;
	const copy=response.clone();
	caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)).catch(()=>{});
}

// Stale-While-Revalidate Strategy
async function staleWhileRevalidate(request) {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(request);

	const networkPromise = fetch(request).then(response => {
		if (response && response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	});

	if (cachedResponse) {
        // Ignore network errors for background update if we have a cache hit
        networkPromise.catch(() => {});
        return cachedResponse;
    }

    try {
        return await networkPromise;
    } catch (err) {
        // Fallback for navigation requests
        if (request.mode === "navigate") {
            const fallbackResponse = await caches.match(OFFLINE_PATH);
            if (fallbackResponse) return fallbackResponse;
        }

        throw err;
    }
}

// Network-First with Offline Fallback Strategy
async function networkFirst(request) {
	try {
		const networkResponse = await fetch(request);
		if (networkResponse && networkResponse.ok) {
			cachePut(request, networkResponse);
		}
		return networkResponse;
	} catch (error) {
		const cachedResponse = await caches.match(request, {ignoreSearch: true});
		if (cachedResponse) return cachedResponse;
		if (request.mode === "navigate") {
			const fallbackResponse = await caches.match(OFFLINE_PATH);
			if (fallbackResponse) return fallbackResponse;
		}
		throw error;
	}
}

self.addEventListener("fetch",event=>{
	const request=event.request;
	if(request.method!=="GET")return;

	const url=new URL(request.url);
	if(url.origin!==self.location.origin)return;

	// Navigation requests: Network-First with fallback to offline page
	if(request.mode==="navigate"){
		event.respondWith(networkFirst(request));
		return;
	}

	// Static assets and API/UI components: Stale-While-Revalidate
	if(url.pathname.startsWith("/_next/static/") || url.pathname.endsWith(".svg") || url.pathname.match(/\.(js|css|woff2?)$/)){
		event.respondWith(staleWhileRevalidate(request));
		return;
	}

	// Default caching for other requests (Cache-First)
	event.respondWith(
		caches.match(request).then(cached=>
			cached || fetch(request).then(response=>{
				if(response.ok) cachePut(request,response);
				return response;
			})
		)
	);
});
