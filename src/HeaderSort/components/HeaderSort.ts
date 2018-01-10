import { Component, createElement } from "react";
import * as classNames from "classnames";

import { AttributeType } from "./HeaderSortContainer";

export interface SortOptionType extends AttributeType {
    value: string;
}

export interface HeaderSortProps {
    caption: string;
    onClickAction?: (attribute: string, order: string) => void;
    sortAttributes: AttributeType[];
    sortOrder: string;
    style: object;
}

export interface HeaderSortState {
    sortOrder: string;
}

export class HeaderSort extends Component<HeaderSortProps, HeaderSortState> {
    constructor(props: HeaderSortProps) {
        super(props);

        this.state = {
            sortOrder: this.props.sortOrder
        };

        this.handleClick = this.handleClick.bind(this);
    }

    componentWillReceiveProps(newProps: HeaderSortProps) {
        this.setState({
            sortOrder: newProps.sortOrder
        });
    }

    render() {
        return createElement("div", {
                className: "sort-header",
                onClick: this.handleClick
            },
            createElement("span", { className: "" }, this.props.caption),
            createElement("span", { className: classNames("sortIcon", this.state.sortOrder) })
        );
    }

    private handleClick() {
        const sortOrder = this.state.sortOrder;

        if (sortOrder !== "asc") {
            this.setState({ sortOrder: "asc" });
        } else {
            this.setState({ sortOrder: "desc" });
        }
        const primarySort = this.props.sortAttributes.filter(sortAttribute => sortAttribute.isPrimary)[0];

        if (primarySort && this.props.onClickAction) {
            this.props.onClickAction(primarySort.name, this.state.sortOrder);
        }
    }
}
