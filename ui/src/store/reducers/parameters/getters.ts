import { AppState } from "..";
import { IParameters, RequestStatus } from "./actions";

export function getParameters(state: AppState): {
    data: IParameters,
    loading: boolean,
    error: boolean
} {
    return {
        loading: state.parameters.status === RequestStatus.LOADING,
        error: state.parameters.status === RequestStatus.ERROR,
        data: state.parameters.parameters,
    }
}
