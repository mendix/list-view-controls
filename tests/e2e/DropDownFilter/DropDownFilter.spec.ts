import defaultFilter from "./pages/default.page";
import page from "../DropDownSort/pages/home.page";

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

        const checkbox = $(".widget-checkbox-filter input");
        checkbox.click();
        browser.waitUntil(() => {
            return defaultFilter.listViewList.length === 1;
        }, 5000, "Wait for single item.");
        const itemValueCheckbox = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValueCheckbox).toContain("United Kingdom");

        const searchBar = $(".search-bar input");
        checkbox.click();
        searchBar.waitForDisplayed();
        searchBar.setValue(textFilterValue);
        browser.waitUntil(() => {
            return defaultFilter.listViewList.length === 1;
        }, 5000, "Wait for single item.");
        const itemValue = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValue).toContain(textFilterValue);
    });
    it("should filter when used multiple times", () => {
        browser.url("/p/index");

        const dropDownSort = $(".widget-drop-down-sort .form-control");
        dropDownSort.click();
        dropDownSort.$$("option")[0].click();
        const itemValueSortFirst = page.listViewFirstItem.getHTML();
        expect(itemValueSortFirst).toContain("Belgium");

        dropDownSort.click();
        dropDownSort.$$("option")[1].click();
        const itemValueSortSecond = page.listViewFirstItem.getHTML();
        expect(itemValueSortSecond).toContain("United Kingdom");

        const dropDownFilter = $(".widget-drop-down-filter .form-control");
        dropDownFilter.click();
        dropDownFilter.$$("option")[1].click();
        const itemValueFilter = page.listViewFirstItem.getHTML();
        expect(itemValueFilter).toContain("Zimbabwe");

        dropDownFilter.click();
        dropDownFilter.$$("option")[2].click();
        const itemValueFilterSecond = page.listViewFirstItem.getHTML();
        expect(itemValueFilterSecond).toContain("Zimbabwe");
    });
});
