class HomePage {

    public get dropdownSort() { return browser.element(".mx-name-dropdownSort1"); }

    public get listViewList() { return browser.elements(".mx-name-listView1 .mx-listview-list"); }

    public get listViewFirstItem() { return browser.elements(".mx-name-listView1 > ul > li.mx-listview-item.mx-name-index-0 > div > div > span"); }

    public open(): void {
        browser.url("/");
    }
}
const page = new HomePage();
export default page;
