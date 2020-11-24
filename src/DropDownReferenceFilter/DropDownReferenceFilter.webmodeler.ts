import { Component, ReactNode, createElement } from "react";
import * as classNames from "classnames";

import { Alert } from "../Shared/components/Alert";
import { SharedUtils } from "../Shared/SharedUtils";
import { Validate } from "./Validate";

import { DropDownFilter } from "./components/DropDownFilter";
import { ContainerProps, FilterProps } from "./components/DropDownReferenceFilterContainer";

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
        return createElement(DropDownFilter, {
            defaultFilterIndex: this.props.defaultValue ? 1 : 0,
            filters: this.getFilters(),
            handleChange: () => { return; }
        });
    }

    private getFilters(): FilterProps[] {
        const filters: FilterProps[] = [ {
            caption: "",
            value: "",
            constraint: "",
            isDefault: !this.props.defaultValue
        } ];
        if (this.props.defaultValue) {
            filters.push({
                caption: this.props.defaultValue,
                value: this.props.defaultValue,
                constraint: "",
                isDefault: !this.props.defaultValue
            });
        }
        return filters;
    }
}
