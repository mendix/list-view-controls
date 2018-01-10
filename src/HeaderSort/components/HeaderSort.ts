import { Component, createElement } from "react";
import * as classNames from "classnames";

export interface HeaderSortProps {
    caption: string;
    onClickAction?: (attribute: string, order: string) => void;
    sortAttribute: string;
    sortOrder: SortOrder;
    initialSorted: boolean;
}

export type SortOrder = "desc" | "asc";
type StateSortOrder = "" | SortOrder;

export interface HeaderSortState {
    sortOrder: StateSortOrder;
    isClicked: boolean;
}

export class HeaderSort extends Component<HeaderSortProps, HeaderSortState> {
    constructor(props: HeaderSortProps) {
        super(props);

        this.state = {
            isClicked: false,
            sortOrder: this.getInitialState(this.props)
        };

        this.handleClick = this.handleClick.bind(this);
    }

    componentWillReceiveProps(newProps: HeaderSortProps) {
        if (this.state.sortOrder !== newProps.sortOrder) {
            if (this.state.isClicked) {
                this.setState({
                    sortOrder: newProps.sortOrder
                });
            } else {
                this.setState({
                    sortOrder: this.getInitialState(newProps)
                });
            }
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

    private getInitialState(props: HeaderSortProps): StateSortOrder {
        if (props.initialSorted) {
            return props.sortOrder;
        }
        return "";
    }

    private handleClick() {
        this.setState({ isClicked: true });
        const sortOrder = this.state.sortOrder !== "asc"
            ? "asc"
            : "desc";

        this.setState({ sortOrder });

        if (this.props.sortAttribute && this.props.onClickAction) {
            this.props.onClickAction(this.props.sortAttribute, sortOrder);
        }
    }
}
