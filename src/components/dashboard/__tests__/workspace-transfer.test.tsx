import {render,screen,waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach,describe,expect,it,vi} from "vitest";
import {WorkspaceTransfer} from "@/components/dashboard/workspace-transfer";
function workspaceFile(content:string){return new File([content],"devhub-workspace.json",{type:"application/json"})}
describe("WorkspaceTransfer",()=>{
	beforeEach(()=>{localStorage.clear()});

	it("disables export when there are no favorites",()=>{
		render(<WorkspaceTransfer/>);
		expect(screen.getByRole("button",{name:/Export favorites/})).toBeDisabled();
	});

	it("exports favorites as a local JSON download",async()=>{
		localStorage.setItem("devhub:favorites",JSON.stringify(["json-formatter"]));
		const createObjectURL=vi.fn(()=>"blob:devhub");
		const revokeObjectURL=vi.fn();
		Object.defineProperty(URL,"createObjectURL",{configurable:true,value:createObjectURL});
		Object.defineProperty(URL,"revokeObjectURL",{configurable:true,value:revokeObjectURL});
		vi.spyOn(HTMLAnchorElement.prototype,"click").mockImplementation(()=>{});
		const user=userEvent.setup();
		render(<WorkspaceTransfer/>);
		await user.click(screen.getByRole("button",{name:/Export favorites/}));
		expect(createObjectURL).toHaveBeenCalledTimes(1);
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:devhub");
		expect(await screen.findByRole("status")).toHaveTextContent("Exported 1 favorite");
	});

	it("imports a workspace file and merges only new known favorites",async()=>{
		localStorage.setItem("devhub:favorites",JSON.stringify(["base64"]));
		const user=userEvent.setup();
		render(<WorkspaceTransfer/>);
		const file=workspaceFile(JSON.stringify({format:"devhub-workspace",version:1,exportedAt:"2026-01-01T00:00:00.000Z",containsUserInputs:false,favorites:["json-formatter","base64","not-a-tool"]}));
		await user.upload(screen.getByLabelText("Import workspace file"),file);
		expect(await screen.findByRole("status")).toHaveTextContent("Imported 1 new favorite; skipped 1 unknown entry.");
		await waitFor(()=>expect(JSON.parse(localStorage.getItem("devhub:favorites")??"[]")).toEqual(["base64","json-formatter"]));
	});

	it("shows a safe error for an invalid file and keeps favorites unchanged",async()=>{
		localStorage.setItem("devhub:favorites",JSON.stringify(["base64"]));
		const user=userEvent.setup();
		render(<WorkspaceTransfer/>);
		await user.upload(screen.getByLabelText("Import workspace file"),workspaceFile("not json"));
		expect(await screen.findByRole("alert")).toHaveTextContent("Import file is not valid JSON.");
		expect(JSON.parse(localStorage.getItem("devhub:favorites")??"[]")).toEqual(["base64"]);
	});
});
