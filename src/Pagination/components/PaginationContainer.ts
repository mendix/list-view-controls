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
import { OnChangeProps, calculateOffSet } from "./PageSizeSelect";
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
    private events: number[] = [];
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
        this.setPageState = StoreState(this.props.mxform, this.props.uniqueid);
    }

    public static translateMessageStatus(fromValue: number, toValue: number, maxPageSize: number): string {
        return mxTranslation("mendix.lib.MxDataSource", "status", [ `${fromValue}`, `${toValue}`, `${maxPageSize}` ]);
    }

    componentDidMount() {
        const persistedState = this.getPageState<PaginationContainerState>();
        if (persistedState) {
            this.setState({
                pendingOffset: persistedState.currentOffset,
                pendingPageNumber: persistedState.pendingPageNumber,
                pageSize: persistedState.pageSize
            });
        }
        const event = (dojo as any).connect(this.props.mxform, "onPersistViewState", (formViewState) => {
            logger.debug("Storing state");
            const widgetViewState = formViewState[this.props.uniqueid] || (formViewState[this.props.uniqueid] = {});
            widgetViewState.pageSize = this.state.pageSize;
            widgetViewState.currentOffset = widgetViewState.publishedOffset = widgetViewState.pendingOffset = this.state.currentOffset;
            widgetViewState.currentPageNumber = widgetViewState.pendingPageNumber = widgetViewState.publishedPageNumber = this.state.currentPageNumber;
        });
        this.events.push(event);
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
        showLoadMoreButton(this.state.targetNode);
    }

    private checkListViewAvailable(): boolean {
        return !!SharedContainerUtils.findTargetListView(this.widgetDOM.parentElement);
    }

    private renderPageButton(): ReactElement<PaginationProps> | null {
        if (this.state.validationPassed) {
            // const offSets = calculateOffSet(this.state.listViewSize, this.state.publishedPageNumber,this.state.publishedOffset);
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
                const pageState = this.getPageState<PaginationContainerState>();

                this.setState({ targetListView, targetNode });
                hideLoadMoreButton(targetNode);

                dataSource = targetListView._datasource;
                listViewSize = pageState && pageState.listViewSize ? pageState.listViewSize : dataSource._setSize;
                pageSize = pageState && pageState.pageSize ? pageState.pageSize : dataSource._pageSize;
                hideUnusedPaging = this.isHideUnUsed(targetListView);
                this.subscriptionTopic = `${targetListView.friendlyId}_${paginationTopicSuffix}`;

                this.beforeListViewDataRender(targetListView);
                this.afterListViewLoad(targetListView, targetNode);
                this.afterListViewDataRender(targetListView);
                this.subScribeToListViewChanges();
            }

            const message = this.validateListView({ targetNode, targetListView, hideUnusedPaging, listViewSize, pageSize });

            this.setState({
                findingListViewWidget: false,
                hideUnusedPaging,
                listViewSize,
                message,
                pageSize,
                targetListView,
                targetNode,
                validationPassed: !message
            });

        }
    }

    private subScribeToListViewChanges() {
        dojoTopic.subscribe(this.subscriptionTopic, (message: TopicMessage) => {
            if (this.state.targetListView && this.props.friendlyId !== message.widgetFriendlyID) {
                const listViewSize = this.state.targetListView._datasource._setSize;
                const calc = calculateOffSet(listViewSize, message.newPageSize || this.state.pageSize, message.newPageNumber);
                this.setWidgetState({
                    pageSize: calc.newPageSize, // message.newPageSize || this.state.pageSize,
                    publishedOffset: calc.newOffSet, // message.newOffSet,
                    pendingOffset: calc.newOffSet,
                    currentOffset: calc.newOffSet,
                    publishedPageNumber: calc.newPageNumber,
                    currentPageNumber: calc.newPageNumber,
                    pendingPageNumber: calc.newPageNumber,
                    updateSource: "multiple"
                });
            }
        });
    }

    private beforeListViewDataRender(targetListView: ListView) {
        dojoAspect.before(targetListView, "_renderData", () => {
            const targetNode = targetListView.domNode;
            if (targetListView) {
                hideLoadMoreButton(targetNode);
                const { pendingPageNumber, pendingOffset } = this.state;
                const targetListViewOffSet = targetListView._datasource.getOffset() as number;
                const listNode = getListNode(targetNode);
                setListNodeToEmpty(listNode);
                if (pendingPageNumber && pendingOffset !== targetListViewOffSet) {
                    this.updateListView(pendingOffset, pendingPageNumber);
                }
            }
        });
    }

    private afterListViewLoad(targetListView: ListView, targetNode: HTMLElement) {
        dojoAspect.after(targetListView, "_onLoad", () => {
            hideLoadMoreButton(targetNode);

            if (targetListView && targetNode) {
                const dataSource = targetListView._datasource;
                const listViewSize = dataSource._setSize || 0;
                const pageSize = this.getPageState("pageSize", dataSource._pageSize);
                const offset = this.getPageState("currentOffset", 0);
                const pageNumber = this.getPageState("currentPageNumber", 1);
                const hideUnusedPaging = this.isHideUnUsed(targetListView) ;

                this.setWidgetState({
                    findingListViewWidget: false,
                    hideUnusedPaging,
                    listViewSize,
                    pageSize,
                    publishedOffset: offset,
                    publishedPageNumber: pageNumber,
                    updateSource: "multiple",
                    targetListView
                });
            }
        });
    }

    private afterListViewDataRender(targetListView: ListView) {
        dojoAspect.after(targetListView, "_renderData", () => {
            if (targetListView) {
                const hideUnusedPaging = this.isHideUnUsed(targetListView);
                if (this.state.hideUnusedPaging !== hideUnusedPaging || this.state.isLoadingItems) {
                    this.setWidgetState({ isLoadingItems: false, hideUnusedPaging });
                }
            }

            resetListViewStructure(targetListView.domNode as HTMLElement);
            hideLoader(targetListView as ListView);
        });
    }

    private validateListView(props: ValidateProps) {
        return Validate.validate({
            ...this.props as ModelerProps,
            queryNode: props.targetNode,
            targetListView: props.targetListView
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
                    publishedPageNumber: pageNumber,
                    publishedOffset: offSet,
                    isLoadingItems: true
                    // listViewSize: targetListView._datasource._setSize
                });

                targetListView._datasource.setOffset(offSet);
                targetListView._datasource._pageSize = newPageSize;
                targetListView.sequence([ "_sourceReload", "_renderData" ]);
                if (publish) {
                    this.publishListViewUpdate({ newOffSet: offSet, newPageNumber: pageNumber, newPageSize, widgetFriendlyID: this.props.friendlyId });
                }
            }
        }
    }

    private setWidgetState(state: Partial<PaginationContainerState>) {
        this.setPageState(state);
        this.setState(state as PaginationContainerState);
    }

    private getPageState<T>(key?: string, defaultValue?: T): T | undefined {
        const mxform = this.props.mxform;
        const widgetViewState = mxform && mxform.viewState ? mxform.viewState[this.props.uniqueid] : void 0;
        const state = 0 === arguments.length ? widgetViewState : widgetViewState && key in widgetViewState ? widgetViewState[key] : defaultValue;
        logger.debug("getPageState", key, defaultValue, state);
        return state;
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
