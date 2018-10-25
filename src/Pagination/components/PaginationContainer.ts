import { Component, ReactChild, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoAspect from "dojo/aspect";
import * as dojoTopic from "dojo/topic";

import { Alert } from "../../Shared/components/Alert";
import { ListView, SharedUtils, StoreState, paginationTopicSuffix } from "../../Shared/SharedUtils";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";

import {
    getListNode, hideLoadMoreButton, hideLoader, mxTranslation,
    resetListViewStructure, setListNodeToEmpty, showLoadMoreButton, showLoader
} from "../utils/ContainerUtils";

import { ModelerProps, TopicMessage, UpdateSourceType } from "../Pagination";
import { OnChangeProps } from "./PageSizeSelect";
import { Pagination, PaginationProps } from "./Pagination";
import { Validate } from "../Validate";

import "../ui/Pagination.scss";

interface PaginationContainerState {
    findingListViewWidget: boolean;
    listViewSize: number;
    message: ReactChild;
    pageSize: number;
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
    initialPageSize?: number;
}

interface ValidateProps {
    listViewSize: number;
    pageSize: number;
    hideUnusedPaging: boolean;
    targetListView?: ListView | null;
    targetNode?: HTMLElement | null;
}

export default class PaginationContainer extends Component<ModelerProps, PaginationContainerState> {
    private widgetDOM: HTMLElement;
    private subscriptionTopic: string;
    private setPageState: (store: Partial<PaginationContainerState>) => void;

    readonly state: PaginationContainerState = {
        findingListViewWidget: true,
        hideUnusedPaging: false,
        isLoadingItems: false,
        listViewSize: 0,
        message: "",
        pageSize: 1
    };

    constructor(props: ModelerProps) {
        super(props);

        mendixLang.delay(this.findListView.bind(this), this.checkListViewAvailable.bind(this), 20);
        this.updateListView = this.updateListView.bind(this);
        this.setWidgetState = this.setWidgetState.bind(this);
    }

    public static translateMessageStatus(fromValue: number, toValue: number, maxPageSize: number): string {
        return mxTranslation("mendix.lib.MxDataSource", "status", [ `${fromValue}`, `${toValue}`, `${maxPageSize}` ]);
    }

    componentDidMount() {
        this.setPageState = StoreState(this.props.mxform, this.props.uniqueid);
        (dojo as any).connect(this.props.mxform, "onPersistViewState", (_formViewState) => {
            logger.debug("Storing state");
            // const widgetViewState = formViewState[this.props.uniqueid] || (formViewState[this.props.uniqueid] = {});
            this.setPageState(this.state);
            // widgetViewState.pageSize = this.state.pageSize;
            // widgetViewState.currentOffset = this.state.currentOffset;
            // widgetViewState.currentPageNumber = this.state.currentPageNumber;
        });
    }

    // shouldComponentUpdate(_nextProps: ModelerProps, _nextState: PaginationContainerState) {
        // const defaultSize = this.state.targetListView && this.state.targetListView._datasource && this.state.targetListView._datasource._pageSize;
        // return (!this.state.isLoadingItems
        //     && (this.state.currentOffset !== this.getPageState<number>("currentOffSet", 0)
        //         || this.state.currentPageNumber !== this.getPageState<number>("currentPageNumber", 1)
        //         || this.state.targetListView && this.state.pageSize !== this.getPageState<number>("pageSize", defaultSize)));
    // }

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

        showLoadMoreButton(targetNode);
    }

    private checkListViewAvailable(): boolean {
        return !!SharedContainerUtils.findTargetListView(this.widgetDOM.parentElement);
    }

    private renderPageButton(): ReactElement<PaginationProps> | null {
        if (this.state.validationPassed) {
            return createElement(Pagination, {
                getMessageStatus: PaginationContainer.translateMessageStatus,
                hideUnusedPaging: this.state.hideUnusedPaging,
                items: this.props.items,
                listViewSize: this.state.listViewSize,
                pageSize: this.state.pageSize,
                onClickAction: this.updateListView,
                pagingStyle: this.props.pagingStyle,
                publishedOffset: this.state.publishedOffset,
                publishedPageNumber: this.state.publishedPageNumber,
                updateSource: this.state.updateSource,
                pageSizeOnChange: this.applyPageSize,
                pageSizeOptions: this.props.pageSizeOptions
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
            let pageSize = 0;
            let dataSource: ListView["_datasource"];

            if (targetListView) {
                hideLoadMoreButton(targetNode);

                dataSource = targetListView._datasource;
                listViewSize = dataSource._setSize;
                pageSize = dataSource._pageSize;
                hideUnusedPaging = this.isHideUnUsed(targetListView);
                this.subscriptionTopic = `${targetListView.friendlyId}_${paginationTopicSuffix}`;

                this.afterListViewLoad(targetListView, targetNode);
                this.afterListViewDataRender(targetListView);
                this.beforeListViewDataRender(targetListView);
                this.subScribeToListViewChanges();
            }

            this.validateListView({ targetNode, targetListView, hideUnusedPaging, listViewSize, pageSize });
        }
    }

    private subScribeToListViewChanges() {
        dojoTopic.subscribe(this.subscriptionTopic, (message: TopicMessage) => {
            if (this.state.targetListView) {
                this.setWidgetState({
                    pageSize: message.newPageSize || this.state.pageSize,
                    publishedOffset: message.newOffSet,
                    pendingOffset: message.newOffSet,
                    currentOffset: message.newOffSet,
                    publishedPageNumber: message.newPageNumber,
                    currentPageNumber: message.newPageNumber,
                    pendingPageNumber: message.newPageNumber,
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
                const pageSize = this.getPageState("pageSize", dataSource._pageSize);
                const offset = this.getPageState("currentOffset", 0);
                const pageNumber = this.getPageState("currentPageNumber", 1);
                const hideUnusedPaging = this.isHideUnUsed(this.state.targetListView) ;

                this.setWidgetState({
                    findingListViewWidget: false,
                    hideUnusedPaging,
                    listViewSize,
                    pageSize,
                    publishedOffset: offset,
                    publishedPageNumber: pageNumber,
                    targetListView,
                    targetNode,
                    updateSource: "multiple"
                });

                // if (offset !== 0 || pageNumber !== 1 || pageSize !== dataSource._pageSize) {
                //     this.updateListView(offset, pageNumber, pageSize, false);
                // }
            }
        });
    }

    private getPageState<T>(key?: string, defaultValue?: T): T | undefined {
        const mxform = this.props.mxform;
        const widgetViewState = mxform && mxform.viewState ? mxform.viewState[this.props.uniqueid] : void 0;
        const state = 0 === arguments.length ? widgetViewState : widgetViewState && key in widgetViewState ? widgetViewState[key] : defaultValue;
        logger.debug("getPageState", key, defaultValue, state);
        return state;
    }

    private beforeListViewDataRender(targetListView: ListView) {
        dojoAspect.before(targetListView, "_renderData", () => {
            if (this.state.targetNode) {
                const { pendingPageNumber, pendingOffset } = this.state;
                const targetListViewOffSet = targetListView._datasource.getOffset() as number;
                const listNode = getListNode(this.state.targetNode);

                setListNodeToEmpty(listNode);
                if (pendingPageNumber && pendingOffset && pendingOffset !== targetListViewOffSet) {
                    this.updateListView(pendingOffset, pendingPageNumber);
                }
            }
        });
    }

    private afterListViewDataRender(targetListView: ListView) {
        dojoAspect.after(targetListView, "_renderData", () => {
            if (this.state.targetListView) {
                const hideUnusedPaging = this.isHideUnUsed(this.state.targetListView);
                if (this.state.hideUnusedPaging !== hideUnusedPaging || this.state.isLoadingItems) {
                    this.setWidgetState({ isLoadingItems: false, hideUnusedPaging });
                }
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
            pageSize: props.pageSize,
            targetListView: props.targetListView,
            targetNode: props.targetNode,
            validationPassed: message === ""
        });
    }

    private updateListView(offSet: number, pageNumber: number, pageSize?: number, publish = true) {
        const { targetListView, targetNode, validationPassed, isLoadingItems } = this.state;

        if (targetListView && targetNode && validationPassed) {
            this.setWidgetState({ pendingOffset: offSet, pendingPageNumber: pageNumber });

            if (!isLoadingItems) {
                showLoader(targetListView);
                const newPageSize = pageSize || this.state.pageSize;

                this.setWidgetState({
                    pageSize: newPageSize,
                    currentOffset: offSet,
                    currentPageNumber: pageNumber,
                    publishedOffset: offSet,
                    isLoadingItems: true
                });

                targetListView._datasource.setOffset(offSet);
                targetListView._datasource._pageSize = newPageSize;
                targetListView.sequence([ "_sourceReload", "_renderData" ]);
                if (publish) {
                    this.publishListViewUpdate({ newOffSet: offSet, newPageNumber: pageNumber, newPageSize });
                }
            }
        }
    }

    private setWidgetState(state: Partial<PaginationContainerState>) {
        this.setPageState(state);
        this.setState(state as PaginationContainerState);
    }

    private publishListViewUpdate = (topicMessage: TopicMessage) => {
        if (this.state.targetListView) {
            dojoTopic.publish(this.subscriptionTopic, topicMessage);
        }
    }

    private isHideUnUsed(targetListView: ListView): boolean {
        const pageSize = targetListView._datasource._pageSize;

        return ((pageSize >= targetListView._datasource._setSize) || (pageSize === 0)) && this.props.hideUnusedPaging;
    }

    private applyPageSize = (onChangeProps: OnChangeProps) => {
        const { newPageSize, newOffSet, newPageNumber } = onChangeProps;
        const { targetListView } = this.state;

        if (targetListView && targetListView._datasource
                && targetListView._datasource._pageSize !== newPageSize) {
            this.updateListView(newOffSet, newPageNumber, newPageSize);
        }
    }
}
