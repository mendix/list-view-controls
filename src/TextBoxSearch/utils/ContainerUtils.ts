import { ContainerProps } from "../components/TextBoxSearchContainer";
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
        window.console.log("Failed to parse style", style, error);
    }

    return {};
};

export class Utils {
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

    static validateProps(props: ContainerProps): string {
        if (props.entity) {
            return `${props.friendlyId}: Requires a list view entity`;
        }
        if (props.attributeList && props.attributeList.length === 0) {
            return `${props.friendlyId}: Requires atleast a one attribute`;
        }
        if (props.attributeList && props.attributeList.length) {
            if (props.attributeList.filter(attribute => attribute.attribute.trim() === "").length) {
                return `${props.friendlyId}: Atleast one attribute is empty, select an attribute`;
            }
        }
        return "";
    }

    static validateCompatibility(props: ContainerProps & { targetListView: ListView }): string {
        const widgetName = props.friendlyId;
        if (!(props.targetListView && props.targetListView._datasource)) {
            return `${widgetName}: Unable to find a listview with to connect`;
        }
        if (props.entity && !Utils.itContains(props.entity, "/")) {
            if (props.entity !== props.targetListView._entity) {
                return `${widgetName}: Supplied entity "${props.entity}" does not belong to list view data source`;
            }
        }
        return "";
    }

    static itContains(array: string[] | string, element: string) {
        return array.indexOf(element) > -1;
    }
}
