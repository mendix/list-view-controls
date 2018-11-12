import { Component, ReactChild, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";

import { Alert, AlertProps } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, OfflineConstraint, SharedUtils, WrapperProps } from "../../Shared/SharedUtils";
import { CheckboxFilter, CheckboxFilterProps } from "./CheckBoxFilter";
import { Validate } from "../Validate";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import FormViewState from "../../Shared/FormViewState";

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

type FilterOptions = "attribute" | "XPath" | "None";

export interface ContainerState {
    alertMessage: ReactChild;
    listViewAvailable: boolean;
    targetListView?: ListView;
    validationPassed?: boolean;
    defaultChecked?: boolean;
}

interface FormState {
    defaultChecked?: boolean;
}

export default class CheckboxFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private widgetDom: HTMLElement;
    private viewStateManager: FormViewState<FormState>;

    readonly state: ContainerState = {
        defaultChecked: this.props.defaultChecked,
        listViewAvailable: false,
        alertMessage: Validate.validateProps(this.props)
    };

    constructor(props: ContainerProps) {
        super(props);

        this.applyFilter = this.applyFilter.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId;
        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            viewState.defaultChecked = this.state.defaultChecked;
        });
    }

    render() {
        const errorMessage = this.state.alertMessage || Validate.validateProps(this.props);

        return createElement("div",
            {
                className: classNames("widget-checkbox-filter", this.props.class),
                ref: widgetDom => this.widgetDom = widgetDom,
                style: SharedUtils.parseStyle(this.props.style)
            },
            this.renderAlert(errorMessage),
            this.renderCheckBoxFilter(errorMessage)
        );
    }

    componentDidMount() {
        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            const selectedSort = this.getDefaultValue();
            this.applyFilter(selectedSort);
        }
    }

    componentWillUnmount() {
        this.viewStateManager.destroy();
    }

    private checkListViewAvailable(): boolean {
        if (!this.widgetDom) {
            return false;
        }
        return !!SharedContainerUtils.findTargetListView(this.widgetDom.parentElement, this.props.listViewEntity);
    }

    private renderAlert(message: ReactChild): ReactElement<AlertProps> {
        return createElement(Alert, {
            className: "widget-checkbox-filter-alert"
        }, message);
    }

    private renderCheckBoxFilter(alertMessage: ReactChild): ReactElement<CheckboxFilterProps> {
        if (!alertMessage) {
            return createElement(CheckboxFilter, {
                handleChange: this.applyFilter,
                isChecked: this.getDefaultValue()
            });
        }

        return null;
    }

    private applyFilter(isChecked: boolean) {
        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, this.getConstraint(isChecked), this.props.group);
            this.setState({ defaultChecked: isChecked });
        }
    }

    private getConstraint(isChecked: boolean): string | OfflineConstraint {
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
        let targetListView: ListView | undefined;
        let errorMessage = "";

        try {
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDom.parentElement, this.props.listViewEntity);
            targetListView = this.dataSourceHelper.getListView();
        } catch (error) {
            errorMessage = error.message;
        }

        if (errorMessage && targetListView) {
            DataSourceHelper.showContent(targetListView.domNode);
        }

        this.setState({
            alertMessage: errorMessage,
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

    private getDefaultValue(): boolean {
        return this.viewStateManager.getPageState("defaultChecked", this.props.defaultChecked);
    }

}
