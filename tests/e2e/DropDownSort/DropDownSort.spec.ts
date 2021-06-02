import page from "./pages/home.page";

const testValue = "Red";
const textFilterValue = "Re";

describe("Drop down sort", () => {
    beforeEach(() => {
        page.open();
    });
    it("when rendered the list view should be sorted by default", () => {
        page.dropdownSort.waitForDisplayed();
        page.listViewFirstItem.waitForDisplayed();
        browser.pause(2000);

        const itemValue = page.listViewFirstItem.getHTML();
        expect(itemValue).toContain(testValue);
    });

    it("should sort using list view built-in search filter", () => {
        const searchBar = $(".mx-listview-searchbar input");
        searchBar.waitForDisplayed();
        searchBar.setValue(textFilterValue);
        browser.waitUntil(() => {
            return page.listViewList.length === 1;
        }, 5000, "Wait for single item.");
        const itemValue = page.listViewFirstItem.getHTML();
        expect(itemValue).toContain(textFilterValue);

        const dropDown = $(".form-control");
        dropDown.click();
        dropDown.$$("option")[1].click();
        const itemValueSort = page.listViewFirstItem.getHTML();
        expect(itemValueSort).toContain(testValue);

    });
});
