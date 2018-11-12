import * as dojoConnect from "dojo/_base/connect";

export default class FromViewState<T> {
    private persistHandle: number;

    constructor(private form: mxui.lib.form._FormBase, private widgetId: string, storeCallback: (state: T) => void) {
        this.persistHandle = dojoConnect.connect(form, "onPersistViewState", null, (formViewState: T) => {
            const widgetViewState = formViewState[widgetId] || (formViewState[widgetId] = {});
            storeCallback(widgetViewState);
        });
    }

    getPageState<K extends keyof T>(key: keyof T, defaultValue?: T[K]): T[K] | undefined {
        const mxform = this.form;
        const widgetViewState = mxform && mxform.viewState ? mxform.viewState[this.widgetId] : void 0;
        const state = widgetViewState && widgetViewState[key] ? widgetViewState[key] : defaultValue;
        logger.debug("getPageState", key, defaultValue, state);
        return state;
    }

    destroy() {
        dojoConnect.disconnect(this.persistHandle);
    }
}
