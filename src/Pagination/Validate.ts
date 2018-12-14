import { ReactChild, createElement } from "react";
import { DataSourceHelperListView } from "../Shared/DataSourceHelper/DataSourceHelper";
import { ModelerProps } from "./Pagination";

type Props = Readonly<{ children?: React.ReactNode; }> & Readonly<ModelerProps>;

export interface ValidateConfigProps extends Props {
    readonly inWebModeler?: boolean;
    readonly targetNode?: HTMLElement | null;
    readonly targetListView?: DataSourceHelperListView | null;
}

export class Validate {

    static validateProps(props: ValidateConfigProps): ReactChild {
        const errorMessages: string[] = [];

        if (props.pagingStyle === "custom") {
            if (props.items.length < 1) {
                errorMessages.push("custom style should have at least one item");
            }
            props.items.forEach((item, index) => {
                const position = index + 1;
                if (item.item === "pageNumberButtons" && (!item.maxPageButtons || item.maxPageButtons < 7)) {
                    errorMessages.push(`Custom item ${position} Number of page buttons should 7 or larger`);
                }
                if (item.item === "text" && !item.text) {
                    errorMessages.push(`Custom item ${position} text requires a 'Text with placeholder'`);
                }
                const isButton = item.item === "firstButton" || item.item === "lastButton" || item.item === "nextButton" || item.item === "previousButton";
                if (isButton && item.showIcon === "none" && !item.buttonCaption) {
                    errorMessages.push(`Custom item ${position} Custom button requires an caption or icon`);
                }
            });
            props.pageSizeOptions.forEach((sizeOption, index) => {
                if (sizeOption.size < 1) {
                    errorMessages.push(`Custom 'Page size' at item ${index + 1} should be larger than 0`);
                }
            });
        }

        if (errorMessages.length) {
            return createElement("div", {},
                "Configuration error in widget:",
                errorMessages.map((message, key) => createElement("p", { key }, message))
            );
        }

        return "";
    }
}
