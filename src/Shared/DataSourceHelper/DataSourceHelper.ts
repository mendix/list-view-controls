import * as aspect from "dojo/aspect";
import { Constraint, Constraints, GroupedOfflineConstraint, SharedUtils } from "../SharedUtils";
import { SharedContainerUtils } from "../SharedContainerUtils";
import { resetListViewHeight } from "../../Pagination/utils/ContainerUtils";
import "../ListViewPrototype";

import "./ui/DataSourceHelper.scss";

interface ConstraintStore {
    constraints: { [group: string]: { [widgetId: string]: Constraint } };
    sorting: { [widgetId: string]: string[] };
}

export interface Paging {
    offset?: number;
    pageSize?: number;
}

export interface DataSourceHelperListView extends mxui.widget.ListView {
    prototype: DataSourceHelperListView;
    __customWidgetDataSourceHelper?: DataSourceHelper;
    __loadDataOriginal: (callback: () => void) => void;
    __postCreateOriginal: () => void;
    __lvcPagingEnabled: boolean;
    __lvcPrototypeUpdated: boolean;
    __customWidgetPagingLoading: boolean;
    __customWidgetPagingOffset: number;
    _getSearchText?: () => string;
    hasSearch: boolean;
    _lastLoadId: string;
}

export class DataSourceHelper {
    private initialLoad = true;
    private delay = 50;
    private timeoutHandle?: number;
    private store: ConstraintStore = { constraints: { _none: {} }, sorting: {} };
    private widget: DataSourceHelperListView;
    private updateInProgress = false;
    private requiresUpdate = false;
    private originalSort: string[][];
    public sorting: string[][] = [];
    public constraints: mendix.lib.dataSource.Constraints = [];
    public paging?: Paging;

    constructor(widget: DataSourceHelperListView) {
        this.widget = widget;
        this.originalSort = window.mx.isOffline() ? this.widget._datasource._sort : this.widget._datasource._sorting;

        aspect.after(widget, "storeState", (store: (key: string, value: any) => void) => {
            mx.logger.debug("after storeState");
            if (widget.__customWidgetDataSourceHelper) {
                const sorting = widget.__customWidgetDataSourceHelper.sorting.length > 0 ? widget.__customWidgetDataSourceHelper.sorting : widget.__customWidgetDataSourceHelper.originalSort;
                store("lvcSorting", sorting);
                store("lvcConstraints", widget.__customWidgetDataSourceHelper.constraints);
                store("lvcPaging", widget.__customWidgetDataSourceHelper.paging);
            }
        }, true);
    }

    static getInstance(widgetDom: Element | null, widgetEntity?: string) {
        const parentElement = widgetDom && widgetDom.parentElement;
        const widget = SharedContainerUtils.findTargetListView(parentElement, widgetEntity);
        const compatibilityMessage = SharedUtils.validateCompatibility({ listViewEntity: widgetEntity, targetListView: widget });

        if (!compatibilityMessage && widget) {
            if (!widget.__customWidgetDataSourceHelper) {
                widget.__customWidgetDataSourceHelper = new DataSourceHelper(widget);
            }
            const restoreState = widget.getState("lvcPersistState", false);
            if (!restoreState) {
                this.hideContent(widget.domNode);
            }

            return widget.__customWidgetDataSourceHelper;
        }

        throw new Error(compatibilityMessage);
    }

    setSorting(widgetId: string, sortConstraint: string[], restoreState = false) {
        this.store.sorting = {} ;
        this.store.sorting[widgetId] = sortConstraint;
        this.registerUpdate(restoreState);
    }

    setConstraint(widgetId: string, constraint: Constraint, groupName = "_none", restoreState = false) {
        const group = groupName.trim() || "_none";
        if (this.store.constraints[group]) {
            this.store.constraints[group][widgetId] = constraint;
        } else {
            this.store.constraints[group] = { [widgetId] : constraint };
        }
        this.registerUpdate(restoreState);
    }

    getListView(): DataSourceHelperListView {
        return this.widget;
    }

