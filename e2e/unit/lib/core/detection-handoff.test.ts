import {beforeEach,describe,expect,it} from "vitest";
import {clearDetectionHandoff,consumeDetectionHandoff,setDetectionHandoff} from "@/lib/detection-handoff";

describe("detection handoff",()=>{
	beforeEach(()=>clearDetectionHandoff());

	it("hands a sample to the matching tool exactly once",()=>{
		setDetectionHandoff("json-formatter",'{"ready":true}');
		expect(consumeDetectionHandoff("json-formatter")).toBe('{"ready":true}');
		expect(consumeDetectionHandoff("json-formatter")).toBeNull();
	});

	it("does not hand a sample to a different tool",()=>{
		setDetectionHandoff("json-formatter",'{"ready":true}');
		expect(consumeDetectionHandoff("base64")).toBeNull();
		expect(consumeDetectionHandoff("json-formatter")).toBe('{"ready":true}');
	});

	it("ignores empty samples and supports clearing",()=>{
		setDetectionHandoff("json-formatter","");
		expect(consumeDetectionHandoff("json-formatter")).toBeNull();
		setDetectionHandoff("json-formatter",'{"ready":true}');
		clearDetectionHandoff();
		expect(consumeDetectionHandoff("json-formatter")).toBeNull();
	});
});
