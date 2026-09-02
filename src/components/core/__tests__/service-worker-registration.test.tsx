import {render} from "@testing-library/react";
import {describe,expect,it,vi} from "vitest";
import {ServiceWorkerRegistration} from "@/components/core/service-worker-registration";

describe("ServiceWorkerRegistration",()=>{
	it("renders no UI and never registers outside production builds",()=>{
		const register=vi.fn();
		Object.defineProperty(navigator,"serviceWorker",{configurable:true,value:{register}});
		const {container}=render(<ServiceWorkerRegistration/>);
		expect(container).toBeEmptyDOMElement();
		expect(register).not.toHaveBeenCalled();
	});
});
