import { Component, FormEvent, OptionHTMLAttributes, ReactElement, createElement } from "react";
import { AttributeType } from "./DropDownSortContainer";

export interface DropDownOptionType extends AttributeType {
    value: string;
}

export interface DropDownProps {
    friendlyId?: string;
    onDropDownChangeAction?: (attribute: string, order: string) => void;
    publishedSortAttribute?: string;
    publishedSortOrder?: string;
    publishedSortWidgetFriendlyId?: string;
    sortAttributes: AttributeType[];
    style: object;
}

export interface DropdownState {
    value: string;
}

export interface OptionHTMLAttributesType extends OptionHTMLAttributes<HTMLOptionElement> {
    key: string;
}

export class DropDown extends Component<DropDownProps, DropdownState> {
    private options: DropDownOptionType[] = [];

    constructor(props: DropDownProps) {
        super(props);

        this.state = { value: this.getDefaultValue(this.props) };

        this.handleChange = this.handleChange.bind(this);
        this.renderOptions = this.renderOptions.bind(this);
        this.callOnChangeAction = this.callOnChangeAction.bind(this);
    }

    componentWillReceiveProps(newProps: DropDownProps) {
        const value = this.getDefaultValue(newProps);

        if (this.state.value !== value) {
            this.setState({ value });
        }

        // Received update from one of the widgets
        if (newProps.publishedSortAttribute
            && newProps.publishedSortOrder
            && !(this.props.friendlyId === newProps.publishedSortWidgetFriendlyId)) {
            this.setState({ value: "empty-0" });
        }
    }

    render() {
        return createElement("select", {
                className: "form-control",
                onChange: this.handleChange,
                value: this.state.value
            },
            this.renderOptions()
        );
    }

    private getDefaultValue(props: DropDownProps): string {
        this.options = this.createOptionProps(props.sortAttributes);
        const defaultOption = this.options.filter(option => option.defaultSelected)[0];

        if (defaultOption) {
            return defaultOption.value;
        }

        return this.options.length > 0 ? this.options[0].value : "";
    }

    private renderOptions(): Array<ReactElement<{}>> {
        const options: Array<ReactElement<OptionHTMLAttributesType>> = [];
        const emptyOption = createElement("option", {
            caption: "",
            className: "",
            key: "empty",
            label: "",
            value: "empty-0"
        }, "");

        options.push(emptyOption);

        this.options.forEach((optionObject) => {
            const { caption, value } = optionObject;

            const optionValue: OptionHTMLAttributesType = {
                className: "",
                key: value,
                label: caption,
                value
            };

            options.push(createElement("option", optionValue, caption));
        });

        return options;
    }

    private handleChange(event: FormEvent<HTMLSelectElement>) {
        const value = event.currentTarget.value;

        this.setState({ value });
        this.callOnChangeAction(value);

    }

    private callOnChangeAction(value: string) {
        const option = this.options.filter((optionFilter => optionFilter.value === value))[0];

        if (option && this.props.onDropDownChangeAction) {
            this.props.onDropDownChangeAction(option.name, option.sort);
        }
    }

    private createOptionProps(sortAttributes: AttributeType[]): DropDownOptionType[] {
        return sortAttributes.map((optionObject, index) => {
            const { name, caption, defaultSelected, sort } = optionObject;
            const value = `${name}-${index}`;

            return { name, caption, defaultSelected, sort, value };
        });
    }
}
