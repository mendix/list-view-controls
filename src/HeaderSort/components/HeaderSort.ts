import { Component, createElement } from "react";
import * as classNames from "classnames";

export interface HeaderSortProps {
    caption: string;
    friendlyId?: string;
    initialSorted: boolean;
    onClickAction?: (attribute: string, order: string) => void;
    publishedSortAttribute?: string;
    publishedSortOrder?: SortOrder;
    publishedSortWidgetFriendlyId?: string;
    sortAttribute: string;
    sortOrder: SortOrder;
}

export type SortOrder = "desc" | "asc";

export interface HeaderSortState {
    sortOrder: SortOrder;
}

export class HeaderSort extends Component<HeaderSortProps, HeaderSortState> {
    constructor(props: HeaderSortProps) {
        super(props);

        this.state = { sortOrder: this.getInitialState(this.props) };

        this.handleClick = this.handleClick.bind(this);
    }

    componentWillReceiveProps(newProps: HeaderSortProps) {
        if (this.state.sortOrder !== newProps.sortOrder) {
            this.setState({ sortOrder: newProps.sortOrder });
        }

        // Received update from one of the widgets
        if (newProps.publishedSortAttribute && newProps.publishedSortOrder) {
            if (this.props.friendlyId === newProps.publishedSortWidgetFriendlyId) {
                this.setState({ sortOrder: newProps.publishedSortOrder });
            } else {
                this.setState({ sortOrder: null });
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

    private getInitialState(props: HeaderSortProps): SortOrder {
        if (props.initialSorted) {
            return props.sortOrder;
        }

        return null;
    }

    private handleClick() {
        const sortOrder = this.state.sortOrder !== "asc"
            ? "asc"
            : "desc";

        this.setState({ sortOrder });

        if (this.props.sortAttribute && this.props.onClickAction) {
            this.props.onClickAction(this.props.sortAttribute, sortOrder);
        }
    }
}
