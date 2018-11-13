import { Component, ReactChild, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, OfflineConstraint, SharedUtils, WrapperProps } from "../../Shared/SharedUtils";
import { Validate } from "../Validate";

import { DropDownFilter, DropDownFilterProps } from "./DropDownFilter";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import FormViewState from "../../Shared/FormViewState";

import "../ui/DropDownFilter.scss";

export interface ContainerProps extends WrapperProps {
    entity: string;
    filters: FilterProps[];
}

export interface FilterProps {
    caption: string;
    filterBy: filterOptions;
    attribute: string;
    attributeValue: string;
    constraint: string;
    isDefault: boolean;
}

export type filterOptions = "none" | "attribute" | "XPath";

export interface ContainerState {
    alertMessage?: ReactChild;
    listViewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    defaultOption?: FilterProps;
}

interface FormState {
    defaultOption?: FilterProps;
}

export default class DropDownFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private widgetDom: HTMLElement;
    private viewStateManager: FormViewState<FormState>;

    constructor(props: ContainerProps) {
        super(props);

        this.applyFilter = this.applyFilter.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId;
        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            viewState.defaultOption = this.state.defaultOption;
        });

        this.state = {
            alertMessage: Validate.validateProps(this.props),
            listViewAvailable: false,
            defaultOption: this.getDefaultOption()
        };
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-drop-down-filter", this.props.class),
                ref: (widgetDom: HTMLElement) => this.widgetDom = widgetDom,
                style: SharedUtils.parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderDropDownFilter()
        );
    }

    componentDidMount() {
        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            this.applyFilter(this.state.defaultOption);
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

    private renderAlert() {
        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-drop-down-filter-alert"
        }, this.state.alertMessage);
    }

    private renderDropDownFilter(): ReactElement<DropDownFilterProps> {
        if (!this.state.alertMessage) {
            const selectedCaption = this.state.defaultOption && this.state.defaultOption.caption;
            const defaultFilterIndex = this.props.filters.map(value => value.caption).indexOf(selectedCaption);
            if (this.props.mxObject) {
                this.props.filters.forEach(filter => filter.constraint = filter.constraint.replace(/\[%CurrentObject%\]/g,
                    this.props.mxObject.getGuid()
                ));
            }
            return createElement(DropDownFilter, {
                defaultFilterIndex,
                filters: this.props.filters,
                handleChange: this.applyFilter
            });
        }

        return null;
    }

    private getDefaultOption() {
        const defaultFilter = this.props.filters.filter(value => value.isDefault)[0];

        return this.viewStateManager.getPageState("defaultOption", defaultFilter);
    }

    private applyFilter(selectedFilter: FilterProps) {
        const constraint = this.getConstraint(selectedFilter);
        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
        }
        this.setState({ defaultOption: selectedFilter });
    }

    private getConstraint(selectedFilter: FilterProps) {
        const { targetListView } = this.state;
        const { attribute, filterBy, constraint, attributeValue } = selectedFilter;

        if (targetListView && targetListView._datasource) {
            const mxObjectId = this.props.mxObject ? this.props.mxObject.getGuid() : "";
            const hasContext = constraint.indexOf(`'[%CurrentObject%]'`) !== -1;

            if (filterBy === "XPath" && hasContext && mxObjectId) {
                return constraint.replace(/\'\[%CurrentObject%\]\'/g, mxObjectId);
            } else if (filterBy === "XPath" && !hasContext) {
                return constraint;
            } else if (filterBy === "attribute" && attributeValue) {
                return this.getAttributeConstraint(attribute, attributeValue);
            } else {
                return "";
            }
        }
    }

    private getAttributeConstraint(attribute: string, attributeValue: string): string | OfflineConstraint {
        if (window.mx.isOffline()) {
            const constraints: OfflineConstraint = {
                attribute,
                operator: "contains",
                path: this.props.entity,
                value: attributeValue
            };

            return constraints;
        }

        return `[contains(${attribute},'${attributeValue}')]`;
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

        if (errorMessage && targetListView) {
            DataSourceHelper.showContent(targetListView.domNode);
        }

        this.setState({
            alertMessage: errorMessage,
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

}
