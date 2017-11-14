import { Component, createElement } from "react";
import * as classNames from "classnames";

import { Alert } from "../Shared/components/Alert";
import { SharedUtils } from "../Shared/SharedUtils";
import { Validate } from "./Validate";
import { CheckboxFilter } from "./components/CheckBoxFilter";
import { ContainerProps } from "./components/CheckBoxFilterContainer";

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, {}> {
    constructor(props: ContainerProps) {
        super(props);
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-checkbox-filter", this.props.class),
                style: SharedUtils.parseStyle(this.props.style)
            },
            this.renderAlert(),
            createElement(CheckboxFilter, {
                handleChange:  () => { return; },
                isChecked: this.props.defaultChecked
            })
        );
    }

    private renderAlert() {
        return createElement(Alert, {
            className: "widget-checkbox-filter-alert",
            message: Validate.validateProps({ ...this.props as ContainerProps, isWebModeler: true })
        });
    }
}

export function getVisibleProperties(valueMap: ContainerProps, visibilityMap: any) {
    visibilityMap.attribute = valueMap.filterBy === "attribute";
    visibilityMap.attributeValue = valueMap.filterBy === "attribute";
    visibilityMap.constraint = valueMap.filterBy === "XPath";
    visibilityMap.unCheckedAttribute = valueMap.unCheckedFilterBy === "attribute";
    visibilityMap.unCheckedAttributeValue = valueMap.unCheckedFilterBy === "attribute";
    visibilityMap.unCheckedConstraint = valueMap.unCheckedFilterBy === "XPath";

    return visibilityMap;
}
