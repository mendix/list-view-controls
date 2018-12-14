import { Component, ReactChild, ReactNode, createElement } from "react";
import * as classNames from "classnames";
import * as mendixLang from "mendix/lang";
import * as dojoTopic from "dojo/topic";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper, DataSourceHelperListView } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { SharedUtils, WrapperProps } from "../../Shared/SharedUtils";

import { HeaderSort, SortOrder } from "./HeaderSort";
import { SharedContainerUtils } from "../../Shared/SharedContainerUtils";
import { FormViewState } from "../../Shared/FormViewState";

import "../ui/HeaderSort.scss";

export interface ContainerProps extends WrapperProps {
    entity: string;
    caption: string;
    sortAttribute: string;
    initialSorted: boolean;
    sortOrder: "asc" | "desc"; // initialSortOrder
}

export interface ContainerState {
    alertMessage?: ReactChild;
    listViewAvailable: boolean;
    targetListView?: DataSourceHelperListView;
    sortOrder: SortOrder;
}

interface FormState {
    sortOrder: SortOrder;
}

export default class HeaderSortContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper?: DataSourceHelper;
    private widgetDom: HTMLElement | null = null;
    private viewStateManager: FormViewState<FormState>;
    private subscriptionTopic = "";
    private retriesFind = 0;

    constructor(props: ContainerProps) {
        super(props);

        this.updateSort = this.updateSort.bind(this);
        this.subScribeToWidgetChanges = this.subScribeToWidgetChanges.bind(this);
        this.publishWidgetChanges = this.publishWidgetChanges.bind(this);
        const id = this.props.uniqueid || this.props.friendlyId.split(".")[2];

        this.viewStateManager = new FormViewState(this.props.mxform, id, viewState => {
            viewState.sortOrder = this.state.sortOrder;
        });

        this.state = {
            listViewAvailable: false,
            sortOrder: this.getInitialStateSortOrder()
        };
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
            const restoreState = this.checkRestoreState();
            this.updateSort(this.state.sortOrder, restoreState);
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

        return !!SharedContainerUtils.findTargetListView(this.widgetDom.parentElement, this.props.entity);
    }

    private renderSort(): ReactNode {
        if (!this.state.alertMessage) {
            return createElement(HeaderSort, {
                caption: this.props.caption,
                onClickAction: this.updateSort,
                sortOrder: this.state.sortOrder
            });
        }

        return null;
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

        if (targetListView) {
            const id = targetListView.friendlyId + (targetListView.uniqueid ? targetListView.uniqueid : "");
            this.subscriptionTopic = `${id}_sortUpdate`;
            this.subScribeToWidgetChanges();
            if (!this.props.initialSorted || errorMessage) {
                DataSourceHelper.showContent(targetListView.domNode);
            }
        }

        this.setState({
            alertMessage: errorMessage,
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

    private updateSort(order: SortOrder, restoreState = false) {
        const { targetListView } = this.state;
        const { sortAttribute } = this.props;

        if (targetListView && this.dataSourceHelper) {
            this.dataSourceHelper.setSorting(this.props.friendlyId, [ sortAttribute, order ], restoreState);
            if (!restoreState) {
                this.setState({ sortOrder: order });
                this.publishWidgetChanges(sortAttribute, order);
            }
        }
    }

    private subScribeToWidgetChanges() {
        dojoTopic.subscribe(this.subscriptionTopic, (message: string[]) => {
            const publishedSortAttribute = message[0];
            const publishedSortOrder = message[1] as SortOrder;
            const publishedSortWidgetFriendlyId = message[2];
            if (publishedSortWidgetFriendlyId !== this.props.friendlyId) {
                if (publishedSortAttribute === this.props.sortAttribute) {
                    this.setState({
                        sortOrder: publishedSortOrder
                    });
                } else {
                    this.setState({
                        sortOrder: ""
                    });
                }
            }
        });
    }

    private publishWidgetChanges(attribute: string, order: string) {
        if (this.state.targetListView) {
            dojoTopic.publish(this.subscriptionTopic, [ attribute, order, this.props.friendlyId ]);
        }
    }

    private checkRestoreState(): boolean {
        return this.viewStateManager.getPageState("sortOrder") !== undefined;
    }

    private getInitialStateSortOrder(): SortOrder {
        const restore = this.checkRestoreState();
        const initialSortOrder = this.props.initialSorted && !restore ? this.props.sortOrder : "";
        return this.viewStateManager.getPageState("sortOrder", initialSortOrder);
    }

}
