class Home {
    public get paginationOne() { return $(".mx-name-pagination9"); }

    public get listViewOne() { return $(".mx-name-listView1"); }

    public get nextButton() { return $(".mx-name-pagination9 > div > button.btn.mx-button.mx-name-paging-next"); }

    public get firstButton() { return $(".mx-name-pagination9 > div > button.btn.mx-button.mx-name-paging-first"); }

    public get previousButton() { return $(".mx-name-pagination9 > div > button.btn.mx-button.mx-name-paging-previous"); }

    public get customButtonTwo() { return $("#mxui_widget_ReactCustomWidgetWrapper_0 > div > ul > li:nth-child(2)"); }

    public get lastButton() { return $(".mx-name-pagination9 > div > button.btn.mx-button.mx-name-paging-last"); }

    public get listViewFirstItem() { return $(".mx-name-listView1 > ul > li.mx-name-index-0 > div > div > span"); }

    public get listViewThirdItem() { return $(".mx-name-listView1 > ul > li.mx-name-index-2 > div > div > span"); }

    public get listView4ThirdItem() { return $("ul > li.mx-name-index-2"); }

    public get listViewFifthItem() { return $(".mx-name-listView1 > ul > li.mx-name-index-4 > div > div > span"); }

    public get listViewSeventhItem() { return $(".mx-name-listView1 > ul > li.mx-name-index-6 > div > div > span"); }

    public get listViewNinethItem() { return $(".mx-name-listView1 > ul > li.mx-name-index-8 > div > div > span"); }

    public get listViewLastItem() { return $(".mx-name-listView1 > ul > li.mx-name-index-18 > div > div > span"); }

    public open(): void {
        browser.url("/p/pagination");
    }
    public openCustom(): void {
        browser.url("/p/pagination-custom");
    }
}
const home = new Home();
export default home;
