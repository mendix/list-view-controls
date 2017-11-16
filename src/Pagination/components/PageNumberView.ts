import { ReactElement, SFC, createElement } from "react";
import * as classNames from "classnames";

import { BreakView } from "./BreakView";

export interface PageNumberViewProps {
    maxPageButtons: number;
    pageCount: number;
    selectedPageNumber: number;
    onClickAction: (pageNumber: number) => void;
}

export const PageNumberView: SFC<PageNumberViewProps> = (props) => {
    const pageItems: Array<ReactElement<any>> = [];
    const margin = 1;
    let leftSide;
    let rightSide;
    let breakViewAdded = false;
    const divider = Math.ceil(props.maxPageButtons / 2);

    if (props.pageCount <= props.maxPageButtons) {
        for (let pageIndex = 1; pageIndex <= props.maxPageButtons; pageIndex++) {
            pageItems.push(getPageNumberView(pageIndex, props));
        }
    } else {
        leftSide = divider;
        rightSide = props.maxPageButtons - leftSide;

        if (props.selectedPageNumber > props.pageCount - divider) {
            rightSide = props.pageCount - props.selectedPageNumber;
            leftSide = props.maxPageButtons - rightSide;
        } else if (props.selectedPageNumber < divider) {
            leftSide = props.selectedPageNumber;
            rightSide = props.maxPageButtons - leftSide;
        }

        for (let page = 1; page <= props.pageCount; page++) {
            if (page <= margin) {
                pageItems.push(getPageNumberView(page, props));
                continue;
            }

            if (page === props.pageCount) {
                pageItems.push(getPageNumberView(page, props));
                continue;
            }

            if ((page - 1 > props.selectedPageNumber - leftSide) && (page < props.selectedPageNumber + rightSide)) {
                if (props.selectedPageNumber + rightSide >= props.pageCount) {
                    pageItems.push(getPageNumberView(page, props));
                    continue;
                }
                if (breakViewAdded) {
                    breakViewAdded = false;
                } else {
                    pageItems.push(getPageNumberView(page, props));
                }
                continue;
            }

            // If a page is clicked and on the right side of the pagination there exists a page or pages with value
            // more than max page buttons, Make sure that the second page is a break view
            if (page === 2) {
                pageItems.push(createElement(BreakView, {}));
                breakViewAdded = true;
                continue;
            }

            if (page === props.pageCount - 1) {
                pageItems.push(createElement(BreakView, {}));
            }
        }
    }

    return createElement("ul", {}, pageItems);
};

const getPageNumberView = (pageNumber: number, props: PageNumberViewProps) => {
    return createElement("li", {
            className: classNames(
                props.selectedPageNumber === pageNumber ? "active" : "",
                pageNumber < 10 ? "single-digit" : ""
            ),
            onClick: () => props.onClickAction(pageNumber)
        },
        pageNumber
    );
};

PageNumberView.displayName = "PageNumberView";
