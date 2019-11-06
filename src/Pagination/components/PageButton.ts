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
    const disabledClass = { disabled: props.isDisabled };
    const onClick = !props.isDisabled ? props.onClickAction : () => {
        return;
    };

    if (props.buttonType === "firstButton") {

        cssClass = "btn mx-button mx-name-paging-first";
        iconClass = "glyphicon glyphicon-step-backward";

    } else if (props.buttonType === "previousButton") {

        cssClass = "btn mx-button mx-name-paging-previous";
        iconClass = "glyphicon glyphicon-backward";

    } else if (props.buttonType === "nextButton") {

        cssClass = "btn mx-button mx-name-paging-next";
        iconClass = "glyphicon glyphicon-forward";

    } else if (props.buttonType === "lastButton") {

        cssClass = "btn mx-button mx-name-paging-last";
        iconClass = "glyphicon glyphicon-step-forward";
    }

    if (props.showIcon === "default") {
        if (!props.buttonCaption) {
            return createElement("button", {
                    className: classNames(cssClass, disabledClass),
                    onClick,
                    key: props.key
                },
                createElement("span", { className: iconClass })
            );
        } else {
            if (props.buttonType === "firstButton" || props.buttonType === "previousButton") {
                return createElement("button", {
                        className: classNames(cssClass, disabledClass),
                        onClick,
                        key: props.key
                    },
                    createElement("span", { className: iconClass }),
                    createElement("span", { className: props.buttonType },
                        props.buttonCaption
                    )
                );
            }

            return createElement("button", {
                    className: classNames(cssClass, disabledClass),
                    onClick,
                    key: props.key
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
                onClick,
                key: props.key
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
