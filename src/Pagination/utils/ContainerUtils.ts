import { DataSourceHelperListView } from "../../Shared/DataSourceHelper/DataSourceHelper";

export const hideLoadMoreButton = (targetNode?: HTMLElement | null) => {
    if (targetNode) {
        targetNode.classList.add("hide-load-more");
    }
};

export const showLoadMoreButton = (listView?: DataSourceHelperListView) => {
    if (listView) {
        listView.domNode.classList.remove("hide-load-more");
    }
};

export const resetListViewHeight = (targetNode: HTMLElement) => {
    const listNode = targetNode.querySelector("ul") as HTMLUListElement;

    listNode.style.removeProperty("height");
    listNode.style.removeProperty("overflow");
};
export const persistListViewHeight = (targetNode: HTMLElement) => {
    const listNode = targetNode.querySelector("ul") as HTMLUListElement;
    if (listNode.offsetHeight > 0) {
        listNode.style.height = listNode.offsetHeight + "px";
        listNode.style.overflow = "hidden";
    }
};

export const getListNode = (targetNode: HTMLElement): HTMLUListElement => {
    return targetNode.querySelector("ul") as HTMLUListElement;
};

export const setListNodeToEmpty = (targetNode: HTMLElement) => {
    logger.debug("setListNodeToEmpty");
    // Explicitly remove children as IE does not like listNode.innerHTML = "";
    const listNode = targetNode.querySelector("ul") as HTMLUListElement;
    while (listNode.firstChild) {
        listNode.removeChild(listNode.firstChild);
    }
};

export const showLoader = (targetListView: DataSourceHelperListView) => {
    logger.debug("showLoader");
    targetListView.domNode.classList.add("widget-pagination-loading");
};

export const hideLoader = (targetListView: DataSourceHelperListView) => {
    logger.debug("hideLoader");
    targetListView.domNode.classList.remove("widget-pagination-loading");
};

export const mxTranslation = (namespace: string, key: string, replacements: any[]) => {
    const templateString = mx.session.getConfig(`uiconfig.translations.${namespace}.${key}`)
        || (window.mx.session.getConfig("uiconfig.translations") as any)[`${namespace}.${key}`]
        || "[No translation]";
    return replacements.reduce((substituteMessage, value, index) => substituteMessage.split("{" + (index + 1) + "}").join(value), templateString);
};
