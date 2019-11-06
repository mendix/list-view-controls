import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { DropDownFilter, DropDownFilterProps } from "../DropDownFilter";

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
            const props: DropDownFilterProps = {
                defaultFilterIndex: 1,
                filters: [ {
                    attribute: "Code",
                    attributeValue: "256",
                    caption: "Country",
                    constraint: "",
                    filterBy: "attribute",
                    isDefault: false
                } ],
                handleChange: jasmine.createSpy("onClick")
            };
            const wrapper = renderDropDownFilter(props);
            const select: any = wrapper.find("select");

            select.simulate("change", {
                currentTarget: {
                    selectedOptions: [
                        { getAttribute: (_attribute: string) => "Code" }
                    ],
                    value: "256"
                }
            });

            expect(props.handleChange).toHaveBeenCalledWith(undefined);

        });

        it("updates when the select option changes", () => {
            const newValue = "Uganda";
            const props: DropDownFilterProps = {
                defaultFilterIndex: 1,
                filters: [ {
                    attribute: "Code",
                    attributeValue: "256",
                    caption: "Country",
                    constraint: "",
                    filterBy: "attribute",
                    isDefault: false
                } ],
                handleChange: value => value
            };
            const spy = spyOn(props, "handleChange").and.callThrough();
            const wrapper = renderDropDownFilter(props);
            const select: any = wrapper.find("select");

            select.simulate("change", {
                currentTarget: {
                    selectedOptions: [
                        { getAttribute: (_attribute: string) => "Code" }
                    ],
                    value: "256"
                }
            });

            expect(spy).toHaveBeenCalledWith(undefined);

            select.simulate("change", {
                currentTarget: {
                    selectedOptions: [
                        { getAttribute: (_attribute: string) => "Name" }
                    ],
                    value: newValue
                }
            });

            expect(props.handleChange).toHaveBeenCalledWith(undefined);
        });
    });
});
