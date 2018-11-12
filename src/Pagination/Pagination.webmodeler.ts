import { Component, ReactChild, createElement } from "react";
import { findDOMNode } from "react-dom";

import { Alert } from "../Shared/components/Alert";
import { SharedUtils } from "../Shared/SharedUtils";
import { Validate } from "./Validate";

import { ModelerProps } from "./Pagination";
import { Pagination } from "./components/Pagination";

interface PaginationWebModelerState {
    findingListViewWidget: boolean;
    hideUnusedPaging: boolean;
    message: ReactChild;
}

// tslint:disable-next-line class-name
export class preview extends Component<ModelerProps, PaginationWebModelerState> {

    constructor(props: ModelerProps) {
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
                className: "widget-pagination-alert"
            }, this.state.message),
            createElement(Pagination, {
                getMessageStatus: () => "[2 to 10 of 50]",
                hideUnusedPaging: false,
                items: this.props.items,
                listViewSize: 20,
                pageSize: 2,
                onChange: () => {
                    return;
                },
                pagingStyle: this.props.pagingStyle,
                offset: 0,
                pageNumber: 1,
                pageSizeOptions: this.props.pageSizeOptions
            })
        );
    }

    componentDidMount() {
        this.validateConfigs(this.props);
    }

    componentWillReceiveProps(nextProps: ModelerProps) {
        this.validateConfigs(nextProps);
    }

    private validateConfigs(props: ModelerProps) {
        const queryNode = findDOMNode(this) as HTMLElement;
        const targetNode = SharedUtils.findTargetNode(queryNode);
        const message = Validate.validate({
            ...props as ModelerProps,
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
    if (valueMap.pagingStyle === "custom") {
        valueMap.items.forEach((item, index) => {
            const isButton = item.item === "firstButton" || item.item === "lastButton" || item.item === "nextButton" || item.item === "previousButton";
            visibilityMap.items[index].text = item.item === "text";
            visibilityMap.items[index].buttonCaption = isButton;
            visibilityMap.items[index].showIcon = isButton;
            visibilityMap.items[index].maxPageButtons = item.item === "pageNumberButtons";
        });
    } else {
        visibilityMap.items = false;
    }

    return visibilityMap;
}

export function getPreviewCss() {
    return require("./ui/Pagination.scss");
}
