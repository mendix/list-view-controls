import { ReactNode, SFC, createElement } from "react";

import { BreakView } from "./BreakView";
import { PageNumberButton } from "./PageNumberButton";

export interface PageNumberViewProps {
    maxPageButtons: number;
    pageCount: number;
    selectedPageNumber: number;
    onClickAction: (pageNumber: number) => void;
}

export const PageNumberView: SFC<PageNumberViewProps> = (props) => {
    const pageItems: ReactNode[] = [];
    const { selectedPageNumber, onClickAction } = props;
    if (props.pageCount <= props.maxPageButtons) {
        for (let pageNumber = 1; pageNumber <= props.pageCount; pageNumber++) {
            pageItems.push(PageNumberButton({ pageNumber, selectedPageNumber, onClickAction }));
        }
    } else {
        const leftBreakpoint = Math.ceil(props.maxPageButtons / 2);
        const rightBreakpoint = Math.floor(props.maxPageButtons / 2);
        const hasLeftDivider = props.selectedPageNumber > leftBreakpoint;
        const hasRightDivider = props.selectedPageNumber < (props.pageCount - rightBreakpoint);
        let leftButtonNumber = 1;
        let rightButtonNumber = 1;
        if (!hasLeftDivider && hasRightDivider) {
            // [first] [left] _ _ _ [right] [...] [last]
            leftButtonNumber = 1 + 1; // first
            rightButtonNumber = props.maxPageButtons - 2; // divider, last
        } else if (hasLeftDivider && hasRightDivider) {
            // [first] [...] [left] _ _ _ [right] [...] [last]
            const leftOfSelected = Math.floor((props.maxPageButtons - 4) / 2); // first, divider, divider, last
            const rightOfSelected = Math.ceil((props.maxPageButtons - 4) / 2) - 1; // first, divider, divider, last, selected
            leftButtonNumber = props.selectedPageNumber - leftOfSelected;
            rightButtonNumber = props.selectedPageNumber + rightOfSelected;
        } else if (hasLeftDivider && !hasRightDivider) {
            // [first] [...] [left] _ _ _ [right] [last]
            leftButtonNumber = props.pageCount - (props.maxPageButtons - 3) ; // first, divider, last
            rightButtonNumber = props.pageCount - 1; // last
        }
        // Add first page button
        pageItems.push(PageNumberButton({ pageNumber: 1, selectedPageNumber, onClickAction }));
        if (hasLeftDivider) {
            pageItems.push(createElement(BreakView, {}));
        }
        // Add middle page buttons
        for (let pageNumber = leftButtonNumber; pageNumber <= rightButtonNumber; pageNumber++) {
            pageItems.push(PageNumberButton({ pageNumber, selectedPageNumber, onClickAction }));
        }
        if (hasRightDivider) {
            pageItems.push(createElement(BreakView, {}));
        }
        // Add last page button
        pageItems.push(PageNumberButton({ pageNumber: props.pageCount, selectedPageNumber, onClickAction }));
    }

    return createElement("ul", {}, pageItems);
};
