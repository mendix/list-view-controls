import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");
import * as classNames from "classnames";

import { PageNumberView, PageNumberViewProps } from "../PageNumberView";
import { BreakView } from "../BreakView";

configure({ adapter: new Adapter() });

describe("PageNumberView", () => {

    describe("render", () => {

        it("the entire structure when the page count is less then maximum number of buttons ", () => {
            const pageNumberView = shallowRenderPageNumberView(defaultPageNumberViewProps);

            expect(pageNumberView).toBeElement(
                createElement("ul", {},
                    getDefaultPageNumberView(1, defaultPageNumberViewProps),
                    getDefaultPageNumberView(2, defaultPageNumberViewProps),
                    getDefaultPageNumberView(3, defaultPageNumberViewProps),
                    getDefaultPageNumberView(4, defaultPageNumberViewProps),
                    getDefaultPageNumberView(5, defaultPageNumberViewProps),
                    createElement(BreakView, { key: "break" }),
                    getDefaultPageNumberView(10, defaultPageNumberViewProps)
                )
            );
        });

        it("all buttons when page count is less than maximum number of page buttons ", () => {
            const pageNumberViewProps = { ...defaultPageNumberViewProps, pageCount: 2 };
            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);

            expect(pageNumberView).toBeElement(
                createElement("ul", {},
                    getDefaultPageNumberView(1, pageNumberViewProps),
                    getDefaultPageNumberView(2, pageNumberViewProps)
                )
            );
        });

        it("structure with two break views when page number is more than maximum number of page buttons", () => {
            const pageNumberViewProps: PageNumberViewProps = {
                ...defaultPageNumberViewProps,
                selectedPageNumber: 5
            };

            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);

            expect(pageNumberView).toBeElement(
                createElement("ul", {},
                    getDefaultPageNumberView(1, pageNumberViewProps),
                    createElement(BreakView, { key: "breakLeft" }),
                    getDefaultPageNumberView(4, pageNumberViewProps),
                    getDefaultPageNumberView(5, pageNumberViewProps),
                    getDefaultPageNumberView(6, pageNumberViewProps),
                    createElement(BreakView, { key: "breakRight" }),
                    getDefaultPageNumberView(10, pageNumberViewProps)
                )
            );
        });
    });

    describe("on navigation", () => {
        let pageNumberViewProps: PageNumberViewProps;

        beforeEach(() => {
            pageNumberViewProps = {
                ...defaultPageNumberViewProps,
                onClickAction: jasmine.createSpy("onClick")
            };
        });

        it("when custom page button 6 is clicked, set page to 6", () => {
            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);
            const pageNumberButton = pageNumberView.find("li").at(5);
            pageNumberButton.simulate("click");

            expect(pageNumberViewProps.onClickAction).toHaveBeenCalled();
            expect(pageNumberButton.hasClass("active"));
        });

        it("when custom page button 6 has focus and enter is pressed, set page to 6", () => {
            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);
            const pageNumberButton = pageNumberView.find("li").at(5);
            pageNumberButton.simulate("keydown", { key: "Enter" });

            expect(pageNumberViewProps.onClickAction).toHaveBeenCalled();
            expect(pageNumberButton.hasClass("active"));
        });

        it("when custom page button 6 has focus and space is pressed, set page to 6", () => {
            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);
            const pageNumberButton = pageNumberView.find("li").at(5);
            const preventDefaultMock = jasmine.createSpy();
            pageNumberButton.simulate("keyup", { key: " ", preventDefault: preventDefaultMock });

            expect(pageNumberViewProps.onClickAction).toHaveBeenCalled();
            expect(preventDefaultMock).toHaveBeenCalled();
            expect(pageNumberButton.hasClass("active"));
        });

        it("when custom page button 6 has focus and h key is pressed, don't set page to 6", () => {
            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);
            const pageNumberButton = pageNumberView.find("li").at(5);
            const preventDefaultMock = jasmine.createSpy();
            pageNumberButton.simulate("keydown", { keyCode: 72, preventDefault: preventDefaultMock });

            expect(pageNumberViewProps.onClickAction).not.toHaveBeenCalled();
            expect(preventDefaultMock).not.toHaveBeenCalled();
            expect(pageNumberButton.hasClass("active")).toBe(false);
        });

        it("when a high custom page button 9 is clicked, remove last break view", () => {
            pageNumberViewProps.selectedPageNumber = 7;

            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);
            const pageNumberButton = pageNumberView.find("li").at(5);
            pageNumberButton.simulate("click");
            const breakViews = pageNumberView.find(BreakView);

            expect(breakViews.length).toBe(1);
        });
    });

    const shallowRenderPageNumberView = (props: PageNumberViewProps) => shallow(createElement(PageNumberView, props));
    const defaultPageNumberViewProps: PageNumberViewProps = {
        maxPageButtons: 7,
        onClickAction: () => { /* */ },
        pageCount: 10,
        selectedPageNumber: 1,
        key: "key"
    };

    const getDefaultPageNumberView = (pageNumber: number, props: PageNumberViewProps) =>
        createElement("li", {
                className: classNames(
                    props.selectedPageNumber === pageNumber ? "active" : ""
                ),
                role: "button",
                onClick: jasmine.any(Function),
                onKeyDown: jasmine.any(Function),
                onKeyUp: jasmine.any(Function),
                key: `page${pageNumber}`,
                tabindex: 0,
                title:
                    props.selectedPageNumber === pageNumber
                        ? `Currently showing page ${pageNumber} of ${props.pageCount}`
                        : `Go to page ${pageNumber}`
            },
            pageNumber
        );
});
