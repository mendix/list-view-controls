import { Component, ReactChild, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as dojoConnect from "dojo/_base/connect";
import * as dojoAspect from "dojo/aspect";
import * as dojoTopic from "dojo/topic";

import { Alert } from "../../Shared/components/Alert";
import { ListView, SharedUtils } from "../../Shared/SharedUtils";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";

import { ModelerProps, UpdateSourceType } from "../Pagination";
import {
    getListNode, hideLoadMoreButton, hideLoader, resetListViewStructure,
    setListNodeToEmpty, showLoadMoreButton, showLoader
} from "../utils/ContainerUtils";

import { Pagination, PaginationProps } from "./Pagination";
import { Validate } from "../Validate";

import "../ui/Pagination.scss";

interface PaginationContainerState {
    findingListViewWidget: boolean;
    listViewSize: number;
    message: ReactChild;
    offset: number;
    hideUnusedPaging: boolean;
    isLoadingItems: boolean;
    publishedOffset?: number;
    publishedPageNumber?: number;
    pendingOffset?: number;
    pendingPageNumber?: number;
    currentOffset?: number;
    currentPageNumber?: number;
    targetListView?: ListView | null;
    targetNode?: HTMLElement | null;
    updateSource?: UpdateSourceType;
    validationPassed?: boolean;
}

interface ValidateProps {
    listViewSize: number;
    offset: number;
    hideUnusedPaging: boolean;
    targetListView?: ListView | null;
    targetNode?: HTMLElement | null;
}

export default class PaginationContainer extends Component<ModelerProps, PaginationContainerState> {
    private navigationHandler: object;
    private widgetDOM: HTMLElement;

    constructor(props: ModelerProps) {
        super(props);

        this.state = {
            findingListViewWidget: true,
            hideUnusedPaging: false,
            isLoadingItems: false,
            listViewSize: 0,
            message: "",
            offset: 1
        };

        this.updateListView = this.updateListView.bind(this);
        this.publishListViewUpdate = this.publishListViewUpdate.bind(this);
        this.findListView = this.findListView.bind(this);
        this.navigationHandler = dojoConnect.connect(props.mxform, "onNavigation", this , this.findListView);
    }

    public static translateMessageStatus(fromValue: number, toValue: number, maxPageSize: number): string {
        return window.mx.ui.translate("mxui.lib.MxDataSource", "status", [ fromValue, toValue, maxPageSize ]);
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-pagination", this.props.class),
                ref: (widgetDOM) => this.widgetDOM = widgetDOM,
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                className: "widget-pagination-alert"
            }, this.state.message),
            this.renderPageButton()
        );
    }

    componentWillUnmount() {
        const targetNode = this.state.targetNode;

        dojoConnect.disconnect(this.navigationHandler);
        showLoadMoreButton(targetNode);
    }

    private renderPageButton(): ReactElement<PaginationProps> | null {
        if (this.state.validationPassed) {
            return createElement(Pagination, {
                getMessageStatus: PaginationContainer.translateMessageStatus,
                hideUnusedPaging: this.state.hideUnusedPaging,
                items: this.props.items,
                listViewSize: this.state.listViewSize,
                offset: this.state.offset,
                onClickAction: this.updateListView,
                pagingStyle: this.props.pagingStyle,
                publishedOffset: this.state.publishedOffset,
                publishedPageNumber: this.state.publishedPageNumber,
                updateSource: this.state.updateSource
            });
        }

        return null;
    }

    private findListView() {
        if (this.state.findingListViewWidget) {
            const targetListView = SharedContainerUtils.findTargetListView(this.widgetDOM.parentElement);
            const targetNode = targetListView && targetListView.domNode;
            let hideUnusedPaging = false;
            let listViewSize = 0;
            let offset = 0;
            let dataSource: ListView["_datasource"];

            if (targetListView) {
                hideLoadMoreButton(targetNode);

                dataSource = targetListView._datasource;
                listViewSize = dataSource._setSize;
                offset = dataSource._pageSize;
                hideUnusedPaging = this.isHideUnUsed(targetListView);

                this.afterListViewLoad(targetListView, targetNode);
                this.afterListViewDataRender(targetListView);
                this.beforeListViewDataRender(targetListView);
                this.subScribeToListViewChanges(targetListView);
            }

            this.validateListView({ targetNode, targetListView, hideUnusedPaging, listViewSize, offset });
        }
    }

    private subScribeToListViewChanges(targetListView: ListView) {
        dojoTopic.subscribe(targetListView.friendlyId, (message: number[]) => {
            if (this.state.targetListView) {
                this.setState({
                    publishedOffset: message[0],
                    publishedPageNumber: message[1],
                    updateSource: "multiple"
                });
            }
        });
    }

    private afterListViewLoad(targetListView: ListView, targetNode: HTMLElement) {
        dojoAspect.after(targetListView, "_onLoad", () => {
            hideLoadMoreButton(targetNode);

            if (this.state.targetListView && this.state.targetNode) {
                targetNode = this.state.targetNode;
                const dataSource = this.state.targetListView._datasource;
                const listViewSize = dataSource._setSize;
                const offset = dataSource._pageSize;
                const hideUnusedPaging = this.isHideUnUsed(this.state.targetListView) ;

                this.setState({
                    findingListViewWidget: false,
                    hideUnusedPaging,
                    listViewSize,
                    offset,
                    publishedOffset: 0,
                    publishedPageNumber: 1,
                    targetListView,
                    targetNode,
                    updateSource: "other"
                });
            }
        });
    }

    private beforeListViewDataRender(targetListView: ListView) {
        dojoAspect.before(targetListView, "_renderData", () => {
            if (this.state.targetNode) {
                const listNode = getListNode(this.state.targetNode);

                setListNodeToEmpty(listNode);
            }
        });
    }

    private afterListViewDataRender(targetListView: ListView) {
        dojoAspect.after(targetListView, "_renderData", () => {
            const { pendingPageNumber, pendingOffset, currentOffset } = this.state;

            if (pendingPageNumber && pendingOffset && pendingOffset !== currentOffset) {
                this.updateListView(pendingOffset, pendingPageNumber);
            }

            if (this.state.targetListView) {
                this.setState({ isLoadingItems: false });
            }

            resetListViewStructure(this.state.targetNode as HTMLElement);
            hideLoader(this.state.targetListView as ListView);
        });
    }

    private validateListView(props: ValidateProps) {
        const message = Validate.validate({
            ...this.props as ModelerProps,
            queryNode: props.targetNode,
            targetListView: props.targetListView
        });

        this.setState({
            findingListViewWidget: false,
            hideUnusedPaging: props.hideUnusedPaging,
            listViewSize: props.listViewSize,
            message,
            offset: props.offset,
            targetListView: props.targetListView,
            targetNode: props.targetNode,
            validationPassed: message === ""
        });
    }

    private updateListView(offSet: number, pageNumber: number) {
        const { targetListView, targetNode, validationPassed, isLoadingItems } = this.state;

        if (targetListView && targetNode && validationPassed) {
            this.setState({ pendingOffset: offSet, pendingPageNumber: pageNumber });

            if (!isLoadingItems) {
                showLoader(targetListView);

                this.setState({
                    currentOffset: offSet,
                    currentPageNumber: pageNumber,
                    isLoadingItems: true
                });

                targetListView._datasource.setOffset(offSet);
                targetListView.sequence([ "_sourceReload", "_renderData" ]);
                this.publishListViewUpdate(offSet, pageNumber);
            }
        }
    }

    private publishListViewUpdate(offSet: number, pageNumber: number) {
        if (this.state.targetListView) {
            dojoTopic.publish(this.state.targetListView.friendlyId, [ offSet, pageNumber ]);
        }
    }

    private isHideUnUsed(targetListView: ListView): boolean {
        const offset = targetListView._datasource._pageSize;

        return ((offset >= targetListView._datasource._setSize) || (offset === 0)) && this.props.hideUnusedPaging;
    }
}
