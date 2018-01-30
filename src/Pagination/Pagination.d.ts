import { WrapperProps } from "../Shared/SharedUtils";

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

export interface ModelerProps extends WrapperProps {
    caption: string;
    hideUnusedPaging: boolean;
    items: ItemType[];
    pagingStyle: PageStyleType;
}
