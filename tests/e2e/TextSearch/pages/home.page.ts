import { Client, Element, RawResult } from "webdriverio";

class HomePage {
    public get searchInput() { return browser.element(".mx-name-text_boxSearch1 input"); }
    public get searchButton() { return browser.element(".mx-name-text_boxSearch1 button"); }
    public get listViewList(): Client<RawResult<Element[]>> & RawResult<Element[]> {
        return browser.elements(".mx-name-listView3 .mx-listview-item");
    }

    public open(): void {
        browser.url("/p/textsearch");
    }
}
const page = new HomePage();
export default page;
