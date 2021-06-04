class HomePage {

    public get dropdownSort() { return $(".mx-name-dropdownSort1"); }

    public get listViewList() { return $$(".mx-name-listView1 > ul > li"); }

    public get listViewFirstItem() {
        return $(".mx-name-listView1 > ul > li.mx-name-index-0 > div > div > span");
    }

    public open(): void {
        browser.url("/p/dropdownsort");
    }
}
const page = new HomePage();
export default page;
