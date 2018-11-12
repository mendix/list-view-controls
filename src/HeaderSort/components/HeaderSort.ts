import { Component, createElement } from "react";
import * as classNames from "classnames";

export interface HeaderSortProps {
    caption: string;
    onClickAction?: (order: string) => void;
    sortOrder: SortOrder;
}

export type SortOrder = "" | "desc" | "asc";

export interface HeaderSortState {
    sortOrder: SortOrder;
}

export class HeaderSort extends Component<HeaderSortProps, HeaderSortState> {
    constructor(props: HeaderSortProps) {
        super(props);

        this.state = { sortOrder: this.props.sortOrder };

        this.handleClick = this.handleClick.bind(this);
    }

    componentWillReceiveProps(newProps: HeaderSortProps) {
        if (this.state.sortOrder !== newProps.sortOrder) {
            this.setState({ sortOrder: newProps.sortOrder });
        }
    }

    render() {
        return createElement("div", {
                className: "sort-header",
                onClick: this.handleClick
            },
            createElement("span", { className: "" }, this.props.caption),
            createElement("span", { className: classNames("sort-icon", this.state.sortOrder) })
        );
    }

    private handleClick() {
        const sortOrder = this.state.sortOrder !== "asc"
            ? "asc"
            : "desc";

        this.setState({ sortOrder });

        if (this.props.onClickAction) {
            this.props.onClickAction(sortOrder);
        }
    }
}
