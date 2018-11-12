import { ListView } from "../../Shared/SharedUtils";

export const hideLoadMoreButton = (targetNode?: HTMLElement | null) => {
    if (targetNode) {
        const buttonNode = targetNode.querySelector(".mx-listview-loadMore") as HTMLButtonElement;

        if (buttonNode) {
            buttonNode.classList.add("widget-pagination-hide-load-more");
        }
    }
};

export const showLoadMoreButton = (targetNode?: HTMLElement | null) => {
    if (targetNode) {
        const buttonNode = targetNode.querySelector(".mx-listview-loadMore") as HTMLButtonElement;

        if (buttonNode) {
            buttonNode.classList.remove("widget-pagination-hide-load-more");
        }
    }
};

export const resetListViewStructure = (targetNode: HTMLElement) => {
    const listNode = targetNode.querySelector("ul") as HTMLUListElement;

    listNode.style.removeProperty("height");
    listNode.style.removeProperty("overflow");
};

export const getListNode = (targetNode: HTMLElement): HTMLUListElement => {
    return targetNode.querySelector("ul") as HTMLUListElement;
};

export const setListNodeToEmpty = (listNode: HTMLUListElement) => {
    logger.debug("setListNodeToEmpty");
    // Explicitly remove children as IE does not like listNode.innerHTML = "";
    while (listNode.firstChild) {
        listNode.removeChild(listNode.firstChild);
    }
};

export const showLoader = (targetListView: ListView) => {
    logger.debug("showLoader");
    targetListView.domNode.classList.add("widget-pagination-loading");
};

export const hideLoader = (targetListView: ListView) => {
    logger.debug("hideLoader");
    targetListView.domNode.classList.remove("widget-pagination-loading");
};

export const mxTranslation = (namespace: string, key: string, replacements: any[]) => {
    const templateString = mx.session.getConfig(`uiconfig.translations.${namespace}.${key}`)
        || window.mx.session.getConfig("uiconfig.translations")[`${namespace}.${key}`]
        || "[No translation]";
    return replacements.reduce((substituteMessage, value, index) => substituteMessage.split("{" + (index + 1) + "}").join(value), templateString);
};
