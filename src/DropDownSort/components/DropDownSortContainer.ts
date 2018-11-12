import { Component, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoTopic from "dojo/topic";
import * as dojoConnect from "dojo/_base/connect";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, SharedUtils, StoreState, WrapperProps } from "../../Shared/SharedUtils";

import { DropDownProps, DropDownSort } from "./DropDownSort";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";

import "../ui/DropDownSort.scss";

export interface ContainerProps extends WrapperProps {
    entity: string;
    sortAttributes: AttributeType[];
}

export interface AttributeType {
    name: string;
    caption: string;
    defaultSelected: boolean;
    sort: string;
}

export interface ContainerState {
    alertMessage?: string;
    listViewAvailable: boolean;
    publishedSortAttribute?: string;
    publishedSortOrder?: string;
    publishedSortWidgetFriendlyId?: string;
    targetListView?: ListView | null;
    defaultOption?: AttributeType;
    defaultSortOrder?: string;
    defaultSortAttribute?: string;
}

export interface FormState {
    defaultOption?: AttributeType;
}

export default class DropDownSortContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private widgetDom: HTMLElement;
    private setPageState: (store: Partial<FormState>) => void;
    private subscriptionTopic: string;

    readonly state: ContainerState = {
        defaultOption: this.getDefaultOption(),
        listViewAvailable: false
    };

    constructor(props: ContainerProps) {
        super(props);

        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
        this.updateSort = this.updateSort.bind(this);
        this.subScribeToWidgetChanges = this.subScribeToWidgetChanges.bind(this);
        this.publishWidgetChanges = this.publishWidgetChanges.bind(this);
        this.setPageState = StoreState(this.props.mxform, this.props.uniqueid);
    }

    render() {
        return createElement("div", {
                className: classNames("widget-drop-down-sort", this.props.class),
                ref: (widgetDom: HTMLElement) => this.widgetDom = widgetDom,
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-drop-down-sort-alert"
            }, this.state.alertMessage),
            this.renderDropDown()
        );
    }

    componentDidMount() {
        dojoConnect.connect(this.props.mxform, "onPersistViewState", null, (formViewState) => {
            logger.debug("Storing state");
            formViewState[this.props.uniqueid] = {
                defaultOption: this.state.defaultOption
            };
        });
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            const pageState: FormState = this.getPageState<FormState>();
            const selectedSort = pageState && pageState.defaultOption || this.props.sortAttributes.filter(sortAttribute => sortAttribute.defaultSelected)[0];
            if (selectedSort) {
                    this.updateSort(selectedSort.name, selectedSort.sort);
            }
        }
    }

    private checkListViewAvailable(): boolean {
        return !!SharedContainerUtils.findTargetListView(this.widgetDom.parentElement, this.props.entity);
    }

    private renderDropDown(): ReactElement<DropDownProps> | null {
        if (!this.state.alertMessage) {
            return createElement(DropDownSort, {
                friendlyId: this.props.friendlyId,
                onDropDownChangeAction: this.updateSort,
                publishedSortAttribute: this.state.publishedSortAttribute,
                publishedSortOrder: this.state.publishedSortOrder,
                publishedSortWidgetFriendlyId: this.state.publishedSortWidgetFriendlyId,
                sortAttributes: this.props.sortAttributes,
                style: SharedUtils.parseStyle(this.props.style),
                defaultSortAttribute: this.getDefaultOption()
            });
        }

        return null;
    }

    private getDefaultOption() {
        const pageState = this.getPageState<FormState>();
        const defaultOption = pageState && pageState.defaultOption;
        if (pageState && defaultOption && defaultOption.sort && defaultOption.name) {
            return defaultOption;
        }
        return this.props.sortAttributes.filter(sortAttribute => sortAttribute.defaultSelected)[0];
    }

    private connectToListView() {
        let alertMessage = "";
        let targetListView: ListView | undefined;

        try {
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDom.parentElement, this.props.entity);
            targetListView = this.dataSourceHelper.getListView();
        } catch (error) {
            alertMessage = error.message;
        }

        if (targetListView && !alertMessage) {
            this.subscriptionTopic = `${targetListView.friendlyId}_sortUpdate`;
            this.subScribeToWidgetChanges();
            if (!this.state.defaultOption) {
                DataSourceHelper.showContent(targetListView.domNode);
            }
        }

        this.setState({
            alertMessage,
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

    private updateSort(attribute: string, order: string) {
        const { targetListView } = this.state;

        if (targetListView && this.dataSourceHelper) {
            this.dataSourceHelper.setSorting(this.props.friendlyId, [ attribute, order ]);
            const selectedOption = this.props.sortAttributes.filter(option => option.name === attribute && option.sort === order)[0];
            this.setWidgetState({
                defaultOption: selectedOption
            });
            this.publishWidgetChanges(attribute, order);
        }
    }

    private subScribeToWidgetChanges() {
        dojoTopic.subscribe(this.subscriptionTopic, (message: string[]) => {
            const publishedSortAttribute = message[0];
            const publishedSortOrder = message[1];
            const publishedSortWidgetFriendlyId = message[2];
            if (this.props.friendlyId !== publishedSortWidgetFriendlyId) {
                this.setState({
                    publishedSortAttribute,
                    publishedSortOrder,
                    publishedSortWidgetFriendlyId
                });
            }
        });
    }

    private publishWidgetChanges(attribute: string, order: string) {
        dojoTopic.publish(this.subscriptionTopic, [ attribute, order, this.props.friendlyId ]);
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
