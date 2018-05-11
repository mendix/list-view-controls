import { ChangeEvent, Component, ReactElement, createElement } from "react";
import { OnChangeProps, calculateOffSet } from "./PageSize";

export interface PageSizeSelectProps {
    text: string;
    currentPage: number;
    pageSize: number;
    listViewSize: number;

    sizeOptions: OptionProps[];
    handleChange: (optionProps: OnChangeProps) => void;
}

interface PageSizeState {
    selectedValue: string;
    pageSize: number;
}

export interface OptionProps {
    caption: string;
    size: number;
}

export type Display = Partial<OptionProps> & Partial<PageSizeState>;

export class PageSizeSelect extends Component<PageSizeSelectProps, PageSizeState> {
    private filters: Display[];
    private pageSizeSelectDom: HTMLSelectElement;
    private defaultPageSize?: number;

    constructor(props: PageSizeSelectProps) {
        super(props);

        this.state = {
            selectedValue : PageSizeSelect.getSelectedValue(props.sizeOptions, props.pageSize),
            pageSize: props.pageSize
        };

        this.filters = this.props.sizeOptions.map((filter, index) => ({
            ...filter,
            selectedValue: `${index}`
        }));
    }

    render() {
        return createElement("div",
            { className: "page-size" },
            this.props.text ? createElement("label", {}, `${this.props.text}`) : null,
            this.renderDropDown()
        );
    }

    componentWillReceiveProps(newProps: PageSizeSelectProps) {
        if (!this.defaultPageSize) {
            this.defaultPageSize = newProps.pageSize;
        }
        if (newProps.pageSize !== this.props.pageSize) {
            const selectedValue = PageSizeSelect.getSelectedValue(newProps.sizeOptions, newProps.pageSize);
            if (selectedValue !== this.state.selectedValue) {
                this.setState({ selectedValue });
            }
        }
    }

    componentDidUpdate(_previousProps: PageSizeSelectProps, _previousState: PageSizeState) {
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
            PageSizeSelect.createOptions(this.filters)
        );
    }

    private handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const { listViewSize } = this.props;
        const selectedPageSize = this.filters.find(filter => filter.selectedValue === event.currentTarget.value).size;
        this.setState({
            selectedValue: event.currentTarget.value,
            pageSize: selectedPageSize
         });

        const newOffSet = calculateOffSet(listViewSize, selectedPageSize, this.props.currentPage);
        this.props.handleChange(newOffSet);
    }

    static getSelectedValue = (sizeOptions: OptionProps[], selectedPageSize: number): string => {
        return `${sizeOptions.indexOf(sizeOptions.find(sizeOption => sizeOption.size === selectedPageSize))}`;
    }

    static createOptions = (options: Display[]): ReactElement<{}>[] => {
        return options.map((option, index) => createElement("option", {
            className: "",
            key: index,
            label: option.caption,
            value: option.selectedValue
        }, option.caption));
    }
}
