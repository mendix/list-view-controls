import { WrapperProps } from "../Shared/SharedUtils";

export type PageStyleType = "custom" | "default" | "pageNumberButtons";

export type ButtonType = "firstButton" | "lastButton" | "nextButton" | "previousButton" | "buttonCaption" | "text" | "pageNumberButtons" | "pageSize";

export type IconType = "default" | "none";

export type UpdateSourceType = "multiple" | "other";
export type RenderPageSizeAs = "dropdown" | "input";

export interface ItemType {
    buttonCaption: string;
    item: ButtonType;
    maxPageButtons: number;
    showIcon: IconType;
    text: string;
    renderPageSizeAs: RenderPageSizeAs;
}

export interface PageSizeOption {
    size: number;
    caption: string;
    isDefault: boolean;
}

export interface ModelerProps extends WrapperProps {
    caption: string;
    hideUnusedPaging: boolean;
    items: ItemType[];
    pagingStyle: PageStyleType;
    enablePageSize: boolean;
    pageSizeLabel: string;
    pageSizeOptions: PageSizeOption[];
}

export interface TopicMessage {
    newOffSet: number;
    newPageNumber: number;
    newPageSize?: number;
    widgetFriendlyID?: string;
}
