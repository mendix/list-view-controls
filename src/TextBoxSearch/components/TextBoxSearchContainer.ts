import { Component, ReactElement, createElement } from "react";
import * as mendixLang from "mendix/lang";
import * as classNames from "classnames";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { GroupedOfflineConstraint, ListView, OfflineConstraint, SharedUtils, WrapperProps } from "../../Shared/SharedUtils";

import { TextBoxSearch, TextBoxSearchProps } from "./TextBoxSearch";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import FormViewState from "../../Shared/FormViewState";

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
    private viewStateManager: FormViewState<FormState>;

    constructor(props: ContainerProps) {
        super(props);

        this.applySearch = this.applySearch.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId;
        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            viewState.defaultSearchText = this.state.defaultSearchText;
        });

        this.state = {
            defaultSearchText: this.getDefaultValue(),
            listViewAvailable: false
        };

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
        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            this.applySearch(this.state.defaultSearchText);
        }
    }

    private checkListViewAvailable(): boolean {
        if (!this.widgetDom) {
            return false;
        }

        return !!SharedContainerUtils.findTargetListView(this.widgetDom.parentElement, this.props.entity);
    }

    private renderTextBoxSearch(): ReactElement<TextBoxSearchProps> | null {
        if (!this.state.alertMessage) {
            return createElement(TextBoxSearch, {
                defaultQuery: this.state.defaultSearchText,
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
        this.setState({ defaultSearchText: searchQuery });
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
        return this.viewStateManager.getPageState("defaultSearchText", this.props.defaultQuery);
    }

}
