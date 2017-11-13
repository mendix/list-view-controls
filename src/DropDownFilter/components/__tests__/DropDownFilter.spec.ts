import { createElement } from "react";
import { shallow } from "enzyme";

import { DropDownFilter, DropDownFilterProps } from "../DropDownFilter";

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
        it("changes value", (done) => {
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

            setTimeout(() => {
                expect(props.handleChange).toHaveBeenCalledWith(undefined);
                done();
            }, 1000);
        });

        it("updates when the select option changes", (done) => {
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
            spyOn(props, "handleChange").and.callThrough();
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

            setTimeout(() => {
                expect(props.handleChange).toHaveBeenCalledWith(undefined);

                select.simulate("change", {
                    currentTarget: {
                        selectedOptions: [
                            { getAttribute: (_attribute: string) => "Name" }
                        ],
                        value: newValue
                    }
                });

                setTimeout(() => {
                    expect(props.handleChange).toHaveBeenCalledWith(undefined);
                    done();
                }, 1000);
            }, 1000);
        });
    });
});
