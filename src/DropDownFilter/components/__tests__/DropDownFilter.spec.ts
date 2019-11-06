import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { DropDownFilter, DropDownFilterProps } from "../DropDownFilter";
import { FilterProps } from "../DropDownFilterContainer";

configure({ adapter: new Adapter() });

describe("DropDownFilter", () => {
    const renderDropDownFilter = (props: DropDownFilterProps) => shallow(createElement(DropDownFilter, props));
    const dropDownFilterProps: DropDownFilterProps = {
        defaultFilterIndex: 1,
        filters: [ {
            attribute: "Code",
            attributeValue: "256",
            caption: "Country",
            constraint: "",
            filterBy: "attribute",
            isDefault: false
        } ],
        handleChange: jasmine.any(Function) as any
    };

    const createOptions = (props: DropDownFilterProps) => {
        return props.filters.map((option, index) => createElement("option", {
            className: "",
            key: index,
            label: option.caption,
            value: `${index}`
        }, option.caption));
    };

    it("renders the structure correctly", () => {
        const dropDownFilter = renderDropDownFilter(dropDownFilterProps);

        expect(dropDownFilter).toBeElement(
            createElement("select", {
                className: "form-control",
                onChange: jasmine.any(Function) as any,
                value: "1"
            }, createOptions(dropDownFilterProps))
        );
    });

    describe("select", () => {
        it("changes value", () => {
            const filter: FilterProps = {
                attribute: "Code",
                attributeValue: "256",
                caption: "Country",
                constraint: "",
                filterBy: "attribute",
                isDefault: false
            };
            const props: DropDownFilterProps = {
                defaultFilterIndex: 1,
                filters: [ filter ],
                handleChange: jasmine.createSpy("onClick")
            };
            const wrapper = renderDropDownFilter(props);
            const select: any = wrapper.find("select");

            select.simulate("change", {
                currentTarget: {
                    value: "0"
                }
            });
            // tslint:disable-next-line:line no-object-literal-type-assertion
            expect(props.handleChange).toHaveBeenCalledWith({ ...filter, selectedValue: "0" } as FilterProps);

        });

        it("updates when the select option changes", () => {
            const filter: FilterProps = {
                attribute: "Code",
                attributeValue: "256",
                caption: "Country",
                constraint: "",
                filterBy: "attribute",
                isDefault: false
            };
            const filterNew: FilterProps = {
                attribute: "Code",
                attributeValue: "258",
                caption: "Country",
                constraint: "",
                filterBy: "attribute",
                isDefault: false
            };
            const props: DropDownFilterProps = {
                defaultFilterIndex: 1,
                filters: [ filter, filterNew ],
                handleChange: value => value
            };
            const spy = spyOn(props, "handleChange").and.callThrough();
            const wrapper = renderDropDownFilter(props);
            const select: any = wrapper.find("select");

            select.simulate("change", {
                currentTarget: {
                    value: "0"
                }
            });

            // tslint:disable-next-line:line no-object-literal-type-assertion
            expect(spy).toHaveBeenCalledWith({ ...filter, selectedValue: "0" } as FilterProps);

            select.simulate("change", {
                currentTarget: {
                    selectedOptions: [
                        { getAttribute: (_attribute: string) => "Code" }
                    ],
                    value: "1"
                }
            });

            // tslint:disable-next-line:line no-object-literal-type-assertion
            expect(props.handleChange).toHaveBeenCalledWith({ ...filterNew, selectedValue: "1" } as FilterProps);
        });
    });
});
