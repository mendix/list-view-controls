import { Component, ReactChild, ReactElement, createElement } from "react";
import { hot } from "react-hot-loader";

import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoAspect from "dojo/aspect";

import { Alert } from "../../Shared/components/Alert";
import { ListView, SharedUtils } from "../../Shared/SharedUtils";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";

import {
    getListNode, hideLoadMoreButton, hideLoader, mxTranslation,
    resetListViewStructure, setListNodeToEmpty, showLoadMoreButton, showLoader
} from "../utils/ContainerUtils";

import { ModelerProps } from "../Pagination";
import { OnChangeProps } from "./PageSizeSelect";
import { Pagination, PaginationProps } from "./Pagination";
import { Validate } from "../Validate";
import FormViewState from "../../Shared/FormViewState";

import "../ui/Pagination.scss";

interface PaginationContainerState {
    findingListViewWidget: boolean;
    message: ReactChild;
    targetListView?: ListView | null;
    targetNode?: HTMLElement | null;
    validationPassed?: boolean;
    offset: number;
}

interface PaginationPageState {
    pageSize?: number;
    offset?: number;
}

class PaginationContainer extends Component<ModelerProps, PaginationContainerState> {
    private widgetDom: HTMLElement;
    private viewStateManager: FormViewState<PaginationPageState>;

    readonly state: PaginationContainerState = {
        findingListViewWidget: true,
        message: "",
        offset: 0
    };

