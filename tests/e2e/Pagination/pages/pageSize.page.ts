class PageSize {

    public get pageSizeDropdown() {
        return browser.element(".pagination .page-size");
    }

    public get listView() { return browser.element(".mx-listview"); }

    public get listViewItems() { return this.listView.elements(".mx-listview-item"); }

    public openPageSizeDropdown(): void {
        browser.url("/p/page-size");
    }

}

const pageSize = new PageSize();
export default pageSize;
