import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

configure({ adapter: new Adapter() });

import { TextBoxSearch, TextBoxSearchProps } from "../TextBoxSearch";

describe("TextBoxSearch", () => {
    const renderSearchBar = (props: TextBoxSearchProps) => shallow(createElement(TextBoxSearch, props));
    const onTextChange = (_query: string) => { /* */ };
    const textSearchProps: TextBoxSearchProps = {
        defaultQuery: "",
        onTextChange,
        placeholder: "search"
    };

    it("renders the structure correctly", () => {
        const searchBar = renderSearchBar(textSearchProps);

        expect(searchBar).toBeElement(
            createElement("div", { className: "search-bar" },
                createElement("input", {
                    className: "form-control",
                    onChange: jasmine.any(Function) as any,
                    placeholder: textSearchProps.placeholder,
                    value: textSearchProps.defaultQuery
                })
            )
        );
    });

    it("renders with the specified placeholder", () => {
        const newSearchProps: TextBoxSearchProps = {
            defaultQuery: "",
            onTextChange: jasmine.any(Function) as any,
            placeholder: "search"
        };
        const searchBar = renderSearchBar(newSearchProps);

        expect(searchBar).toBeElement(
            createElement("div", { className: "search-bar" },
                createElement("input", {
                    className: "form-control",
                    onChange: jasmine.any(Function) as any,
                    placeholder: textSearchProps.placeholder,
                    value: textSearchProps.defaultQuery
                })
            )
        );
    });

    describe("input", () => {
        beforeEach(() => {
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });

        it("accepts value", () => {
            const newValue = "Kenya";
            const barProps: TextBoxSearchProps = {
                ...textSearchProps,
                onTextChange: (query: string) => query
            };
            const spy = barProps.onTextChange = jasmine.createSpy("myInputValue");
            const wrapper = renderSearchBar(barProps);
            const input: any = wrapper.find("input");

            input.simulate("change", { currentTarget: { value: newValue } });
            jasmine.clock().tick(1000);
            expect(spy).toHaveBeenCalledWith(newValue);
        });

        it("renders with specified default query", () => {
            const newSearchProps: TextBoxSearchProps = {
                defaultQuery: "Birds",
                onTextChange: jasmine.any(Function) as any,
                placeholder: "search"
            };
            const searchBar = renderSearchBar(newSearchProps);

            expect(searchBar.state("query")).toEqual("Birds");
        });

        it("updates when the search value changes", () => {
            const newValue = "en";
            const barProps: TextBoxSearchProps = {
                ...textSearchProps,
                onTextChange: value => value
            };
            const spy = spyOn(barProps, "onTextChange").and.callThrough();

            const wrapper = renderSearchBar(barProps);
            const input: any = wrapper.find("input");

            input.simulate("change", { currentTarget: { value: "as" } });
            jasmine.clock().tick(1000);

            expect(spy).toHaveBeenCalledWith("as");

            input.simulate("change", { currentTarget: { value: newValue } });
            jasmine.clock().tick(1000);

            expect(spy).toHaveBeenCalledWith(newValue);
        });

        it("is cleared when the remove button is clicked", () => {

            const barProps: TextBoxSearchProps = {
                ...textSearchProps,
                onTextChange: value => value
            };
            const spy = spyOn(barProps, "onTextChange").and.callThrough();

            const wrapper = renderSearchBar(barProps);
            const input: any = wrapper.find("input");

            input.simulate("change", { currentTarget: { value: "as" } });
            jasmine.clock().tick(1000);

            expect(spy).toHaveBeenCalledWith("as");

            const button: any = wrapper.find("button");
            button.simulate("click", { currentTarget: { } });
            jasmine.clock().tick(1000);

            expect(spy).toHaveBeenCalledWith("");
        });
    });
});
