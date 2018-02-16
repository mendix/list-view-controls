import { Component, createElement } from "react";
import * as classNames from "classnames";

import { SharedUtils } from "../Shared/SharedUtils";

import { HeaderSort, SortOrder } from "./components/HeaderSort";
import { ContainerProps } from "./components/HeaderSortContainer";

declare function require(name: string): string;

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, {}> {
    constructor(props: ContainerProps) {
        super(props);

    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-header-sort", this.props.class),
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(HeaderSort, {
                caption: this.props.caption,
                initialSorted: this.props.initialSorted,
                onClickAction: () => { return; },
                sortAttribute: this.props.sortAttribute,
                sortOrder: this.initialSortOrder(this.props.initialSorted, this.props.sortOrder)
            })
        );
    }

    private initialSortOrder(initialSorted: boolean, sortOrder: SortOrder): SortOrder {
        if (initialSorted) {
            return sortOrder;
        }

        return "";
    }
}

export function getPreviewCss() {
    return require("./ui/HeaderSort.scss");
}
