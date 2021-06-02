import defaultFilter from "./pages/default.page";

const dropDownTestValue = "Uganda";
const textFilterValue = "Netherlands";
describe("Drop down filter", () => {
    it("should filter african countries by default when the list view is rendered", () => {
        defaultFilter.open();
        defaultFilter.dropDownFilter.waitForDisplayed();
        defaultFilter.listViewFirstItem.waitForDisplayed();

        const itemValue = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValue).toContain(dropDownTestValue);
    });
    it("should filter using multiple type of filters", () => {
        browser.url("/p/index");

        const searchBar = $(".search-bar input");
        searchBar.waitForDisplayed();
        searchBar.setValue(textFilterValue);
        browser.waitUntil(() => {
            return defaultFilter.listViewList.length === 1;
        }, 5000, "Wait for single item.");
        const itemValue = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValue).toContain(textFilterValue);
    });
});
