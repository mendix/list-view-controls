import page from "./pages/home.page";
import { dates } from "./pages/datatype.page";

const testValue = "Uganda";

describe("Text box search", () => {
    beforeAll(() => page.open());

    it("when query is entered in the search input the list view should be filtered", () => {
        page.searchInput.waitForVisible();
        page.searchInput.click();
        page.searchInput.setValue(testValue);
        browser.pause(1000);

        expect(page.listViewList.value.length).toBe(1);
    });

    it("when query is entered in the search input and clear button clicked the list view should be filtered with new query", () => {
        page.searchInput.waitForVisible();
        page.searchInput.click();
        page.searchInput.setValue(testValue);
        browser.pause(1000);

        expect(page.listViewList.value.length).toBe(1);

        page.searchButton.click();
        browser.pause(1000);

        expect(page.listViewList.value.length).toBeGreaterThan(1);

        page.searchInput.setValue("e");
        browser.pause(1000);

        expect(page.listViewList.value.length).toBeGreaterThan(2);
    });

    describe("dates", () => {
        beforeAll(() => {
            browser.url("/p/textsearch/datatypes");
        });

        it("on single attribute", () => {
            dates.singleDateSearchInput.waitForVisible();
            dates.singleDateSearchInput.setValue("1/1/2018");
            browser.pause(1000);
            dates.singleListViewDateInputs.waitForVisible();
            for (const item of dates.singleListViewDateInputs.value as any) {
                expect(item.getHTML()).toContain(dates.singleDateSearchInput.getValue());
            }
        });

    });
});
