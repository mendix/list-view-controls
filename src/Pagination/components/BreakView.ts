import { createElement } from "react";
import classNames from "classnames";

export const BreakView = () => createElement("li", { className: classNames("break-view"), "aria-hidden": true }, "...");

BreakView.displayName = "BreakView";
