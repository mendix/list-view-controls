import defaultFilter from "./pages/default.page";

const dropDownTestValue = "Uganda";
describe("DropDownFilter", () => {
    it("should filter african countries by default when the list view is rendered", () => {
        defaultFilter.open();
        defaultFilter.dropDownFilter.waitForVisible();
        defaultFilter.listViewFirstItem.waitForVisible();

        const itemValue = defaultFilter.listViewFirstItem.getHTML();
        expect(itemValue).toContain(dropDownTestValue);
    });
});
