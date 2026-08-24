import {describe,expect,it} from "vitest";
import {recommendNextActions,TOOL_PAIRINGS} from "@/lib/next-actions";
import {tools} from "@/lib/tools";
const registry=tools.map(({slug,name,featured})=>({slug,name,featured}));
describe("recommendNextActions",()=>{
	it("recommends curated pairings for the current tool first",()=>{
		const result=recommendNextActions({tools:registry,currentSlug:"jwt-decoder"});
		expect(result.map(item=>item.slug)).toEqual(["base64","json-formatter","hash-generator"]);
		expect(result[0].source).toBe("pairing");
		expect(result[0].reason).toBe("Pairs well with JWT Decoder.");
	});
	it("never recommends the current tool itself",()=>{
		for(const tool of registry){
			const result=recommendNextActions({tools:registry,currentSlug:tool.slug,favorites:[tool.slug],recentSlugs:[tool.slug]});
			expect(result.map(item=>item.slug)).not.toContain(tool.slug);
		}
	});
	it("uses recent activity when there is no current tool",()=>{
		const result=recommendNextActions({tools:registry,recentSlugs:["cron-parser"]});
		expect(result.map(item=>item.slug)).toEqual(TOOL_PAIRINGS["cron-parser"].slice(0,3));
		expect(result[0].source).toBe("recent");
		expect(result[0].reason).toBe("Follows your recent Cron Parser activity.");
	});
	it("fills remaining slots with favorites without duplicates",()=>{
		const result=recommendNextActions({tools:registry,currentSlug:"jwt-decoder",favorites:["base64","cron-parser"],limit:4});
		expect(result.map(item=>item.slug)).toEqual(["base64","json-formatter","hash-generator","cron-parser"]);
		expect(result[3].source).toBe("favorite");
	});
	it("falls back to featured registry order without local signals",()=>{
		const result=recommendNextActions({tools:registry});
		expect(result.map(item=>item.slug)).toEqual(["json-formatter","base64","jwt-decoder"]);
		expect(result.every(item=>item.source==="featured")).toBe(true);
	});
	it("ignores unknown slugs from every signal",()=>{
		const result=recommendNextActions({tools:registry,currentSlug:"nope",recentSlugs:["bogus"],favorites:["missing"]});
		expect(result.map(item=>item.slug)).toEqual(["json-formatter","base64","jwt-decoder"]);
	});
	it("bounds the limit",()=>{
		expect(recommendNextActions({tools:registry,limit:0})).toEqual([]);
		expect(recommendNextActions({tools:registry,limit:-5})).toEqual([]);
		expect(recommendNextActions({tools:registry,limit:100})).toHaveLength(6);
	});
	it("only maps known registry slugs in pairings",()=>{
		const known=new Set(registry.map(tool=>tool.slug));
		for(const [slug,related] of Object.entries(TOOL_PAIRINGS)){
			expect(known.has(slug)).toBe(true);
			for(const item of related){
				expect(known.has(item)).toBe(true);
				expect(item).not.toBe(slug);
			}
		}
	});
});
