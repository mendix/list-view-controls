// import { Component, ReactElement, createElement } from "react";
// import * as classNames from "classnames";

// import { Alert } from "../Shared/components/Alert";
// import { SharedUtils } from "../Shared/SharedUtils";
// import { Validate } from "./Validate";

// import { PageSize, PageSizeProps } from "./components/PageSize";
// import { ContainerProps } from "./components/PageSizeContainer";

// // tslint:disable-next-line class-name
// export class preview extends Component<ContainerProps> {

//     render() {
//         return createElement("div",
//             {
//                 className: classNames("widget-page-size", this.props.class),
//                 style: SharedUtils.parseStyle(this.props.style)
//             },
//             this.renderAlert(),
//             this.renderDropDownFilter()
//         );
//     }

//     private renderAlert() {
//         return createElement(Alert, {
//             bootstrapStyle: "danger",
//             className: "widget-page-size-alert"
//         }, Validate.validateProps(this.props));
//     }

//     private renderDropDownFilter(): ReactElement<PageSizeProps> {
//         const { filters } = this.props;
//         const defaultFilterIndex = filters.indexOf(filters.filter(value => value.isDefault)[0]);

//         return createElement(PageSize, {
//             defaultFilterIndex,
//             handleChange: () => { return; },
//             sizeOptions: this.props.filters
//         });
//     }
// }

// export function getVisibleProperties(valueMap: ContainerProps, visibilityMap: any) {
//     valueMap.filters.forEach(filterAttribute => {
//         if (filterAttribute.filterBy === "attribute") {
//             visibilityMap.filters.attribute = true;
//             visibilityMap.filters.value = true;
//             visibilityMap.filters.constraint = false;
//         } else if (filterAttribute.filterBy === "XPath") {
//             visibilityMap.filters.attribute = false;
//             visibilityMap.filters.value = false;
//             visibilityMap.filters.constraint = true;
//         }
//     });

//     return visibilityMap;
// }
