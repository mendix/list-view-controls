import { ChangeEvent, Component, createElement } from "react";

import "./ui/TextBoxSearch.scss";

export interface TextBoxSearchProps {
    defaultQuery: string;
    placeholder?: string;
    onTextChange: (query: string) => void;
}

interface TextBoxSearchState {
    query: string;
}

export class TextBoxSearch extends Component<TextBoxSearchProps, TextBoxSearchState> {
    private searchTimeOut = 500;
    private updateHandle: number;

    constructor(props: TextBoxSearchProps) {
        super(props);

        this.state = { query: this.props.defaultQuery };
        this.resetQuery = this.resetQuery.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        return createElement("div",
            {
                className: "search-bar"
            },
            createElement("input", {
                className: "form-control",
                onChange: this.handleOnChange,
                placeholder: this.props.placeholder,
                value: this.state.query
            }),
            this.renderReset()
        );
    }

    renderReset() {
        if (this.state.query) {
            return createElement("button",
                {
                    className: `btn-transparent visible`,
                    onClick: this.resetQuery
                },
                createElement("span", { className: "glyphicon glyphicon-remove" })
            );
        }

        return null;
    }

    componentWillReceiveProps(newProps: TextBoxSearchProps) {
        if (this.state.query !== newProps.defaultQuery) {
            this.setState({ query: this.props.defaultQuery });
        }
    }

    private handleOnChange(event: ChangeEvent<HTMLSelectElement>) {
        const query = event.currentTarget.value;

        if (this.state.query !== query) {
            if (this.updateHandle) {
                window.clearTimeout(this.updateHandle);
            }
            this.updateHandle = window.setTimeout(() => {
                this.props.onTextChange(query);
            }, this.searchTimeOut);
        }
        this.setState({ query });
    }

    private resetQuery() {
        const query = "";

        this.setState({ query });
        this.props.onTextChange(query);
    }
}
