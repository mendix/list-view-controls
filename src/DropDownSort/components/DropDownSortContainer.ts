import { Component, ReactNode, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoTopic from "dojo/topic";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper, DataSourceHelperListView } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { SharedUtils, WrapperProps } from "../../Shared/SharedUtils";

import { DropDownSort } from "./DropDownSort";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import { FormViewState } from "../../Shared/FormViewState";

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
    targetListView?: DataSourceHelperListView | null;
    selectedOption: AttributeType;
}

export interface FormState {
    selectedOption?: AttributeType;
}

export default class DropDownSortContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper?: DataSourceHelper;
    private widgetDom: HTMLElement | null = null;
    private viewStateManager: FormViewState<FormState>;
    private subscriptionTopic = "";
    private retriesFind = 0;

    constructor(props: ContainerProps) {
        super(props);

        this.updateSort = this.updateSort.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId.split(".")[2];

        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            viewState.selectedOption = this.state.selectedOption;
        });

        // State is moved into constructor to avoid unnecessary
        // rendering while using Persisted state (FormViewState)
        this.state = {
            selectedOption: this.getDefaultOption(),
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
            if (this.state.selectedOption) {
                const restoreState = this.checkRestoreState();
                this.updateSort(this.state.selectedOption, restoreState);
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
        this.retriesFind++;
        if (this.retriesFind > 25) {
            return true; // Give-up searching
        }

        return !!SharedContainerUtils.findTargetListView(this.widgetDom.parentElement, this.props.entity);
    }

    private renderDropDown(): ReactNode {
        if (!this.state.alertMessage) {
            const selectedCaption = this.state.selectedOption && this.state.selectedOption.caption || "";
            const defaultSortIndex = this.props.sortAttributes.map(value => value.caption).indexOf(selectedCaption);

            return createElement(DropDownSort, {
                friendlyId: this.props.friendlyId,
                onDropDownChangeAction: this.updateSort,
                sortAttributes: this.props.sortAttributes,
                style: SharedUtils.parseStyle(this.props.style),
                defaultSortIndex: defaultSortIndex !== -1 ? defaultSortIndex : undefined
            });
        }

        return null;
    }

    private checkRestoreState(): boolean {
        return this.viewStateManager.getPageState("selectedOption") !== undefined;
    }

    private getDefaultOption(): AttributeType {
        const initialDefaultOption = this.props.sortAttributes.filter(sortAttribute => sortAttribute.defaultSelected)[0];

        return this.viewStateManager.getPageState("selectedOption", initialDefaultOption);
    }

    private connectToListView() {
        let alertMessage = "";
        let targetListView: DataSourceHelperListView | undefined;

        try {
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDom, this.props.entity);
            targetListView = this.dataSourceHelper.getListView();
        } catch (error) {
            alertMessage = error.message;
        }

        if (targetListView && !alertMessage) {
            const id = targetListView.friendlyId + (targetListView.uniqueid ? targetListView.uniqueid : "");
            this.subscriptionTopic = `${id}_sortUpdate`;
            this.subScribeToWidgetChanges();
            if (!this.state.selectedOption) {
                DataSourceHelper.showContent(targetListView.domNode);
            }
        }

        this.setState({
            alertMessage,
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

    private updateSort(selectedOption: AttributeType, restoreState = false) {
        const { targetListView } = this.state;

        if (targetListView && this.dataSourceHelper) {
            logger.debug(this.props.friendlyId, "updateSort", selectedOption.name, selectedOption.sort);
            this.dataSourceHelper.setSorting(this.props.friendlyId, [ selectedOption.name, selectedOption.sort ], restoreState);
            this.setState({ selectedOption });
            this.publishWidgetChanges(selectedOption);
        }
    }

    private subScribeToWidgetChanges() {
        dojoTopic.subscribe(this.subscriptionTopic, (message: string[]) => {
            const attribute = message[0];
            const order = message[1];
            const sourceWidgetId = message[2];
            const selectedOption = this.props.sortAttributes.filter(option => option.name === attribute && option.sort === order)[0];
            if (attribute && order && this.props.friendlyId !== sourceWidgetId) {
                this.setState({ selectedOption });
            }
        });
    }

    private publishWidgetChanges(sortOption: AttributeType) {
        dojoTopic.publish(this.subscriptionTopic, [ sortOption.name, sortOption.sort, this.props.friendlyId ]);
    }

}
