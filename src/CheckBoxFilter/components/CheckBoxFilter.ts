import { ChangeEvent, Component, createElement } from "react";

export interface CheckboxFilterProps {
    isChecked: boolean;
    handleChange: (value: boolean) => void;
}

interface CheckboxFilterState {
    isChecked: boolean;
}

export class CheckboxFilter extends Component<CheckboxFilterProps, CheckboxFilterState> {
    constructor(props: CheckboxFilterProps) {
        super(props);

        this.state = { isChecked : this.props.isChecked };
        this.handleOnChange = this.handleOnChange.bind(this);
    }

    render() {
        return createElement("input", {
            checked: this.state.isChecked,
            defaultChecked: this.state.isChecked,
            onChange: this.handleOnChange,
            type: "checkbox"
        });
    }

    componentWillReceiveProps(newProps: CheckboxFilterProps) {
        if (this.state.isChecked !== newProps.isChecked) {
            this.setState({ isChecked : newProps.isChecked });
        }
    }

    private handleOnChange(event: ChangeEvent<HTMLInputElement>) {
        this.setState({ isChecked: event.target.checked });
        this.props.handleChange(event.target.checked);
    }
}
