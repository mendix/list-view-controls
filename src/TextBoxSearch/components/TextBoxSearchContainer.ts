import { Component, ReactElement, createElement } from "react";
import * as dojoConnect from "dojo/_base/connect";
import * as dijitRegistry from "dijit/registry";
import * as classNames from "classnames";

import { Alert } from "../../Shared/components/Alert";
import { DataSourceHelper } from "../../Shared/DataSourceHelper/DataSourceHelper";
import { GroupedOfflineConstraint, ListView, OfflineConstraint, SharedUtils } from "../../Shared/SharedUtils";

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
    datePicker?: mxui.widget.DatePicker;
    searchNode?: HTMLInputElement;
}

export default class SearchContainer extends Component<ContainerProps, ContainerState> {
    private dataSourceHelper: DataSourceHelper;
    private connections: object[];
    private widgetDOM: HTMLElement;
    private searchByDate: boolean;

    constructor(props: ContainerProps) {
        super(props);

        this.state = {
            listViewAvailable: false,
            alertMessage: this.validateSearchAttributes()
        };
        this.connections = [];
        this.connections.push(dojoConnect.connect(props.mxform, "onNavigation", this, this.connectToListView));
    }

    componentDidUpdate(_previousProps: ContainerProps, previousState: ContainerState) {
        if (this.state.listViewAvailable && !previousState.listViewAvailable) {
            this.applySearch(this.props.defaultQuery);
        }
    }

    render() {
        return createElement("div", {
                className: classNames("widget-text-box-search", this.props.class),
                ref: (widgetDOM) => this.widgetDOM = widgetDOM,
                style: SharedUtils.parseStyle(this.props.style)
            },
            createElement(Alert, {
                bootstrapStyle: "danger",
                className: "widget-text-box-search-alert"
            }, this.state.alertMessage),
            this.renderTextBoxSearch()
        );
    }

    componentWillUnmount() {
        this.connections.forEach(dojoConnect.disconnect);
        if (this.state.datePicker) {
            this.state.datePicker.uninitialize();
        }

    }

    private renderTextBoxSearch(): ReactElement<TextBoxSearchProps> | null {
        if (!this.state.alertMessage && !this.searchByDate) {
            return createElement(TextBoxSearch, {
                defaultQuery: this.props.defaultQuery,
                onTextChange: this.applySearch,
                placeholder: this.props.placeHolder
            });
        }

        return null;
    }

    private renderCalendar = () => {
        const format = this.findCalendarFormat();

        const datePicker = new mxui.widget.DatePicker({
            format: format.datePattern,
            placeholder: format.datePattern
        });
        datePicker.buildRendering();
        datePicker.startup();

        const searchNode = datePicker.domNode.children[1].children[0] as HTMLInputElement;

        this.connections.push(dojoConnect.connect(searchNode, "keyup", this, this.applySearch));
        this.connections.push(dojoConnect.connect(searchNode, "click", this, this.killEvent));
        this.connections.push(dojoConnect.connect(searchNode, "keypress", this, this.killEvent));
        this.connections.push(dojoConnect.connect(searchNode, "keydown", this, this.killEvent));
        this.connections.push(dojoConnect.connect(searchNode, "keypress", this, this.escapeReset));
        this.connections.push(dojoConnect.connect(datePicker, "onChange", this, this.applySearch));
        this.setState({ datePicker, searchNode });
        return datePicker;
    }

    private killEvent = (event: Event) => event.stopPropagation();

    private escapeReset = (event: KeyboardEvent) => {
        if (event.keyCode === 27) { // escape key maps to keycode `27`
            if (event.srcElement.tagName === "SELECT") {
                (event.srcElement as HTMLSelectElement).selectedIndex = 0;
            } else if (event.srcElement.tagName === "INPUT") {
                (event.srcElement as HTMLInputElement).value = "";
            }
            this.applySearch("");
        }
    }

