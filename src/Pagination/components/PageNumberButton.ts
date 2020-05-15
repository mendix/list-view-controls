import { ReactElement, createElement } from "react";
import * as classNames from "classnames";

import { mxTranslation } from "../utils/ContainerUtils";

export interface PageNumberButtonProps {
    pageNumber: number;
    totalPages: number;
    selectedPageNumber: number;
    onClickAction: () => void;
}

export const PageNumberButton = (
    props: PageNumberButtonProps
): ReactElement => {
    const { onClickAction, pageNumber, selectedPageNumber, totalPages } = props;

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
            title:
                selectedPageNumber === pageNumber
                    ? mxTranslation(
                          "mxui.widget.Grid.a11y",
                          "page_status",
                          [],
                          true,
                          `Currently showing page ${pageNumber} of ${totalPages}`
                      )
                    : `Go to page ${pageNumber}`
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
