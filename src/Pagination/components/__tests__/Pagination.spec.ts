import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { Pagination, PaginationProps } from "../Pagination";
import { PageButton, PageButtonProps } from "../PageButton";
import { ButtonType, IconType } from "../../Pagination";
import { PageNumberView, PageNumberViewProps } from "../PageNumberView";
import { PageSizeSelect } from "../PageSizeSelect";

configure({ adapter: new Adapter() });

describe("Pagination", () => {

    describe("when default", () => {

        it("renders the structure", () => {
            const pagination = shallowRenderPagination(defaultStylePaginationProps);

            expect(pagination).toBeElement(
                createElement("div", { className: "pagination visible", role: "navigation", "aria-label": "List pagination" },
                    getDefaultPageButtons(defaultPageButtonProps)
                )
            );
        });

        it("is not visible when hide un-used property is set", () => {
            const paginationProps: PaginationProps = {
                ...defaultStylePaginationProps,
                hideUnusedPaging: true,
                listViewSize: 10,
                pageSize: 10
            };

            const pagination = shallowRenderPagination(paginationProps);

            expect(pagination).toBeElement(
                createElement("div", { className: "pagination hidden", role: "navigation", "aria-label": "List pagination" },
                    getDefaultPageButtons(defaultPageButtonProps)
                )
            );
        });

        it("renders the structure as disabled when list view is empty", () => {
            const paginationProps: PaginationProps = {
                ...defaultStylePaginationProps,
                listViewSize: 0,
                offset: 0,
                pageSize: 10
            };

            const pagination = shallowRenderPagination(paginationProps);

            expect(pagination).toBeElement(
                createElement("div", { className: "pagination visible", role: "navigation", "aria-label": "List pagination" },
                    getDefaultPageButtons(defaultPageButtonProps)
                )
            );
        });
    });

    it("renders default page buttons", () => {
        const pagination = shallowRenderPagination({ ...defaultStylePaginationProps, pagingStyle: "pageNumberButtons" });

        expect(pagination).toBeElement(
            createElement("div", { className: "pagination visible", role: "navigation", "aria-label": "List pagination" },
                createElement(PageNumberView, defaultPageNumberViewProps)
            )
        );
    });

    describe("when custom", () => {

        it("renders the entire structure when the page count is less then maximum number of buttons ", () => {
            const pagination = shallowRenderPagination(customStylePaginationProps);

            expect(pagination).toBeElement(
                createElement("div", { className: "pagination visible", role: "navigation", "aria-label": "List pagination" },
                    getCustomPageButtons()
                )
            );
        });

        it("renders the structure with correct custom message when list view is empty", () => {
            const paginationProps: PaginationProps = {
                ...customStylePaginationProps,
                listViewSize: 0,
                pageSize: 0
            };

            const pagination = shallowRenderPagination(paginationProps);

            expect(pagination).toBeElement(
                createElement("div", { className: "pagination visible", role: "navigation", "aria-label": "List pagination" },
                    getCustomPageButtons()
                )
            );
        });
    });

    describe("on navigation", () => {

        it("when first button is clicked set page to 1", () => {
            const paginationProps: PaginationProps = {
                ...defaultStylePaginationProps,
                onChange: jasmine.createSpy("onChange")
            };
            const pagination = shallowRenderPagination(paginationProps);
            const paginationInstance = pagination.instance() as Pagination;
            paginationInstance.setState({ currentOffset: 2 });

            const firstPageButton = pagination.find(PageButton).at(0);
            firstPageButton.props().onClickAction!();

            expect(paginationProps.onChange).toHaveBeenCalled();
            expect(paginationInstance.state.currentOffset).toBe(0);
        });

        it("when previous button is clicked and page is 8, set page to 7", () => {
            const paginationProps: PaginationProps = {
                ...customStylePaginationProps,
                onChange: jasmine.createSpy("onChange")
            };
            const pagination = shallowRenderPagination(paginationProps);
            const paginationInstance = pagination.instance() as Pagination;
            paginationInstance.setState({ currentOffset: 14 });

            const previousPageButton = pagination.find(PageButton).at(1);
            previousPageButton.props().onClickAction!();

            expect(paginationProps.onChange).toHaveBeenCalled();
            expect(paginationInstance.state.currentOffset).toBe(12);
        });

        it("when previous button is clicked and page number is at start, disable previous button", () => {
            const paginationProps: PaginationProps = {
                ...customStylePaginationProps,
                onChange: jasmine.createSpy("onChange")
            };

            const pagination = shallowRenderPagination(paginationProps);
            const paginationInstance = pagination.instance() as Pagination;
            paginationInstance.setState({ currentOffset: 2 });
            const previousPageButton = pagination.find(PageButton).at(1);
            previousPageButton.props().onClickAction!();

            expect(paginationProps.onChange).toHaveBeenCalled();
            expect(paginationInstance.state.currentOffset).toBe(0);
        });

        it("when next button is clicked and page is 4, set page to 5", () => {
            const paginationProps: PaginationProps = {
                ...customStylePaginationProps,
                onChange: jasmine.createSpy("onChange")
            };

            const pagination = shallowRenderPagination(paginationProps);
            const paginationInstance = pagination.instance() as Pagination;
            paginationInstance.setState({ currentOffset: 6 });
            const nextPageButton = pagination.find(PageButton).at(2);
            nextPageButton.props().onClickAction!();

            expect(paginationProps.onChange).toHaveBeenCalled();
            expect(paginationInstance.state.currentOffset).toBe(8);
        });

        it("when last button is clicked set page to page count", () => {
            const paginationProps: PaginationProps = {
                ...customStylePaginationProps,
                onChange: jasmine.createSpy("onChange")
            };

            const pagination = shallowRenderPagination(paginationProps);
            const paginationInstance = pagination.instance() as Pagination;
            paginationInstance.setState({ currentOffset: 6 });
            const lastPageButton = pagination.find(PageButton).at(3);
            lastPageButton.props().onClickAction!();

            expect(paginationProps.onChange).toHaveBeenCalled();
            expect(paginationInstance.state.currentOffset).toBe(30);
        });

        it("with non even number of page items, when last button is clicked set page to page count", () => {
            const paginationProps: PaginationProps = {
                ...customStylePaginationProps,
                listViewSize: 33,
                onChange: jasmine.createSpy("onChange")
            };

            const pagination = shallowRenderPagination(paginationProps);
            const paginationInstance = pagination.instance() as Pagination;
            paginationInstance.setState({ currentOffset: 6 });
            const lastPageButton = pagination.find(PageButton).at(3);
            lastPageButton.props().onClickAction!();

            expect(paginationProps.onChange).toHaveBeenCalled();
            expect(paginationInstance.state.currentOffset).toBe(32);
        });

        it("when same custom page button 5 is clicked do nothing", () => {
            const paginationProps: PaginationProps = {
                ...customStylePaginationProps,
                onChange: jasmine.createSpy("onChange")
            };

            const pagination = shallowRenderPagination(paginationProps);
            const paginationInstance = pagination.instance() as Pagination;
            paginationInstance.setState({ currentOffset: 8 });
            const pageNumberButton = pagination.find(PageNumberView);
            pageNumberButton.props().onClickAction(5);

            expect(paginationProps.onChange).not.toHaveBeenCalled();
            expect(paginationInstance.state.currentOffset).toBe(8);
        });

        it("when next custom page button 6 is clicked update pagination", () => {
            const paginationProps: PaginationProps = {
                ...customStylePaginationProps,
                onChange: jasmine.createSpy("onChange")
            };

            const pagination = shallowRenderPagination(paginationProps);
            const paginationInstance = pagination.instance() as Pagination;
            paginationInstance.setState({ currentOffset: 2 });
            const pageNumberButton = pagination.find(PageNumberView);
            pageNumberButton.props().onClickAction(6);

            expect(paginationProps.onChange).toHaveBeenCalled();
            expect(paginationInstance.state.currentOffset).toBe(10);
        });
    });

    describe("on receive external state change", () => {
        it("from multiple pagination update user interface", () => {
            const pagination = shallowRenderPagination(defaultStylePaginationProps);

            pagination.setProps({
                offset: 8
            });
            const paginationInstance = pagination.instance() as Pagination;

            expect(paginationInstance.state.currentOffset).toBe(8);
        });

        it("from publish other custom widgets", () => {
            const pagination = shallowRenderPagination(defaultStylePaginationProps);

            pagination.setProps({
                offset: 8
            });
            const paginationInstance = pagination.instance() as Pagination;

            expect(paginationInstance.state.currentOffset).toBe(8);
        });
    });

    describe("with page size", () => {
        const customPageSizeProps: any = {
            pagingStyle: "custom",
            items: [
                {
                    ...itemProps,
                    item: "pageSize",
                    renderPageSizeAs: "dropdown",
                    text: ""
                }
            ],
            pageSizeOptions: [
                {
                    size: 2,
                    caption: "Two"
                },
                {
                    size: 5,
                    caption: "Five"
                },
                {
                    size: 10,
                    caption: "Ten"
                }
            ]
        };

        it("dropdown renders expected structure", () => {
            const props: any = {
                ...defaultStylePaginationProps,
                ...customPageSizeProps
            };
            const pagination = shallowRenderPagination(props);

            expect(pagination).toBeElement(
                createElement("div", { className: "pagination visible", role: "navigation", "aria-label": "List pagination" },
                    getCustomPageSizeSelect(props)
                )
            );
        });

    });

    const defaultPageButtonProps = {
        buttonType: "firstButton" as ButtonType,
        isDisabled: true,
        onClickAction: jasmine.any(Function) as any,
        showIcon: "default" as IconType
    };

    const shallowRenderPagination = (props: PaginationProps) => shallow(createElement(Pagination, props));

    const getMessageStatus = (fromValue: number, toValue: number, maxPageSize: number): string => {
        return `${fromValue} to ${toValue} of ${maxPageSize}`;
    };

    const createButton = (buttonProps?: PageButtonProps) => createElement(PageButton, {
        ...buttonProps
    });

    const getDefaultPageButtons = (pageButtonProps: PageButtonProps) => [
        createButton({ ...pageButtonProps, buttonType: "firstButton", key: 0 }),
        createButton({ ...pageButtonProps, buttonType: "previousButton", key: 1 }),
        createElement("span", { className: "paging-status", key: 2 }, "From 1 to 2 of 32, page 1 of pages 16"),
        createButton({ ...pageButtonProps, buttonType: "nextButton", key: 3 }),
        createButton({ ...pageButtonProps, buttonType: "lastButton", key: 4 })
    ];

    const getCustomPageButtons = () => {
        const props = {
            buttonCaption: "",
            isDisabled: true,
            showIcon: "default" as IconType,
            onClickAction: jasmine.any(Function) as any
        };

        return [
            createButton({ ...props, buttonType: "firstButton", key: 0 }),
            createButton({ ...props, buttonType: "previousButton", key: 1 }),
            createElement("span", { className: "paging-status", key: 2 }, "From 1 to 2 of 32, page 1 of pages 16"),
            createButton({ ...props, buttonType: "nextButton", key: 3 }),
            createButton({ ...props, buttonType: "lastButton", key: 4 }),
            createElement(PageNumberView, defaultPageNumberViewProps)
        ];
    };

    const getCustomPageSizeSelect = (props: PaginationProps) => {
        return [
            createElement(PageSizeSelect, {
                onChange: props.onChange,
                pageSize: props.pageSize,
                sizeOptions: props.pageSizeOptions,
                listViewSize: props.listViewSize,
                currentPage: 1,
                key: "key"
            })
        ];
    };

    const defaultStylePaginationProps: PaginationProps = {
        getMessageStatus: (fromValue: number, toValue: number, maxPageSize: number) => {
            return getMessageStatus(fromValue, toValue, maxPageSize);
        },
        hideUnusedPaging: false,
        offset: 0,
        items: [],
        pageSizeOptions: [],
        listViewSize: 32,
        pageSize: 2,
        onChange: jasmine.createSpy("onChange"),
        pagingStyle: "default"
    };

    const itemProps = {
        buttonCaption: "",
        item: "firstButton",
        maxPageButtons: 7,
        showIcon: "default" as IconType
    };

    const customStylePaginationProps: any = {
        ...defaultStylePaginationProps,
        items: [
            {
                ...itemProps,
                item: "firstButton"
            },
            {
                ...itemProps,
                item: "previousButton"
            },
            {
                ...itemProps,
                item: "text",
                showIcon: "none",
                text: "From {firstItem} to {lastItem} of {totalItems}, page {currentPageNumber} of pages {totalPages}"
            },
            {
                ...itemProps,
                item: "nextButton"
            },
            {
                ...itemProps,
                item: "lastButton"
            },
            {
                ...itemProps,
                item: "pageNumberButtons",
                maxPageButtons: 7
            }
        ],
        pagingStyle: "custom"
    };

    const defaultPageNumberViewProps: PageNumberViewProps = {
        maxPageButtons: 7,
        onClickAction: jasmine.any(Function) as any,
        pageCount: 16,
        selectedPageNumber: 1,
        key: "key"
    };
});
