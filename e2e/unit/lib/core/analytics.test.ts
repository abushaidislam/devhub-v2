import {describe,expect,it} from "vitest";
import {GLOBAL_EVENTS,sanitizeActivationEvent,TOOL_EVENTS,trackActivationEvent,type ActivationEvent} from "@/lib/analytics";
import {tools} from "@/lib/tools";

const slug=tools[0].slug;

describe("sanitizeActivationEvent",()=>{
	it("accepts every allowlisted tool event with a registry slug",()=>{
		for(const name of TOOL_EVENTS){
			expect(sanitizeActivationEvent({name,tool:slug})).toEqual({name,properties:{tool:slug}});
		}
	});
	it("accepts global events and never attaches properties to them",()=>{
		for(const name of GLOBAL_EVENTS){
			expect(sanitizeActivationEvent({name})).toEqual({name});
		}
	});
	it("rejects tool events whose slug is not in the registry",()=>{
		expect(sanitizeActivationEvent({name:"tool_opened",tool:"not-a-tool"})).toBeNull();
		expect(sanitizeActivationEvent({name:"tool_opened",tool:""})).toBeNull();
		expect(sanitizeActivationEvent({name:"tool_opened",tool:123} as unknown as ActivationEvent)).toBeNull();
	});
	it("rejects event names outside the allowlist",()=>{
		expect(sanitizeActivationEvent({name:"pasted_content",tool:slug} as unknown as ActivationEvent)).toBeNull();
		expect(sanitizeActivationEvent({name:""} as unknown as ActivationEvent)).toBeNull();
	});
	it("strips extra fields so payload content cannot leak into events",()=>{
		const result=sanitizeActivationEvent({name:"tool_run_succeeded",tool:slug,input:"secret payload",output:"secret result"} as unknown as ActivationEvent);
		expect(result).not.toBeNull();
		expect(Object.keys(result as object).sort()).toEqual(["name","properties"]);
		expect(Object.keys((result as {properties:Record<string,string>}).properties)).toEqual(["tool"]);
	});
});

describe("trackActivationEvent",()=>{
	it("does not transmit outside production builds",()=>{
		expect(process.env.NODE_ENV).not.toBe("production");
		expect(trackActivationEvent({name:"tool_opened",tool:slug})).toBe(false);
		expect(trackActivationEvent({name:"command_palette_opened"})).toBe(false);
	});
	it("returns false for events the sanitizer rejects",()=>{
		expect(trackActivationEvent({name:"tool_opened",tool:"not-a-tool"})).toBe(false);
	});
});
