import {readFileSync} from "node:fs";
import {join} from "node:path";
import {describe,expect,it} from "vitest";
import manifest from "@/app/manifest";
import {buildPrecachePaths,PWA_CACHE_NAME,PWA_OFFLINE_PATH} from "@/lib/pwa";
import {tools} from "@/lib/tools";

const swSource=readFileSync(join(process.cwd(),"public","sw.js"),"utf8");

describe("pwa precache contract",()=>{
	it("includes the core app shell, offline fallback, and every tool page without duplicates",()=>{
		const paths=buildPrecachePaths(tools);
		for(const path of ["/","/dashboard","/favorites","/recent","/recipes","/tools",PWA_OFFLINE_PATH])expect(paths).toContain(path);
		for(const tool of tools)expect(paths).toContain(`/tools/${tool.slug}`);
		expect(new Set(paths).size).toBe(paths.length);
	});

	it("keeps public/sw.js in sync with the precache contract and cache version",()=>{
		for(const path of buildPrecachePaths(tools))expect(swSource).toContain(`"${path}"`);
		expect(swSource).toContain(`"${PWA_CACHE_NAME}"`);
		expect(swSource).toContain(`"${PWA_OFFLINE_PATH}"`);
	});

	it("never precaches an unknown tool route",()=>{
		const knownSlugs=new Set(tools.map(tool=>tool.slug));
		const precachedSlugs=[...swSource.matchAll(/"\/tools\/([a-z0-9-]+)"/g)].map(match=>match[1]??"");
		expect(precachedSlugs.length).toBeGreaterThan(0);
		for(const slug of precachedSlugs)expect(knownSlugs.has(slug)).toBe(true);
	});

	it("keeps payload storage out of the service worker",()=>{
		expect(swSource).not.toContain("localStorage");
		expect(swSource).not.toContain("indexedDB");
	});
});

describe("manifest",()=>{
	it("declares an installable standalone app with any-purpose and maskable icons",()=>{
		const result=manifest();
		expect(result.display).toBe("standalone");
		expect(result.start_url).toBe("/dashboard");
		expect(result.scope).toBe("/");
		expect(result.icons?.some(icon=>icon.purpose==="any")).toBe(true);
		expect(result.icons?.some(icon=>icon.purpose==="maskable")).toBe(true);
	});
});
