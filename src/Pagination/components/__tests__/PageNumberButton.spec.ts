import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");
import * as classNames from "classnames";

import { PageNumberButton, PageNumberButtonProps } from "../PageNumberButton";

configure({ adapter: new Adapter() });

describe("PageNumberButton", () => {
    let defaultPageNumberButtonProps: PageNumberButtonProps & {
        key?: string | number;
    };

    beforeEach(() => {
        defaultPageNumberButtonProps = {
            pageNumber: 1,
            totalPages: 5,
            selectedPageNumber: 2,
            onClickAction: jasmine.createSpy(),
            key: "page1"
        };
    });

    it("renders correctly", () => {
        const pageNumberButton = shallow(createElement(PageNumberButton, defaultPageNumberButtonProps));

        expect(pageNumberButton).toBeElement(createExpectedPageNumberButtonElement(defaultPageNumberButtonProps));
    });

    it("executes onClickAction when clicked", () => {
        const pageNumberButton = shallow(createElement(PageNumberButton, defaultPageNumberButtonProps));

        pageNumberButton.simulate("click");
        expect(defaultPageNumberButtonProps.onClickAction).toHaveBeenCalled();
        expect(pageNumberButton.hasClass("active"));
    });

    it("executes onClickAction when it has focus and enter key is down", () => {
        const pageNumberButton = shallow(createElement(PageNumberButton, defaultPageNumberButtonProps));

        const preventDefaultMock = jasmine.createSpy();
        pageNumberButton.simulate("keydown", { key: "Enter", preventDefault: preventDefaultMock });

        expect(preventDefaultMock).toHaveBeenCalled();
        expect(defaultPageNumberButtonProps.onClickAction).toHaveBeenCalled();
        expect(pageNumberButton.hasClass("active"));
    });

    it("executes onClickAction when it has focus and space key is down", () => {
        const pageNumberButton = shallow(createElement(PageNumberButton, defaultPageNumberButtonProps));
        const preventDefaultMock = jasmine.createSpy();
        pageNumberButton.simulate("keydown", { key: " ", preventDefault: preventDefaultMock });

        expect(preventDefaultMock).toHaveBeenCalled();
        expect(defaultPageNumberButtonProps.onClickAction).toHaveBeenCalled();
        expect(pageNumberButton.hasClass("active"));
    });

    it("doesn't execute onClickAction when it has focus and another key is pressed", () => {
        const pageNumberButton = shallow(createElement(PageNumberButton, defaultPageNumberButtonProps));

        pageNumberButton.simulate("keydown", { key: "h" });

        expect(defaultPageNumberButtonProps.onClickAction).not.toHaveBeenCalled();
        expect(pageNumberButton.hasClass("active"));
    });

    function createExpectedPageNumberButtonElement(props: PageNumberButtonProps) {
        const { pageNumber, totalPages, selectedPageNumber } = props;

        return createElement(
            "li",
            {
                className: classNames(selectedPageNumber === pageNumber ? "active" : ""),
                role: "button",
                onClick: jasmine.any(Function),
                onKeyDown: jasmine.any(Function),
                key: `page${pageNumber}`,
                tabindex: 0,
                title:
                    selectedPageNumber === pageNumber
                        ? `Currently showing page ${pageNumber} of ${totalPages}`
                        : `Go to page ${pageNumber}`
            },
            pageNumber
        );
    }
});
