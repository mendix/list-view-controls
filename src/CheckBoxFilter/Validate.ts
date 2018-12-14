import { ReactChild, createElement } from "react";
import { ContainerProps } from "./components/CheckBoxFilterContainer";

export class Validate {
    static validateProps(props: ContainerProps & { isWebModeler?: boolean }): ReactChild {
        const errorMessages = [];

        if ((props.isWebModeler || !window.mx.isOffline()) && props.filterBy === "XPath" && !props.constraint) {
            errorMessages.push("The checked 'XPath constraint' is required when 'Filter by' is set to 'XPath'");
        }
        if (props.filterBy === "attribute" && !props.attribute) {
            errorMessages.push("The checked 'Attribute' is required when 'Filter by' is set to 'Attribute'");
        }
        if (props.filterBy === "attribute" && !props.attributeValue) {
            errorMessages.push("The checked 'Attribute value' is required when 'Filter by' is set to 'Attribute'");
        }
        if ((props.isWebModeler || !window.mx.isOffline()) && props.unCheckedFilterBy === "XPath" && !props.unCheckedConstraint) {
            errorMessages.push("The unchecked 'XPath constraint' is required when 'Filter by' is set to 'XPath'");
        }
        if (props.unCheckedFilterBy === "attribute" && !props.unCheckedAttribute) {
            errorMessages.push("The unchecked 'Attribute' is required when 'Filter by' is set to 'Attribute'");
        }
        if (props.unCheckedFilterBy === "attribute" && !props.unCheckedAttributeValue) {
            errorMessages.push("The unchecked 'Attribute value' is required when 'Filter by' is set to 'Attribute'");
        }
        if (!props.isWebModeler) {
            if (window.mx.isOffline()) {
                if (props.filterBy === "XPath") {
                    errorMessages.push("The checked 'Filter by' 'XPath' is not supported for offline application");
                }
                if (props.filterBy === "attribute" && props.attribute.indexOf("/") > -1) {
                    errorMessages.push(`The checked 'Filter by' 'Attribute' over reference is not supported for offline application`);
                }
                if (props.unCheckedFilterBy === "XPath") {
                    errorMessages.push("The unchecked 'Filter by' 'XPath' is not supported for offline application");
                }
                if (props.unCheckedFilterBy === "attribute" && props.unCheckedAttribute.indexOf("/") > -1) {
                    errorMessages.push(`The unchecked 'Filter by' 'Attribute' over reference is not supported for offline application`);
                }
            }
            if (!props.mxObject && props.filterBy === "XPath" && props.constraint.indexOf("[%CurrentObject%]'") > -1) {
                errorMessages.push("The checked 'XPath constraint', requires a context object");
            }
            if (!props.mxObject && props.unCheckedFilterBy === "XPath" && props.unCheckedConstraint.indexOf("[%CurrentObject%]'") > -1) {
                errorMessages.push("The unchecked 'XPath constraint', requires a context object");
            }
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
