import * as dijitRegistry from "dijit/registry";

import { DataSourceHelperListView } from "./DataSourceHelper/DataSourceHelper";

export class SharedContainerUtils {
    static findTargetListView(filterNode: HTMLElement | null, listViewEntity?: string): DataSourceHelperListView | undefined {
        console.log("LAUREN findTargetListView listViewEntity: " + listViewEntity); // testing only
        let targetListView: DataSourceHelperListView | undefined;

        while (filterNode) {
            const targetNodes = filterNode.querySelectorAll(`.mx-listview`);

            for (let count = 0; count < targetNodes.length; count++) { //tslint:disable-line
                targetListView = dijitRegistry.byNode(targetNodes.item(count) as HTMLElement);

                if (targetListView && !listViewEntity) { // returns the first found list view
                    return targetListView;
                }

                if (targetListView && (targetListView._entity === listViewEntity)) {
                    return targetListView;
                }
            }

            if (filterNode.isEqualNode(document) || !filterNode.classList || filterNode.classList.contains("mx-incubator")
                || filterNode.classList.contains("mx-offscreen")) {
                break;
            }

            filterNode = filterNode.parentNode as HTMLElement;
        }

        return targetListView;
    }

    static findListViewByClassName(filterNode: HTMLElement | null, filterClassName?: string, listViewEntity?: string): DataSourceHelperListView | undefined {
        console.log("LAUREN findListViewByClassName listViewEntity: " + listViewEntity); // testing only
        console.log("LAUREN findListViewByClassName filterClassName: " + filterClassName); // testing only
        let targetListView: DataSourceHelperListView | undefined;

        while (filterNode) {
            // const targetNodes = filterNode.querySelectorAll(`.mx-name-listViewItem`);
            console.log("LAUREN findlistViewByClassName actual class name: " + `.mx-name-` + filterClassName);
            const targetNodes = filterNode.querySelectorAll(`.mx-name-` + filterClassName);

            for (let count = 0; count < targetNodes.length; count++) { //tslint:disable-line
                targetListView = dijitRegistry.byNode(targetNodes.item(count) as HTMLElement);
                // targetListView = dijitRegistry.byId("mxui_widget_ListView_0");

                if (targetListView && !listViewEntity) { // returns the first found list view
                    return targetListView;
                }

                if (targetListView && (targetListView._entity === listViewEntity)) {
                    return targetListView;
                }
            }

            if (filterNode.isEqualNode(document) || !filterNode.classList || filterNode.classList.contains("mx-incubator")
                || filterNode.classList.contains("mx-offscreen")) {
                break;
            }

            filterNode = filterNode.parentNode as HTMLElement;
        }

        return targetListView;
    }
}
