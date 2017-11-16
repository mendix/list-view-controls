import { ContainerProps } from "./components/CheckBoxFilterContainer";

export class Validate {
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
        if (!props.isWebModeler) {
            if (window.mx.isOffline() && props.filterBy === "XPath") {
                errorMessage.push("Filter by 'XPath' is not supported in offline mode");
            }
            if (window.mx.isOffline() && props.unCheckedFilterBy === "XPath") {
                errorMessage.push("Unchecked filter by 'XPath' is not supported in offline mode");
            }
            if (!props.mxObject && props.filterBy === "XPath" && props.constraint.indexOf("[%CurrentObject%]'") > -1) {
                errorMessage.push("Requires a context object");
            }
        }

        if (errorMessage.length) {
            return `${widgetName} : ${errorMessage.join(", ")}`;
        }

        return "";
    }
}
