import * as dojoConnect from "dojo/_base/connect";
import { DataSourceHelperListView, Paging } from "./DataSourceHelper/DataSourceHelper";

// Originally the the list view controls always reset the offset to 0 and remove the sorting
// To optimize the network call we need to overwrite this behavior when filtering and sorting is set on a list view
// Also the the restore of the state when navigating back to the list view from the a detail page need to rehandled
// Add store list view control sorting, paging and filtering.

export function updateListViewPrototype(widget: DataSourceHelperListView) {
    if (!widget.__proto__.__lvcPrototypeChanged && listviewPrototypeCompatible(widget)) {
        widget.__proto__.__lvcPrototypeChanged = true;
        widget.__proto__.postCreate = function(this: DataSourceHelperListView) {
            logger.debug("list view control, overwrites postCreate prototype");
            const paging = this.getState("lvcPaging") as Paging;
            if (paging) {
                // Reset the offset, prevent the list view _createSource to load more data than needed.
                // The offset and could be set after _createSource
                if (this.mxform.viewState[this.uniqueid]) {
                    this.mxform.viewState[this.uniqueid].datasourceOffset = 0;
                }
            }
            this._createSource();
            if (paging) {
                if (paging.offset !== undefined) {
                    this._datasource.setOffset(paging.offset);
                }
                if (paging.pageSize !== undefined) {
                    this._datasource.setPageSize(paging.pageSize);
                }
            }

            const sorting = this.getState("lvcSorting");
            if (sorting) {
                this._datasource._sorting = sorting;
            }

            const constraints = this.getState("lvcConstraints");
            if (constraints) {
                this._datasource._constraints = constraints;
            }

            this._itemList = [];
            this.templateMap = this.templateMap || [];
            this.selection = this.getState("selection", this.selection);

            const persistHandleListView = dojoConnect.connect(this.mxform, "onPersistViewState", null, (formViewState: any) => {
                const widgetViewState = formViewState[this.uniqueid] || (formViewState[this.uniqueid] = {});
                if (this.__customWidgetDataSourceHelper) {
                    widgetViewState.lvcPersistState = true;
                    widgetViewState.lvcSorting = this.__customWidgetDataSourceHelper.sorting;
                    widgetViewState.lvcConstraints = this.__customWidgetDataSourceHelper.constraints;
                    widgetViewState.lvcPaging = this.__customWidgetDataSourceHelper.paging;
                }
                dojoConnect.disconnect(persistHandleListView);
            });
        };

        // The first time the prototype is change the initial list view is already created
        // So first time, the state is not stored by the prototype, but is handled here
        const persistHandle = dojoConnect.connect(widget.mxform, "onPersistViewState", null, (formViewState: any) => {
            const widgetViewState = formViewState[widget.uniqueid] || (formViewState[widget.uniqueid] = {});
            if (widget.__customWidgetDataSourceHelper) {
                widgetViewState.lvcPersistState = true;
                widgetViewState.lvcSorting = widget.__customWidgetDataSourceHelper.sorting;
                widgetViewState.lvcConstraints = widget.__customWidgetDataSourceHelper.constraints;
                widgetViewState.lvcPaging = widget.__customWidgetDataSourceHelper.paging;
            }
            dojoConnect.disconnect(persistHandle);
        });

        widget.__proto__._loadData = function(this: DataSourceHelperListView, callback: () => void) {
            logger.debug("List view control, overwrites _loadData prototype");
            const paging = this.getState("lvcPaging") as Paging;
            if (!paging && this._datasource.__customWidgetPagingOffset === undefined) {
                // Prevent default behavior to reset of offset
                this._datasource.setOffset(0);
            }
            this._datasource.reload(() => {
                if (this._datasource.__customWidgetPagingOffset !== undefined && this._datasource.getSetSize() <= this._datasource.getOffset()) {
                    // When data set is filtered/restored and a offset page shows with no items,
                    // it need to be reset offset to 0 and reload
                    this._datasource.__customWidgetPagingOffset = undefined;
                    this._datasource.setOffset(0);
                    this._loadData(callback);
                }
                this._renderData(() => {
                    this._onLoad();
                    if (callback) {
                        callback();
                    }
                });
            });
        };
    }
}

export function listviewPrototypeCompatible(widget: DataSourceHelperListView) {
    const compatible = !!(widget
        && widget.templateMap
        && widget.selection
        && widget.mxform
        && widget.uniqueid
        && widget.getState
        && widget._itemList
        && widget._createSource
        && widget._loadData
        && widget._renderData
        && widget._onLoad
        && widget._datasource
        && widget._datasource.reload
        && widget._datasource.getSetSize
        && widget._datasource.getOffset
        && widget._datasource.setOffset
        && widget._datasource.setPageSize
        && widget._datasource._constraints !== undefined
        && widget._datasource._sorting
    );
    if (!compatible) {
        logger.error("This Mendix version is not compatible with list view controls. The List view prototype could not be updated.");
    }
    return compatible;
}
