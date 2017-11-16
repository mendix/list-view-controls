import { PaginationListView as ListView, WrapperProps } from "./Pagination";

export interface ValidateConfigProps extends WrapperProps {
    inWebModeler?: boolean;
    queryNode?: HTMLElement | null;
    targetListView?: ListView | null;
}

export class Validate {

    static validate(props: ValidateConfigProps): string {
        const errorMessage: string[] = [];
        if (props.pagingStyle === "custom") {
            if (props.items.length < 1) {
                errorMessage.push("custom style should have at least one item");
            }
            props.items.forEach(item => {
                if (item.item === "pageNumberButtons" && item.maxPageButtons < 7) {
                    errorMessage.push("Number of page buttons should 7 or larger");
                }
                if (item.item === "text" && !item.text) {
                    errorMessage.push("Custom item text requires a 'Text with placeholder'");
                }
                const isButton = item.item === "firstButton" || item.item === "lastButton" || item.item === "nextButton" || item.item === "previousButton";
                if (isButton && item.showIcon === "none" && !item.buttonCaption) {
                    errorMessage.push("Custom button requires an caption or icon");
                }
            });
        }
        if (!props.inWebModeler) {
            if (!props.queryNode) {
                errorMessage.push("unable to find a list view on the page");
            }
            if (props.targetListView && !Validate.isCompatible(props.targetListView)) {
                errorMessage.push("this Mendix version is incompatible");
            }
        }
        if (errorMessage.length) {
            return `${props.friendlyId} : ${errorMessage.join(", ")}`;
        }

        return "";
    }

    static isCompatible(targetListView: ListView): boolean {
        return !!(targetListView
            && targetListView._datasource
            && targetListView._datasource.setOffset
            && targetListView._datasource._pageSize !== undefined
            && targetListView._sourceReload
            && targetListView._renderData
            && targetListView._datasource._setSize !== undefined
            && targetListView.update);
    }
}
