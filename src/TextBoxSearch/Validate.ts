import { ContainerProps } from "./components/TextBoxSearchContainer";

export class Validate {

    static validateProps(props: ContainerProps): string {
        if (props.entity) {
            return `${props.friendlyId}: Requires a list view entity`;
        }
        if (props.attributeList && props.attributeList.length === 0) {
            return `${props.friendlyId}: Requires atleast a one attribute`;
        }
        if (props.attributeList && props.attributeList.length) {
            if (props.attributeList.filter(attribute => attribute.attribute.trim() === "").length) {
                return `${props.friendlyId}: Atleast one attribute is empty, select an attribute`;
            }
        }
        return "";
    }
}
