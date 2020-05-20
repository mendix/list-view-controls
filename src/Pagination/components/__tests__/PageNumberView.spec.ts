import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { PageNumberView, PageNumberViewProps } from "../PageNumberView";
import { BreakView } from "../BreakView";
import { PageNumberButton } from "../PageNumberButton";

configure({ adapter: new Adapter() });

describe("PageNumberView", () => {
    const defaultPageNumberViewProps: PageNumberViewProps & { key?: string | number } = {
        maxPageButtons: 7,
        onClickAction: () => {
            /* */
        },
        pageCount: 10,
        selectedPageNumber: 1,
        key: "key"
    };

    describe("render", () => {
        it("the entire structure when the page count is less then maximum number of buttons ", () => {
            const pageNumberView = shallowRenderPageNumberView(defaultPageNumberViewProps);

            expect(
                pageNumberView.matchesElement(
                    createElement(
                        "ul",
                        {},
                        createExpectedPageNumberButtonElement(1, defaultPageNumberViewProps),
                        createExpectedPageNumberButtonElement(2, defaultPageNumberViewProps),
                        createExpectedPageNumberButtonElement(3, defaultPageNumberViewProps),
                        createExpectedPageNumberButtonElement(4, defaultPageNumberViewProps),
                        createExpectedPageNumberButtonElement(5, defaultPageNumberViewProps),
                        createElement(BreakView),
                        createExpectedPageNumberButtonElement(10, defaultPageNumberViewProps)
                    )
                )
            ).toBe(true);
        });

        it("all buttons when page count is less than maximum number of page buttons ", () => {
            const pageNumberViewProps = { ...defaultPageNumberViewProps, pageCount: 2 };
            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);

            expect(
                pageNumberView.matchesElement(
                    createElement(
                        "ul",
                        {},
                        createExpectedPageNumberButtonElement(1, pageNumberViewProps),
                        createExpectedPageNumberButtonElement(2, pageNumberViewProps)
                    )
                )
            ).toBe(true);
        });

        it("structure with two break views when page number is more than maximum number of page buttons", () => {
            const pageNumberViewProps: PageNumberViewProps = {
                ...defaultPageNumberViewProps,
                selectedPageNumber: 5
            };

            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);

            expect(
                pageNumberView.matchesElement(
                    createElement(
                        "ul",
                        {},
                        createExpectedPageNumberButtonElement(1, pageNumberViewProps),
                        createElement(BreakView),
                        createExpectedPageNumberButtonElement(4, pageNumberViewProps),
                        createExpectedPageNumberButtonElement(5, pageNumberViewProps),
                        createExpectedPageNumberButtonElement(6, pageNumberViewProps),
                        createElement(BreakView),
                        createExpectedPageNumberButtonElement(10, pageNumberViewProps)
                    )
                )
            ).toBe(true);
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

        it("when a high custom page button 9 is clicked, remove last break view", () => {
            pageNumberViewProps.selectedPageNumber = 7;

            const pageNumberView = shallowRenderPageNumberView(pageNumberViewProps);
            const pageNumberButton = pageNumberView.find("PageNumberButton").at(5);
            pageNumberButton.simulate("click");
            const breakViews = pageNumberView.find(BreakView);

            expect(breakViews.length).toBe(1);
        });
    });

    function shallowRenderPageNumberView(props: PageNumberViewProps) {
        return shallow(createElement(PageNumberView, props));
    }

    function createExpectedPageNumberButtonElement(pageNumber: number, props: PageNumberViewProps) {
        const { selectedPageNumber } = props;

        return createElement(PageNumberButton, {
            pageNumber,
            selectedPageNumber
        } as any);
    }
});
