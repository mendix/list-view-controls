import { Component, ReactChild, ReactElement, createElement } from "react";
import { hot } from "react-hot-loader";

import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoAspect from "dojo/aspect";

import { Alert } from "../../Shared/components/Alert";
import { ListView, SharedUtils } from "../../Shared/SharedUtils";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";

import {
    hideLoadMoreButton, hideLoader, mxTranslation, persistListViewHeight,
    resetListViewHeight, setListNodeToEmpty, showLoadMoreButton, showLoader
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
    listSize: number;
}

interface PaginationPageState {
    pageSize?: number;
    offset?: number;
}

class PaginationContainer extends Component<ModelerProps, PaginationContainerState> {
    private widgetDom: HTMLElement;
    private viewStateManager: FormViewState<PaginationPageState>;
    private retriesFind = 0;
    private initialLoading = true;

    constructor(props: ModelerProps) {
        super(props);

        logger.debug(this.props.friendlyId, ".constructor");

        this.updateListView = this.updateListView.bind(this);

        const id = this.props.uniqueid || this.props.friendlyId;
        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            if (this.state.validationPassed) {
                const datasource = this.state.targetListView._datasource;
                viewState.pageSize = datasource.getPageSize();
                viewState.offset = datasource.getOffset();
            }
        });

        this.state = {
            findingListViewWidget: true,
            message: "",
            pageSize: this.viewStateManager.getPageState("pageSize", undefined), // We dont know, based on the modeler configuration of the list view.
            offset: this.viewStateManager.getPageState("offset", 0),
            listSize: 0
        };
    }

    componentDidMount() {
        logger.debug(this.props.friendlyId, ".componentDidMount");
        mendixLang.delay(this.findListView.bind(this), this.checkListViewAvailable.bind(this), 20);
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
        this.retriesFind++;
        if (this.retriesFind > 25) {
            return true; // Give-up searching
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
                hideUnusedPaging: this.props.hideUnusedPaging,
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
            this.updateDatasource(offSet, pageSize);
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
                hideLoadMoreButton(targetNode);
                // this.afterListViewLoaded(targetListView);
                this.beforeListViewDataRender(targetListView);
                this.afterListViewDataRender(targetListView);
            }

        }
    }

    private beforeListViewDataRender(targetListView: ListView) {
        logger.debug(this.props.friendlyId, ".beforeListViewDataRender");
        dojoAspect.before(targetListView, "_renderData", () => {
            logger.debug(this.props.friendlyId, "_renderData.before");
            const datasource = targetListView._datasource;
            if (this.initialLoading) {
                this.afterListViewLoaded(targetListView);
                this.initialLoading = false;
            } else {
                if (datasource.__customWidgetPagingLoading) {
                    // other pagination widget did the update, just take the new values
                    this.setState({
                        offset: datasource.getOffset(),
                        pageSize: datasource.getPageSize(),
                        listSize: datasource.getSetSize()
                    });
                } else {
                    const previousOffset = this.state.offset;
                    const listSize = datasource.getSetSize();
                    let offset = previousOffset;
                    if (previousOffset !== datasource.getOffset()) {
                        if (listSize > previousOffset) {
                            this.updateDatasource(offset);
                        } else {
                            offset = 0;
                            datasource.__customWidgetPagingOffset = offset;
                        }
                    }
                    const pageSize = datasource.getPageSize();
                    if (this.state.offset !== offset || this.state.pageSize !== pageSize || this.state.listSize !== listSize) {
                        this.setState({
                            offset,
                            pageSize,
                            listSize
                        });
                    }
                }
            }
            persistListViewHeight(targetListView.domNode);
            setListNodeToEmpty(targetListView.domNode);
        });
    }

    private afterListViewLoaded(targetListView: ListView) {
        logger.debug(this.props.friendlyId, ".afterListViewLoad");
        // Initial load of list view, also take in account the previous page state
        const datasource = targetListView._datasource;
        datasource.__customWidgetPagingOffset = 0;
        const pageSize = this.state.pageSize ? this.state.pageSize : datasource.getPageSize();
        if (!this.state.pageSize) {
            // Only to initial run, page size needs to be set, when navigating back the data is coming from FormViewState
            this.setState({ pageSize });
        }
        this.updateDatasource(this.state.offset, pageSize);
    }

    private afterListViewDataRender(targetListView: ListView) {
        logger.debug(this.props.friendlyId, ".afterListViewDataRender");
        dojoAspect.after(targetListView, "_renderData", () => {
            logger.debug(this.props.friendlyId, "_renderData.after");
            resetListViewHeight(targetListView.domNode as HTMLElement);
        });
    }

    private updateDatasource(offset?: number, pageSize?: number) {
        const listview = this.state.targetListView;
        const datasource = listview._datasource;
        if (datasource.__customWidgetPagingLoading) {
            return;
        }
        let changed = false;
        // On navigating back, the core listview persist list length, should be truncated
        if (offset !== undefined && (offset !== datasource.getOffset() || datasource._pageObjs.length > pageSize)) {
            datasource.__customWidgetPagingOffset = offset;
            datasource.setOffset(offset);
            changed = true;
        }
        if (pageSize !== undefined && datasource.getPageSize() !== pageSize) {
            datasource.setPageSize(pageSize);
            changed = true;
        }

        if (changed) {
            logger.debug(this.props.friendlyId, ".updateDatasource changed", offset, pageSize);
            datasource.__customWidgetPagingLoading = true;
            showLoader(listview);
            listview.sequence([ "_sourceReload", "_renderData" ], () => {
                datasource.__customWidgetPagingLoading = false;
                resetListViewHeight(listview.domNode);
                logger.debug(this.props.friendlyId, ".updateDatasource updated");
                hideLoader(listview);
            });
        }
    }
}

export default hot(module)(PaginationContainer);
