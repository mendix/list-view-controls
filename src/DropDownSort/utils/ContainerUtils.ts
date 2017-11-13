import { OptionHTMLAttributes } from "react";

import { DropDownOptionType } from "../components/DropDownSort";
import { AttributeType, ContainerProps } from "../components/DropDownSortContainer";
import { ListView } from "mendix-data-source-helper";

export interface OptionHTMLAttributesType extends OptionHTMLAttributes<HTMLOptionElement> { key: string; }

export const createOptionProps = (sortAttributes: AttributeType[]): DropDownOptionType[] => sortAttributes.map((optionObject, index) => {
    const { name, caption, defaultSelected, sort } = optionObject;
    const value = `${name}-${index}`;
    return { name, caption, defaultSelected, sort, value };
});

export const parseStyle = (style = ""): { [key: string]: string } => {
    try {
        return style.split(";").reduce<{ [key: string]: string }>((styleObject, line) => {
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
    static validateProps(props: ContainerProps): string {
        const widgetName = props.friendlyId;

        if (props.sortAttributes && !props.sortAttributes.length) {
            return `${widgetName}: should have at least one filter`;
        }

        if (props.sortAttributes) {
            const errorMessage: string[] = [];
            props.sortAttributes.forEach((sortAttribute) => {
                if (sortAttribute.caption === "") {
                    errorMessage.push("sort caption is required");
                }
                if (sortAttribute.name === "" && !sortAttribute.name) {
                    errorMessage.push("Atleast one sort attribute is required");
                }
            });

            if (errorMessage.length) {
                return `${widgetName} : ${errorMessage.join(", ")}`;
            }
        }

        return "";
    }

    static validateCompatibility(props: ContainerProps & { targetListView: ListView | null }): string {
        const { targetListView } = props;
        const type = targetListView && targetListView.datasource && targetListView.datasource.type;
        const widgetName = props.friendlyId;

        if (!targetListView) {
            return `${widgetName}: unable to find a list view to connect`;
        }
        if (type && type !== "database" && type !== "xpath") {
            return `${widgetName}, widget is only compatible with list view data source type 'Database' and 'XPath'`;
        }
        if (!(targetListView && targetListView._datasource && targetListView._entity && targetListView.update)) {
            return `${widgetName}: this Mendix version is incompatible`;
        }
        if (targetListView._entity && props.entity !== targetListView._entity) {
            return `${widgetName}: supplied entity "${props.entity}" does not belong to list view data source`;
        }

        return "";
    }

    static findTargetNode(filterNode: HTMLElement): HTMLElement | null {
        let targetNode: HTMLElement | null = null;

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
