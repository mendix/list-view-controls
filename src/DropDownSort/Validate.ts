import { ContainerProps } from "./components/DropDownSortContainer";

export class Validate {
    static validateProps(props: ContainerProps): string {
        const widgetName = props.friendlyId;

        if (props.sortAttributes && !props.sortAttributes.length) {
            return `${widgetName}: should have at least one filter`;
        }

        if (props.sortAttributes) {
            const errorMessage: string[] = [];
            props.sortAttributes.forEach((sortAttribute) => {
                if (sortAttribute.caption === "") {
                    errorMessage.push("sort caption is required");
                }
                if (sortAttribute.name === "" && !sortAttribute.name) {
                    errorMessage.push("Atleast one sort attribute is required");
                }
            });

            if (errorMessage.length) {
                return `${widgetName} : ${errorMessage.join(", ")}`;
            }
        }

        return "";
    }
}
