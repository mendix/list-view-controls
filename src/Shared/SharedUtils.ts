export interface WrapperProps {
    uniqueid: string;
    class: string;
    style: string;
    friendlyId: string;
    mxform: mxui.lib.form._FormBase;
    mxObject: mendix.lib.MxObject;
}

export interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        setOffset: (offSet: number) => void;
        setPageSize: (pageSize: number) => void;
        _constraints: Constraints;
        _entity: string;
        _pageObjs: any[];
        _sorting: string[][];
        getOffset: () => number;
        getPageSize: () => number;
        getSetSize: () => number;
        __customWidgetPagingOffset: number;
    };
    _entity: string;
    _renderData: () => void;
    _showLoadingIcon: () => void;
    _sourceReload: () => void;
    friendlyId: string;
    datasource: {
        type: "microflow" | "entityPath" | "database" | "xpath";
    };
    update: (obj: mendix.lib.MxObject | null, callback?: () => void) => void;
    sequence: (sequence: string[], callback?: () => void) => void;
}

export interface OfflineConstraint {
    attribute: string;
    operator: string;
    value: string;
    path?: string;
}

export interface GroupedOfflineConstraint {
    constraints: OfflineConstraint[];
    operator: "or" | "and";
}

export type Constraints = (GroupedOfflineConstraint | OfflineConstraint)[] | string;

export const paginationTopicSuffix = "_paginationUpdate";

export const StoreState = <T>(form: mxui.lib.form._FormBase, uniqueid: string) => (state: T) => {
    const viewState = form.viewState && form.viewState[uniqueid];
    form.viewState[uniqueid] = { ...viewState, ...(state as any) };
};

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

    static validateCompatibility(props: { listViewEntity?: string, targetListView?: ListView; }): string {
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
        if (targetListView._entity && listViewEntity !== targetListView._entity) {
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
