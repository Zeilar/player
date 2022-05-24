import { render } from "@testing-library/react";
import { Player } from ".";

describe("Player", () => {
	it("should render successfully", () => {
		const { baseElement } = render(<Player src={{ default: "" }} />);
		expect(baseElement).toBeTruthy();
	});
});
