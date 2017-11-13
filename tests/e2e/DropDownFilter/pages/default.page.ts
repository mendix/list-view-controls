class DefaultFilter {

    public get dropDownFilter() { return browser.element(".mx-name-dropdownFilter1"); }

    public get listViewList() { return browser.elements(".mx-name-listView0"); }

    public get listViewFirstItem() { return browser.elements(".mx-listview-item.mx-name-index-0"); }

    public open(): void {
        browser.url("/p/DefaultFilter");
    }
}
const defaultFilter = new DefaultFilter();
export default defaultFilter;
