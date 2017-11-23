import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";
import * as classNames from "classnames";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, SharedUtils } from "../../Shared/SharedUtils";

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
    private dataSourceHelper: DataSourceHelper;
    private navigationHandler: object;

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listViewAvailable: false };

        this.applySearch = this.applySearch.bind(this);
        this.navigationHandler = dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView.bind(this));
    }

    componentDidUpdate(_previousProps: ContainerProps, previousState: ContainerState) {
        if (this.state.listViewAvailable && !previousState.listViewAvailable) {
            this.applySearch(this.props.defaultQuery);
        }
    }

    render() {
        return createElement("div", {
                className: classNames("widget-text-box-search", this.props.class),
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-text-box-search-alert",
                message: this.state.alertMessage
            }),
            this.renderTextBoxSearch()
        );
    }

    componentWillUnmount() {
        dojoConnect.disconnect(this.navigationHandler);
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

    private applySearch(searchQuery: string) {
        // construct constraint based on search query
        const constraint = this.getConstraint(searchQuery);

        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
        }
    }

    private getConstraint(searchQuery: string) {
        const { targetListView } = this.state;
        const constraints: string[] = [];

        if (targetListView && targetListView._datasource) {
            this.props.attributeList.forEach(searchAttribute => {
                constraints.push(`contains(${searchAttribute.attribute},'${searchQuery}')`);
            });

            return "[" + constraints.join(" or ") + "]";
        }
        return "";
    }

    private connectToListView() {
        const queryNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = SharedUtils.findTargetNode(queryNode) as HTMLElement;
        let targetListView: ListView | undefined;
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
        targetListView = targetListView || undefined;

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
}
