import { ReactChild, createElement } from "react";
import { ContainerProps } from "./components/DropDownFilterContainer";

export class Validate {
    static validateProps(props: ContainerProps & { isWebModeler?: boolean }): ReactChild {
        const errorMessages: string[] = [];

        props.filters.forEach((filter, index) => {
            if ((props.isWebModeler || !window.mx.isOffline()) && filter.filterBy === "XPath" && !filter.constraint) {
                errorMessages.push(`Filter position: {${index + 1 }} is missing XPath constraint`);
            }
            if (filter.filterBy === "attribute" && !filter.attribute) {
                errorMessages.push(`Filter position: {${index + 1 }} 'Attribute' is required`);
            }
            if (filter.filterBy === "attribute" && !filter.attributeValue) {
                errorMessages.push(`Filter position: {${index + 1 }} 'Attribute value' is required`);
            }
            if ((props.isWebModeler || !window.mx.isOffline()) && !props.isWebModeler && filter.filterBy === "XPath" && filter.constraint.indexOf("[%CurrentObject%]'") > -1 && !props.mxObject) {
                errorMessages.push(`Filter position: {${index + 1 }} is XPath constraint, requires a context object`);
            }
            if (!props.isWebModeler && window.mx.isOffline()) {
                if (filter.filterBy === "attribute" && filter.attribute && filter.attribute.indexOf("/") > -1) {
                    errorMessages.push(`Filter position: {${index + 1 }} 'Attribute' over reference is not supported in offline mode`);
                }
                if (filter.filterBy === "XPath") {
                    errorMessages.push(`Filter position: {${index + 1 }}: 'Filter' on 'XPath' is not supported in offline mode`);
                }
                // The modeler handles 'XPath' offline validation
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
