import { Component, ReactNode, createElement } from "react";
import * as classNames from "classnames";

import { Alert } from "../Shared/components/Alert";
import { SharedUtils } from "../Shared/SharedUtils";
import { Validate } from "./Validate";

import { DropDownFilter } from "./components/DropDownFilter";
import { ContainerProps } from "./components/DropDownFilterContainer";

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps> {

    render() {
        return createElement("div",
            {
                className: classNames("widget-drop-down-filter", this.props.class),
                style: SharedUtils.parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderDropDownFilter()
        );
    }

    private renderAlert() {
        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-drop-down-filter-alert"
        }, Validate.validateProps({ ...this.props as ContainerProps, isWebModeler: true }));
    }

    private renderDropDownFilter(): ReactNode {
        const { filters } = this.props;
        const defaultFilterIndex = filters.indexOf(filters.filter(value => value.isDefault)[0]);

        return createElement(DropDownFilter, {
            defaultFilterIndex,
            filters: this.props.filters,
            handleChange: () => { return; }
        });
    }
}

export function getVisibleProperties(valueMap: ContainerProps, visibilityMap: any) {
    valueMap.filters.forEach(filterAttribute => {
        if (filterAttribute.filterBy === "attribute") {
            visibilityMap.filters.attribute = true;
            visibilityMap.filters.value = true;
            visibilityMap.filters.constraint = false;
        } else if (filterAttribute.filterBy === "XPath") {
            visibilityMap.filters.attribute = false;
            visibilityMap.filters.value = false;
            visibilityMap.filters.constraint = true;
        }
    });

    return visibilityMap;
}
