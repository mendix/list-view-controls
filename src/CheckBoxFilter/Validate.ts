import { ContainerProps } from "./components/CheckBoxFilterContainer";

export class Validate {
    static validateProps(props: ContainerProps & { isWebModeler?: boolean }): string {
        const widgetName = "List view controls Check box filter";
        const errorMessage = [];

        if (props.filterBy === "XPath" && !props.constraint) {
            errorMessage.push("The checked 'XPath constraint' is required when 'Filter by' is set to 'XPath'");
        }
        if (props.filterBy === "attribute" && !props.attribute) {
            errorMessage.push("The checked 'Attribute' is required when 'Filter by' is set to 'Attribute'");
        }
        if (props.filterBy === "attribute" && !props.attributeValue) {
            errorMessage.push("The checked 'Attribute value' is required when 'Filter by' is set to 'Attribute'");
        }
        if (props.unCheckedFilterBy === "XPath" && !props.unCheckedConstraint) {
            errorMessage.push("The unchecked 'XPath constraint' is required when 'Filter by' is set to 'XPath'");
        }
        if (props.unCheckedFilterBy === "attribute" && !props.unCheckedAttribute) {
            errorMessage.push("The unchecked 'Attribute' is required when 'Filter by' is set to 'Attribute'");
        }
        if (props.unCheckedFilterBy === "attribute" && !props.unCheckedAttributeValue) {
            errorMessage.push("The unchecked 'Attribute value' is required when 'Filter by' is set to 'Attribute'");
        }
        if (!props.isWebModeler) {
            if (window.mx.isOffline() && props.filterBy === "XPath") {
                errorMessage.push("The checked 'Filter by' 'XPath' is not supported for offline application");
            }
            if (window.mx.isOffline() && props.unCheckedFilterBy === "XPath") {
                errorMessage.push("The unchecked 'Filter by' 'XPath' is not supported for offline application");
            }
            if (!props.mxObject && props.filterBy === "XPath" && props.constraint.indexOf("[%CurrentObject%]'") > -1) {
                errorMessage.push("The checked 'XPath constraint', requires a context object");
            }
            if (!props.mxObject && props.unCheckedFilterBy === "XPath" && props.unCheckedConstraint.indexOf("[%CurrentObject%]'") > -1) {
                errorMessage.push("The unchecked 'XPath constraint', requires a context object");
            }
        }

        if (errorMessage.length) {
            return `${widgetName} : ${errorMessage.join(", ")}`;
        }

        return "";
    }
}
