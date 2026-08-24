import {render,screen} from "@testing-library/react";
import {beforeEach,describe,expect,it} from "vitest";
import {ToolRuntime} from "@/components/tool-runtime";
import {clearDetectionHandoff,setDetectionHandoff} from "@/lib/detection-handoff";

describe("ToolRuntime detection handoff",()=>{
	beforeEach(()=>clearDetectionHandoff());

	it("prefills the input with a handed-off detector sample",()=>{
		setDetectionHandoff("json-formatter",'{"ready":true}');
		render(<ToolRuntime slug="json-formatter" name="JSON Formatter"/>);
		expect(screen.getByRole("textbox",{name:"JSON Formatter input"})).toHaveValue('{"ready":true}');
		expect(screen.getByText("Detected input loaded")).toBeInTheDocument();
	});

	it("keeps the default sample when no handoff exists",()=>{
		render(<ToolRuntime slug="json-formatter" name="JSON Formatter"/>);
		expect(screen.getByRole("textbox",{name:"JSON Formatter input"})).toHaveValue('{\n  "name": "DevHub",\n  "ready": true\n}');
		expect(screen.getByText("Ready")).toBeInTheDocument();
	});
});
