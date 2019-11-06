import defaultFilter from "./pages/default.page";

describe("Check box filter", () => {
    /*
        widget properties in sandbox:
        - Checked: Official language is "English"
        - UnChecked: Continent is "Africa"
        - default: Unchecked
    */
    beforeAll(() => {
        defaultFilter.open();
    });

    describe("when default is not set ", () => {
        it("the checkbox is unchecked", () => {
            defaultFilter.checkBoxFilter.waitForDisplayed();
            const checkBoxFilter = defaultFilter.checkBoxFilter;
            const checked = checkBoxFilter.isSelected() as boolean;
            expect(checked).toBe(false);
        });

        it("the listview filters only 'African' countries", () => {
            defaultFilter.listView.waitForExist();
            const listViewItems = defaultFilter.listViewItems;
            for (const item of listViewItems) {
                expect(item.getHTML()).toContain("Africa");
            }
        });
    });

    describe("when clicked", () => {
        beforeAll(() => {
            defaultFilter.checkBoxFilter.waitForDisplayed();
            defaultFilter.checkBoxFilter.click();
            browser.pause(1000);
        });

        it("the checkbox is checked", () => {
            defaultFilter.checkBoxFilter.waitForDisplayed();
            const checked = defaultFilter.checkBoxFilter.isSelected() as boolean;

            expect(checked).toBe(true);
        });

        it("the listview filters only 'English' speaking countries", () => {
            defaultFilter.listView.waitForDisplayed();
            const listViewItems = defaultFilter.listViewItems;
            for (const item of listViewItems) {
                expect(item.getHTML()).toContain("English");
            }
        });
    });
});
