import page from "./pages/home.page";

const testValue = "Red";

describe("Drop down sort", () => {
    it("when rendered the list view should be sorted by default", () => {
        page.open();
        page.dropdownSort.waitForDisplayed();
        page.listViewFirstItem.waitForDisplayed();
        browser.pause(2000);

        const itemValue = page.listViewFirstItem.getHTML();
        expect(itemValue).toContain(testValue);
    });
});
