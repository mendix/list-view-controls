import { WrapperProps } from "./Pagination";
import { ListView } from "../Shared/SharedUtils";

interface ValidateConfigProps extends WrapperProps {
    inWebModeler?: boolean;
    queryNode?: HTMLElement | null;
    targetListView?: ListView | null;
}

const getAlertMessage = (friendlyId: string, message: string) => `Custom widget ${friendlyId} error in configuration" ${message}`;

export class Validate {

    static validate(props: ValidateConfigProps): string {
        if (!props.queryNode) {
            return getAlertMessage(props.friendlyId, "unable to find a list view on the page");
        }
        if (props.inWebModeler) {
            return "";
        }
        if (props.targetListView && !Validate.isCompatible(props.targetListView)) {
            return getAlertMessage(props.friendlyId, "this Mendix version is incompatible");
        }

        return "";
    }

    static isCompatible(targetListView: ListView): boolean {
        return !!(targetListView
            && targetListView._datasource
            && targetListView._datasource.setOffset
            && targetListView._datasource._pageSize !== undefined
            && targetListView._sourceReload
            && targetListView._renderData
            && targetListView._datasource._setSize !== undefined
            && targetListView._showLoadingIcon
            && targetListView.update);
    }
}
