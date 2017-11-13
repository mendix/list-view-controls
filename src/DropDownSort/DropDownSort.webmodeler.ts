import { Component, createElement } from "react";

import { Alert } from "./components/Alert";
import { DropDown } from "./components/DropDownSort";
import { Utils, createOptionProps, parseStyle } from "./utils/ContainerUtils";
import { ContainerProps } from "./components/DropDownSortContainer";

declare function require(name: string): string;

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, {}> {
    constructor(props: ContainerProps) {
        super(props);

    }

    render() {
        return createElement("div", { className: "widget-dropdown-sort" },
            this.renderAlert(),
            createElement(DropDown, {
                onDropDownChangeAction: () => { return; },
                options: createOptionProps(this.props.sortAttributes),
                style: parseStyle(this.props.style)
            })
        );
    }

    private renderAlert() {
        const message = Utils.validateProps({
            ...this.props as ContainerProps
        });

        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-drop-down-filter-alert",
            message
        });
    }
}

export function getPreviewCss() {
    return require("./ui/DropDownSort.scss");
}
