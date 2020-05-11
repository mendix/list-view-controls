import { ReactElement, createElement } from "react";
import * as classNames from "classnames";

import { mxTranslation } from "../utils/ContainerUtils";

interface PageNumberButtonProps {
    pageNumber: number;
    totallPages: number;
    selectedPageNumber: number;
    onClickAction: () => void;
    key?: string | number;
}

export const PageNumberButton = (
    props: PageNumberButtonProps
): ReactElement => {
    const { onClickAction, pageNumber, selectedPageNumber, totallPages } = props;

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
            title:
                selectedPageNumber === pageNumber
                    ? mxTranslation(
                          "mxui.widget.Grid.a11y",
                          "page_status",
                          [],
                          true,
                          `Currently showing page ${pageNumber} of ${totallPages}`
                      )
                    : `Go to page ${pageNumber}`
        },
        pageNumber
    );
};

const onKeyDown = (onClickAction: () => void, e: KeyboardEvent) => {
    if (e.key === "Enter") {
        onClickAction();
    }
};

const onKeyUp = (onClickAction: () => void, e: KeyboardEvent) => {
    if (e.key === " ") {
        e.preventDefault();
        onClickAction();
    }
};

PageNumberButton.displayName = "PageNumberButton";
