class IndexPage {

    private get resetButton() { return browser.element(".mx-name-actionButton1"); }

    public tearDownSetUp(): void {
        browser.url("/p/index");
        this.resetButton.waitForVisible();
        this.resetButton.click();
    }
}
const indexPage = new IndexPage();
export default indexPage;
