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
    listSize?: number;
    offsetGuid?: string;
    isPersisted?: boolean;
}

interface PaginationPageState {
    pageSize?: number;
    offset?: number;
    offsetGuid?: string;
    isPersisted?: boolean;
}

class PaginationContainer extends Component<ModelerProps, PaginationContainerState> {
    private widgetDom: HTMLElement;
    private viewStateManager: FormViewState<PaginationPageState>;
    private retriesFind = 0;
    private initialLoading = true;
    private persistTimeout?: number;

    constructor(props: ModelerProps) {
        super(props);

        logger.debug(this.props.friendlyId, ".constructor");

        this.updateListView = this.updateListView.bind(this);

        const id = this.props.uniqueid || this.props.friendlyId;
        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            const datasource = this.state.targetListView._datasource;
            if (this.state.validationPassed) {
                viewState.pageSize = datasource.getPageSize() || this.state.pageSize;
                viewState.offset = datasource.getOffset() || this.state.offset;
                viewState.offsetGuid = datasource.getSetSize() ? (datasource._pageObjs[0] as mendix.lib.MxObject).getGuid() : this.state.offsetGuid;
                viewState.isPersisted = true;
            }
        });

        this.state = {
            findingListViewWidget: true,
            message: "",
            pageSize: this.viewStateManager.getPageState("pageSize", undefined) as number, // We dont know, based on the modeler configuration of the list view.
            offset: this.viewStateManager.getPageState("offset", 0) as number,
            offsetGuid: this.viewStateManager.getPageState("offsetGuid", undefined) as string,
            isPersisted: this.viewStateManager.getPageState("isPersisted", false) as boolean
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
        // Added to deal with the passing this predicate in mendixLang.delay
        this.retriesFind++;
        if (this.retriesFind > 25) {
            return true; // Give-up searching
        }

        return !! SharedContainerUtils.findTargetListView(this.widgetDom.parentElement);
    }

    private renderPageButton(): ReactElement<PaginationProps> | null {
        logger.debug(this.props.friendlyId, ".renderPageButton");

        if (this.state.validationPassed && this.state.pageSize && this.state.targetListView._datasource.getSetSize() > 0) {
            const { offset, pageSize } = this.state;
            logger.debug(this.props.friendlyId, ".renderPageButton pagesize, offset, listsize", pageSize, offset, this.state.targetListView._datasource.getSetSize());

            return createElement(Pagination, {
                getMessageStatus: PaginationContainer.translateMessageStatus,
                hideUnusedPaging: this.props.hideUnusedPaging,
                items: this.props.items,
                listViewSize: this.state.targetListView._datasource.getSetSize(),
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
                this.beforeListViewDataRender(targetListView);
                this.afterListViewDataRender(targetListView);
                targetListView._renderData(); // render the initial listview so before and after render events apply.
            }

        }
    }

    private beforeListViewDataRender(targetListView: ListView) {
        logger.debug(this.props.friendlyId, ".beforeListViewDataRender");

        dojoAspect.before(targetListView, "_renderData", () => {
            logger.debug(this.props.friendlyId, "_renderData.before");

            const datasource = targetListView._datasource;
            if (datasource.getSetSize() === 0) {
                this.setState({ listSize: datasource.getSetSize() });
                return;
            } else {
                this.setState({ listSize: datasource.getSetSize() });
            }
            if (this.initialLoading) {
                this.afterListViewLoaded(targetListView);
                this.initialLoading = false;
            } else {
                if (this.state.isPersisted) {
                    const offset = this.correctOffset(this.state.offset, targetListView._datasource.getSetSize());
                    this.setState({ offset });

                    const offsetFound = targetListView._datasource._pageObjs[0] && (targetListView._datasource._pageObjs[0].getGuid() === this.state.offsetGuid); // Handles listview bug when pagesize, listviewsize, offset are set but _pageObjs is []
                    if (offsetFound) {
                        this.setState({ isPersisted: false, offsetGuid: undefined });
                        targetListView._renderData();
                    } else {
                        if (targetListView._datasource.getOffset() !== offset) {
                            targetListView._datasource.setOffset(offset);
                        }
                        logger.debug(this.props.friendlyId, ".updateDatasource direct sourceReload and _renderData");
                        if (this.persistTimeout !== undefined) {
                            targetListView.sequence([ "_sourceReload", "_renderData" ]);
                        }
                    }
                    this.persistTimeout = this.persistTimeout === undefined && window.setTimeout(() => {
                        window.clearTimeout(this.persistTimeout);
                        this.persistTimeout = undefined;
                        if (!offsetFound) {
                            logger.debug(this.props.friendlyId, "Cannot find the persisted object", this.persistTimeout);
                            this.setState({ isPersisted: false });
                        }
                        hideLoader(targetListView); // Handles the test case when selected page's objects have all been removed.
                    }, 800);
                } else {
                    this.setState({ offsetGuid: datasource._pageObjs[0].getGuid() });
                }
                if (datasource.__customWidgetPagingLoading) {
                    // other pagination widget did the update, just take the new values
                    this.setState({
                        offset: datasource.getOffset(),
                        pageSize: datasource.getPageSize(),
                        listSize: datasource.getSetSize()
                    });
                } else {
                    logger.debug(this.props.friendlyId, ".initialLoading False, pagingLoading False");
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
                        this.updateDatasource(offset, pageSize);
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
        const pageSize = this.state.pageSize ? this.state.pageSize : datasource.getPageSize() && datasource.getPageSize() || 10;
        if (!this.state.pageSize) {
            // Only to initial run, page size needs to be set, when navigating back the data is coming from FormViewState
            this.setState({ pageSize });
        }
        const offset = this.correctOffset(this.state.offset, datasource.getSetSize());
        this.updateDatasource(offset, pageSize); // State is changed in here
    }

    private afterListViewDataRender(targetListView: ListView) {
        logger.debug(this.props.friendlyId, ".afterListViewDataRender");
        dojoAspect.after(targetListView, "_renderData", () => {
            logger.debug(this.props.friendlyId, "_renderData.after");
            resetListViewHeight(targetListView.domNode as HTMLElement);
        });
    }

    private correctOffset(offset, listViewSize) {
        return offset < listViewSize ? offset : 0;
    }

    private updateDatasource(offset?: number, pageSize?: number) {
        logger.debug(".updateDataSource offset, pageSize", offset, pageSize);
        const listview = this.state.targetListView;
        const datasource = listview._datasource;
        if (datasource.__customWidgetPagingLoading) {
            logger.debug("customWidgetPagingLoading");
            return;
        }
        let changed = false;
        // On navigating back, the core listview persist list length, should be truncated
        if (offset !== undefined && (offset !== datasource.getOffset() || datasource._pageObjs.length > pageSize)) {
            logger.debug("off set is defined");
            datasource.__customWidgetPagingOffset = offset;
            datasource.setOffset(offset);
            changed = true;
        }
        if (pageSize !== undefined && datasource.getPageSize() !== pageSize) {
            logger.debug("page size is defined");
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
