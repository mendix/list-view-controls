import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { OptionProps, PageSizeSelect, PageSizeSelectProps } from "../PageSizeSelect";

configure({ adapter: new Adapter() });

describe("PageSizeDropdown", () => {
    const shallowPageSizeSelect = (props: PageSizeSelectProps) => shallow(createElement(PageSizeSelect, props));
    const sizeOptions: OptionProps[] = [
        {
            size: 2,
            caption: "Two"
        },
        {
            size: 5,
            caption: "Five"
        },
        {
            size: 10,
            caption: "Ten"
        }
    ];

    const pageSizeSelectProps: PageSizeSelectProps = {
        onChange: () => jasmine.any(Function) as any,
        pageSize: 2,
        sizeOptions,
        listViewSize: 4,
        currentPage: 1
    };

    const expectedDropDown = (props: PageSizeSelectProps) => {
        const displayOptions = props.sizeOptions.map((sizeOption, index) => ({
            ...sizeOption,
            selectedValue: `${index}`
        }));

        return createElement("select",
            {
                className: "form-control",
                onChange: jasmine.any(Function) as any,
                value: PageSizeSelect.getSelectedValue(props.sizeOptions, 2)
            },
            PageSizeSelect.createOptions(displayOptions)
        );
    };

    it("render the expected structure", () => {
        const props = pageSizeSelectProps;
        const pageSize = shallowPageSizeSelect(props);

        expect(pageSize).toBeElement(
            createElement("div",
                { className: "page-size" },
                expectedDropDown(props)
            )
        );
    });

    it("render with default page size value", () => {
        const props = {
            ...pageSizeSelectProps,
            pageSize: 5 // default page size
        };
        const pageSize = shallowPageSizeSelect(props);

        expect(pageSize.find("select").props().value).toBe("1"); // because the selected page-size 5 is index 1
    });

    it("selecting a new value should call onchange prop function with new OnChangeProps", (done) => {
        const props = { ...pageSizeSelectProps, pageSize: 5 };
        spyOn(props, "onChange").and.callThrough();

        const wrapper = shallowPageSizeSelect(props);
        const select = wrapper.find("select");

        select.simulate("change", { currentTarget : { value: "2" } }); // Index 2 is page size 10

        setTimeout(() => {
            expect(props.onChange).toHaveBeenCalledWith(
                0, // newOffSet
                10 // Index 2 is page size 10
            );
            done();
        }, 500);
    });

});
