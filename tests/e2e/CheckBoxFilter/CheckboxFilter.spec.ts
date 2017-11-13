import defaultFilter from "./pages/default.page";

describe("CheckBoxFilter", () => {
    /*
        widget properties in sandbox:
        - Checked: Official language is "English"
        - UnChecked: Continent is "Africa"
        - default: Unchecked
    */
    beforeAll(() => {
        defaultFilter.open();
    });

    describe("when default is not set", () => {
        it("the checkbox is unchecked", () => {
            defaultFilter.checkBoxFilter.waitForVisible();
            const checkBoxFilter = defaultFilter.checkBoxFilter;
            const checked = checkBoxFilter.isSelected() as boolean;
            expect(checked).toBe(false);
        });

        it("the listview filters only 'African' countries", () => {
            defaultFilter.listView.waitForVisible();
            defaultFilter.listViewItems.waitForVisible();
            const listViewItems = defaultFilter.listViewItems;
            for (const item of listViewItems.getHTML() as any) {
                expect(item).toContain("Africa");
            }
        });
    });

    describe("when clicked", () => {
        beforeAll(() => {
            defaultFilter.checkBoxFilter.waitForVisible();
            defaultFilter.checkBoxFilter.click();
        });

        it("the checkbox is checked", () => {
            defaultFilter.checkBoxFilter.waitForVisible();
            const checkBoxFilter = defaultFilter.checkBoxFilter;
            const checked = checkBoxFilter.isSelected() as boolean;
            expect(checked).toBe(true);
        });

        it("the listview filters only 'English' speaking countries", () => {
            defaultFilter.listView.waitForVisible();
            defaultFilter.listViewItems.waitForVisible();
            const listViewItems = defaultFilter.listViewItems;
            for (const item of listViewItems.getHTML() as any) {
                expect(item).toContain("English");
            }
        });
    });
});
