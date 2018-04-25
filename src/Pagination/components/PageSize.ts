import { ChangeEvent, Component, createElement } from "react";
import { OptionProps } from "./PageSizeSelect";
export interface PageSizeProps {
    labelText: string;
    currentOffSet?: number;
    pageSize?: number;
    listViewSize: number;
    sizeOptions?: OptionProps[];
    initialPageSize?: number;
    handleChange: (OptionProps: OnChangeProps) => void;
}

interface PageSizeState {
    selectedValue?: string;
    currentPageSize: string;
}

export interface OnChangeProps {
    newOffSet: number;
    newPageSize: number;
    newPageNumber: number;
}

// type Display = Partial<OptionProps> & PageSizeState;
export class PageSize extends Component<PageSizeProps, PageSizeState> {
    private inputTimeout = 500;
    private timeoutHandler?: number;

    constructor(props: PageSizeProps) {
        super(props);

        this.state = {
            currentPageSize : `${props.pageSize}`
        };
    }

    render() {
        return createElement("div", { className: "page-size" },
        this.props.labelText ? createElement("label", { }, this.props.labelText) : null,
            createElement("input", {
                className: "form-control",
                onChange: this.handleOnChange,
                value: this.state.currentPageSize
            })
        );
    }

    componentWillReceiveProps(nextProps: PageSizeProps) {
        if (nextProps.pageSize !== this.props.pageSize && nextProps.pageSize !== Number(this.state.currentPageSize)) {
            this.setState({
                currentPageSize: `${nextProps.pageSize}`
            });
        }
    }

    private handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { listViewSize, currentOffSet } = this.props;
        const eventValue = event.currentTarget.value;

        if (this.state.currentPageSize !== eventValue) {
            const currentPageSize = this.verifiedPageSize(event.currentTarget.value);

            if (this.timeoutHandler) {
                window.clearTimeout(this.timeoutHandler);
            }
            this.timeoutHandler = window.setTimeout(() => {
                const newOffSet = this.calculateOffSet(listViewSize, currentOffSet, Number(currentPageSize));
                this.props.handleChange(newOffSet);
            }, this.inputTimeout);
            this.setState({
                currentPageSize
            });
        }
    }

    private verifiedPageSize = (currentValue: string): string => {
        if (currentValue && !isNaN(currentValue as any)) { // isNaN("") is false
            return `${parseInt(currentValue, 10)}`;
        }

        return `${this.props.initialPageSize}`;
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
