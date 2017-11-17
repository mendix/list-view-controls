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
                    getDefaultPageNumberView(6, defaultPageNumberViewProps),
                    createElement(BreakView, {}),
                    getDefaultPageNumberView(10, defaultPageNumberViewProps)
                )
            );
        });

        it("all buttons when page count is less than maximum number of page buttons ", () => {
            const pageNumberView = shallowRenderPageNumberView({ ...defaultPageNumberViewProps, pageCount: 0 });

            expect(pageNumberView).toBeElement(
                createElement("ul", {},
                    getDefaultPageNumberView(1, defaultPageNumberViewProps),
                    getDefaultPageNumberView(2, defaultPageNumberViewProps),
                    getDefaultPageNumberView(3, defaultPageNumberViewProps),
                    getDefaultPageNumberView(4, defaultPageNumberViewProps),
                    getDefaultPageNumberView(5, defaultPageNumberViewProps),
                    getDefaultPageNumberView(6, defaultPageNumberViewProps),
                    getDefaultPageNumberView(7, defaultPageNumberViewProps)
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
                    createElement(BreakView, {}),
                    getDefaultPageNumberView(4, pageNumberViewProps),
                    getDefaultPageNumberView(5, pageNumberViewProps),
                    getDefaultPageNumberView(6, pageNumberViewProps),
                    getDefaultPageNumberView(7, pageNumberViewProps),
                    createElement(BreakView, {}),
                    getDefaultPageNumberView(10, pageNumberViewProps)
                )
            );
        });
    });

    describe("on navigation", () => {
        it("when custom page button 6 is clicked, set page to 6", () => {
            const pageNumberViewProps = {
                ...defaultPageNumberViewProps,
                onClickAction: jasmine.createSpy("onClick")
            };

            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);
            const pageNumberButton = pageNumberView.find("li").at(5);
            pageNumberButton.simulate("click");

            expect(pageNumberViewProps.onClickAction).toHaveBeenCalled();
            expect(pageNumberButton.hasClass("active"));
        });

        it("when a high custom page button 9 is clicked, remove last break view", () => {
            const pageNumberViewProps: PageNumberViewProps = {
                ...defaultPageNumberViewProps,
                onClickAction: jasmine.createSpy("onClick"),
                selectedPageNumber: 7
            };

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
        onClickAction: jasmine.any(Function),
        pageCount: 10,
        selectedPageNumber: 1
    };

    const getDefaultPageNumberView = (pageNumber: number, props: PageNumberViewProps) =>
        createElement("li", {
                className: classNames(
                    props.selectedPageNumber === pageNumber ? "active" : "",
                    pageNumber < 10 ? "single-digit" : ""
                ),
                onClick: jasmine.any(Function)
            },
            pageNumber
        );
});
