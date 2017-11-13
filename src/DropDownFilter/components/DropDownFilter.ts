import { ChangeEvent, Component, OptionHTMLAttributes, ReactElement, createElement } from "react";

import { FilterProps } from "./DropDownFilterContainer";

export interface DropDownFilterProps {
    defaultFilterIndex: number;
    filters: FilterProps[];
    handleChange: (FilterProps) => void;
}

interface DropDownFilterState {
    selectedValue: string;
}
// Added to deal with typings issue of componentClass, needing to pass a className attribute on select options
export interface DropDownType extends OptionHTMLAttributes<HTMLOptionElement> {
    key: string;
    value: string;
    label: string;
}

type Display = Partial<FilterProps> & DropDownFilterState;

export class DropDownFilter extends Component<DropDownFilterProps, DropDownFilterState> {
    // Remap prop filters to dropdownfilters
    private filters: Display[];

    constructor(props: DropDownFilterProps) {
        super(props);

        this.state = {
            selectedValue : props.defaultFilterIndex < 0 ? "0" : `${props.defaultFilterIndex}`
        };
        this.handleOnChange = this.handleOnChange.bind(this);

        this.filters = this.props.filters.map((filter, index) => ({
            ...filter,
            selectedValue: `${index}`
        }));
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

    private createOptions(): ReactElement<{}>[] {
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
        const selectedFilter = this.filters.find(filter => filter.selectedValue === event.currentTarget.value);
        this.props.handleChange(selectedFilter);
    }
}
