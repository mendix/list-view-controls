import { SFC, createElement } from "react";
import * as classNames from "classnames";

interface BreakProps {
    key: string;
}

export const BreakView: SFC<BreakProps> = ({ key }) => createElement("li", { className: classNames("break-view"), key },
    "..."
);

BreakView.displayName = "BreakView";
