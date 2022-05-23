import { render } from "@testing-library/react";
import { PlayerControls } from ".";

describe("Player", () => {
	it("should render successfully", () => {
		const { baseElement } = render(<PlayerControls player={null} />);
		expect(baseElement).toBeTruthy();
	});
});
