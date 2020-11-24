import { Component, ReactChild, ReactNode, createElement } from "react";
import * as classNames from "classnames";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper, DataSourceHelperListView } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { SharedUtils, WrapperProps } from "../../Shared/SharedUtils";
import { Validate } from "../Validate";

import { DropDownFilter } from "./DropDownFilter";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import { FormViewState } from "../../Shared/FormViewState";

import "../ui/DropDownReferenceFilter.scss";

export interface ContainerProps extends WrapperProps {
    entity: string;
    filterEntityPath: string;
    attribute: string;
    constraint: string;
    sortAttributes: SortProps[];
    defaultValue: string;
}

export interface SortProps {
    attribute: string;
    sortOrder: SortOrder;
}

export type SortOrder = "asc" | "desc";

export interface FilterProps {
    caption: string;
    value: string;
    constraint: string;
    isDefault: boolean;
}

export type filterOptions = "none" | "attribute" | "XPath";

export interface ContainerState {
    alertMessage?: ReactChild;
    listViewAvailable: boolean;
    targetListView?: DataSourceHelperListView;
    selectedOption: FilterProps;
    options: FilterProps[];
}

export type LoadingState = "loading" | "error" | "loaded" | "restore";

interface FormState {
    selectedOption?: FilterProps;
}

export default class DropDownFilterContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper?: DataSourceHelper;
    private widgetDom: Element | null = null;
    private viewStateManager: FormViewState<FormState>;
    private retriesFind = 0;
    private defaultFilter: FilterProps = {
        caption: "",
        value: "",
        constraint: "",
        isDefault: true
    };

    constructor(props: ContainerProps) {
        super(props);

        this.applyFilter = this.applyFilter.bind(this);
        this.viewStateManager = new FormViewState(this.props.mxform, this.props.uniqueid, viewState => {
            viewState.selectedOption = this.state.selectedOption;
        });

        this.state = {
            alertMessage: Validate.validateProps(this.props),
            listViewAvailable: false,
            selectedOption: this.getInitialStateSelectedOption(),
            options: []
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
        SharedUtils.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
        this.getData();
    }

    componentDidUpdate(prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            const restoreState = this.checkRestoreState();
            this.applyFilter(this.state.selectedOption, restoreState);
        } else if (this.state.listViewAvailable && this.props.mxObject !== prevProps.mxObject) {
            const hasContext = this.props.constraint.indexOf(`'[%CurrentObject%]'`) !== -1;
            if (hasContext) {
                this.getData();
            }
        }
    }

    componentWillUnmount() {
        this.viewStateManager.destroy();
    }

    private getData(): void {
        const mxObjectId = this.props.mxObject ? this.props.mxObject.getGuid() : "";
        const hasContext = this.props.constraint.indexOf(`'[%CurrentObject%]'`) !== -1;
        if (hasContext && !mxObjectId) {
            return;
        }
        const pathParts = this.props.filterEntityPath.split("/");
        const filterEntity = pathParts[pathParts.length - 1];
        const xpath = `//${filterEntity}${this.props.constraint.split("[%CurrentObject%]").join(mxObjectId)}`;
        const sort = createSortProps(this.props.sortAttributes);
        mx.data.get({
            xpath,
            filter: {
                attributes: [ this.props.attribute ],
                sort,
                distinct : true
            },
            count: false,
            callback: objects => {
                const options: FilterProps[] = this.getOptions(objects);

                this.setState({ options });
                const restoreState = this.checkRestoreState();
                if (!restoreState) {
                    const value = options.filter(option => option.isDefault)[0];
                    this.setState({ selectedOption: value });
                    this.applyFilter(this.state.selectedOption, restoreState);
                }
            },
            error: error => {
                // tslint:disable-next-line:no-console
                console.error("Failed to load data options", error);
                this.setState({ alertMessage: "Failed to load data options" });
            }
        });
    }

    private getOptions(objects: mendix.lib.MxObject[]): FilterProps[] {
        if (objects.length > 1000) {
            logger.warn("Filter contains more than a 1000 options (including 1000s or more options that need to be retrieved from the server will impact page loading performance considerably on older browsers)");
        }
        let hasDefault = false;
        const isAttribute = this.props.filterEntityPath.split("/").length === 1;
        const path = isAttribute ? "" : `${this.props.filterEntityPath}/`;
        const options: FilterProps[] = objects.map(o => {
            const value = o.get(this.props.attribute) as string;
            const caption = mx.parser.formatAttribute(o, this.props.attribute);
            const isDefault = this.props.defaultValue && this.props.defaultValue === value || false;
            hasDefault = hasDefault || isDefault;
            return {
                caption,
                value,
                constraint: `[${path}${this.props.attribute}='${value}']`,
                isDefault
            };
        }).filter((value, index, array) => array.map(mapObj => mapObj.value).indexOf(value.value) === index);

        options.unshift(this.defaultFilter);
        return options;
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

    private renderAlert(): ReactNode {
        return createElement(Alert, {
            className: "widget-checkbox-filter-alert"
        }, this.state.alertMessage);
    }

    private renderDropDownFilter(): ReactNode {
        if (!this.state.alertMessage) {
            const selectedCaption = this.state.selectedOption && this.state.selectedOption.caption;
            const defaultFilterIndex = this.state.options.map(value => value.caption).indexOf(selectedCaption);

            return createElement(DropDownFilter, {
                defaultFilterIndex,
                filters: this.state.options,
                handleChange: this.applyFilter
            });
        }

        return null;
    }

    private checkRestoreState(): boolean {
        return this.viewStateManager.getPageState("selectedOption") !== undefined;
    }

    private getInitialStateSelectedOption(): FilterProps {
        return this.viewStateManager.getPageState("selectedOption", this.defaultFilter);
    }

    private applyFilter(selectedFilter: FilterProps, restoreState = false) {
        const constraint = this.getConstraint(selectedFilter);
        if (this.dataSourceHelper) {
            logger.debug(this.props, this.props.uniqueid, "applyFilter", constraint);
            this.dataSourceHelper.setConstraint(this.props.uniqueid, constraint, undefined, restoreState);
        }
        this.setState({ selectedOption: selectedFilter });
    }

    private getConstraint(selectedFilter: FilterProps): string {
        if (this.state.targetListView) {
            return selectedFilter.constraint;
        }
        return "";
    }

    private connectToListView() {
        let errorMessage = "";
        let targetListView: DataSourceHelperListView | undefined;

        try {
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDom, this.props.entity);
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

export const createSortProps = (sortAttributes: SortProps[]): mx.Sort[] => {
    const combined: any = [];
    sortAttributes.map((optionObject) => {
        const { attribute, sortOrder } = optionObject;
        combined.push([ attribute, sortOrder ]);
    });
    return combined;
};
