class PageSize {

    public get pageSizeDropdown() {
        return $(".pagination .page-size");
    }

    public get listView() { return $(".mx-listview"); }

    public get listViewItems() { return this.listView.$$(".mx-listview-item"); }

    public openPageSizeDropdown(): void {
        browser.url("/p/page-size");
    }

}

const pageSize = new PageSize();
export default pageSize;
