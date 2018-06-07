class Dates {
    public get singleDateSearchInput() {
        return browser.element(".single-date-attribute .mx-dateinput-input");
    }

    public get singleListViewDateInputs() {
        return browser.elements(".single-date-attribute [widgetid*=mxui_widget_DateInput] label");
    }

    public openPage() {
        browser.url("/p/textsearch/datatypes");
    }
}

export const dates = new Dates();
