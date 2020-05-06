import { SFC, createElement } from "react";
import * as classNames from "classnames";

interface BreakProps {
    key: string;
}

export const BreakView: SFC<BreakProps> = (props) => createElement("li", { className: classNames("break-view"), key: props.key },
    "..."
);

BreakView.displayName = "BreakView";
