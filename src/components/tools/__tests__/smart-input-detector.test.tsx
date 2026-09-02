import {fireEvent,render,screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach,describe,expect,it,vi} from "vitest";
import {SmartInputDetector} from "@/components/tools/smart-input-detector";
import {DETECTION_INPUT_LIMIT} from "@/lib/detection";
import {clearDetectionHandoff,consumeDetectionHandoff} from "@/lib/detection-handoff";

const {push}=vi.hoisted(()=>({push:vi.fn()}));
vi.mock("next/navigation",()=>({useRouter:()=>({push})}));

describe("SmartInputDetector",()=>{
	beforeEach(()=>{push.mockClear();clearDetectionHandoff()});

	it("suggests a matching local tool and clears input back to the textarea",async()=>{
		const user=userEvent.setup();
		render(<SmartInputDetector/>);
		const input=screen.getByRole("textbox",{name:"Input to detect"});
		fireEvent.change(input,{target:{value:'{"ready":true}'}});
		expect(screen.getByRole("link",{name:/JSON Formatter/})).toHaveAttribute("href","/tools/json-formatter");
		expect(screen.getByText("100%")).toBeInTheDocument();
		await user.click(screen.getByRole("button",{name:"Clear detected input"}));
		expect(input).toHaveValue("");
		expect(input).toHaveFocus();
		expect(screen.getByText(/Nothing is stored or sent/)).toBeInTheDocument();
	});

	it("shows a safe no-match state",()=>{
		render(<SmartInputDetector/>);
		fireEvent.change(screen.getByRole("textbox",{name:"Input to detect"}),{target:{value:"ordinary words"}});
		expect(screen.getAllByText(/No confident match/).length).toBeGreaterThan(0);
	});

	it("clears with Escape and keeps focus in the textarea",()=>{
		render(<SmartInputDetector/>);
		const input=screen.getByRole("textbox",{name:"Input to detect"});
		fireEvent.change(input,{target:{value:"0 9 * * 1"}});
		fireEvent.keyDown(input,{key:"Escape"});
		expect(input).toHaveValue("");
		expect(input).toHaveFocus();
	});

	it("focuses the textarea with the slash shortcut",()=>{
		render(<SmartInputDetector/>);
		fireEvent.keyDown(window,{key:"/"});
		expect(screen.getByRole("textbox",{name:"Input to detect"})).toHaveFocus();
	});

	it("fills the textarea from an example chip",async()=>{
		const user=userEvent.setup();
		render(<SmartInputDetector/>);
		await user.click(screen.getByRole("button",{name:"JSON"}));
		expect(screen.getByRole("link",{name:/JSON Formatter/})).toBeInTheDocument();
	});

	it("opens the top match with Ctrl+Enter and hands off the sample",()=>{
		render(<SmartInputDetector/>);
		const input=screen.getByRole("textbox",{name:"Input to detect"});
		fireEvent.change(input,{target:{value:'{"ready":true}'}});
		fireEvent.keyDown(input,{key:"Enter",ctrlKey:true});
		expect(push).toHaveBeenCalledWith("/tools/json-formatter");
		expect(consumeDetectionHandoff("json-formatter")).toBe('{"ready":true}');
	});

	it("hands off the sample when a suggestion is clicked",async()=>{
		const user=userEvent.setup();
		render(<SmartInputDetector/>);
		fireEvent.change(screen.getByRole("textbox",{name:"Input to detect"}),{target:{value:"0 9 * * 1"}});
		await user.click(screen.getByRole("link",{name:/Cron Parser/}));
		expect(consumeDetectionHandoff("cron-parser")).toBe("0 9 * * 1");
	});

	it("warns when oversized input is trimmed",()=>{
		render(<SmartInputDetector/>);
		const input=screen.getByRole("textbox",{name:"Input to detect"});
		fireEvent.change(input,{target:{value:"a".repeat(DETECTION_INPUT_LIMIT+10)}});
		expect(input).toHaveValue("a".repeat(DETECTION_INPUT_LIMIT));
		expect(screen.getByText(/trimmed to/)).toBeInTheDocument();
	});
});
