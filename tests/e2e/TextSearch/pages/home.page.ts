class HomePage {
    public get searchInput() { return $(".mx-name-text_boxSearch1 input"); }
    public get searchClearButton() { return $(".mx-name-text_boxSearch1 button"); }
    public get listViewList() { return $(".mx-name-listView3 .mx-listview-list"); }
    public get listViewListItems() { return $$(".mx-name-listView3 > ul > li"); }
    public open(): void {
        browser.url("/p/textsearch");
    }
}
const page = new HomePage();
export default page;
