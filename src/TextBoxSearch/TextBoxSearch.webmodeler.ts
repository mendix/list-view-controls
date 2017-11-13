import { Component, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";
import { Alert } from "./components/Alert";

import { TextBoxSearch } from "./components/TextBoxSearch";
import { ContainerProps, ContainerState } from "./components/TextBoxSearchContainer";
import { Utils, parseStyle } from "./utils/ContainerUtils";

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, ContainerState> {

    constructor(props: ContainerProps) {
        super(props);
    }

    render() {
        return createElement("div", {
                className: classNames("widget-text-box-search", this.props.class),
                style: parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-text-box-search-alert",
                message: this.state.alertMessage
            }),
            createElement(TextBoxSearch, {
                defaultQuery: "",
                onTextChange: () => { return; },
                placeholder: "Search"
            })
        );
    }

    componentDidMount() {
        this.validateConfigs();
    }

    componentWillReceiveProps(_newProps: ContainerProps) {
        this.validateConfigs();
    }

    private validateConfigs() {
        const routeNode = findDOMNode(this) as HTMLElement;
        const targetNode = Utils.findTargetNode(routeNode);

        if (targetNode) {
            const alertMessage = Utils.validateProps({
                ...this.props as ContainerProps
            });

            this.setState({ alertMessage, targetNode });
        }
    }
}

export function getPreviewCss() {
    return require("./components/ui/TextBoxSearch.scss");
}
