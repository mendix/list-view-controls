import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { PageSize, PageSizeProps } from "../PageSize";

configure({ adapter: new Adapter() });

describe("PageSize", () => {
    const shallowRenderPageSize = (props: PageSizeProps) => shallow(createElement(PageSize, props));

    const pageSizeProps: PageSizeProps = {
        text: "",
        handleChange: () => jasmine.any(Function) as any,
        pageSize: 2,
        listViewSize: 4,
        currentOffSet: 0
    };

    it("input-text renders expected structure", () => {
        const props = { ...pageSizeProps, pageSize: 3 };
        const pageSize = shallowRenderPageSize(props);

        expect(pageSize).toBeElement(
            createElement("div", { className: "page-size" },
                createElement("input", {
                    type: "number",
                    className: "form-control",
                    onChange: jasmine.any(Function) as any,
                    value: 3
                })
            )
        );
    });

    it("render with default page size value", () => {
        const props = { ...pageSizeProps, pageSize: 5 };

        const wrapper = shallowRenderPageSize(props);
        const input = wrapper.find("input");

        expect(input.props().value).toBe(5);
    });

    it("inputting a new value should call onchange prop function with new OnChangeProps", (done) => {
        const props = { ...pageSizeProps, pageSize: 5 };
        spyOn(props, "handleChange").and.callThrough();

        const wrapper = shallowRenderPageSize(props);
        const select = wrapper.find("input");

        select.simulate("change", { currentTarget : { value: "10" } });

        setTimeout(() => {
            expect(props.handleChange).toHaveBeenCalledWith({
                newOffSet: 0,
                newPageNumber: 1,
                newPageSize: 10
            });
            done();
        }, 500);
    });

});
