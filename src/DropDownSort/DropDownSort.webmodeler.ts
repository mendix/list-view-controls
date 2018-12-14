import { Component, createElement } from "react";

import { SharedUtils } from "../Shared/SharedUtils";

import { DropDownSort } from "./components/DropDownSort";
import { ContainerProps } from "./components/DropDownSortContainer";

declare function require(name: string): string;

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, {}> {
    constructor(props: ContainerProps) {
        super(props);

    }

    render() {
        return createElement("div", { className: "widget-drop-down-sort" },
            createElement(DropDownSort, {
                onDropDownChangeAction: () => { return; },
                sortAttributes: this.props.sortAttributes,
                style: SharedUtils.parseStyle(this.props.style)
            })
        );
    }
}

export function getPreviewCss() {
    return require("./ui/DropDownSort.scss");
}
