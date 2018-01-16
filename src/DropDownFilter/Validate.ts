import { ReactChild, createElement } from "react";
import { ContainerProps } from "./components/DropDownFilterContainer";

export class Validate {
    static validateProps(props: ContainerProps): ReactChild {
        const errorMessages: string[] = [];

        props.filters.forEach((filter, index) => {
            if (filter.filterBy === "XPath" && !filter.constraint) {
                errorMessages.push(`Filter position: {${index + 1 }} is missing XPath constraint`);
            }
            if (filter.filterBy === "attribute" && !filter.attribute) {
                errorMessages.push(`Filter position: {${index + 1 }} 'Attribute' is required`);
            }
            if (filter.filterBy === "attribute" && !filter.attributeValue) {
                errorMessages.push(`Filter position: {${index + 1 }} 'Attribute value' is required`);
            }
        });
        if (props.filters.filter(filter => filter.isDefault).length > 1) {
            errorMessages.push("Should only have one filter set as default");
        }

        if (errorMessages.length) {
            return createElement("div", {},
                "Configuration error in widget:",
                errorMessages.map((message, key) => createElement("p", { key }, message))
            );
        }

        return "";
    }

}
