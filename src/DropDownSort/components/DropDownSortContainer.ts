import { Component, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoTopic from "dojo/topic";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, SharedUtils, WrapperProps } from "../../Shared/SharedUtils";

import { DropDown, DropDownProps } from "./DropDownSort";
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
}

export default class DropDownSortContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private widgetDOM: HTMLElement;
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
    }

    render() {
        return createElement("div", {
                className: classNames("widget-drop-down-sort", this.props.class),
                ref: (widgetDOM: HTMLElement) => this.widgetDOM = widgetDOM,
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-drop-down-sort-alert"
            }, this.state.alertMessage),
            this.renderDropDown()
        );
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            const selectedSort = this.props.sortAttributes.filter(sortAttribute => sortAttribute.defaultSelected)[0];

            if (selectedSort) {
                this.updateSort(selectedSort.name, selectedSort.sort);
            }
        }
    }

    private checkListViewAvailable(): boolean {
        return !!SharedContainerUtils.findTargetListView(this.widgetDOM.parentElement, this.props.entity);
    }

    private renderDropDown(): ReactElement<DropDownProps> | null {
        if (!this.state.alertMessage) {
            return createElement(DropDown, {
                friendlyId: this.props.friendlyId,
                onDropDownChangeAction: this.updateSort,
                publishedSortAttribute: this.state.publishedSortAttribute,
                publishedSortOrder: this.state.publishedSortOrder,
                publishedSortWidgetFriendlyId: this.state.publishedSortWidgetFriendlyId,
                sortAttributes: this.props.sortAttributes,
                style: SharedUtils.parseStyle(this.props.style)
            });
        }

        return null;
    }

    private getDefaultOption() {
        return this.props.sortAttributes.filter(sortAttribute => sortAttribute.defaultSelected)[0];
    }

    private connectToListView() {
        let alertMessage = "";
        let targetListView: ListView | undefined;

        try {
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDOM.parentElement, this.props.entity);
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
            this.publishWidgetChanges(attribute, order);
        }
    }

    private subScribeToWidgetChanges() {
        dojoTopic.subscribe(this.subscriptionTopic, (message: string[]) => {
            this.setState({
                publishedSortAttribute: message[0],
                publishedSortOrder: message[1],
                publishedSortWidgetFriendlyId: message[2]
            });
        });
    }

    private publishWidgetChanges(attribute: string, order: string) {
        dojoTopic.publish(this.subscriptionTopic, [ attribute, order, this.props.friendlyId ]);
    }
}
