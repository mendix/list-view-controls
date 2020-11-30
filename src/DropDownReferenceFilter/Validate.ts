import { ReactChild, createElement } from "react";
import { ContainerProps } from "./components/DropDownReferenceFilterContainer";

export class Validate {
    static validateProps(props: ContainerProps & { isWebModeler?: boolean }): ReactChild {
        const errorMessages: string[] = [];

        if (!props.isWebModeler && window.mx.isOffline()) {
            errorMessages.push(`'Drop down reference filter is not supported in offline applications`);
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
