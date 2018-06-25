import { Component, ReactElement, createElement } from "react";
import * as dojoConnect from "dojo/_base/connect";
import * as classNames from "classnames";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { GroupedOfflineConstraint, ListView, OfflineConstraint, SharedUtils } from "../../Shared/SharedUtils";

import { TextBoxSearch, TextBoxSearchProps } from "./TextBoxSearch";

interface WrapperProps {
    class: string;
    style: string;
    friendlyId: string;
    mxform: mxui.lib.form._FormBase;
    mxObject: mendix.lib.MxObject;
}

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
}

export default class SearchContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper?: DataSourceHelper;
    private connections: object[] = [];
    private widgetDOM?: HTMLElement;

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listViewAvailable: false };
        this.connections.push(dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView));
    }

    componentDidUpdate(_previousProps: ContainerProps, previousState: ContainerState) {
        if (this.state.listViewAvailable && !previousState.listViewAvailable) {
            this.applySearch(this.props.defaultQuery);
        }
    }

    render() {
        return createElement("div", {
                className: classNames("widget-text-box-search", this.props.class),
                ref: (widgetDOM) => this.widgetDOM = widgetDOM as HTMLElement,
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-text-box-search-alert"
            }, this.state.alertMessage),
            this.renderTextBoxSearch()
        );
    }

    componentWillUnmount() {
        this.connections.forEach(dojoConnect.disconnect);
    }

    private renderTextBoxSearch(): ReactElement<TextBoxSearchProps> | null {
        if (!this.state.alertMessage) {
            return createElement(TextBoxSearch, {
                defaultQuery: this.props.defaultQuery,
                onTextChange: this.applySearch,
                placeholder: this.props.placeHolder
            });
        }

        return null;
    }

    private applySearch = (searchQuery: string) => {
        const constraint = this.getConstraint(searchQuery);

        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
        }
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

            return constraints.length ? "[" + constraints.join(" or ") + "]" : "";
        }
        return "";
    }

    private connectToListView = () => {
        let errorMessage = "";
        let targetListView: ListView | undefined;

        try {
            if (this.widgetDOM && this.widgetDOM.parentElement && this.widgetDOM.parentElement) {
                this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDOM.parentElement, this.props.entity);
                targetListView = this.dataSourceHelper.getListView();
            }
        } catch (error) {
            errorMessage = error.message;
        }

        this.setState({
            alertMessage: errorMessage,
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

}
