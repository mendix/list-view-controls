import { Component, createElement } from "react";

import { Alert } from "../Shared/components/Alert";
import { SharedUtils } from "../Shared/SharedUtils";
import { Validate } from "./Validate";

import { DropDown } from "./components/DropDownSort";
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
                sortAttributes: this.props.sortAttributes,
                style: SharedUtils.parseStyle(this.props.style)
            })
        );
    }

    private renderAlert() {
        const message = Validate.validateProps({
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
