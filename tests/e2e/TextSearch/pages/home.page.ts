import { Client, Element, RawResult } from "webdriverio";

class HomePage {
    public get searchInput() { return browser.element(".mx-name-text_boxSearch1 input"); }
    public get searchButton() { return browser.element(".mx-name-text_boxSearch1 button"); }
    public get listViewList(): Client<RawResult<Element[]>> & RawResult<Element[]> {
        return browser.elements(".mx-name-listView1 .mx-listview-list");
    }

    public open(): void {
        browser.url("/");
    }
}
const page = new HomePage();
export default page;
