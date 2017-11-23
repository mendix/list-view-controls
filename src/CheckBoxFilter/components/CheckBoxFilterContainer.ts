import { Component, ReactElement, createElement } from "react";
import { findDOMNode } from "react-dom";
import * as classNames from "classnames";
import * as dijitRegistry from "dijit/registry";
import * as dojoConnect from "dojo/_base/connect";

import { Alert, AlertProps } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, SharedUtils } from "../../Shared/SharedUtils";
import { CheckboxFilter, CheckboxFilterProps } from "./CheckBoxFilter";
import { Validate } from "../Validate";

interface WrapperProps {
    class: string;
    style: string;
    friendlyId: string;
    mxform: mxui.lib.form._FormBase;
    mxObject: mendix.lib.MxObject;
}

export interface ContainerProps extends WrapperProps {
    listViewEntity: string;
    filterBy: FilterOptions;
    attribute: string;
    attributeValue: string;
    constraint: string;
    defaultChecked: boolean;
    unCheckedFilterBy: FilterOptions;
    unCheckedAttribute: string;
    unCheckedAttributeValue: string;
    unCheckedConstraint: string;
}

type FilterOptions = "attribute" | "XPath" | "None";

interface OfflineConstraint {
    attribute: string;
    operator: string;
    value: string;
    path?: string;
}

export interface ContainerState {
    alertMessage: string;
    listViewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    validationPassed?: boolean;
}

export default class CheckboxFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private navigationHandler: object;

    constructor(props: ContainerProps) {
        super(props);

        this.state = { listViewAvailable: false, alertMessage: Validate.validateProps(props) };
        this.applyFilter = this.applyFilter.bind(this);
        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render timing
        this.navigationHandler = dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView.bind(this));
    }

    render() {
        const errorMessage = this.state.alertMessage || Validate.validateProps(this.props);

        return createElement("div",
            {
                className: classNames("widget-checkbox-filter", this.props.class),
                style: SharedUtils.parseStyle(this.props.style)
            },
            this.renderAlert(errorMessage),
            this.renderCheckBoxFilter(errorMessage)
        );
    }

    componentDidUpdate(prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable
                && (!prevState.listViewAvailable || prevProps.mxObject !== this.props.mxObject)) {
            this.applyFilter(this.props.defaultChecked);
        }
    }

    componentWillUnmount() {
        dojoConnect.disconnect(this.navigationHandler);
    }

    private renderAlert(message: string): ReactElement<AlertProps> {
        return createElement(Alert, {
            className: "widget-checkbox-filter-alert",
            message
        });
    }

    private renderCheckBoxFilter(alertMessage: string): ReactElement<CheckboxFilterProps> {
        if (!alertMessage) {
            return createElement(CheckboxFilter, {
                handleChange: this.applyFilter,
                isChecked: this.props.defaultChecked
            });
        }

        return null;
    }

    private applyFilter(isChecked: boolean) {
        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, this.getConstraint(isChecked));
        }
    }

    private getConstraint(isChecked: boolean): string | OfflineConstraint {
        const { targetListView } = this.state;

        if (targetListView && targetListView._datasource) {
            const attribute = isChecked ? this.props.attribute : this.props.unCheckedAttribute;
            const filterBy = isChecked ? this.props.filterBy : this.props.unCheckedFilterBy;
            const constraint = isChecked ? this.props.constraint : this.props.unCheckedConstraint;
            const attributeValue = isChecked ? this.props.attributeValue : this.props.unCheckedAttributeValue;
            const mxObjectId = this.props.mxObject ? this.props.mxObject.getGuid() : "";

            if (filterBy === "XPath" && constraint.indexOf(`[%CurrentObject%]'`) !== -1) {
                if (mxObjectId) {
                    return constraint.replace(`'[%CurrentObject%]'`, mxObjectId);
                }
                return "";
            } else if (filterBy === "XPath") {
                return constraint;
            } else if (filterBy === "attribute") {
                return this.getAttributeConstraint(attribute, attributeValue);
            }

            return "";
        }
    }

    private getAttributeConstraint(attribute: string, attributeValue: string): string | OfflineConstraint {
        const { targetListView } = this.state;

        if (window.mx.isOffline()) {
            const constraints: OfflineConstraint = {
                attribute,
                operator: "contains",
                path: this.props.listViewEntity,
                value: attributeValue
            };

            return constraints;
        }
        if (targetListView && targetListView._datasource) {
            const entityMeta = mx.meta.getEntity(this.props.listViewEntity);

            if (entityMeta.isEnum(attribute)) {
                return `[${attribute}='${attributeValue.trim()}']`;
            } else if (entityMeta.isBoolean(attribute)) {
                return `[${attribute} = '${attributeValue.trim().toLowerCase()}']`;
            } else {
                return `[contains(${attribute},'${attributeValue}')]`;
            }
        }
    }

    private connectToListView() {
        let targetListView: ListView | null = null;
        let errorMessage = "";
        const filterNode = findDOMNode(this).parentNode as HTMLElement;
        const targetNode = SharedUtils.findTargetNode(filterNode);

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
            listViewEntity: this.props.listViewEntity,
            targetListView
        });

        errorMessage = validationMessage || errorMessage;
        if (errorMessage) {
            DataSourceHelper.showContent(targetNode);
        }

        this.setState({
            alertMessage: errorMessage,
            listViewAvailable: !!targetListView,
            targetListView,
            targetNode
        });
    }
}
