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
    private searchTimeOut = 100;
    private updateHandle?: number;
    private resetQueryHandle = this.resetQuery.bind(this);
    private onChangeHandle = this.onChange.bind(this);

    readonly state: TextBoxSearchState = { query: this.props.defaultQuery };

    render() {
        return createElement("div",
            {
                className: "search-bar"
            },
            createElement("input", {
                className: "form-control",
                onChange: this.onChangeHandle,
                placeholder: this.props.placeholder,
                value: this.state.query
            }),
            this.renderReset()
        );
    }

    componentWillReceiveProps(newProps: TextBoxSearchProps) {
        if (this.state.query !== newProps.defaultQuery) {
            this.setState({ query: newProps.defaultQuery });
        }
    }

    private onChange(event: ChangeEvent<HTMLSelectElement>) {
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

    private renderReset() {
        if (this.state.query) {
            return createElement("button",
                {
                    className: `btn-transparent visible`,
                    onClick: this.resetQueryHandle
                },
                createElement("span", { className: "glyphicon glyphicon-remove" })
            );
        }

        return null;
    }

    private resetQuery() {
        const query = "";

        this.setState({ query });
        this.props.onTextChange(query);
    }
}
