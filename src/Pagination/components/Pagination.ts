import { Component, ReactElement, SFCElement, createElement } from "react";
import * as classNames from "classnames";

import { PageButton, PageButtonProps } from "./PageButton";
import { IconType, ItemType, PageStyleType } from "../Pagination";
import { PageNumberView, PageNumberViewProps } from "./PageNumberView";
import { OptionProps, PageSizeSelect } from "./PageSizeSelect";

export interface PaginationProps {
    hideUnusedPaging: boolean;
    items: ItemType[];
    listViewSize: number;
    pageSize: number;
    offset?: number;
    pageNumber?: number;
    onChange: (offSet?: number, pageSize?: number) => void;
    getMessageStatus: (currentOffset: number, offset: number, maxPageSize: number) => string;
    pagingStyle: PageStyleType;
    pageSizeOptions?: OptionProps[];
}

export interface OnChangeProps {
    newOffSet: number;
    newPageSize: number;
    newPageNumber: number;
}

export interface PaginationState {
    currentOffset: number;
    isVisible?: boolean;
    previousIsDisabled: boolean;
    nextIsDisabled: boolean;
    pageCount: number;
    selectedPageNumber: number;
    defaultPageSize?: number;
}

export class Pagination extends Component<PaginationProps, PaginationState> {

    constructor(props: PaginationProps) {
        super(props);

        this.state = {
            currentOffset: 0,
            isVisible: !this.props.hideUnusedPaging,
            nextIsDisabled: false,
            pageCount: 0,
            previousIsDisabled: true,
            selectedPageNumber: 1
        };
    }

    render() {
        return createElement("div",
            { className: classNames("pagination", `${this.state.isVisible ? "visible" : "hidden"}`) },
            this.renderPagination()
        );
    }

    componentDidMount() {
        const { listViewSize, pageSize } = this.props;

        this.setState({
            pageCount: pageSize !== 0 ? Math.ceil(listViewSize / pageSize) : listViewSize
        });

        if (listViewSize === 0 || pageSize >= listViewSize || pageSize === 0) {
            this.setState({ nextIsDisabled: true });
        }
    }

    componentWillReceiveProps(nextProps: PaginationProps) {
        const { offset, listViewSize, pageSize, pageNumber } = nextProps;
        const pageCount = pageSize !== 0 ? Math.ceil(listViewSize / pageSize) : listViewSize;
        const currentOffset = offset || 0;
        const selectedPageNumber = pageNumber || 1;

        this.setState({
            currentOffset,
            isVisible: !nextProps.hideUnusedPaging,
            nextIsDisabled: (currentOffset + pageSize) >= listViewSize,
            pageCount,
            previousIsDisabled: currentOffset <= 0,
            selectedPageNumber
        });
    }

    private renderPagination = (): SFCElement<PageNumberViewProps>[] | ReactElement<{}>[] => {
        if (this.props.pagingStyle === "default") {

            return this.renderDefault();

        } else if (this.props.pagingStyle === "pageNumberButtons") {

            return [
                createElement(PageNumberView, {
                    maxPageButtons: 7,
                    onClickAction: this.updatePagination,
                    pageCount: this.state.pageCount,
                    selectedPageNumber: this.state.selectedPageNumber
                })
            ];

        } else {

            return this.renderCustom();
        }
    }

    private renderDefault = (): Array<ReactElement<{}>> => {
        return [
            this.createFirstButton(),
            this.createPreviousButton(),
            this.createMessage(),
            this.createNextButton(),
            this.createLastButton()
        ];
    }

    private renderCustom = (): Array<ReactElement<{}>> => {
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
                return createElement(PageNumberView, {
                    maxPageButtons: option.maxPageButtons,
                    onClickAction: this.updatePagination,
                    pageCount: this.state.pageCount,
                    selectedPageNumber: this.state.selectedPageNumber
                });
            }

