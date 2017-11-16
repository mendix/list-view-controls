import { Component, ReactElement, createElement } from "react";
import * as classNames from "classnames";

import { PageButton, PageButtonProps } from "./PageButton";
import { IconType, ItemType, PageStyleType, UpdateSourceType } from "../Pagination";
import { PageNumberView } from "./PageNumberView";
import { BreakView } from "./BreakView";

export interface PaginationProps {
    hideUnusedPaging: boolean;
    items: ItemType[];
    listViewSize: number;
    offset: number;
    publishedOffset?: number;
    publishedPageNumber?: number;
    onClickAction: (offset: number, pageNumber: number) => void;
    getMessageStatus: (currentOffset: number, offset: number, maxPageSize: number) => string;
    pagingStyle: PageStyleType;
    updateSource?: UpdateSourceType;
}

export interface PaginationState {
    currentOffset: number;
    isVisible?: boolean;
    previousIsDisabled: boolean;
    nextIsDisabled: boolean;
    pageCount: number;
    selectedPageNumber: number;
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

        this.firstPageClickAction = this.firstPageClickAction.bind(this);
        this.lastPageClickAction = this.lastPageClickAction.bind(this);
        this.nextPageClickAction = this.nextPageClickAction.bind(this);
        this.previousPageClickAction = this.previousPageClickAction.bind(this);
        this.handleSelectedPage = this.handleSelectedPage.bind(this);
        this.getMessageStatus = this.getMessageStatus.bind(this);
        this.createPageNumberViews = this.createPageNumberViews.bind(this);
        this.renderPagination = this.renderPagination.bind(this);
        this.renderDefault = this.renderDefault.bind(this);
    }

    render() {
        return createElement("div",
            { className: classNames("pagination", `${this.state.isVisible ? "visible" : "hidden"}`) },
            this.renderPagination()
        );
    }

    componentDidMount() {
        const { listViewSize, offset } = this.props;

        this.setState({
            pageCount: offset !== 0 ? Math.ceil(listViewSize / offset) : listViewSize
        });

        if (listViewSize === 0 || offset >= listViewSize || offset === 0) {
            this.setState({ nextIsDisabled: true });
        }
    }

    componentWillReceiveProps(nextProps: PaginationProps) {
        const { publishedOffset, listViewSize, offset, publishedPageNumber } = nextProps;
        const pageCount = offset !== 0 ? Math.ceil(listViewSize / offset) : listViewSize;
        const currentOffset = publishedOffset as number;

        if (nextProps.updateSource === "other") {
            this.setState({
                currentOffset: 0,
                nextIsDisabled: (currentOffset + offset) >= listViewSize,
                pageCount,
                previousIsDisabled: currentOffset <= 0,
                selectedPageNumber: 1
            });
        } else {
            this.setState({
                currentOffset,
                nextIsDisabled: (currentOffset + offset) >= listViewSize,
                pageCount,
                previousIsDisabled: currentOffset <= 0,
                selectedPageNumber: publishedPageNumber as number
            });
        }
    }

    private renderPagination(): Array<ReactElement<{}>> {
        if (this.props.pagingStyle === "default") {

            return this.renderDefault();

        } else if (this.props.pagingStyle === "pageNumberButtons") {

            return [ this.createPageNumberViews(7) ];

        } else {

            return this.renderCustom();
        }
    }

    private renderDefault(): Array<ReactElement<{}>> {
        return [
            this.createFirstButton(),
            this.createPreviousButton(),
            this.createMessage(),
            this.createNextButton(),
            this.createLastButton()
        ];
    }

    private renderCustom(): Array<ReactElement<{}>> {
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
                return this.createPageNumberViews(option.maxPageButtons);
            }
        }) as Array<ReactElement<{}>>;
    }

    private createFirstButton(buttonProps?: PageButtonProps): ReactElement<{}> {
        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "firstButton",
            isDisabled: this.state.previousIsDisabled,
            onClickAction: this.firstPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createPreviousButton(buttonProps?: PageButtonProps): ReactElement<{}> {
        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "previousButton",
            isDisabled: this.state.previousIsDisabled,
            onClickAction: this.previousPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createNextButton(buttonProps?: PageButtonProps): ReactElement<{}> {
        return createElement(PageButton, {
            ...buttonProps,
            buttonType: "nextButton",
            isDisabled: this.state.nextIsDisabled,
            onClickAction: this.nextPageClickAction,
            showIcon: Pagination.getShowIcon(buttonProps)
        });
    }

    private createLastButton(buttonProps?: PageButtonProps): ReactElement<{}> {
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

    private firstPageClickAction() {
        const currentOffset = 0;
        const selectedPageNumber = currentOffset + 1;

        this.setState({
            currentOffset,
            nextIsDisabled: false,
            previousIsDisabled: true,
            selectedPageNumber
        });

        this.props.onClickAction(currentOffset, selectedPageNumber);
    }

    private nextPageClickAction() {
        const { listViewSize, offset } = this.props;
        const currentOffset = this.state.currentOffset + offset;
        const selectedPageNumber = this.state.selectedPageNumber + 1;

        this.setState({
            currentOffset,
            nextIsDisabled: (listViewSize - currentOffset) <= offset,
            previousIsDisabled: currentOffset > listViewSize,
            selectedPageNumber
        });

        this.props.onClickAction(currentOffset, selectedPageNumber);
    }

    private previousPageClickAction() {
        const currentOffset = this.state.currentOffset - this.props.offset;
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

        this.props.onClickAction(currentOffset, selectedPageNumber);
    }

    private lastPageClickAction() {
        const { offset, listViewSize } = this.props;
        const currentOffset = (listViewSize % offset) === 0
            ? listViewSize - offset
            : listViewSize - (listViewSize % offset);
        const selectedPageNumber = Math.ceil(this.props.listViewSize / offset);

        if (currentOffset > 0) {
            this.setState({
                currentOffset,
                nextIsDisabled: true,
                previousIsDisabled: false,
                selectedPageNumber
            });
        }

        this.props.onClickAction(currentOffset, selectedPageNumber);
    }

    private createPageNumberViews(maxPageButtons: number): ReactElement<{}> {
        const pageItems: Array<ReactElement<any>> = [];
        const margin = 1;
        let leftSide;
        let rightSide;
        let breakViewAdded = false;
        const divider = Math.ceil(maxPageButtons / 2);

        if (this.state.pageCount <= maxPageButtons) {
            for (let pageIndex = 1; pageIndex <= this.state.pageCount; pageIndex++) {
                pageItems.push(this.getPageNumberView(pageIndex));
            }
        } else {
            leftSide = divider;
            rightSide = maxPageButtons - leftSide;

            if (this.state.selectedPageNumber > this.state.pageCount - divider) {
                rightSide = this.state.pageCount - this.state.selectedPageNumber;
                leftSide = maxPageButtons - rightSide;
            } else if (this.state.selectedPageNumber < divider) {
                leftSide = this.state.selectedPageNumber;
                rightSide = maxPageButtons - leftSide;
            }

            for (let page = 1; page <= this.state.pageCount; page++) {
                if (page <= margin) {
                    pageItems.push(this.getPageNumberView(page));
                    continue;
                }

                if (page === this.state.pageCount) {
                    pageItems.push(this.getPageNumberView(page));
                    continue;
                }

                if ((page - 1 > this.state.selectedPageNumber - leftSide) && (page < this.state.selectedPageNumber + rightSide)) {
                    if (this.state.selectedPageNumber + rightSide >= this.state.pageCount) {
                        pageItems.push(this.getPageNumberView(page));
                        continue;
                    }
                    if (breakViewAdded) {
                        breakViewAdded = false;
                    } else {
                        pageItems.push(this.getPageNumberView(page));
                    }
                    continue;
                }

                // If a page is clicked and on the right side of the pagination there exists a page or pages with value
                // more than max page buttons, Make sure that the second page is a break view
                if (page === 2) {
                    pageItems.push(createElement(BreakView, {}));
                    breakViewAdded = true;
                    continue;
                }

                if (page === this.state.pageCount - 1) {
                    pageItems.push(createElement(BreakView, {}));
                }
            }
        }

        return createElement("ul", {}, pageItems);
    }

    private getPageNumberView(pageNumber: number) {
        return createElement(PageNumberView, {
            key: `key${pageNumber}`,
            onClick: () => this.handleSelectedPage(pageNumber),
            page: pageNumber,
            selected: this.state.selectedPageNumber === pageNumber
        });
    }

    private handleSelectedPage(selectedPageNumber: number) {
        const currentOffset = (selectedPageNumber - 1) * this.props.offset;

        if (this.state.selectedPageNumber === selectedPageNumber) {
            return;
        }

        this.setState({
            currentOffset,
            nextIsDisabled: (currentOffset + this.props.offset) >= this.props.listViewSize,
            previousIsDisabled: currentOffset <= 0,
            selectedPageNumber
        });

        this.props.onClickAction(currentOffset, selectedPageNumber);
    }

    private getMessageStatus(message?: string): string {
        const currentOffset = this.state.currentOffset;
        const { listViewSize, offset } = this.props;
        let fromValue = currentOffset + 1;
        let toValue = 0;

        if (listViewSize === 0) {
            fromValue = 0;
        } else if (listViewSize < offset || (currentOffset + offset) > listViewSize) {
            toValue = listViewSize;
        } else {
            toValue = currentOffset + offset;
        }

        if (message) {
            const totalPages = offset && offset !== 0 ? Math.ceil(listViewSize / offset) : listViewSize;

            return message
                .replace("{firstItem}", fromValue.toString())
                .replace("{lastItem}", toValue.toString())
                .replace("{totalItems}", listViewSize.toString())
                .replace("{currentPageNumber}", this.state.selectedPageNumber.toString())
                .replace("{totalPages}", totalPages.toString());
        }

        return this.props.getMessageStatus(fromValue, toValue, listViewSize);
    }

    static getShowIcon(buttonProps?: PageButtonProps): IconType {
        return buttonProps ? buttonProps.showIcon as IconType : "default";
    }
}
