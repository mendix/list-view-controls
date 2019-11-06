import page from "./pages/home.page";

const testValue = "Uganda";

describe("Text box search", () => {
    it("when query is entered in the search input the list view should be filtered", () => {
        page.open();
        page.searchInput.waitForDisplayed();
        expect(page.listViewListItems.length).toBe(5);
        page.searchInput.click();
        page.searchInput.setValue(testValue);
        browser.pause(1000);
        expect(page.listViewListItems.length).toBe(1);
    });

    it("when query is entered in the search input and clear button clicked the list view should be filtered with new query", () => {
        page.open();
        page.searchInput.waitForDisplayed();
        page.searchInput.click();
        page.searchInput.setValue(testValue);

        browser.waitUntil(() => {
            return page.listViewListItems.length === 1;
        }, 5000, "wait for single item");
        expect(page.listViewListItems.length).toBe(1);

        page.searchButton.click();

        browser.waitUntil(() => {
            return page.listViewListItems.length === 5;
        }, 5000, "wait for clear search");
        expect(page.listViewListItems.length).toBe(5);

        page.searchInput.setValue("en");

        browser.waitUntil(() => {
            return page.listViewListItems.length === 4;
        }, 5000, "wait for search items");
        expect(page.listViewListItems.length).toBe(4);
    });
});
