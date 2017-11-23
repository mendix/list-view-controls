import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { BreakView } from "../BreakView";

configure({ adapter: new Adapter() });

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
