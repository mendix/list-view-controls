import { DataSourceHelperListView } from "./DataSourceHelper/DataSourceHelper";

export interface WrapperProps {
    uniqueid: string;
    class: string;
    style: string;
    friendlyId: string;
    mxform: mxui.lib.form._FormBase;
    mxObject: mendix.lib.MxObject;
}

export interface GroupedOfflineConstraint {
    constraints: mendix.lib.dataSource.OfflineConstraint[];
    operator: "or" | "and";
}

export type Constraint = string | mendix.lib.dataSource.OfflineConstraint | mendix.lib.dataSource.GroupedOfflineConstraint;
export type Constraints = (mendix.lib.dataSource.OfflineConstraint | mendix.lib.dataSource.GroupedOfflineConstraint)[] | string;

export class SharedUtils {
    static parseStyle(style = ""): {[key: string]: string} {
        try {
            return style.split(";").reduce<{[key: string]: string}>((styleObject, line) => {
                const pair = line.split(":");
                if (pair.length === 2) {
                    const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                    styleObject[name] = pair[1].trim();
                }
                return styleObject;
            }, {});
        } catch (error) {
            // tslint:disable-next-line no-console
            window.console.log("Failed to parse style", style, error);
        }

        return {};
    }

    static validateCompatibility(props: { listViewEntity?: string, targetListView?: DataSourceHelperListView }): string {
        const { listViewEntity, targetListView } = props;
        const type = targetListView && targetListView.datasource && targetListView.datasource.type;

        if (!targetListView) {
            let errorMessage = "This widget is unable to find a list view ";
            errorMessage += listViewEntity ? `with the supplied entity '${listViewEntity}'` : "to connect";

            return errorMessage;
        }
        if (type && type !== "database" && type !== "xpath") {
            return "This widget is only compatible with list view data source type 'Database' and 'XPath'";
        }
        if (!(targetListView && targetListView._datasource && targetListView._entity && targetListView.update)) {
            return "This widget version is not compatible with this Mendix version";
        }
        if (targetListView._entity && listViewEntity !== undefined && listViewEntity !== targetListView._entity) {
            return `The supplied entity "${props.listViewEntity}" does not belong to list view data source`;
        }

        return "";
    }

    static findTargetNode(filterNode: HTMLElement): HTMLElement | null {
        let targetNode: HTMLElement | null = null ;

        while (!targetNode && filterNode) {
            targetNode = filterNode.querySelectorAll(`.mx-listview`)[0] as HTMLElement;
            if (targetNode || filterNode.isEqualNode(document) || !filterNode.classList || filterNode.classList.contains("mx-incubator")
                    || filterNode.classList.contains("mx-offscreen")) {
                break;
            }
            filterNode = filterNode.parentNode as HTMLElement;
        }

        return targetNode;
    }

}
