import { ReactChild, createElement } from "react";
import { ContainerProps } from "./components/TextBoxSearchContainer";

export class Validate {
    static validateProps(props: ContainerProps & { isWebModeler?: boolean }): ReactChild {
        const errorMessages: string[] = [];

        if (!props.isWebModeler && window.mx.isOffline()) {
            props.attributeList.forEach((searchAttribute, index) => {
                if (searchAttribute.attribute.indexOf("/") > -1) {
                    errorMessages.push(`'Search attribute' at position {${index + 1}} over reference is not supported in offline application`);
                }
            });
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
