class PageSize {

    public get pageSizeDropdown() {
        return $(".pagination .page-size");
    }

    public get listView() { return $(".mx-name-listView1 "); }

    public get listViewItems() { return this.listView.$$("ul > li"); }

    public openPageSizeDropdown(): void {
        browser.url("/p/page-size");
    }

}

const pageSize = new PageSize();
export default pageSize;
