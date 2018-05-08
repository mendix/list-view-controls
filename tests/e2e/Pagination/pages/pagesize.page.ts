class PageSize {

    public get pageSizeDropdown() {
        return browser.element(".pagination .page-size");
    }

    public get pageSizeDropdownSelect() {
        return browser.element(".pagination .page-size select");
    }
    public get listView() { return browser.element("#mxui_widget_ListView_0"); }

    public get listViewItems() { return browser.elements("#mxui_widget_ListView_0 .mx-listview-item"); }

    public get pageSizeInput() {
        return browser.element("#mxui_widget_ReactCustomWidgetWrapper_1 > div > div > input");
    }

    public get pageSizeInputListView() {
        return browser.element("#mxui_widget_ListView_1");
    }
    public get pageSizeInputListViewItems() { return browser.elements("#mxui_widget_ListView_1 .mx-listview-item"); }

    public openPageSizeDropdown(): void {
        browser.url("/p/page-size-dropdown");
    }

    public openPageSize(): void {
        browser.url("/p/page-size");
    }
}

const pageSize = new PageSize();
export default pageSize;
