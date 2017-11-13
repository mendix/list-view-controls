import { createElement } from "react";
import { shallow } from "enzyme";

import { CheckboxFilter, CheckboxFilterProps } from "../CheckBoxFilter";

describe("CheckBoxFilter", () => {
    const renderCheckBoxFilter = (filterProps: CheckboxFilterProps) => shallow(createElement(CheckboxFilter, filterProps));

    it("renders the structure correctly", () => {
        const props: CheckboxFilterProps = {
            handleChange: jasmine.any(Function) as any,
            isChecked: true
        };
        const checkBoxFilter = renderCheckBoxFilter(props);

        expect(checkBoxFilter).toBeElement(
            createElement("input", {
                checked: props.isChecked,
                defaultChecked: props.isChecked,
                onChange: jasmine.any(Function) as any,
                type: "checkbox"
            })
        );
    });

    it("should call onchange function when checked", () => {
        const props: CheckboxFilterProps = {
            handleChange: value => value,
            isChecked: false
        };
        spyOn(props, "handleChange").and.callThrough();
        const wrapper = renderCheckBoxFilter(props);
        const input = wrapper.find("input");

        input.simulate("change", { target: { checked: true } });
        expect(props.handleChange).toHaveBeenCalledWith(true);
    });
});
