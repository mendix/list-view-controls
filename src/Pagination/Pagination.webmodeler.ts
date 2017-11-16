import { Component, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "../Shared/components/Alert";
import { SharedUtils } from "../Shared/SharedUtils";
import { Validate } from "./Validate";

import { ModelerProps, WrapperProps } from "./Pagination";
import { Pagination } from "./components/Pagination";

interface PaginationWebModelerState {
    findingListViewWidget: boolean;
    hideUnusedPaging: boolean;
    message: string;
}

// tslint:disable-next-line class-name
export class preview extends Component<WrapperProps, PaginationWebModelerState> {

    constructor(props: WrapperProps) {
        super(props);

        this.state = {
            findingListViewWidget: true,
            hideUnusedPaging: this.props.hideUnusedPaging,
            message: ""
        };
    }

    render() {
        return createElement("div", { className: "widget-pagination" },
            createElement(Alert, {
                className: "widget-pagination-alert",
                message: this.state.message
            }),
            createElement(Pagination, {
                getMessageStatus: () => "[2 to 10 of 50]",
                hideUnusedPaging: false,
                items: this.props.items,
                listViewSize: 20,
                offset: 2,
                onClickAction: () => {
                    return;
                },
                pagingStyle: this.props.pagingStyle
            })
        );
    }

    componentDidMount() {
        this.validateConfigs(this.props);
    }

    componentWillReceiveProps(nextProps: WrapperProps) {
        this.validateConfigs(nextProps);
    }

    private validateConfigs(props: WrapperProps) {
        const queryNode = findDOMNode(this) as HTMLElement;
        const targetNode = SharedUtils.findTargetNode(queryNode);
        const message = Validate.validate({
            ...props as WrapperProps,
            inWebModeler: true
        });

        this.hideLoadMoreButton(targetNode);

        this.setState({
            findingListViewWidget: false,
            hideUnusedPaging: props.hideUnusedPaging,
            message
        });
    }

    private hideLoadMoreButton(targetNode: HTMLElement | null) {
        if (targetNode) {
            const buttonNode = targetNode.querySelector(".mx-listview-loadMore") as HTMLButtonElement;

            if (buttonNode) {
                buttonNode.classList.add("widget-pagination-hide-load-more");
            }
        }
    }
}

export function getVisibleProperties(valueMap: ModelerProps, visibilityMap: any) {
    if (valueMap.pagingStyle === "default") {
        visibilityMap.items = false;
    } else {
        valueMap.items.forEach((item, index) => {
            const isButton = item.item === "firstButton" || item.item === "lastButton" || item.item === "nextButton" || item.item === "previousButton";
            visibilityMap.items[index].text = item.item === "text";
            visibilityMap.items[index].buttonCaption = isButton;
            visibilityMap.items[index].showIcon = item.item !== "text";
            visibilityMap.items[index].maxPageButtons = item.item === "pageNumberButtons";
        });
    }

    return visibilityMap;
}

export function getPreviewCss() {
    return require("./ui/Pagination.scss");
}
