import * as dojoConnect from "dojo/_base/connect";

export class FormViewState<T> {
    private persistHandle: number;

    constructor(private form: mxui.lib.form._FormBase, private widgetId: string, storeCallback: (state: T) => void) {
        this.persistHandle = dojoConnect.connect(form, "onPersistViewState", null, (formViewState: any) => {
            const widgetViewState: T = formViewState[widgetId] || (formViewState[widgetId] = {});
            storeCallback(widgetViewState);
        });
    }

    getPageState<K extends keyof T, D = T[K]>(key: keyof T, defaultValue?: D): D {
        const mxform = this.form;
        const widgetViewState = mxform && mxform.viewState ? mxform.viewState[this.widgetId] : void 0;
        const state = widgetViewState && widgetViewState[key] !== undefined ? widgetViewState[key] : defaultValue;
        logger.debug("getPageState", this.widgetId, key, defaultValue, state);
        return state;
    }

    destroy() {
        dojoConnect.disconnect(this.persistHandle);
    }
}
