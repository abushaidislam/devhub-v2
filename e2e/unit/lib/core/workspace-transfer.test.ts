import {describe,expect,it} from "vitest";
import {buildWorkspaceExport,parseWorkspaceImport,serializeWorkspaceExport,WORKSPACE_IMPORT_LIMIT,WORKSPACE_VERSION} from "@/lib/workspace-transfer";
const known=["json-formatter","base64","cron-parser"];
describe("workspace transfer",()=>{
	it("round-trips favorites through export and import",()=>{
		const raw=serializeWorkspaceExport(buildWorkspaceExport(["json-formatter","cron-parser"],known));
		const result=parseWorkspaceImport(raw,known);
		expect(result.favorites).toEqual(["json-formatter","cron-parser"]);
		expect(result.skipped).toBe(0);
	});
	it("marks exports as containing no user inputs",()=>{
		const data=buildWorkspaceExport(["json-formatter"],known);
		expect(data.containsUserInputs).toBe(false);
		expect(data.format).toBe("devhub-workspace");
		expect(data.version).toBe(WORKSPACE_VERSION);
	});
	it("drops unknown and duplicate slugs on export",()=>{
		const data=buildWorkspaceExport(["json-formatter","not-a-tool","json-formatter"],known);
		expect(data.favorites).toEqual(["json-formatter"]);
	});
	it("skips unknown or malformed entries and dedupes on import",()=>{
		const raw=JSON.stringify({format:"devhub-workspace",version:1,favorites:["base64","base64","bogus",7]});
		const result=parseWorkspaceImport(raw,known);
		expect(result.favorites).toEqual(["base64"]);
		expect(result.skipped).toBe(2);
	});
	it("rejects invalid JSON",()=>{
		expect(()=>parseWorkspaceImport("not json",known)).toThrow(/valid JSON/);
	});
	it("rejects other file formats",()=>{
		expect(()=>parseWorkspaceImport(JSON.stringify({format:"other",version:1,favorites:[]}),known)).toThrow(/not a DevHub workspace export/);
	});
	it("rejects unsupported schema versions",()=>{
		expect(()=>parseWorkspaceImport(JSON.stringify({format:"devhub-workspace",version:2,favorites:[]}),known)).toThrow(/version/);
	});
	it("rejects payloads missing a favorites list",()=>{
		expect(()=>parseWorkspaceImport(JSON.stringify({format:"devhub-workspace",version:1}),known)).toThrow(/favorites list/);
	});
	it("rejects oversized payloads before parsing",()=>{
		expect(()=>parseWorkspaceImport("a".repeat(WORKSPACE_IMPORT_LIMIT+1),known)).toThrow(/too large/);
	});
});
