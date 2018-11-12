import { Component, ReactElement, createElement } from "react";
import * as mendixLang from "mendix/lang";
import * as classNames from "classnames";
import * as dojoConnect from "dojo/_base/connect";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { GroupedOfflineConstraint, ListView, OfflineConstraint, SharedUtils, StoreState, WrapperProps } from "../../Shared/SharedUtils";

import { TextBoxSearch, TextBoxSearchProps } from "./TextBoxSearch";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";

export interface ContainerProps extends WrapperProps {
    attributeList: SearchAttributes[];
    defaultQuery: string;
    entity: string;
    placeHolder: string;
}

export interface SearchAttributes {
    attribute: string;
}

export interface ContainerState {
    alertMessage?: string;
    listViewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
    defaultSearchText?: string;
}

interface FormState {
    defaultSearchText?: string;
}

export default class SearchContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private widgetDom: HTMLElement;
    private setPageState: (store: Partial<FormState>) => void;

    readonly state: ContainerState = { listViewAvailable: false };
    constructor(props: ContainerProps) {
        super(props);

        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
        this.applySearch = this.applySearch.bind(this);
        this.setPageState = StoreState(this.props.mxform, this.props.uniqueid);
    }

    render() {
        return createElement("div", {
                className: classNames("widget-text-box-search", this.props.class),
                ref: (widgetDom) => this.widgetDom = widgetDom,
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-text-box-search-alert"
            }, this.state.alertMessage),
            this.renderTextBoxSearch()
        );
    }

    componentDidMount() {
        dojoConnect.connect(this.props.mxform, "onPersistViewState", null, (formViewState) => {
            logger.debug("Storing state");
            formViewState[this.props.uniqueid] = {
                defaultSearchText: this.state.defaultSearchText
            };
        });
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            this.applySearch(this.getDefaultValue());
        }
    }

    private checkListViewAvailable(): boolean {
        return !!SharedContainerUtils.findTargetListView(this.widgetDom.parentElement, this.props.entity);
    }

    private renderTextBoxSearch(): ReactElement<TextBoxSearchProps> | null {
        if (!this.state.alertMessage) {
            return createElement(TextBoxSearch, {
                defaultQuery: this.getDefaultValue(),
                onTextChange: this.applySearch,
                placeholder: this.props.placeHolder
            });
        }

        return null;
    }

    private applySearch(searchQuery: string) {
        // Construct constraint based on search query
        const constraint = this.getConstraint(searchQuery);

        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
        }
        this.setWidgetState({ defaultSearchText: searchQuery });
    }

    private getConstraint(searchQuery: string): string | GroupedOfflineConstraint {
        const { targetListView } = this.state;

        searchQuery = searchQuery.trim();

        if (!searchQuery) {
            return "";
        }

        if (window.mx.isOffline()) {
            const offlineConstraints: OfflineConstraint[] = [];
            this.props.attributeList.forEach(search => {
                offlineConstraints.push({
                    attribute: search.attribute,
                    operator: "contains",
                    path: this.props.entity,
                    value: searchQuery
                });
            });

            return {
                constraints: offlineConstraints,
                operator: "or"
            };
        }

        if (targetListView && targetListView._datasource && searchQuery) {
            const constraints: string[] = [];
            this.props.attributeList.forEach(searchAttribute => {
                constraints.push(`contains(${searchAttribute.attribute},'${searchQuery}')`);
            });

            return "[" + constraints.join(" or ") + "]";
        }
        return "";
    }

    private connectToListView() {
        let errorMessage = "";
        let targetListView: ListView | undefined;

        try {
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDom.parentElement, this.props.entity);
            targetListView = this.dataSourceHelper.getListView();
        } catch (error) {
            errorMessage = error.message;
        }

        this.setState({
            alertMessage: errorMessage,
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

    private getDefaultValue() {
        const pageState = this.getPageState<FormState>();
        return pageState && pageState.defaultSearchText || this.props.defaultQuery;
    }

    private setWidgetState(state: Partial<ContainerState & FormState>) {
        this.setPageState(state);
        this.setState(state as ContainerState);
    }

    private getPageState<T>(key?: string, defaultValue?: T): T | undefined {
        const mxform = this.props.mxform;
        const widgetViewState = mxform && mxform.viewState ? mxform.viewState[this.props.uniqueid] : void 0;
        const state = 0 === arguments.length ? widgetViewState : widgetViewState && widgetViewState[key] ? widgetViewState[key] : defaultValue;
        logger.debug("getPageState", key, defaultValue, state);
        return state;
    }
}