    private findCalendarFormat(searchAttribute: string = this.props.attributeList[0].attribute) {
        const { targetListView } = this.state;
        if (targetListView) {
            const datePicker = dijitRegistry.byNode(targetListView.domNode.querySelector(".mx-name-datePicker1"));
            if (datePicker.attributePath.split("/")[1] === searchAttribute) {
                return {
                    ...datePicker._rdParams,
                    placeholder: datePicker.placeholder
                };
            }
        }
        return {
            format: "",
            placeholder: "",
            datePattern: "",
            selector: "date"
        };
    }

    private applySearch = (searchQuery: string) => {
        const constraint = this.getConstraint(searchQuery);

        if (this.dataSourceHelper) {
            this.dataSourceHelper.setConstraint(this.props.friendlyId, constraint);
        }
    }

    private getConstraint(searchQuery: string): string | GroupedOfflineConstraint {
        const { targetListView } = this.state;

        searchQuery = this.state.datePicker ? searchQuery : searchQuery.trim();
        if (this.state.datePicker) {
            return this.getDateConstraints();
        }
        if (!searchQuery) {
            return "";
        }
        if (window.mx.isOffline()) {
            const offlineConstraints: OfflineConstraint[] = [];
            this.props.attributeList.forEach(search => {
                offlineConstraints.push({
                    attribute: search.attribute,
                    operator: "contains",
                    path: this.props.entity,
                    value: searchQuery
                });
            });

            return {
                constraints: offlineConstraints,
                operator: "or"
            };
        }
        if (targetListView && targetListView._datasource && searchQuery) {
            const constraints: string[] = [];

            this.props.attributeList.forEach(searchAttribute => {
                constraints.push(`contains(${searchAttribute.attribute},'${searchQuery}')`);
            });

            return "[" + constraints.join(" or ") + "]";
        }
        return "";
    }

    private getDateConstraints = () => {
        const { datePicker, searchNode } = this.state;
        const constraints: string[] = [];
        const dayInMilliSeconds = 24 * 60 * 60 * 1000;

        if (datePicker) {
            if (datePicker.get("value")) {
                this.props.attributeList.forEach(searchAttribute => {
                    const { attribute } = searchAttribute;
                    let finalDate = (datePicker.get("value") as Date).getTime();
                    if (!mx.meta.getEntity(this.props.entity).isLocalizedDate(attribute)) {
                        finalDate = window.mx.parser.delocalizeEpoch(datePicker.get("value") as Date);
                    }
                    const nextDate = finalDate + dayInMilliSeconds;
                    constraints.push(`(${attribute}>=${finalDate} and ${attribute}<${nextDate})`);
                });
                if (this.state.alertMessage) {
                    this.setState({ alertMessage: "" });
                }
            } else if (searchNode.value) {
                this.setState({ alertMessage: "Invalid date" });
            }
        }

        return constraints.length ? "[" + constraints.join(" or ") + "]" : "";
    }

    private connectToListView = () => {
        let errorMessage = "";
        let targetListView: ListView | undefined;

        try {
            this.dataSourceHelper = DataSourceHelper.getInstance(this.widgetDOM.parentElement, this.props.entity);
            targetListView = this.dataSourceHelper.getListView();
        } catch (error) {
            errorMessage = error.message;
        }

        if (this.searchByDate) {
            const datePicker = this.renderCalendar();
            this.widgetDOM.appendChild(datePicker.domNode);
        }

        this.setState({
            alertMessage: errorMessage || this.validateSearchAttributes(),
            listViewAvailable: !!targetListView,
            targetListView
        });
    }

    private validateSearchAttributes(): string {
        let isDate = false;
        let isString = false;
        this.props.attributeList.forEach(searchAttribute => {
            if (mx.meta.getEntity(this.props.entity).isDate(searchAttribute.attribute)) {
                isDate = true;
            } else {
                isString = true;
            }
        });
        if (isDate && !isString) this.searchByDate = true;

        return (isDate && isString) ? "Avoid mixing date and text attributes" : "";
    }
}
