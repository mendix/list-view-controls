import { ReactElement, createElement } from "react";
import * as classNames from "classnames";

interface PageNumberButtonProps {
    pageNumber: number;
    selectedPageNumber: number;
    onClickAction: () => void;
    key?: string | number;
}

export const PageNumberButton = (
    props: PageNumberButtonProps
): ReactElement => {
    const { onClickAction, pageNumber, selectedPageNumber } = props;

    return createElement(
        "li",
        {
            className: classNames(
                selectedPageNumber === pageNumber ? "active" : ""
            ),
            role: "button",
            onClick: onClickAction,
            onKeyDown: onKeyDown.bind(null, onClickAction),
            onKeyUp: onKeyUp.bind(null, onClickAction),
            key: props.key,
            tabindex: 0,
            "aria-label":
                selectedPageNumber === pageNumber
                    ? `Current page, page ${pageNumber}`
                    : `Go to page ${pageNumber}`
        },
        pageNumber
    );
};

const onKeyDown = (onClickAction: () => void, e: KeyboardEvent) => {
    // if enter key
    if (e.keyCode === 13) {
        onClickAction();
    }
};

const onKeyUp = (onClickAction: () => void, e: KeyboardEvent) => {
    // if space key
    if (e.keyCode === 32) {
        e.preventDefault();
        onClickAction();
    }
};

PageNumberButton.displayName = "PageNumberButton";