            if (buttonProps.buttonType === "pageSize") {
                return createElement(PageSizeSelect, {
                    onChange: this.props.onChange,
                    pageSize: this.props.pageSize,
                    sizeOptions: this.props.pageSizeOptions,
                    listViewSize: this.props.listViewSize,
                    currentPage: this.state.selectedPageNumber
                });
            }
        }) as Array<ReactElement<{}>>;
    }

    private createFirstButton = (buttonProps?: PageButtonProps): ReactElement<{}> => {
        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "firstButton",
            isDisabled: this.state.previousIsDisabled,
            onClickAction: this.firstPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createPreviousButton = (buttonProps?: PageButtonProps): ReactElement<{}> => {
        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "previousButton",
            isDisabled: this.state.previousIsDisabled,
            onClickAction: this.previousPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createNextButton = (buttonProps?: PageButtonProps): ReactElement<{}> => {
        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "nextButton",
            isDisabled: this.state.nextIsDisabled,
            onClickAction: this.nextPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createLastButton = (buttonProps?: PageButtonProps): ReactElement<{}> => {
        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "lastButton",
            isDisabled: this.state.nextIsDisabled,
            onClickAction: this.lastPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createMessage(message?: string): ReactElement<{}> {
        message = this.getMessageStatus(message);

        return createElement("button", { className: "paging-status" }, message);
    }

    private firstPageClickAction = () => {
        const currentOffset = 0;
        const selectedPageNumber = currentOffset + 1;

        this.setState({
            currentOffset,
            nextIsDisabled: false,
            previousIsDisabled: true,
            selectedPageNumber
        });

        this.props.onChange(currentOffset);
    }

    private nextPageClickAction = () => {
        const { listViewSize, pageSize } = this.props;
        const currentOffset = this.state.currentOffset + pageSize;
        const selectedPageNumber = this.state.selectedPageNumber + 1;

        this.setState({
            currentOffset,
            nextIsDisabled: (listViewSize - currentOffset) <= pageSize,
            previousIsDisabled: currentOffset > listViewSize,
            selectedPageNumber
        });

        this.props.onChange(currentOffset);
    }

    private previousPageClickAction = () => {
        const currentOffset = this.state.currentOffset - this.props.pageSize;
        let selectedPageNumber = 0;

        if (currentOffset > 0) {
            selectedPageNumber = this.state.selectedPageNumber - 1;

            this.setState({
                currentOffset,
                nextIsDisabled: false,
                selectedPageNumber
            });
        } else if (currentOffset <= 0) {
            selectedPageNumber = currentOffset + 1;

            this.setState({
                currentOffset,
                nextIsDisabled: false,
                previousIsDisabled: true,
                selectedPageNumber
            });
        }

        this.props.onChange(currentOffset);
    }

    private lastPageClickAction = () => {
        const { pageSize, listViewSize } = this.props;
        const currentOffset = (listViewSize % pageSize) === 0
            ? listViewSize - pageSize
            : listViewSize - (listViewSize % pageSize);
        const selectedPageNumber = Math.ceil(this.props.listViewSize / pageSize);

        if (currentOffset > 0) {
            this.setState({
                currentOffset,
                nextIsDisabled: true,
                previousIsDisabled: false,
                selectedPageNumber
            });
        }

        this.props.onChange(currentOffset);
    }

    private getMessageStatus = (message?: string): string => {
        const currentOffset = this.state.currentOffset || 0;
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

            return message.replace("{firstItem}", fromValue.toString())
                .replace("{lastItem}", toValue.toString())
                .replace("{totalItems}", listViewSize.toString())
                .replace("{currentPageNumber}", this.state.selectedPageNumber ? this.state.selectedPageNumber.toString() : "1")
                .replace("{totalPages}", totalPages.toString());
        }

        return this.props.getMessageStatus(fromValue, toValue, listViewSize);
    }

    static getShowIcon(buttonProps?: PageButtonProps): IconType {
        return buttonProps ? buttonProps.showIcon as IconType : "default";
    }

    private updatePagination = (pageNumber: number) => {
        const currentOffset = (pageNumber - 1) * this.props.pageSize;

        if (this.state.selectedPageNumber === pageNumber) {
            return;
        }

        this.setState({
            currentOffset,
            nextIsDisabled: (currentOffset + this.props.pageSize) >= this.props.listViewSize,
            previousIsDisabled: currentOffset <= 0,
            selectedPageNumber: pageNumber
        });

        this.props.onChange(currentOffset);
    }

}
