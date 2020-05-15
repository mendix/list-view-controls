import { ReactElement, createElement } from "react";
import * as classNames from "classnames";

export interface PageNumberButtonProps {
    pageNumber: number;
    selectedPageNumber: number;
    onClickAction: () => void;
}

export const PageNumberButton = (
    props: PageNumberButtonProps
): ReactElement => {
    const { onClickAction, pageNumber, selectedPageNumber } = props;

    const supportText = selectedPageNumber === pageNumber ? `Go to currently shown page ${pageNumber}` : `Go to page ${pageNumber}`;

    return createElement(
        "li",
        {
            className: classNames(
                selectedPageNumber === pageNumber ? "active" : ""
            ),
            role: "button",
            onClick: onClickAction,
            onKeyDown: onKeyDown.bind(null, onClickAction),
            tabindex: 0,
            title: supportText,
            "aria-label":  supportText
        },
        pageNumber
    );
};

const onKeyDown = (onClickAction: () => void, e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClickAction();
    }
};

PageNumberButton.displayName = "PageNumberButton";
