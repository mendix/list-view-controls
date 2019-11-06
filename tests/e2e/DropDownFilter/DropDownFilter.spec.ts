import defaultFilter from "./pages/default.page";

const dropDownTestValue = "Uganda";
describe("Drop down filter", () => {
    it("should filter african countries by default when the list view is rendered", () => {
        defaultFilter.open();
        defaultFilter.dropDownFilter.waitForDisplayed();
        defaultFilter.listViewFirstItem.waitForDisplayed();

        const itemValue = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValue).toContain(dropDownTestValue);
    });
});
