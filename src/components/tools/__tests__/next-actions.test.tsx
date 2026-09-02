import {render,screen} from "@testing-library/react";
import {beforeEach,describe,expect,it} from "vitest";
import {NextActions} from "@/components/tools/next-actions";
describe("NextActions",()=>{
	beforeEach(()=>{localStorage.clear()});

	it("recommends pairings for the current tool and never the tool itself",()=>{
		render(<NextActions currentSlug="jwt-decoder"/>);
		expect(screen.getByRole("heading",{name:"Recommended next"})).toBeInTheDocument();
		const links=screen.getAllByRole("link");
		expect(links).toHaveLength(3);
		expect(screen.getByRole("link",{name:/Base64/})).toHaveAttribute("href","/tools/base64");
		expect(screen.getAllByText("Pairs well with JWT Decoder.")).toHaveLength(3);
		for(const link of links)expect(link).not.toHaveAttribute("href","/tools/jwt-decoder");
	});

	it("falls back to featured tools without local signals",()=>{
		render(<NextActions/>);
		expect(screen.getByRole("link",{name:/JSON Formatter/})).toBeInTheDocument();
		expect(screen.getAllByText("Popular in the toolkit.")).toHaveLength(3);
	});

	it("surfaces saved favorites when they are not already recommended",async()=>{
		localStorage.setItem("devhub:favorites",JSON.stringify(["cron-parser"]));
		render(<NextActions/>);
		expect(await screen.findByText("Saved in your favorites.")).toBeInTheDocument();
		expect(screen.getByRole("link",{name:/Cron Parser/})).toHaveAttribute("href","/tools/cron-parser");
	});
});
