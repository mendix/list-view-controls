import { Component, ReactChild, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as dojoConnect from "dojo/_base/connect";
import * as dojoTopic from "dojo/topic";
import * as dojoAspect from "dojo/aspect";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, SharedUtils, TopicMessage, WrapperProps, paginationTopicSuffix } from "../../Shared/SharedUtils";
import { Validate } from "../Validate";

import { OnChangeProps, PageSize, PageSizeProps } from "./PageSize";

import "../ui/PageSize.scss";
import { hideLoadMoreButton, resetListViewStructure } from "../../Pagination/utils/ContainerUtils";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";

export interface ContainerProps extends WrapperProps {
    entity: string;
    options: OptionProps[];
    labelText: string;
}

export interface OptionProps {
    caption: string;
    size: number;
    isDefault: boolean;
}

export interface ContainerState {
    alertMessage?: ReactChild;
    listViewAvailable: boolean;
    targetListView?: ListView;
    targetNode?: HTMLElement;
    currentOffSet?: number;
    listViewSize?: number;
    pageSize?: number;
    currentPageNumber?: number;
}

export default class PageSizeContainer extends Component<ContainerProps, ContainerState> {
    // private dataSourceHelper: DataSourceHelper;
    private navigationHandler: object;
    private widgetDOM: HTMLElement;
    private subscriptionTopic: string;

    constructor(props: ContainerProps) {
        super(props);

        this.state = {
            alertMessage: Validate.validateProps(this.props),
            listViewAvailable: false,
            currentOffSet: 0,
            listViewSize: 0,
            currentPageNumber: 0
        };

        // Ensures that the listView is connected so the widget doesn't break in mobile due to unpredictable render time
        this.navigationHandler = dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView.bind(this));
    }

    render() {
        return createElement("div",
            {
                className: classNames("widget-page-size", this.props.class),
                ref: (widgetDOM: HTMLElement) => this.widgetDOM = widgetDOM,
                style: SharedUtils.parseStyle(this.props.style)
            },
            this.renderAlert(),
            this.renderDropDownFilter()
        );
    }

    componentDidUpdate(prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable
                && (!prevState.listViewAvailable || prevProps.mxObject !== this.props.mxObject)) {
            const selectedFilter = this.props.options.filter(filter => filter.isDefault)[0] || this.props.options[0];
            this.applyPageSize({
                newOffSet: this.state.currentOffSet,
                newPageSize: selectedFilter.size,
                newPageNumber: this.state.currentPageNumber
            });
        }
    }

    componentWillUnmount() {
        dojoConnect.disconnect(this.navigationHandler);
    }

    private renderAlert = () => {
        return createElement(Alert, {
            bootstrapStyle: "danger",
            className: "widget-page-size-alert"
        }, this.state.alertMessage);
    }

    private renderDropDownFilter = (): ReactElement<PageSizeProps> => {
        if (!this.state.alertMessage) {
            const defaultFilterIndex = this.props.options.indexOf(this.props.options.filter(value => value.isDefault)[0]);

            return createElement(PageSize, {
                labelText: this.props.labelText || "Items per page",
                defaultFilterIndex,
                handleChange: this.applyPageSize,
                sizeOptions: this.props.options,
                currentOffSet: this.state.currentOffSet,
                listViewSize: this.state.listViewSize,
                pageSize: this.state.pageSize
            });
        }

        return null;
    }

    private applyPageSize = (onChangeProps: OnChangeProps) => {
        const { newPageSize, newOffSet } = onChangeProps;
        const { targetListView } = this.state;

        if (targetListView && targetListView._datasource
                && targetListView._datasource._pageSize !== newPageSize) {
            targetListView._datasource._pageSize = newPageSize;
            targetListView._datasource.setOffset(newOffSet);
            targetListView.sequence([ "_sourceReload", "_renderData" ]);
            this.publishListViewUpdate({ ...onChangeProps });
        }
    }

    private connectToListView = () => {
        const targetListView = SharedContainerUtils.findTargetListView(this.widgetDOM.parentElement, this.props.entity);
        const errorMessage = SharedUtils.validateCompatibility({ listViewEntity: this.props.entity, targetListView });

        if (targetListView) {
            this.subscriptionTopic = `${targetListView.friendlyId}_${paginationTopicSuffix}`;
        }

        if (errorMessage && targetListView) {
            this.afterListViewDataRender(targetListView);
            DataSourceHelper.showContent(targetListView.domNode);
        }

        this.setState({
            alertMessage: errorMessage,
            listViewAvailable: !!targetListView,
            targetListView,
            listViewSize: targetListView._datasource._setSize
        });
    }

    private publishListViewUpdate(topicMessage: TopicMessage) {
        if (this.state.targetListView) {
            dojoTopic.publish(this.subscriptionTopic, topicMessage);
        }
    }
    private afterListViewDataRender = (targetListView: ListView) => {
        if (targetListView) {
            dojoAspect.after(targetListView, "_renderData", () => {
                resetListViewStructure(targetListView.domNode);
                hideLoadMoreButton(targetListView.domNode);
            });
        }
    }
}
