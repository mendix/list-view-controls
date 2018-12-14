import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { DropDownProps, DropDownSort, OptionHTMLAttributesType } from "../DropDownSort";

configure({ adapter: new Adapter() });

configure({ adapter: new Adapter() });

describe("DropDownSort", () => {

    const renderDropdown = (props: DropDownProps) => shallow(createElement(DropDownSort, props));

    const dropDownProps: DropDownProps = {
        onDropDownChangeAction: () => jasmine.any(Function) as any,
        sortAttributes: [
            { caption: "Name Asc", name: "Name", defaultSelected: true, sort: "asc" },
            { caption: "Name Desc", name: "Name", defaultSelected: false, sort: "desc" },
            { caption: "Code Desc", name: "Code", defaultSelected: false, sort: "desc" }
        ],
        style: {}
    };

    const createOptions = (props: DropDownProps) => {
        return props.sortAttributes.map((option, index) => {
            const { caption } = option;
            const value = `${option.name}-${index}`;
            const optionValue: OptionHTMLAttributesType = {
                className: "",
                key: value,
                label: caption,
                value
            };
            return createElement("option", optionValue, caption);
        });
    };

    it("renders the structure correctly", () => {
        const wrapper = renderDropdown(dropDownProps);

        expect(wrapper).toBeElement(
            createElement("select", {
                className: "form-control",
                onChange: jasmine.any(Function) as any,
                value: jasmine.any(String) as any
            },
                createOptions(dropDownProps)
            )
        );
    });

    it("renders with the specified default sort", () => {
        const sortAttributes = [
            { caption: "Name Asc", name: "Name", defaultSelected: false, sort: "asc" },
            { caption: "Name Desc", name: "Name", defaultSelected: true, sort: "desc" }
        ];
        const props: DropDownProps = {
            ...dropDownProps,
            sortAttributes,
            defaultSortIndex: 1
        };

        const wrapper = renderDropdown(props);
        const option = wrapper.find("select");

        expect(option.prop("value")).toBe("Name-1");
    });

    describe("select", () => {
        it("changes value", (done) => {
            const newValue = "Code";
            const props: DropDownProps = {
                ...dropDownProps,
                onDropDownChangeAction: value => value
            };
            spyOn(props, "onDropDownChangeAction").and.callThrough();
            const wrapper = renderDropdown(props);
            const select = wrapper.find("select");

            select.simulate("change", {
                currentTarget: {
                    value: newValue + "-0"
                }
            });

            setTimeout(() => {
                expect(props.onDropDownChangeAction).toHaveBeenCalledWith(props.sortAttributes[0]);
                done();
            }, 1000);
        });

        it("updates when the select option changes", (done) => {
            const newValue = "Code";
            const props: DropDownProps = {
                ...dropDownProps,
                onDropDownChangeAction: value => value
            };
            spyOn(props, "onDropDownChangeAction").and.callThrough();
            const wrapper = renderDropdown(props);
            const select = wrapper.find("select");

            select.simulate("change", {
                currentTarget: {
                    value: "Name-0"
                }
            });

            setTimeout(() => {
                expect(props.onDropDownChangeAction).toHaveBeenCalledWith(props.sortAttributes[0]);

                select.simulate("change", {
                    currentTarget: {
                        value: newValue + "-1"
                    }
                });

                setTimeout(() => {
                    expect(props.onDropDownChangeAction).toHaveBeenCalledWith(props.sortAttributes[1]);
                    done();
                }, 1000);
            }, 1000);
        });
    });
});
