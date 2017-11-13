import { ContainerProps } from "../components/CheckBoxFilterContainer";
import { ListView } from "mendix-data-source-helper";

export const parseStyle = (style = ""): {[key: string]: string} => {
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
};

export class Utils {
    static validateProps(props: ContainerProps & { isWebModeler?: boolean }): string {
        const widgetName = props.friendlyId;
        const errorMessage = [];

        if (props.filterBy === "XPath" && !props.constraint) {
            errorMessage.push("Filter by 'XPath' requires an 'XPath constraint'");
        }
        if (props.filterBy === "attribute" && !props.attribute) {
            errorMessage.push("Filter by 'Attribute' requires an 'Attribute'");
        }
        if (props.filterBy === "attribute" && !props.attributeValue) {
            errorMessage.push("Filter by 'Attribute' requires an 'Attribute value'");
        }
        if (props.unCheckedFilterBy === "XPath" && !props.unCheckedConstraint) {
            errorMessage.push("Unchecked filter by 'XPath' requires an 'XPath constraint'");
        }
        if (props.unCheckedFilterBy === "attribute" && !props.unCheckedAttribute) {
            errorMessage.push("Unchecked filter by 'Attribute' requires an 'Attribute'");
        }
        if (props.unCheckedFilterBy === "attribute" && !props.unCheckedAttributeValue) {
            errorMessage.push("Unchecked filter by 'Attribute' requires an 'Attribute value'");
        }
        if (!props.isWebModeler && window.mx.isOffline() && props.filterBy === "XPath") {
            errorMessage.push("Filter by 'XPath' is not supported in offline mode");
        }
        if (!props.isWebModeler && window.mx.isOffline() && props.unCheckedFilterBy === "XPath") {
            errorMessage.push("Unchecked filter by 'XPath' is not supported in offline mode");
        }
        if (!props.isWebModeler && !props.mxObject && props.filterBy === "XPath" && props.constraint.indexOf("[%CurrentObject%]'") > -1) {
            errorMessage.push("Requires a context object");
        }

        if (errorMessage.length) {
            return `${widgetName} : ${errorMessage.join(", ")}`;
        }

        return "";
    }

    static validateCompatibility(props: ContainerProps & { targetListView: ListView; }): string {
        const { targetListView } = props;
        const type = targetListView && targetListView.datasource && targetListView.datasource.type;
        const widgetName = props.friendlyId;

        if (!targetListView) {
            return `${widgetName}: Unable to find a list view to connect`;
        }
        if (type && type !== "database" && type !== "xpath") {
            return `${widgetName}: Widget is only compatible with list view data source type 'Database' and 'XPath'`;
        }
        if (!(targetListView && targetListView._datasource && targetListView._entity && targetListView.update)) {
            return `${widgetName}: This Mendix version is incompatible`;
        }
        if (targetListView._entity && props.listViewEntity !== targetListView._entity) {
            return `${widgetName}: Supplied entity "${props.listViewEntity}" does not belong to list view data source`;
        }

        return "";
    }

    static findTargetNode(filterNode: HTMLElement): HTMLElement | null {
        let targetNode: HTMLElement | null = null ;

        while (!targetNode && filterNode) {
            targetNode = filterNode.querySelectorAll(`.mx-listview`)[0] as HTMLElement;
            if (targetNode || filterNode.isEqualNode(document) || filterNode.classList.contains("mx-incubator")
                    || filterNode.classList.contains("mx-offscreen")) {
                break;
            }
            filterNode = filterNode.parentNode as HTMLElement;
        }

        return targetNode;
    }

    static itContains(array: string[] | string, element: string) {
        return array.indexOf(element) > -1;
    }
}
