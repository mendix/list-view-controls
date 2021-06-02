class DefaultFilter {

    public get dropDownFilter() { return $(".mx-name-dropdownFilter1"); }

    public get listViewList() { return $$(".mx-name-listView1 > ul > li"); }

    public get listViewFirstItem() { return $(".mx-listview .mx-name-index-0"); }

    public open(): void {
        browser.url("/p/dropdownfilter");
    }
}
const defaultFilter = new DefaultFilter();
export default defaultFilter;
