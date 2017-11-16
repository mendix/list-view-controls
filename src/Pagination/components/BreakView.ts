import { SFC, createElement } from "react";
import * as classNames from "classnames";

export const BreakView: SFC<{}> = () => {
    return createElement("li", { className: classNames("break-view") },
        "..."
    );
};

BreakView.displayName = "BreakView";
