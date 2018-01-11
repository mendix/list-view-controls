import { createElement } from "react";
import { configure, shallow } from "enzyme";
import Adapter = require("enzyme-adapter-react-16");

import { HeaderSort, HeaderSortProps } from "../HeaderSort";
import * as classNames from "classnames";

configure({ adapter: new Adapter() });

describe("HeaderSort", () => {

    const renderSort = (props: HeaderSortProps) => shallow(createElement(HeaderSort, props));

    const defaultProps: HeaderSortProps = {
        caption: "Header",
        initialSorted: true,
        onClickAction: () => jasmine.any(Function) as any,
        sortAttribute: "",
        sortOrder: "asc"
    };

    it("renders the structure correctly", () => {
        const wrapper = renderSort(defaultProps);

        expect(wrapper).toBeElement(
            createElement("div", {
                className: "sort-header",
                onClick: jasmine.any(Function) as any
            },
            createElement("span", { className: "" }, defaultProps.caption),
            createElement("span", { className: classNames("sortIcon", defaultProps.sortOrder) })
        ));
    });

    it("renders with the specified default sort", () => {
        const props: HeaderSortProps = {
            ...defaultProps,
            initialSorted: true,
            sortOrder: "desc"
        };
        const wrapper = renderSort(props).childAt(1);

        expect(wrapper.hasClass("desc")).toBe(true);
    });

    it("changes listview sort order when its clicked ", (done) => {
        const newValue = "Name";
        const props: HeaderSortProps = {
            ...defaultProps,
            onClickAction: () => jasmine.any(Function) as any,
            sortAttribute: "Name",
            sortOrder: "asc"
        };
        spyOn(props, "onClickAction").and.callThrough();
        const headerSort = renderSort(props);
        const headerSortInstance = headerSort.instance() as any;

        headerSort.simulate("click", {
            currentTarget: { childElementCount: 2 }
        });
        headerSort.setState({ isClicked: true });
        headerSortInstance.componentWillReceiveProps(props);

        setTimeout(() => {
            expect(props.onClickAction).toHaveBeenCalledWith(newValue, "desc");
            done();
        }, 1000);
    });
});
