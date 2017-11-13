import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";
import { Alert } from "./components/Alert";

import { DropDownFilter, DropDownFilterProps } from "./components/DropDownFilter";
import { ContainerProps, ContainerState } from "./components/DropDownFilterContainer";
import { Utils, parseStyle } from "./utils/ContainerUtils";

// tslint:disable-next-line class-name
export class preview extends Component<ContainerProps, ContainerState> {
    constructor(props: ContainerProps) {
        super(props);

        this.state = { listviewAvailable: true };
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-drop-down-filter", this.props.class),
                style: parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderDropDownFilter()
        );
    }

    componentDidMount() {
        this.validateConfigs();
    }

    componentWillReceiveProps(_newProps: ContainerProps) {
        this.validateConfigs();
    }

    private validateConfigs() {
        // validate filter values if filterby is attribute, then value should not be empty or "" or " ".
        const routeNode = findDOMNode(this) as HTMLElement;
        const targetNode = Utils.findTargetNode(routeNode);

        if (targetNode) {
            this.setState({ targetNode });
        }
        this.setState({ listviewAvailable: true, targetNode });
    }

    private renderAlert() {
        const message = Utils.validateProps({
            ...this.props as ContainerProps
        });

        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-drop-down-filter-alert",
            message
        });
    }

    private renderDropDownFilter(): ReactElement<DropDownFilterProps> {
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
            visibilityMap.filters.filterBy = true;
            visibilityMap.filters.value = true;
            visibilityMap.filters.constraint = false;
        } else if (filterAttribute.filterBy === "XPath") {
            visibilityMap.filters.attribute = false;
            visibilityMap.filters.filterBy = true;
            visibilityMap.filters.value = false;
            visibilityMap.filters.constraint = true;
        }
    });

    return visibilityMap;
}
