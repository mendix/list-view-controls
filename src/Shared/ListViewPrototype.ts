import { DataSourceHelperListView, Paging } from "./DataSourceHelper/DataSourceHelper";
import { v4 as uuid } from "uuid";

// Originally the the list view controls always reset the offset to 0 and remove the filtering and sorting
// To optimize the network call we need to overwrite this behavior when filtering and sorting is set on a list view
// Also the restore of the state when navigating back to the list view from a detail page need to restore the state.
// WARNING: Please dont copy the practice, fiddling with prototypes is bad practice
// It could brake the widgets in future platform updates.

(() => {
    const ListView: DataSourceHelperListView = mxui.widget.ListView as any;

    if (!ListView.prototype.__lvcPrototypeUpdated && listviewPrototypeCompatible(ListView.prototype)) {
        ListView.prototype.__lvcPrototypeUpdated = true;
        ListView.prototype.__postCreateOriginal = ListView.prototype.postCreate;
        ListView.prototype.postCreate = function(this: DataSourceHelperListView) {
            mx.logger.debug("list view control, overwrites postCreate prototype");
            this.__postCreateOriginal();
            if (!listviewInstanceCompatible(this)) return;

            const paging = this.getState("lvcPaging") as Paging;
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
        };

        ListView.prototype.__loadDataOriginal = ListView.prototype._loadData;
        ListView.prototype._loadData = function(this: DataSourceHelperListView, callback: () => void) {
            mx.logger.debug("List view control, overwrites _loadData prototype");
            if (!listviewInstanceCompatible(this)) {
                this.__loadDataOriginal(callback);
                return;
            }
            const loadId = this._lastLoadId = uuid();

            if (this.__lvcPagingEnabled) {
                // Prevent default behavior to reset of offset
                this._datasource.setOffset(0);
            }
            this._datasource.reload(() => {
                // Applying logic to avoid wrong rendering of elements
                if (this._lastLoadId !== loadId) {
                    if (callback) {
                        callback();
                    }
                    return;
                }

                const offset = this._datasource.getOffset();
                if (offset && this._datasource.getSetSize() <= offset) {
                    // When data set is filtered/restored and an offset page shows with no items,
                    // it needs to be reset the offset to 0 and reload
                    this._datasource.setOffset(0);
                    this._loadData(callback);
                    return;
                }
                this._renderData(() => {
                    this._onLoad();
                    if (callback) {
                        callback();
                    }
                });
            });
        };
    } else {
        mx.logger.debug("Prototype update called unexpected again");
    }

    function listviewPrototypeCompatible(listview: DataSourceHelperListView) {
        const compatible = !!(listview
            && listview.postCreate
            && listview._loadData
            && listview.getState
            && listview._onLoad
            && listview._renderData
        );
        if (!compatible) {
            mx.logger.error("This Mendix version is not compatible with list view controls. The List view prototype could not be updated.");
        }
        return compatible;
    }

    function listviewInstanceCompatible(listview: DataSourceHelperListView) {
        const ignore = !!(listview
            && !(listview.datasource.type === "database" || listview.datasource.type === "xpath"));
        if (ignore) {
            return false;
        }
        const compatible = !!(listview
            && (listview.datasource.type === "database" || listview.datasource.type === "xpath")
            && listview._datasource
            && listview._datasource.reload
            && listview._datasource.setOffset
            && listview._datasource.setPageSize
            && listview._datasource._constraints !== undefined
            && (listview._datasource._sorting || listview._datasource._sort)
            && listview._datasource.getSetSize
            && listview._datasource.getOffset
        );
        if (!compatible) {
            mx.logger.error("This Mendix version is not compatible with list view controls. The List view controls use is limited.");
        }
        return compatible;
    }
})();
