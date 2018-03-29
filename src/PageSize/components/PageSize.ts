import { ChangeEvent, Component, ReactElement, createElement } from "react";

import { OptionProps } from "./PageSizeContainer";

export interface PageSizeProps {
    labelText: string;
    currentOffSet: number;
    pageSize: number;
    listViewSize: number;
    defaultFilterIndex: number;
    sizeOptions: OptionProps[];
    handleChange: (OptionProps: OnChangeProps) => void;
}

interface PageSizeState {
    selectedValue: string;
}

type Display = Partial<OptionProps> & PageSizeState;
export interface OnChangeProps {
    newOffSet: number;
    newPageSize: number;
    newPageNumber: number;
}

export class PageSize extends Component<PageSizeProps, PageSizeState> {
    // Remap prop filters to dropdownfilters
    private filters: Display[];

    constructor(props: PageSizeProps) {
        super(props);

        this.state = {
            selectedValue : props.defaultFilterIndex < 0 ? "10" : `${props.defaultFilterIndex}`
        };
        this.handleOnChange = this.handleOnChange.bind(this);

        this.filters = this.props.sizeOptions.map((filter, index) => ({
            ...filter,
            selectedValue: `${index}`
        }));
    }

    render() {
        return createElement("div",
            {},
            createElement("label", {}, `${this.props.labelText}`),
            this.renderDropDown()
        );
    }

    componentWillReceiveProps(newProps: PageSizeProps) {
        const selectedValue = newProps.defaultFilterIndex < 0 ? "20" : `${newProps.defaultFilterIndex}`;
        if (this.state.selectedValue !== selectedValue) {
            this.setState({ selectedValue });
        }
    }

    private renderDropDown = () => {
        return createElement("select",
            {
                className: "form-control",
                onChange: this.handleOnChange,
                value: this.state.selectedValue
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
        const selectedFilter = this.filters.find(filter => filter.selectedValue === event.currentTarget.value);
        const newOffSet = this.calculateOffSet(listViewSize, currentOffSet, selectedFilter.size);
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
}
