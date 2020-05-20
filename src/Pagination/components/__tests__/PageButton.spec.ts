import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");
import * as classNames from "classnames";

import { PageButton, PageButtonProps } from "../PageButton";

configure({ adapter: new Adapter() });

describe("PageButton", () => {

    describe("when show icon is default", () => {

        it("renders first button structure correctly", () => {
            const cssClass = "btn mx-button mx-name-paging-first";
            const iconClass = "glyphicon glyphicon-step-backward";
            const title = "Go to first page";

            const pageButton = shallow(createElement(PageButton, {
                buttonType: "firstButton",
                showIcon: "default"
            }));

            expect(pageButton).toBeElement(
                createElement("button", {
                        className: classNames(cssClass, { disabled: false }),
                        title
                    },
                    createElement("span", { className: iconClass })
                )
            );
        });

        it("renders previous button structure correctly", () => {
            const cssClass = "btn mx-button mx-name-paging-previous";
            const iconClass = "glyphicon glyphicon-backward";
            const title = "Go to previous page";

            const pageButton = shallow(createElement(PageButton, {
                buttonType: "previousButton",
                showIcon: "default"
            }));

            expect(pageButton).toBeElement(
                createElement("button", {
                        className: classNames(cssClass, { disabled: false }),
                        title
                    },
                    createElement("span", { className: iconClass })
                )
            );
        });

        it("renders next button structure correctly", () => {
            const cssClass = "btn mx-button mx-name-paging-next";
            const iconClass = "glyphicon glyphicon-forward";
            const title = "Go to next page";

            const pageButton = shallow(createElement(PageButton, {
                buttonType: "nextButton",
                showIcon: "default"
            }));

            expect(pageButton).toBeElement(
                createElement("button", {
                        className: classNames(cssClass, { disabled: false }),
                        title
                    },
                    createElement("span", { className: iconClass })
                )
            );
        });

        it("renders last button structure correctly", () => {
            const cssClass = "btn mx-button mx-name-paging-last";
            const iconClass = "glyphicon glyphicon-step-forward";
            const title = "Go to last page";

            const pageButton = shallow(createElement(PageButton, {
                buttonType: "lastButton",
                showIcon: "default"
            }));

            expect(pageButton).toBeElement(
                createElement("button", {
                        className: classNames(cssClass, { disabled: false }),
                        title
                    },
                    createElement("span", { className: iconClass })
                )
            );
        });

        describe("and button caption is specified", () => {

            it("renders first button structure correctly", () => {
                const cssClass = "btn mx-button mx-name-paging-first";
                const iconClass = "glyphicon glyphicon-step-backward";
                const buttonCaption = "first";

                const pageButton = shallow(createElement(PageButton, {
                    buttonCaption,
                    buttonType: "firstButton",
                    showIcon: "default"
                }));

                expect(pageButton).toBeElement(
                    createElement("button", {
                            className: classNames(cssClass, { disabled: false }),
                            title: buttonCaption
                        },
                        createElement("span", { className: iconClass }),
                        createElement("span", { className: "firstButton" },
                            buttonCaption
                        )
                    )
                );
            });

            it("renders last button structure correctly", () => {
                const cssClass = "btn mx-button mx-name-paging-last";
                const iconClass = "glyphicon glyphicon-step-forward";
                const buttonCaption = "last";

                const pageButton = shallow(createElement(PageButton, {
                    buttonCaption,
                    buttonType: "lastButton",
                    showIcon: "default"
                }));

                expect(pageButton).toBeElement(
                    createElement("button", {
                            className: classNames(cssClass, { disabled: false }),
                            title: buttonCaption
                        },
                        createElement("span", { className: "lastButton" },
                            buttonCaption
                        ),
                        createElement("span", { className: iconClass })
                    )
                );
            });
        });
    });

    describe("when show icon is none", () => {

        it("with button caption renders button structure correctly", () => {
            const buttonCaption = "first";

            const pageButton = shallow(createElement(PageButton, {
                buttonCaption,
                showIcon: "none"
            }));

            expect(pageButton).toBeElement(
                createElement(
                    "button",
                    { className: classNames(""), title: buttonCaption },
                    createElement(
                        "span",
                        { className: classNames("") },
                        buttonCaption
                    )
                )
            );
        });

        it("without button caption does not render structure", () => {
            const buttonCaption = "";

            const pageButton = shallow(createElement(PageButton, {
                buttonCaption,
                buttonType: "firstButton",
                showIcon: "none"
            }));

            expect(pageButton).toBeElement("");
        });
    });

    it("enabled responds when clicked", () => {
        const pageButtonProps: PageButtonProps = {
            buttonType: "firstButton",
            onClickAction: jasmine.createSpy("onClick"),
            showIcon: "default"
        };

        const pageButton = shallow(createElement(PageButton, pageButtonProps));
        pageButton.simulate("click");

        expect(pageButtonProps.onClickAction).toHaveBeenCalled();
    });

    it("when disabled does not responds when clicked", () => {
        const pageButtonProps: PageButtonProps = {
            buttonType: "firstButton",
            isDisabled: true,
            onClickAction: jasmine.createSpy("onClick"),
            showIcon: "default"
        };

        const pageButton = shallow(createElement(PageButton, pageButtonProps));
        pageButton.simulate("click");

        expect(pageButtonProps.onClickAction).not.toHaveBeenCalled();
    });
});
