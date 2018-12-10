import { Component, ReactNode, createElement } from "react";
import * as classNames from "classnames";

import { PageButton, PageButtonProps } from "./PageButton";
import { IconType, ItemType, PageStyleType } from "../Pagination";
import { PageNumberView } from "./PageNumberView";
import { OptionProps, PageSizeSelect } from "./PageSizeSelect";

export interface PaginationProps {
    hideUnusedPaging: boolean;
    items: ItemType[];
    listViewSize: number;
    pageSize: number;
    offset: number;
    onChange: (offSet?: number, pageSize?: number) => void;
    getMessageStatus: (currentOffset: number, offset: number, maxPageSize: number) => string;
    pagingStyle: PageStyleType;
    pageSizeOptions: OptionProps[];
}

export interface OnChangeProps {
    newOffSet: number;
    newPageSize: number;
    newPageNumber: number;
}

export interface PaginationState {
    currentOffset: number;
}

export class Pagination extends Component<PaginationProps, PaginationState> {

    readonly state: PaginationState = {
        currentOffset: this.props.offset
    };

    render() {
        const { listViewSize, pageSize, hideUnusedPaging } = this.props;
        const isVisible = !hideUnusedPaging || hideUnusedPaging && listViewSize > pageSize;
        return createElement("div",
            { className: classNames("pagination", `${isVisible ? "visible" : "hidden"}`) },
            this.renderPagination()
        );
    }

    componentWillReceiveProps(nextProps: PaginationProps) {
        this.setState({ currentOffset: nextProps.offset });
    }

    private renderPagination(): ReactNode[] {
        if (this.props.pagingStyle === "default") {

            return this.renderDefault();
        } else if (this.props.pagingStyle === "pageNumberButtons") {
            const { listViewSize, pageSize } = this.props;
            const pageCount = Math.ceil(listViewSize / pageSize);
            const selectedPageNumber = this.getPageNumber(this.state.currentOffset, pageSize, listViewSize);
            return [
                createElement(PageNumberView, {
                    maxPageButtons: 7,
                    onClickAction: this.updatePagination,
                    pageCount,
                    selectedPageNumber
                })
            ];
        } else {

            return this.renderCustom();
        }
    }

    private getPageNumber(offset: number, pageSize: number, listSize: number) {
        return offset < listSize ? offset / pageSize + 1 : 1;
    }

    private renderDefault(): ReactNode[] {
        return [
            this.createFirstButton(),
            this.createPreviousButton(),
            this.createMessage(),
            this.createNextButton(),
            this.createLastButton()
        ];
    }

    private renderCustom(): ReactNode[] {
        return this.props.items.map(option => {
            const buttonProps = {
                buttonCaption: option.buttonCaption,
                buttonType: option.item,
                showIcon: option.showIcon,
                text: option.text
            };

            if (buttonProps.buttonType === "firstButton") {
                return this.createFirstButton(buttonProps);
            }

            if (buttonProps.buttonType === "nextButton") {
                return this.createNextButton(buttonProps);
            }

            if (buttonProps.buttonType === "previousButton") {
                return this.createPreviousButton(buttonProps);
            }

            if (buttonProps.buttonType === "lastButton") {
                return this.createLastButton(buttonProps);
            }

            if (buttonProps.buttonType === "text") {
                return this.createMessage(buttonProps.text);
            }

            if (buttonProps.buttonType === "pageNumberButtons") {
                const { listViewSize, pageSize } = this.props;
                const pageCount = Math.ceil(listViewSize / pageSize);
                const selectedPageNumber = this.getPageNumber(this.state.currentOffset, pageSize, listViewSize);

                return createElement(PageNumberView, {
                    maxPageButtons: option.maxPageButtons,
                    onClickAction: this.updatePagination,
                    pageCount,
                    selectedPageNumber
                });
            }

            if (buttonProps.buttonType === "pageSize") {
                const { listViewSize, pageSize } = this.props;
                const currentPage = this.getPageNumber(this.state.currentOffset, pageSize, listViewSize);

                return createElement(PageSizeSelect, {
                    onChange: this.props.onChange,
                    pageSize: this.props.pageSize,
                    sizeOptions: this.props.pageSizeOptions,
                    listViewSize,
                    currentPage
                });
            }
        });
    }

    private createFirstButton(buttonProps?: PageButtonProps): ReactNode {
        const isDisabled = this.state.currentOffset <= 0;

        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "firstButton",
            isDisabled,
            onClickAction: this.firstPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createPreviousButton(buttonProps?: PageButtonProps): ReactNode {
        const isDisabled = this.state.currentOffset <= 0;

        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "previousButton",
            isDisabled,
            onClickAction: this.previousPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createNextButton(buttonProps?: PageButtonProps): ReactNode {
        const isDisabled = (this.state.currentOffset + this.props.pageSize) >= this.props.listViewSize;

        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "nextButton",
            isDisabled,
            onClickAction: this.nextPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createLastButton(buttonProps?: PageButtonProps): ReactNode {
        const isDisabled = (this.state.currentOffset + this.props.pageSize) >= this.props.listViewSize;

        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "lastButton",
            isDisabled,
            onClickAction: this.lastPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createMessage(message?: string): ReactNode {
        message = this.getMessageStatus(message);

        return createElement("button", { className: "paging-status" }, message);
    }

    private firstPageClickAction = () => {
        this.setState({ currentOffset: 0 });

        this.props.onChange(0);
    }

    private nextPageClickAction = () => {
        const newOffset = this.state.currentOffset + this.props.pageSize;

        this.setState({ currentOffset: newOffset });

        this.props.onChange(newOffset);
    }

    private previousPageClickAction = () => {
        const newOffset = Math.max(this.state.currentOffset - this.props.pageSize, 0);

        this.setState({ currentOffset: newOffset });

        this.props.onChange(newOffset);
    }

    private lastPageClickAction = () => {
        const { pageSize, listViewSize } = this.props;
        const newOffset = (listViewSize % pageSize) === 0
            ? listViewSize - pageSize
            : listViewSize - (listViewSize % pageSize);

        if (newOffset > 0) {
            this.setState({ currentOffset : newOffset });
        }

        this.props.onChange(newOffset);
    }

    private getMessageStatus(message?: string): string {
        const currentOffset = this.state.currentOffset;
        const { listViewSize, pageSize } = this.props;
        let fromValue = currentOffset + 1;
        let toValue = 0;

        if (listViewSize === 0) {
            fromValue = 0;
        } else if (listViewSize < pageSize || (currentOffset + pageSize) > listViewSize) {
            toValue = listViewSize;
        } else {
            toValue = currentOffset + pageSize;
        }

        if (message) {
            const totalPages = pageSize && pageSize !== 0 ? Math.ceil(listViewSize / pageSize) : listViewSize;
            const selectedPageNumber = Math.ceil(listViewSize / pageSize);

            return message.replace("{firstItem}", fromValue.toString())
                .replace("{lastItem}", toValue.toString())
                .replace("{totalItems}", listViewSize.toString())
                .replace("{currentPageNumber}", selectedPageNumber.toString())
                .replace("{totalPages}", totalPages.toString());
        }

        return this.props.getMessageStatus(fromValue, toValue, listViewSize);
    }

    static getShowIcon(buttonProps?: PageButtonProps): IconType {
        return buttonProps ? buttonProps.showIcon as IconType : "default";
    }

    private updatePagination = (pageNumber: number) => {
        const newOffset = (pageNumber - 1) * this.props.pageSize;

        if (this.state.currentOffset === newOffset) {
            return;
        }

        this.setState({ currentOffset: newOffset });

        this.props.onChange(newOffset);
    }

}
