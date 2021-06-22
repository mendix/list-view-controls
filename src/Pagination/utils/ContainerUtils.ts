import { DataSourceHelperListView } from "../../Shared/DataSourceHelper/DataSourceHelper";

export interface Translation {
    [key: string]: string;
}

export interface TranslationArray {
    [key: string]: string[];
}

export interface CustomWindow extends Window {
    __widgets_translations: Translation;
}
declare let window: CustomWindow;

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
    mx.logger.debug("setListNodeToEmpty");
    // Explicitly remove children as IE does not like listNode.innerHTML = "";
    const listNode = targetNode.querySelector("ul") as HTMLUListElement;
    while (listNode.firstChild) {
        listNode.removeChild(listNode.firstChild);
    }
};

export const showLoader = (targetListView: DataSourceHelperListView) => {
    mx.logger.debug("showLoader");
    targetListView.domNode.classList.add("widget-pagination-loading");
};

export const hideLoader = (targetListView: DataSourceHelperListView) => {
    mx.logger.debug("hideLoader");
    targetListView.domNode.classList.remove("widget-pagination-loading");
};

export const mxTranslation = (namespace: string, key: string, replacements: any[], lookAtWindow: boolean, defaultTemplateValue: string) => {
    let templateString = defaultTemplateValue ?? "[No translation]";
    if (!lookAtWindow) {
        templateString = mx.session.getConfig(`uiconfig.translations.${namespace}.${key}`)
            || (window.mx.session.getConfig("uiconfig.translations") as any)[`${namespace}.${key}`]
            || defaultTemplateValue || "[No translation]";
    } else if (window.__widgets_translations) {
        templateString = window.__widgets_translations[`${namespace}.${key}`]
            || defaultTemplateValue || "[No translation]";
    }
    return replacements.reduce((substituteMessage, value, index) => substituteMessage.split("{" + (index + 1) + "}").join(value), templateString);
};

export const getTranslations = async (): Promise<void> => {
    const localeCode = window.mx.session.getConfig("locale.code");
    const metaData = await fetch("/metamodel.json");
    const metadataJson = await metaData.json();
    if (metadataJson && metadataJson.systemTexts) {
        const systemTexts = metadataJson.systemTexts as TranslationArray;
        const localeIndex = metadataJson.languages.indexOf(localeCode);
        window.__widgets_translations = Object.keys(systemTexts).reduce((translations, currentKey) => ({ ...translations, [currentKey]: systemTexts[currentKey][localeIndex] }), {});
    } else {
        mx.logger.error("Error while loading translations");
    }
};
