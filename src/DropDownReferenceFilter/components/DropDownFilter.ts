import { ChangeEvent, Component, ReactNode, createElement } from "react";

import { FilterProps } from "./DropDownReferenceFilterContainer";

export interface DropDownFilterProps {
    defaultFilterIndex: number;
    filters: FilterProps[];
    handleChange: (FilterProps: FilterProps) => void;
}

interface DropDownFilterState {
    selectedValue: string;
}

type Display = Partial<FilterProps> & DropDownFilterState;

export class DropDownFilter extends Component<DropDownFilterProps, DropDownFilterState> {
    // Remap prop filters to dropdownfilters
    private filters: Display[] = [];

    constructor(props: DropDownFilterProps) {
        super(props);

        this.state = {
            selectedValue : props.defaultFilterIndex < 0 ? "0" : `${props.defaultFilterIndex}`
        };
        this.handleOnChange = this.handleOnChange.bind(this);

    }

    render() {
        return createElement("select",
            {
                className: "form-control",
                onChange: this.handleOnChange,
                value: this.state.selectedValue
            },
            this.createOptions()
        );
    }

    componentWillReceiveProps(newProps: DropDownFilterProps) {
        const selectedValue = newProps.defaultFilterIndex < 0 ? "0" : `${newProps.defaultFilterIndex}`;
        if (this.state.selectedValue !== selectedValue) {
            this.setState({ selectedValue });
        }
    }

    private createOptions(): ReactNode[] {
        this.filters = this.props.filters.map((filter, index) => ({
            ...filter,
            selectedValue: `${index}`
        }));
        return this.filters.map((option, index) => createElement("option", {
            className: "",
            key: index,
            label: option.caption,
            value: option.selectedValue
        }, option.caption));
    }

    private handleOnChange(event: ChangeEvent<HTMLSelectElement>) {
        this.setState({
            selectedValue: event.currentTarget.value
        });
        const selectedFilter = this.filters.find(filter => filter.selectedValue === event.currentTarget.value) as FilterProps;
        this.props.handleChange(selectedFilter);
    }
}
