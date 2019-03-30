import * as dijitRegistry from "dijit/registry";

import { DataSourceHelperListView } from "./DataSourceHelper/DataSourceHelper";

export class SharedContainerUtils {
    static findTargetListView(filterNode: HTMLElement | null, listViewEntity?: string): DataSourceHelperListView | undefined {
        let targetListView: DataSourceHelperListView | undefined;

        while (filterNode) {
            const targetNodes = filterNode.querySelectorAll(`.mx-listview`);

            if (filterNode.isEqualNode(document) || !filterNode.classList || filterNode.classList.contains("mx-incubator")
                || filterNode.classList.contains("mx-offscreen")) {
                break;
            }

            for (let count = 0; count < targetNodes.length; count++) { //tslint:disable-line
                targetListView = dijitRegistry.byNode(targetNodes.item(count) as HTMLElement);

                if (targetListView && !listViewEntity) { // returns the first found list view
                    return targetListView;
                }

                if (targetListView && (targetListView._entity === listViewEntity)) {
                    return targetListView;
                }
            }
            filterNode = filterNode.parentNode as HTMLElement;
        }

        return targetListView;
    }
}
