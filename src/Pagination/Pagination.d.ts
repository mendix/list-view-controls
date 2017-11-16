export type PageStyleType = "custom" | "default" | "pageNumberButtons";

export type ButtonType = "firstButton" | "lastButton" | "nextButton" | "previousButton" | "buttonCaption" | "text" | "pageNumberButtons";

export type IconType = "default" | "none";

export type UpdateSourceType = "multiple" | "other";

export interface ItemType {
    buttonCaption: string;
    item: ButtonType;
    maxPageButtons: number;
    showIcon: IconType;
    text: string;
}

export interface ModelerProps {
    caption: string;
    hideUnusedPaging: boolean;
    items: ItemType[];
    maxPageButtons: number;
    pagingStyle: PageStyleType;
}

export interface WrapperProps extends ModelerProps {
    "class"?: string;
    friendlyId: string;
    mxform: mxui.lib.form._FormBase;
    style: string;
}
