import { Component, ReactChild, ReactNode, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper, DataSourceHelperListView } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { SharedUtils, WrapperProps } from "../../Shared/SharedUtils";
import { CheckboxFilter } from "./CheckBoxFilter";
import { Validate } from "../Validate";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import { FormViewState } from "../../Shared/FormViewState";

export interface ContainerProps extends WrapperProps {
    listViewEntity: string;
    group: string;
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

type FilterOptions = "attribute" | "XPath" | "none";

export interface ContainerState {
    alertMessage: ReactChild;
    listViewAvailable: boolean;
    targetListView?: DataSourceHelperListView;
    validationPassed?: boolean;
    isChecked: boolean;
}

interface FormState {
    isChecked: boolean;
}

export default class CheckboxFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper?: DataSourceHelper;
    private widgetDom: HTMLElement | null = null;
    private viewStateManager: FormViewState<FormState>;
    private retriesFind = 0;

    constructor(props: ContainerProps) {
        super(props);

        this.applyFilter = this.applyFilter.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId;
        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            viewState.isChecked = this.state.isChecked;
        });

        this.state = {
            isChecked: this.getDefaultValue(),
            listViewAvailable: false,
            alertMessage: Validate.validateProps(this.props)
        };
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-checkbox-filter", this.props.class),
                ref: widgetDom => this.widgetDom = widgetDom,
                style: SharedUtils.parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderCheckBoxFilter()
        );
    }

    componentDidMount() {
        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
    }

    componentWillReceiveProps(nextProps: ContainerProps) {
        if (this.state.listViewAvailable) {
            this.setState({ alertMessage: Validate.validateProps(nextProps) });
        }
    }

    componentDidUpdate(prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            const restoreState = this.checkRestoreState();
            this.applyFilter(this.state.isChecked, restoreState);
        } else if (this.state.listViewAvailable && this.props.mxObject !== prevProps.mxObject) {
            const constraint = this.state.isChecked ? this.props.constraint : this.props.unCheckedConstraint;
            const hasContext = constraint.indexOf(`'[%CurrentObject%]'`) !== -1;
            if (hasContext) {
                this.applyFilter(this.state.isChecked);
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
        return !!SharedContainerUtils.findTargetListView(this.widgetDom.parentElement, this.props.listViewEntity);
    }

    private renderAlert(): ReactNode {
        return createElement(Alert, {
            className: "widget-checkbox-filter-alert"
        }, this.state.alertMessage);
    }

    private renderCheckBoxFilter(): ReactNode {
        if (!this.state.alertMessage) {
            return createElement(CheckboxFilter, {
                handleChange: this.applyFilter,
                isChecked: this.state.isChecked
            });
        }

        return null;
    }

    private applyFilter(isChecked: boolean, restoreState = false) {
        if (this.dataSourceHelper) {
            logger.debug(this.props.friendlyId, "applyFilter", isChecked, this.props.group);
            this.dataSourceHelper.setConstraint(this.props.friendlyId, this.getConstraint(isChecked), this.props.group, restoreState);
            this.setState({ isChecked });
        }
    }

    private getConstraint(isChecked: boolean): string | mendix.lib.dataSource.OfflineConstraint {
        const { targetListView } = this.state;

        if (targetListView && targetListView._datasource) {
            const attribute = isChecked ? this.props.attribute : this.props.unCheckedAttribute;
            const filterBy = isChecked ? this.props.filterBy : this.props.unCheckedFilterBy;
            const constraint = isChecked ? this.props.constraint : this.props.unCheckedConstraint;
            const attributeValue = (isChecked ? this.props.attributeValue : this.props.unCheckedAttributeValue);
            const mxObjectId = this.props.mxObject ? this.props.mxObject.getGuid() : "";
            const hasContext = constraint.indexOf(`'[%CurrentObject%]'`) !== -1;

            if (filterBy === "XPath" && hasContext && mxObjectId) {
                return constraint.replace(/\[%CurrentObject%\]/g, mxObjectId);
            } else if (filterBy === "XPath" && !hasContext) {
                return constraint;
            } else if (filterBy === "attribute" && attributeValue) {
                return this.getAttributeConstraint(attribute, attributeValue);
            }

        }
        return "";
    }

    private getAttributeConstraint(attribute: string, attributeValue: string): string | mendix.lib.dataSource.OfflineConstraint {
        const { targetListView } = this.state;

        if (window.mx.isOffline()) {
            const constraints: mendix.lib.dataSource.OfflineConstraint = {
                attribute,
                operator: "contains",
                path: this.props.listViewEntity,
                value: attributeValue
            };

            return constraints;
        }

        if (targetListView && targetListView._datasource && attributeValue) {
            const entityMeta = mx.meta.getEntity(this.props.listViewEntity);

            if (entityMeta.isEnum(attribute)) {
                return `[${attribute}='${attributeValue}']`;
            } else if (entityMeta.isBoolean(attribute)) {
                return `[${attribute} = '${attributeValue.toLowerCase()}']`;
            } else {
                return `[contains(${attribute},'${attributeValue}')]`;
            }
        }

        return "";
    }

    private connectToListView() {
        let targetListView: DataSourceHelperListView | undefined;
        let errorMessage = "";

        try {
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDom, this.props.listViewEntity);
            targetListView = this.dataSourceHelper.getListView();
        } catch (error) {
            errorMessage = error.message;
        }

        if (errorMessage && targetListView) {
            DataSourceHelper.showContent(targetListView.domNode);
        }

        this.setState({
            alertMessage: errorMessage || this.state.alertMessage,
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

    private checkRestoreState(): boolean {
        return this.viewStateManager.getPageState("isChecked") !== undefined;
    }

    private getDefaultValue(): boolean {
        return this.viewStateManager.getPageState("isChecked", this.props.defaultChecked);
    }

}