    constructor(props: ModelerProps) {
        super(props);
        logger.debug(this.props.friendlyId, ".constructor");

        this.updateListView = this.updateListView.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId;
        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            const datasource = this.state.targetListView._datasource;
            viewState.pageSize = datasource.getPageSize();
            viewState.offset = datasource.getOffset();
        });
    }

    componentDidMount() {
        logger.debug(this.props.friendlyId, ".componentDidMount");
        mendixLang.delay(this.findListView.bind(this), this.checkListViewAvailable.bind(this), 0);
    }

    render() {
        logger.debug(this.props.friendlyId, ".render");
        return createElement("div",
            {
                className: classNames("widget-pagination", this.props.class),
                ref: widgetDom => this.widgetDom = widgetDom,
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                className: "widget-pagination-alert"
            }, this.state.message),
            this.renderPageButton()
        );
    }

    componentWillUnmount() {
        logger.debug(this.props.friendlyId, ".componentWillUnmount");
        showLoadMoreButton(this.state.targetNode);
        this.viewStateManager.destroy();
    }

    public static translateMessageStatus(fromValue: number, toValue: number, maxPageSize: number): string {
        return mxTranslation("mendix.lib.MxDataSource", "status", [ `${fromValue}`, `${toValue}`, `${maxPageSize}` ]);
    }

    private checkListViewAvailable(): boolean {
        logger.debug(this.props.friendlyId, ".checkListViewAvailable");
        return !! SharedContainerUtils.findTargetListView(this.widgetDom.parentElement);
    }

    private renderPageButton(): ReactElement<PaginationProps> | null {
        logger.debug(this.props.friendlyId, ".renderPageButton");

        if (this.state.validationPassed) {
            const datasource = this.state.targetListView._datasource;
            const offset = datasource.getOffset();
            const listViewSize = datasource.getSetSize();
            const pageSize = datasource.getPageSize();
            const pageNumber = (offset / pageSize) + 1;
            return createElement(Pagination, {
                getMessageStatus: PaginationContainer.translateMessageStatus,
                hideUnusedPaging: this.isHideUnUsed(this.state.targetListView),
                items: this.props.items,
                listViewSize,
                pageSize,
                offset,
                pageNumber,
                onClickAction: this.updateListView,
                pagingStyle: this.props.pagingStyle,
                pageSizeOnChange: this.applyPageSize,
                pageSizeOptions: this.props.pageSizeOptions
            });
        }

        return null;
    }

    private findListView() {
        logger.debug(this.props.friendlyId, ".findListView");
        if (this.state.findingListViewWidget) {
            const targetListView = SharedContainerUtils.findTargetListView(this.widgetDom.parentElement);
            const targetNode = targetListView && targetListView.domNode;

            const message = this.validateListView({ targetNode, targetListView });

            this.setState({
                findingListViewWidget: false,
                message,
                targetListView,
                targetNode,
                validationPassed: !message
            });

            if (targetListView) {
                hideLoadMoreButton(targetNode);
                this.beforeListViewDataRender(targetListView);
                this.afterListViewLoad(targetListView, targetNode);
                this.afterListViewDataRender(targetListView);
            }

        }
    }

    private beforeListViewDataRender(targetListView: ListView) {
        logger.debug(this.props.friendlyId, ".beforeListViewDataRender");
        dojoAspect.before(targetListView, "_renderData", () => {
            logger.debug(this.props.friendlyId, "_renderData.before");
            // Update from new constraints required update.
            this.forceUpdate();
            if (this.state.offset !== targetListView._datasource.getOffset()) {
                const size = targetListView._datasource.getSetSize();
                if (size > this.state.offset) {
                    this.updateDataSource(this.state.offset);
                } else {
                    this.setState({ offset: targetListView._datasource.getOffset() });
                }
            }
            const targetNode = targetListView.domNode;
            hideLoadMoreButton(targetNode);
            const listNode = getListNode(targetNode);
            setListNodeToEmpty(listNode);
        });
    }

    private afterListViewLoad(targetListView: ListView, targetNode: HTMLElement) {
        logger.debug(this.props.friendlyId, ".afterListViewLoad");
        // Initial load of list view, also take in account the previous page state
        if (targetListView && targetNode) {
            const dataSource = targetListView._datasource;
            const pageSize = this.viewStateManager.getPageState("pageSize", dataSource.getPageSize());
            const offset = this.viewStateManager.getPageState("offset", dataSource.getOffset());
            this.updateDataSource(offset, pageSize);
        }
        hideLoadMoreButton(targetNode);
    }

    private afterListViewDataRender(targetListView: ListView) {
        logger.debug(this.props.friendlyId, ".afterListViewDataRender");
        dojoAspect.after(targetListView, "_renderData", () => {
            logger.debug(this.props.friendlyId, "_renderData.after");

            resetListViewStructure(targetListView.domNode as HTMLElement);
            hideLoader(targetListView as ListView);
        });
    }

    private validateListView(target: { targetNode: HTMLElement, targetListView: ListView }) {
        return Validate.validate({
            ...this.props as ModelerProps,
            queryNode: target.targetNode,
            targetListView: target.targetListView
        });
    }

    // TODO remove _pageNumber argument
    private updateListView(offSet: number, _pageNumber: number, pageSize?: number) {
        logger.debug(this.props.friendlyId, ".updateListView");
        const { targetListView, targetNode, validationPassed } = this.state;

        if (targetListView && targetNode && validationPassed) {
            this.updateDataSource(offSet, pageSize);
        }
    }

    private updateDataSource(offset?: number, pageSize?: number) {
        const dataSource = this.state.targetListView._datasource;
        let changed = false;
        // On navigating back, the core listview persist list length, should be truncated
        if (offset !== undefined && offset !== dataSource.getOffset() || dataSource._pageObjs.length > pageSize) {
            this.state.targetListView._datasource.setOffset(offset);
            this.setState({
                offset
            });
            changed = true;
        }
        if (pageSize !== undefined && dataSource.getPageSize() !== pageSize) {
            this.state.targetListView._datasource.setPageSize(pageSize);
            changed = true;
        }
        if (changed) {
            showLoader(this.state.targetListView);
            this.state.targetListView.sequence([ "_sourceReload", "_renderData" ]);
        }
    }

    private isHideUnUsed(targetListView: ListView): boolean {
        const pageSize = targetListView._datasource.getPageSize();
        return this.props.hideUnusedPaging && pageSize === 0;
    }

    private applyPageSize = (onChangeProps: OnChangeProps) => {
        const { newPageSize, newOffSet } = onChangeProps;
        this.updateListView(newOffSet, 0, newPageSize);
    }
}

export default hot(module)(PaginationContainer);
