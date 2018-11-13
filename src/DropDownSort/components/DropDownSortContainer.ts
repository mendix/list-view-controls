import { Component, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoTopic from "dojo/topic";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, SharedUtils, WrapperProps } from "../../Shared/SharedUtils";

import { DropDownProps, DropDownSort } from "./DropDownSort";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import FormViewState from "../../Shared/FormViewState";

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
}

export interface FormState {
    defaultOption?: AttributeType;
}

export default class DropDownSortContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private widgetDom: HTMLElement;
    private viewStateManager: FormViewState<FormState>;
    private subscriptionTopic: string;

    constructor(props: ContainerProps) {
        super(props);

        this.updateSort = this.updateSort.bind(this);
        this.subScribeToWidgetChanges = this.subScribeToWidgetChanges.bind(this);
        this.publishWidgetChanges = this.publishWidgetChanges.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId.split(".")[2];

        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            viewState.defaultOption = this.state.defaultOption;
        });

        // State is moved into constructor to avoid unnecessary
        // rerendering while using Persisted state (FormViewState)
        this.state = {
            defaultOption: this.getDefaultOption(),
            listViewAvailable: false
        };
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
        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            if (this.state.defaultOption) {
                this.updateSort(this.state.defaultOption);
            }
        }
    }

    componentWillUnmount() {
        this.viewStateManager.destroy();
    }

    private checkListViewAvailable(): boolean {
        if (!this.widgetDom) {
            return false;
        }

        return !!SharedContainerUtils.findTargetListView(this.widgetDom.parentElement, this.props.entity);
    }

    private renderDropDown(): ReactElement<DropDownProps> | null {
        if (!this.state.alertMessage) {
            const selectedCaption = this.state.defaultOption && this.state.defaultOption.caption;
            const defaultSortIndex = this.props.sortAttributes.map(value => value.caption).indexOf(selectedCaption);

            return createElement(DropDownSort, {
                friendlyId: this.props.friendlyId,
                onDropDownChangeAction: this.updateSort,
                sortAttributes: this.props.sortAttributes,
                style: SharedUtils.parseStyle(this.props.style),
                defaultSortIndex
            });
        }

        return null;
    }

    private getDefaultOption() {
        const initialDefaultOption = this.props.sortAttributes.filter(sortAttribute => sortAttribute.defaultSelected)[0];

        return this.viewStateManager.getPageState("defaultOption", initialDefaultOption);
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

    private updateSort(selectedOption: AttributeType) {
        const { targetListView } = this.state;

        if (targetListView && this.dataSourceHelper) {
            this.dataSourceHelper.setSorting(this.props.friendlyId, [ selectedOption.name, selectedOption.sort ]);
            this.setState({ defaultOption: selectedOption });
            this.publishWidgetChanges(selectedOption);
        }
    }

    private subScribeToWidgetChanges() {
        dojoTopic.subscribe(this.subscriptionTopic, (message: string[]) => {
            const attribute = message[0];
            const order = message[1];
            const sourceWidgetId = message[2];
            const defaultOption = this.props.sortAttributes.filter(option => option.name === attribute && option.sort === order)[0];
            if (attribute && order && this.props.friendlyId !== sourceWidgetId) {
                this.setState({ defaultOption });
            }
        });
    }

    private publishWidgetChanges(sortOption: AttributeType) {
        dojoTopic.publish(this.subscriptionTopic, [ sortOption.name, sortOption.sort, this.props.friendlyId ]);
    }

}
