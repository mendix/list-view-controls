import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as dijitRegistry from "dijit/registry";
import * as classNames from "classnames";
import * as dojoConnect from "dojo/_base/connect";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, SharedUtils } from "../../Shared/SharedUtils";

import { DropDown, DropDownProps } from "./DropDownSort";

import "../ui/DropDownSort.scss";

interface WrapperProps {
    class: string;
    style: string;
    friendlyId: string;
    mxform: mxui.lib.form._FormBase;
    mxObject: mendix.lib.MxObject;
}

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
    targetListView?: ListView | null;
    targetNode?: HTMLElement;
}

export default class DropDownSortContainer extends Component<ContainerProps, ContainerState> {
    private navigationHandler: object;
    private dataSourceHelper: DataSourceHelper;

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listViewAvailable: false };
        this.updateSort = this.updateSort.bind(this);
        this.navigationHandler = dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView.bind(this));
    }

    render() {
        return createElement("div", {
                className: classNames("widget-drop-down-sort", this.props.class),
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-drop-down-sort-alert",
                message: this.state.alertMessage
            }),
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

    componentWillUnmount() {
        dojoConnect.disconnect(this.navigationHandler);
    }

    private renderDropDown(): ReactElement<DropDownProps> | null {
        if (!this.state.alertMessage) {
            return createElement(DropDown, {
                onDropDownChangeAction: this.updateSort,
                sortAttributes: this.props.sortAttributes,
                style: SharedUtils.parseStyle(this.props.style)
            });
        }

        return null;
    }

    private connectToListView() {
        const queryNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = SharedUtils.findTargetNode(queryNode) as HTMLElement;
        let targetListView: ListView | null = null;
        let errorMessage = "";

        if (targetNode) {
            DataSourceHelper.hideContent(targetNode);
            targetListView = dijitRegistry.byNode(targetNode);
            if (targetListView) {
                try {
                    this.dataSourceHelper = DataSourceHelper.getInstance(targetListView, this.props.friendlyId, DataSourceHelper.VERSION);
                } catch (error) {
                    errorMessage = error.message;
                }
            }
        }

        const validationMessage = SharedUtils.validateCompatibility({
            friendlyId: this.props.friendlyId,
            listViewEntity: this.props.entity,
            targetListView
        });

        this.setState({
            alertMessage: validationMessage || errorMessage,
            listViewAvailable: !!targetListView,
            targetListView,
            targetNode
        });
    }

    private updateSort(attribute: string, order: string) {
        const { targetNode, targetListView } = this.state;

        if (targetListView && targetNode && this.dataSourceHelper) {
            this.dataSourceHelper.setSorting(this.props.friendlyId, [ attribute, order ]);
        }
    }
}
