import { Component, FormEvent, OptionHTMLAttributes, ReactElement, createElement } from "react";
import { AttributeType } from "./DropDownSortContainer";

export interface DropDownOptionType extends Partial<AttributeType> {
    value: string;
}

export interface DropDownProps {
    friendlyId?: string;
    onDropDownChangeAction?: (selectedOption: AttributeType) => void;
    sortAttributes: AttributeType[];
    style: object;
    defaultSortIndex?: number;
}

export interface DropdownState {
    value: string;
}

export interface OptionHTMLAttributesType extends OptionHTMLAttributes<HTMLOptionElement> {
    key: string;
}

export class DropDownSort extends Component<DropDownProps, DropdownState> {
    private options: DropDownOptionType[] = [];
    private selectorDomNode: HTMLSelectElement;

    constructor(props: DropDownProps) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.renderOptions = this.renderOptions.bind(this);
        this.state = { value: this.getDefaultValue(this.props) };
    }

    componentWillReceiveProps(newProps: DropDownProps) {
        const value = this.getDefaultValue(newProps);

        if (this.state.value !== value) {
            this.setState({ value });
        }
    }

    render() {
        return createElement("select", {
                className: "form-control",
                onChange: this.handleChange,
                ref: (selector: HTMLSelectElement) => this.selectorDomNode = selector,
                value: this.state.value
            },
            this.renderOptions()
        );
    }

    componentDidUpdate(_previousProps: DropDownProps, _previousState: DropdownState) {
        if (this.state.value === "") {
            this.selectorDomNode.selectedIndex = -1;
        }
    }

    private getDefaultValue(props: DropDownProps): string {
        if (!this.options.length) {
            this.options = this.createOptionProps(this.props.sortAttributes);
        }

        return props.defaultSortIndex !== undefined
            ? `${this.options[props.defaultSortIndex].value}`
            : "";
    }

    private renderOptions(): Array<ReactElement<{}>> {
        return this.options.map(optionObject => {
            const { caption, value } = optionObject;

            const optionValue: OptionHTMLAttributesType = {
                className: "",
                key: value,
                label: caption,
                value
            };

            return createElement("option", optionValue, caption);
        });
    }

    private handleChange(event: FormEvent<HTMLSelectElement>) {
        const value = event.currentTarget.value.split("-").pop();

        this.setState({ value });
        this.callOnChangeAction(Number(value));
    }

    private callOnChangeAction(selectedIndex: number) {
        const selectedOption = this.props.sortAttributes[selectedIndex];

        if (selectedOption && this.props.onDropDownChangeAction) {
            this.props.onDropDownChangeAction(selectedOption);
        }
    }

    private createOptionProps(sortAttributes: AttributeType[]): DropDownOptionType[] {
        return sortAttributes.map(({ name, caption, sort }, index) => ({
            name,
            caption,
            sort,
            value: `${name}-${index}`
        }));
    }
}
