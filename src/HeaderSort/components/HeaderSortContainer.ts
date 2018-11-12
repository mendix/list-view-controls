import { Component, ReactChild, ReactElement, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoTopic from "dojo/topic";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { ListView, SharedUtils, WrapperProps } from "../../Shared/SharedUtils";

import { HeaderSort, HeaderSortProps, SortOrder } from "./HeaderSort";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import FormViewState from "../../Shared/FormViewState";

import "../ui/HeaderSort.scss";

export interface ContainerProps extends WrapperProps {
    entity: string;
    caption: string;
    initialSorted: boolean;
    sortAttribute: string;
    sortOrder: "asc" | "desc";
}

export interface ContainerState {
    alertMessage?: ReactChild;
    listViewAvailable: boolean;
    publishedSortAttribute?: string;
    publishedSortOrder?: SortOrder;
    publishedSortWidgetFriendlyId?: string;
    targetListView?: ListView;
    defaultSortOrder?: SortOrder;
}

interface FormState {
    defaultSortOrder: SortOrder;
}

export default class HeaderSortContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private widgetDom: HTMLElement;
    private viewStateManager: FormViewState<FormState>;

    constructor(props: ContainerProps) {
        super(props);

        this.updateSort = this.updateSort.bind(this);
        this.subScribeToWidgetChanges = this.subScribeToWidgetChanges.bind(this);
        this.publishWidgetChanges = this.publishWidgetChanges.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId.split(".")[2];

        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            viewState.defaultSortOrder = this.state.defaultSortOrder;
        });

        this.state = { listViewAvailable: false, defaultSortOrder: this.getDefaultValue() };
    }

    render() {
        return createElement("div", {
                className: classNames("widget-header-sort", this.props.class),
                ref: (widgetDom) => this.widgetDom = widgetDom,
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-header-sort-alert"
            }, this.state.alertMessage),
            this.renderSort()
        );
    }

    componentDidMount() {
        mendixLang.delay(this.connectToListView.bind(this), this.checkListViewAvailable.bind(this), 20);
    }

    componentDidUpdate(_prevProps: ContainerProps, prevState: ContainerState) {
        if (this.state.listViewAvailable && !prevState.listViewAvailable) {
            this.updateSort(this.state.defaultSortOrder);
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

    private renderSort(): ReactElement<HeaderSortProps> {
        if (!this.state.alertMessage) {
            return createElement(HeaderSort, {
                caption: this.props.caption,
                onClickAction: this.updateSort,
                sortOrder: this.state.defaultSortOrder
            });
        }

        return null;
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

        if (targetListView) {
            this.subScribeToWidgetChanges(targetListView);
            if (!this.props.initialSorted || errorMessage) {
                DataSourceHelper.showContent(targetListView.domNode);
            }
        }

        this.setState({
            alertMessage: errorMessage,
            listViewAvailable: !!targetListView,
            targetListView,
            publishedSortOrder: this.viewStateManager.getPageState("defaultSortOrder", this.getDefaultValue())
        });
    }

    private updateSort(order: SortOrder) {
        const { targetListView } = this.state;
        const { sortAttribute } = this.props;

        if (targetListView && this.dataSourceHelper) {
            this.dataSourceHelper.setSorting(this.props.friendlyId, [ sortAttribute, order ]);
            this.setState({ defaultSortOrder: order });
            this.publishWidgetChanges(sortAttribute, order);
        }
    }

    private subScribeToWidgetChanges(targetListView: ListView) {
        dojoTopic.subscribe(targetListView.friendlyId, (message: string[]) => {
            const publishedSortAttribute = message[0];
            const publishedSortOrder = message[1] as SortOrder;
            const publishedSortWidgetFriendlyId = message[2];
            if (publishedSortAttribute === this.props.sortAttribute && publishedSortWidgetFriendlyId !== this.props.friendlyId)
            this.setState({
                defaultSortOrder: publishedSortOrder
            });
        });
    }

    private publishWidgetChanges(attribute: string, order: string) {
        if (this.state.targetListView) {
            dojoTopic.publish(this.state.targetListView.friendlyId, [ attribute, order, this.props.friendlyId ]);
        }
    }

    private getDefaultValue(): SortOrder {
        const initialSortOrder = this.props.initialSorted ? this.props.sortOrder : "";
        return this.viewStateManager.getPageState("defaultSortOrder", initialSortOrder);
    }

}
