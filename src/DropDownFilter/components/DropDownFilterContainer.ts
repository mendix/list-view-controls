import { Component, ReactChild, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, OfflineConstraint, SharedUtils, StoreState, WrapperProps } from "../../Shared/SharedUtils";
import { Validate } from "../Validate";

import { DropDownFilter, DropDownFilterProps } from "./DropDownFilter";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";

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
    private widgetDOM: HTMLElement;
    private setPageState: (store: Partial<FormState>) => void;

    readonly state: ContainerState = {
        alertMessage: Validate.validateProps(this.props),
        listViewAvailable: false
    };

    constructor(props: ContainerProps) {
        super(props);

        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
        this.applyFilter = this.applyFilter.bind(this);
        this.setPageState = StoreState(this.props.mxform, this.props.uniqueid);
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-drop-down-filter", this.props.class),
                ref: (widgetDOM: HTMLElement) => this.widgetDOM = widgetDOM,
                style: SharedUtils.parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderDropDownFilter()
        );
    }

    componentDidMount() {
        (dojo as any).connect(this.props.mxform, "onPersistViewState", (formViewState) => {
            logger.debug("Storing state");
            formViewState[this.props.uniqueid] = {
                defaultOption: this.state.defaultOption
            };
        });
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            const pageState: FormState = this.getPageState<FormState>();
            const defaultFilters = this.props.filters.filter(filter => filter.isDefault)[0] || this.props.filters[0];
            const selectedFilter = pageState && pageState.defaultOption || defaultFilters;
            this.applyFilter(selectedFilter);
        }
    }

    private checkListViewAvailable(): boolean {
        return !!SharedContainerUtils.findTargetListView(this.widgetDOM.parentElement, this.props.entity);
    }

    private renderAlert() {
        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-drop-down-filter-alert"
        }, this.state.alertMessage);
    }

    private renderDropDownFilter(): ReactElement<DropDownFilterProps> {
        if (!this.state.alertMessage) {
            const pageState = this.getPageState<FormState>();
            const defaultFilter = pageState && pageState.defaultOption || this.props.filters.filter(value => value.isDefault)[0];
            const defaultFilterIndex = this.props.filters.map(value => value.caption).indexOf(defaultFilter.caption);
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

    private applyFilter(selectedFilter: FilterProps) {
        const constraint = this.getConstraint(selectedFilter);
        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
        }
        this.setWidgetState({ defaultOption: selectedFilter });
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
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDOM.parentElement, this.props.entity);
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
