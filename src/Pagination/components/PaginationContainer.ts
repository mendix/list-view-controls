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
    pageSize?: number;
    offset: number;
}

interface PaginationPageState {
    pageSize?: number;
    offset?: number;
}

class PaginationContainer extends Component<ModelerProps, PaginationContainerState> {
    private widgetDom: HTMLElement;
    private viewStateManager: FormViewState<PaginationPageState>;

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

        this.state = {
            findingListViewWidget: true,
            message: "",
            pageSize: this.viewStateManager.getPageState("pageSize", undefined), // We dont know, based on the modeler configuration of the list view.
            offset: this.viewStateManager.getPageState("offset", 0)
        };
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
        if (!this.widgetDom) {
            return false;
        }

        return !! SharedContainerUtils.findTargetListView(this.widgetDom.parentElement);
    }

    private renderPageButton(): ReactElement<PaginationProps> | null {
        logger.debug(this.props.friendlyId, ".renderPageButton");

        if (this.state.validationPassed && this.state.pageSize) {
            const datasource = this.state.targetListView._datasource;
            const pageSize = this.state.pageSize; // datasource.getPageSize();
            const offset = this.state.offset; // datasource.getOffset();

            return createElement(Pagination, {
                getMessageStatus: PaginationContainer.translateMessageStatus,
                hideUnusedPaging: this.props.hideUnusedPaging && pageSize === 0,
                items: this.props.items,
                listViewSize: datasource.getSetSize(),
                pageSize,
                offset,
                onChange: this.updateListView,
                pagingStyle: this.props.pagingStyle,
                pageSizeOptions: this.props.pageSizeOptions
            });
        }

        return null;
    }

    public updateListView(offSet?: number, pageSize?: number) {
        logger.debug(this.props.friendlyId, ".updateListView");
        if (this.state.validationPassed) {
            this.setState({
                offset: offSet !== undefined ? offSet : this.state.offset,
                pageSize: pageSize !== undefined ? pageSize : this.state.pageSize
            });
            this.updateDataSource(offSet, pageSize);
        }
    }

    private findListView() {
        logger.debug(this.props.friendlyId, ".findListView");
        if (this.state.findingListViewWidget) {
            const targetListView = SharedContainerUtils.findTargetListView(this.widgetDom.parentElement);
            const targetNode = targetListView && targetListView.domNode;

            const message = Validate.validate({ ...this.props, targetNode, targetListView });
            const validationPassed = !message;

            this.setState({
                findingListViewWidget: false,
                message,
                targetListView,
                targetNode,
                validationPassed
            });

            if (validationPassed) {
                this.afterListViewLoaded(targetListView, targetNode);
                this.beforeListViewDataRender(targetListView);
                this.afterListViewDataRender(targetListView);
            }

        }
    }

    private beforeListViewDataRender(targetListView: ListView) {
        logger.debug(this.props.friendlyId, ".beforeListViewDataRender");
        dojoAspect.before(targetListView, "_renderData", () => {
            logger.debug(this.props.friendlyId, "_renderData.before");

            const previousOffset = targetListView._datasource.__customWidgetPagingOffset;
            if (previousOffset !== targetListView._datasource.getOffset()) {
                const size = targetListView._datasource.getSetSize();
                if (size > previousOffset) {
                    this.updateDataSource(previousOffset);
                } else {
                    this.state.targetListView._datasource.__customWidgetPagingOffset = 0;
                }
            }
            const targetNode = targetListView.domNode;
            hideLoadMoreButton(targetNode);
            const listNode = getListNode(targetNode);
            setListNodeToEmpty(listNode);
        });
    }

    private afterListViewLoaded(targetListView: ListView, targetNode: HTMLElement) {
        logger.debug(this.props.friendlyId, ".afterListViewLoad");
        // Initial load of list view, also take in account the previous page state
        const datasource = targetListView._datasource;
        datasource.__customWidgetPagingOffset = 0;
        const pageSizeCurrent = datasource.getPageSize();
        const offsetCurrent = datasource.getOffset();
        const size = targetListView._datasource.getSetSize();

        let offset = offsetCurrent;
        if (this.state.offset > size) {
            offset = this.state.offset;
        }

        let pageSize = datasource.getPageSize();
        if (this.state.pageSize !== undefined && this.state.pageSize !== pageSizeCurrent) {
            pageSize = this.state.pageSize;
        }
        // Only to initial run, page size needs to be set, when navigating back the data is coming from FormViewState
        if (!this.state.pageSize) {
            this.setState({ pageSize });
        }
        if (offset !== offsetCurrent || pageSize !== pageSizeCurrent) {
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

    private updateDataSource(offset?: number, pageSize?: number) {
        const dataSource = this.state.targetListView._datasource;
        let changed = false;
        // On navigating back, the core listview persist list length, should be truncated
        if (offset !== undefined && (offset !== dataSource.getOffset() || dataSource._pageObjs.length > pageSize)) {
            this.state.targetListView._datasource.setOffset(offset);
            this.state.targetListView._datasource.__customWidgetPagingOffset = offset;
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
}

export default hot(module)(PaginationContainer);
