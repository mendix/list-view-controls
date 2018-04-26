import { ChangeEvent, Component, ReactElement, createElement } from "react";

export interface PageSizeProps {
    labelText: string;
    currentOffSet: number;
    pageSize: number;
    listViewSize: number;

    sizeOptions: OptionProps[];
    handleChange: (OptionProps: OnChangeProps) => void;
}

interface PageSizeState {
    selectedValue: string;
}

export interface OptionProps {
    caption: string;
    size: number;
    isDefault: boolean;
}

type Display = Partial<OptionProps> & PageSizeState;
export interface OnChangeProps {
    newOffSet: number;
    newPageSize: number;
    newPageNumber: number;
}

export class PageSizeSelect extends Component<PageSizeProps, PageSizeState> {
    // Remap prop filters to dropdownfilters
    private filters: Display[];
    private pageSizeSelectDom: HTMLSelectElement;
    private defaultPageSize?: number;

    constructor(props: PageSizeProps) {
        super(props);

        this.state = {
            selectedValue : this.getSelectedValue(props.sizeOptions, props.pageSize)
        };
        this.handleOnChange = this.handleOnChange.bind(this);

        this.filters = this.props.sizeOptions.map((filter, index) => ({
            ...filter,
            selectedValue: `${index}`
        }));
    }

    render() {
        return createElement("div",
            { className: "page-size" },
            this.props.labelText ? createElement("label", {}, `${this.props.labelText}`) : null,
            this.renderDropDown()
        );
    }

    componentWillReceiveProps(newProps: PageSizeProps) {
        if (!this.defaultPageSize) {
            this.defaultPageSize = newProps.pageSize;
        }
        if (newProps.pageSize !== this.props.pageSize) {
            const selectedValue = this.getSelectedValue(newProps.sizeOptions, newProps.pageSize);
            if (selectedValue !== this.state.selectedValue) {
                this.setState({ selectedValue });
            }
        }
    }

    componentDidUpdate(_previousProps: PageSizeProps, _previousState: PageSizeState) {
        if (this.state.selectedValue === "-1") {
            this.pageSizeSelectDom.selectedIndex = -1;
        }
    }

    private renderDropDown = () => {
        return createElement("select",
            {
                className: "form-control",
                onChange: this.handleOnChange,
                value: this.state.selectedValue,
                ref: (node: HTMLSelectElement) => this.pageSizeSelectDom = node
            },
            this.createOptions()
        );
    }

    private createOptions(): ReactElement<{}>[] {
        return this.filters.map((option, index) => createElement("option", {
            className: "",
            key: index,
            label: option.caption,
            value: option.selectedValue
        }, option.caption));
    }

    private handleOnChange(event: ChangeEvent<HTMLSelectElement>) {
        const { listViewSize, currentOffSet } = this.props;
        this.setState({
            selectedValue: event.currentTarget.value
        });
        const selectedPageSize = this.filters.find(filter => filter.selectedValue === event.currentTarget.value).size;
        const newOffSet = this.calculateOffSet(listViewSize, currentOffSet, selectedPageSize);
        this.props.handleChange(newOffSet);
    }
    private calculateOffSet = (listViewSize: number, currentOffSet: number, newPageSize: number): OnChangeProps => {
        const numberOfPages = Math.ceil(listViewSize / newPageSize);
        for (let newPageNumber = 0; newPageNumber < numberOfPages; newPageNumber++) {
            const pageOffSet = (newPageNumber * newPageSize);
            if (currentOffSet <= pageOffSet) {
                return {
                    newOffSet: pageOffSet,
                    newPageNumber: ++newPageNumber,
                    newPageSize
                };
            }
        }
    }

    private getSelectedValue = (sizeOptions: OptionProps[], selectedPageSize: number): string => {
        return `${sizeOptions.indexOf(sizeOptions.find(sizeOption => sizeOption.size === selectedPageSize))}`;
    }
}
