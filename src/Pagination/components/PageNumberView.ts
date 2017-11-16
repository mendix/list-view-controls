import { SFC, createElement } from "react";
import * as classNames from "classnames";

export interface PageNumberViewProps {
    className?: string;
    onClick: () => void;
    page: number;
    selected: boolean;
}

export const PageNumberView: SFC<PageNumberViewProps> = (props) => {
    return createElement("li", {
            className: classNames(
                props.className,
                props.selected ? "active" : "",
                props.page < 10 ? "single-digit" : ""
            ),
            onClick: props.onClick
        },
        props.page
    );
};

PageNumberView.displayName = "PageNumberView";
