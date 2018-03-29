import { ReactChild, createElement } from "react";
import { ContainerProps } from "./components/PageSizeContainer";

export class Validate {
    static validateProps(props: ContainerProps): ReactChild {
        const errorMessages: string[] = [];

        if (props.options.filter(filter => filter.isDefault).length > 1) {
            errorMessages.push("Should only have one filter set as default");
        }

        if (errorMessages.length) {
            return createElement("div", {},
                "Configuration error in widget:",
                errorMessages.map((message, key) => createElement("p", { key }, message))
            );
        }

        return "";
    }

}
