import { ContainerProps } from "./components/DropDownFilterContainer";

export class Validate {
    static validateProps(props: ContainerProps): string {
        const widgetName = props.friendlyId;

        if (props.filters && !props.filters.length) {
            return `${widgetName}: should have at least one filter`;
        }

        if (props.filters) {
            const errorMessage: string[] = [];
            props.filters.forEach((filter, index) => {
                if (filter.filterBy === "XPath" && !filter.constraint) {
                    errorMessage.push(`Filter position: {${index + 1 }} is missing XPath constraint`);
                }
                if (filter.filterBy === "attribute" && !filter.attributeValue) {
                    errorMessage.push(`Filter position: {${index + 1 }} is missing a Value constraint`);
                }
            });
            if (errorMessage.length) {
                return `${widgetName} : ${errorMessage.join(", ")}`;
            }
        }
        if (props.filters.filter(filter => filter.isDefault).length > 1) {
            return `${widgetName}: should only have one filter set as default`;
        }

        return "";
    }

}