    private registerUpdate(restoreState: boolean) {
        mx.logger.debug("DataSourceHelper .registerUpdate");
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }
        if (!this.updateInProgress) {
            this.timeoutHandle = window.setTimeout(() => {
                mx.logger.debug("DataSourceHelper .execute");
                this.updateInProgress = true;
                // TODO Check if there's currently no update happening on the listView coming from another
                // Feature/functionality/widget which does not use DataSourceHelper
                this.iterativeUpdateDataSource(restoreState);
            }, this.delay);
        } else {
            this.requiresUpdate = true;
        }
    }

    private iterativeUpdateDataSource(restoreState: boolean) {
        this.updateDataSource(() => {
            if (this.requiresUpdate) {
                this.requiresUpdate = false;
                this.iterativeUpdateDataSource(restoreState);
            } else {
                this.updateInProgress = false;
            }
        }, restoreState);
    }

    private updateDataSource(callback: () => void, restoreState: boolean) {
        let constraints: Constraints;
        let sorting: string[][] = Object.keys(this.store.sorting)
            .map(key => this.store.sorting[key])
            .filter(sortConstraint => sortConstraint[0] && sortConstraint[1]);
        if (!sorting.length) {
            sorting = this.originalSort;
        }
        // if (!sorting.length) {
        //     this.widget._datasource._sorting.forEach(sortSet => sorting.push(sortSet));
        // }
        if (window.mx.isOffline()) {
            const noneGroupedConstraints = Object.keys(this.store.constraints._none)
            .map(key => this.store.constraints._none[key]);

            const unGroupedConstraints = (noneGroupedConstraints as mendix.lib.dataSource.OfflineConstraint []).filter(constraint => constraint.value);
            const unGroupedOrConstraints = (noneGroupedConstraints as GroupedOfflineConstraint[]).filter(constraint => constraint.operator); // Coming from text box search

            const groups = Object.keys(this.store.constraints).filter(group => group !== "_none");
            const groupedConstraints: GroupedOfflineConstraint[] = [];
            for (const group of groups) { // Dealing with multiple widgets which have single constraints
                const groupWidgets = Object.keys(this.store.constraints[group]);
                const groupOfflineConstraints: mendix.lib.dataSource.OfflineConstraint[] = [];
                for (const groupWidget of groupWidgets) {
                    const widgetConstraint = this.store.constraints[group][groupWidget] as mendix.lib.dataSource.OfflineConstraint;
                    if (widgetConstraint && widgetConstraint.value) {
                        groupOfflineConstraints.push(widgetConstraint);
                    }
                }
                if (groupOfflineConstraints.length) {
                    groupedConstraints.push({
                        constraints: groupOfflineConstraints,
                        operator: "or"
                    });
                }
            }

            // TODO: Since we do not include `this.widget_datasource._constraints` here, this can cause filtering to reset all the constraints.
            constraints = [ ...unGroupedConstraints, ...unGroupedOrConstraints, ...groupedConstraints ];

        } else {
            const unGroupedConstraints = Object.keys(this.store.constraints._none)
            .map(key => this.store.constraints._none[key])
            .join("");

            const groupedConstraints = Object.keys(this.store.constraints)
                .filter(c => c !== "_none")
                .map(group => "[" + Object.keys(this.store.constraints[group])
                    .map(key => this.store.constraints[group][key] as string)
                    .filter(c => c) // Remove empty
                    .map(c => c.trim().substr(1, c.trim().length - 2)) // Strip []
                    .join(" or ") + "]")
                .join("")
                .replace(/\[]/g, ""); // Remove empty string "[]"

            // @ts-ignore This is a subclass property, but we also handle it gracefully if not present.
            const searchPaths: string[] | undefined = this.widget._datasource._searchPaths;
            // If there is no search, trying to get it will error so first check whether search is enabled.
            const searchText: string | undefined = this.widget.hasSearch ? this.widget._getSearchText?.() : undefined;

            // Unfortunately the listview datasource object does not have a `_getSearchConstraints()` function of some kind,
            // but rather builds it on the fly in `setSearchText(string)`. To not affect the ListView widget, we copy that part
            // out of the function and paste it here. Specifically it is in `QuerySource.setSearchText`.
            const getListViewSearchConstraints = (paths: string[] | undefined, text: string | undefined): string => {
                if (paths && text && text.trim() !== "") {
                    const searchConstraints = paths.map(path => `contains(${path},'${searchText}')`);
                    return `[${searchConstraints.join(" or ")}]`;
                }
                return "";
            };

            const listViewSearchConstraints = getListViewSearchConstraints(searchPaths, searchText);

            constraints = listViewSearchConstraints + unGroupedConstraints + groupedConstraints;
            // if (!restoreState) {
            //     this.widget._datasource._sorting = sorting;
            // }
        }

        this.sorting = sorting;
        this.constraints = constraints;
        if (!restoreState) {
            // when restoring state the prototype update of list view will handel restore the sort and constraint
            this.widget._datasource._constraints = constraints;
            if (window.mx.isOffline()) {
                this.widget._datasource._sort = sorting;
            } else {
                this.widget._datasource._sorting = sorting;
            }
            mx.logger.debug("DataSourceHelper .set sort and constraint");
            const offset = this.widget._datasource.getOffset();
            const pageSize = this.widget._datasource.getPageSize();
            if (!this.widget.__lvcPagingEnabled && offset > 0) {
                // In case load more is used, the data source have to reload the full content
                mx.logger.debug("reset offset");
                this.widget._datasource.setOffset(0);
                this.widget._datasource.setPageSize(pageSize + offset);
            }
            if (!this.initialLoad) {
                this.showLoader();
            }

            this.widget.update(null, () => {
                mx.logger.debug("DataSourceHelper .updated");
                if (!this.widget.__lvcPagingEnabled && offset > 0) {
                    mx.logger.debug("restore offset");
                    // Restore the original paging and offset for load more.
                    this.widget._datasource.setOffset(offset);
                    this.widget._datasource.setPageSize(pageSize);
                }
                this.hideLoader();
                this.initialLoad = false;
                callback();
            });
        } else {
            DataSourceHelper.showContent(this.widget.domNode);
            this.hideLoader();
            this.initialLoad = false;
            callback();
        }
    }

    private showLoader() {
        this.widget.domNode.classList.add("widget-data-source-helper-loading");
    }

    static hideContent(targetNode?: HTMLElement) {
        if (targetNode) {
            targetNode.classList.add("widget-data-source-helper-initial-loading");
        }
    }

    static showContent(targetNode?: HTMLElement) {
        if (targetNode) {
            targetNode.classList.remove("widget-data-source-helper-initial-loading");
        }
    }

    private hideLoader() {
        this.widget.domNode.classList.remove("widget-data-source-helper-loading");
        DataSourceHelper.showContent(this.widget.domNode);
    }

    setPaging(offset?: number, pageSize?: number) {
        const datasource = this.widget._datasource;
        if (this.widget.__customWidgetPagingLoading) {
            return;
        }
        let changed = false;
        if (offset !== undefined && offset !== datasource.getOffset()) {
            this.widget.__customWidgetPagingOffset = offset;
            datasource.setOffset(offset);
            changed = true;
        }
        if (pageSize !== undefined && pageSize !== datasource.getPageSize()) {
            datasource.setPageSize(pageSize);
            changed = true;
        }

        this.paging = {
            pageSize: pageSize !== undefined ? pageSize : datasource.getPageSize(),
            offset: offset !== undefined ? offset : datasource.getOffset()
        };

        if (changed) {
            mx.logger.debug(".updateDatasource changed", offset, pageSize);
            this.widget.__customWidgetPagingLoading = true;
            this.showLoader();
            this.widget.sequence([ "_sourceReload", "_renderData" ], () => {
                this.widget.__customWidgetPagingLoading = false;
                resetListViewHeight(this.widget.domNode);
                mx.logger.debug(".updateDatasource updated");
                this.hideLoader();
            });
        }
    }
}
