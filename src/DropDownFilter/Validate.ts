import { ContainerProps } from "./components/DropDownFilterContainer";

export class Validate {
    static validateProps(props: ContainerProps): string {
        const widgetName = props.friendlyId;
        const errorMessage: string[] = [];

        props.filters.forEach((filter, index) => {
            if (filter.filterBy === "XPath" && !filter.constraint) {
                errorMessage.push(`Filter position: {${index + 1 }} is missing XPath constraint`);
            }
            if (filter.filterBy === "attribute" && !filter.attribute) {
                errorMessage.push(`Filter position: {${index + 1 }} 'Attribute' is required`);
            }
            if (filter.filterBy === "attribute" && !filter.attributeValue) {
                errorMessage.push(`Filter position: {${index + 1 }} 'Attribute value' is required`);
            }
        });
        if (props.filters.filter(filter => filter.isDefault).length > 1) {
            errorMessage.push("Should only have one filter set as default");
        }
        if (errorMessage.length) {
            return `${widgetName} : ${errorMessage.join(", ")}`;
        }

        return "";
    }

}
