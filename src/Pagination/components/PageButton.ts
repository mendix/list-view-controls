import { SFC, createElement } from "react";
import * as classNames from "classnames";

import { ButtonType, IconType } from "../Pagination";

export interface PageButtonProps {
    buttonType?: ButtonType;
    showIcon?: IconType;
    onClickAction?: () => void;
    isDisabled?: boolean;
    buttonCaption?: string;
    key?: string | number;
}

export const PageButton: SFC<PageButtonProps> = (props) => {
    let iconClass = "";
    let cssClass = "";
    let ariaLabel = "";
    const disabledClass = { disabled: props.isDisabled };
    const onClick = !props.isDisabled ? props.onClickAction : () => {
        return;
    };

    if (props.buttonType === "firstButton") {

        cssClass = "btn mx-button mx-name-paging-first";
        iconClass = "glyphicon glyphicon-step-backward";
        ariaLabel = "Go to first page";

    } else if (props.buttonType === "previousButton") {

        cssClass = "btn mx-button mx-name-paging-previous";
        iconClass = "glyphicon glyphicon-backward";
        ariaLabel = "Go to previous page";

    } else if (props.buttonType === "nextButton") {

        cssClass = "btn mx-button mx-name-paging-next";
        iconClass = "glyphicon glyphicon-forward";
        ariaLabel = "Go to next page";

    } else if (props.buttonType === "lastButton") {

        cssClass = "btn mx-button mx-name-paging-last";
        iconClass = "glyphicon glyphicon-step-forward";
        ariaLabel = "Go to last page";
    }

    if (props.showIcon === "default") {
        if (!props.buttonCaption) {
            return createElement("button", {
                    className: classNames(cssClass, disabledClass),
                    disabled: props.isDisabled,
                    onClick,
                    key: props.key,
                    "aria-label": ariaLabel
                },
                createElement("span", { className: iconClass })
            );
        } else {
            if (props.buttonType === "firstButton" || props.buttonType === "previousButton") {
                return createElement("button", {
                        className: classNames(cssClass, disabledClass),
                        disabled: props.isDisabled,
                        onClick,
                        key: props.key,
                        "aria-label": props.buttonCaption
                    },
                    createElement("span", { className: iconClass }),
                    createElement("span", { className: props.buttonType },
                        props.buttonCaption
                    )
                );
            }

            return createElement("button", {
                    className: classNames(cssClass, disabledClass),
                    disabled: props.isDisabled,
                    onClick,
                    key: props.key,
                    "aria-label": props.buttonCaption
                },
                createElement("span", { className: props.buttonType },
                    props.buttonCaption
                ),
                createElement("span", { className: iconClass })
            );
        }
    } else if (props.showIcon === "none" && props.buttonCaption) {
        return createElement("button", {
                className: classNames(cssClass, disabledClass),
                disabled: props.isDisabled,
                onClick,
                key: props.key,
                "aria-label": props.buttonCaption
            },
            createElement("span", { className: classNames(props.buttonType, "") },
                props.buttonCaption
            )
        );
    } else {
        return null;
    }
};

PageButton.displayName = "PageButton";
