import { Component, createElement } from "react";
import * as classNames from "classnames";

import { SharedUtils } from "../Shared/SharedUtils";

import { TextBoxSearch } from "./components/TextBoxSearch";
import { ContainerProps } from "./components/TextBoxSearchContainer";

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps> {
    render() {
        return createElement("div", {
                className: classNames("widget-text-box-search", this.props.class),
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(TextBoxSearch, {
                defaultQuery: "",
                onTextChange: () => { return; },
                placeholder: "Search"
            })
        );
    }
}

export function getPreviewCss() {
    return require("./components/ui/TextBoxSearch.scss");
}
