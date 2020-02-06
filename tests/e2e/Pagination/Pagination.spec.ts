import page from "./pages/home.page";
import pagesize from "./pages/pageSize.page";
import paginationCustom from "./pages/paginationCustom.page";

const testValueOne = "Color 1";
const testValueFive = "Color 5";
const testValueSeven = "Color 7";
const testLastItemValue = "Color 19";

describe("Pagination", () => {

    it("when next button is clicked list view should have those items", () => {
        page.open();
        page.paginationOne.waitForDisplayed();
        page.nextButton.waitForDisplayed();
        page.listViewOne.waitForDisplayed();
        page.listViewFirstItem.waitForDisplayed();

        const itemValueOne = page.listViewFirstItem.getHTML();
        expect(itemValueOne).toContain(testValueOne);

        page.nextButton.click();
        page.listViewThirdItem.waitForDisplayed();
        page.nextButton.click();
        page.listViewFifthItem.waitForDisplayed();

        const itemValueFive = page.listViewFifthItem.getHTML();
        expect(itemValueFive).toContain(testValueFive);
    });

    it("when last button is clicked list view should have last items ", () => {
        page.open();
        page.paginationOne.waitForDisplayed();
        page.nextButton.waitForDisplayed();
        page.lastButton.waitForDisplayed();

        page.lastButton.click();

        const lastItemValue = page.listViewLastItem.getHTML();
        expect(lastItemValue).toContain(testLastItemValue);
    });

    it("when first button is clicked list view should show item of first page ", () => {
        page.open();
        page.paginationOne.waitForDisplayed();
        page.nextButton.waitForDisplayed();
        page.firstButton.waitForDisplayed();
        page.listViewOne.waitForDisplayed();
        page.nextButton.click();
        page.listViewThirdItem.waitForDisplayed();

        page.firstButton.click();
        page.listViewFirstItem.waitForDisplayed();

        const newItemValue = page.listViewFirstItem.getHTML();
        expect(newItemValue).toContain(testValueOne);
    });

    it("when previous button is clicked list view should show item on the previous page ", () => {
        page.open();
        page.paginationOne.waitForDisplayed();
        page.nextButton.waitForDisplayed();
        page.previousButton.waitForDisplayed();

        page.nextButton.click();
        page.listViewThirdItem.waitForDisplayed();
        page.nextButton.click();
        page.listViewFifthItem.waitForDisplayed();
        page.nextButton.click();
        page.listViewSeventhItem.waitForDisplayed();
        page.nextButton.click();
        page.listViewNinethItem.waitForDisplayed();
        page.previousButton.click();
        page.listViewSeventhItem.waitForDisplayed();

        const seventhItemValue = page.listViewSeventhItem.getHTML();
        expect(seventhItemValue).toContain(testValueSeven);
    });

    it ("should display current page and total pages", () => {
        paginationCustom.open();

        const pagingStatus = paginationCustom.pagingStatus;
        pagingStatus.waitForDisplayed();
        expect(pagingStatus.getText()).toContain("page 1 of 9");

        paginationCustom.nextButtonPaging.click();
        paginationCustom.listViewThirdItem.waitForDisplayed();

        expect(pagingStatus.getText()).toContain("page 2 of 9");

    });

    it("when custom button is clicked list view should show item on the custom page ", () => {

        paginationCustom.open();

        paginationCustom.customButtonTwo.waitForDisplayed(120000);
        paginationCustom.customButtonTwo.click();
        paginationCustom.listView4ThirdItem.waitForDisplayed();

        const thirdItemValue = paginationCustom.listView4ThirdItem.getHTML();
        expect(thirdItemValue).toContain("Color P 3");
    });

    describe("Page size dropdown", () => {
        /*
            drop down indices:
                0 is 2
                1 is 5
                2 is 10
        */
        beforeAll(() => {
            pagesize.openPageSizeDropdown();
        });

        it("to limit list view items depending on selection", () => {
            pagesize.pageSizeDropdown.waitForDisplayed();
            pagesize.listView.waitForDisplayed();

            pagesize.pageSizeDropdown.$("select").selectByIndex(1); // Index 1 is page size 5
            browser.pause(1000);
            expect(pagesize.listViewItems.length).toEqual(5);
            pagesize.pageSizeDropdown.$("select").selectByIndex(2); // Index 2 is page size 10
            browser.pause(1000);
            expect(pagesize.listViewItems.length).toEqual(10);
        });
    });

});
