import { createElement } from "react";
import { shallow } from "enzyme";

import { BreakView } from "../BreakView";

describe("BreakView", () => {

    it("renders the structure correctly", () => {
        const breakView = shallow(createElement(BreakView, {}));

        expect(breakView).toBeElement(
            createElement("li", { className: "break-view" },
                "..."
            )
        );
    });
});
