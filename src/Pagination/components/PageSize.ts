import { ChangeEvent, Component, createElement } from "react";
import { OptionProps } from "./PageSizeSelect";

export interface PageSizeProps {
    text: string;
    currentOffSet?: number;
    pageSize?: number;
    listViewSize: number;
    sizeOptions?: OptionProps[];
    handleChange: (optionProps: OnChangeProps) => void;
}

interface PageSizeState {
    previousValidPageSize?: number;
    currentPageSize: number;
}

export interface OnChangeProps {
    newOffSet: number;
    newPageSize: number;
    newPageNumber: number;
}

export class PageSize extends Component<PageSizeProps, PageSizeState> {
    private inputTimeout = 500;
    private timeoutHandler?: number;

    constructor(props: PageSizeProps) {
        super(props);

        this.state = {
            currentPageSize : props.pageSize,
            previousValidPageSize: props.pageSize
        };
    }

    render() {
        return createElement("div", { className: "page-size" },
            this.props.text ? createElement("label", { }, this.props.text) : null,
            createElement("input", {
                type: "number",
                className: "form-control",
                onChange: this.handleOnChange,
                value: this.state.currentPageSize
            })
        );
    }

    componentWillReceiveProps(nextProps: PageSizeProps) {
        if (nextProps.pageSize !== this.props.pageSize && nextProps.pageSize !== Number(this.state.currentPageSize)) {
            this.setState({
                currentPageSize: nextProps.pageSize
            });
        }
    }

    private handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { listViewSize, currentOffSet } = this.props;
        const eventValue = Number(event.currentTarget.value);
        const verifiedPageSize = this.verifiedPageSize(eventValue);

        if (this.state.currentPageSize !== eventValue || eventValue !== verifiedPageSize) { // handle situation when eventValue is empty
            if (this.timeoutHandler) {
                window.clearTimeout(this.timeoutHandler);
            }
            this.timeoutHandler = window.setTimeout(() => {
                const newOffSet = calculateOffSet(listViewSize, currentOffSet, Number(verifiedPageSize));
                this.props.handleChange(newOffSet);
            }, this.inputTimeout);
        }

        this.setState({
            previousValidPageSize: this.isValidPageSize(eventValue) ? eventValue : this.state.previousValidPageSize,
            currentPageSize: eventValue
        });
    }

    private isValidPageSize = (currentValue: number): boolean => {
        return !isNaN(currentValue) && Number(currentValue) > 0;
    }

    private verifiedPageSize = (currentValue: number): number => {
        if (this.isValidPageSize(currentValue)) {
            return Math.floor(currentValue);
        }

        return this.state.previousValidPageSize;
    }
}

export const calculateOffSet = (listViewSize: number, currentOffSet: number, newPageSize: number): OnChangeProps => {
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
};
