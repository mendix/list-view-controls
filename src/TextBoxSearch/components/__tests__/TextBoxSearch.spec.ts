import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

configure({ adapter: new Adapter() });

import { TextBoxSearch, TextBoxSearchProps } from "../TextBoxSearch";

describe("TextBoxSearch", () => {
    const renderSearchBar = (props: TextBoxSearchProps) => shallow(createElement(TextBoxSearch, props));
    const textSearchProps: TextBoxSearchProps = {
        defaultQuery: "",
        onTextChange:  jasmine.any(Function) as any,
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
                }),
                createElement("button",
                    {
                        className: "",
                        onClick: jasmine.any(Function) as any
                    },
                    createElement("span", { className: "glyphicon glyphicon-remove" })
                )
            )
        );
    });

    it("renders with the specified placeholder", () => {
        const newSearchProps: TextBoxSearchProps = {
            defaultQuery: "",
            onTextChange:  jasmine.any(Function) as any,
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
                }),
                createElement("button", { className: "btn-transparent" },
                    createElement("span", { className: "glyphicon glyphicon-remove" })
                )
            )
        );
    });

    describe("input", () => {
        it("accepts value", (done) => {
            const newValue = "Kenya";
            const barProps: TextBoxSearchProps = {
                ...textSearchProps,
                onTextChange: value => value
            };
            spyOn(barProps, "onTextChange").and.callThrough();
            const wrapper = renderSearchBar(barProps);
            const input: any = wrapper.find("input");

            input.simulate("change", { currentTarget: { value: newValue } });

            setTimeout(() => {
                expect(barProps.onTextChange).toHaveBeenCalledWith(newValue);
                done();
            }, 1000);
        });

        it("renders with specified default query", () => {
            const newSearchProps: TextBoxSearchProps = {
                defaultQuery: "Birds",
                onTextChange: jasmine.any(Function) as any,
                placeholder: "search"
            };
            const searchBar = renderSearchBar(newSearchProps);

            expect(searchBar.state().query).toEqual("Birds");
        });

        it("updates when the search value changes", () => {
            const newValue = "en";
            const barProps: TextBoxSearchProps = {
                ...textSearchProps,
                onTextChange: value => value
            };
            spyOn(barProps, "onTextChange").and.callThrough();
            const wrapper = renderSearchBar(barProps);
            const input: any = wrapper.find("input");

            input.simulate("change", { currentTarget: { value: "as" } });

            setTimeout(() => {
                expect(barProps.onTextChange).toHaveBeenCalledWith("as");

                input.simulate("change", { currentTarget: { value: newValue } });

                setTimeout(() => {
                    expect(barProps.onTextChange).toHaveBeenCalledWith(newValue);
                }, 1000);
            }, 1000);
        });

        it("is cleared when the remove button is clicked", () => {
            const textSearch = renderSearchBar(textSearchProps);
            const input: any = textSearch.find("input");

            input.simulate("change", { currentTarget: { value: "as" } });
            setTimeout(() => {
                const button: any = textSearch.find("button");

                button.simulate("click", { currentTarget: { } });

                setTimeout(() => {
                    expect(input.get(0).value).toBe("");
                }, 1000);
            }, 1000);
        });
    });
});
