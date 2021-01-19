import { ParameterService } from "../../../services/ParameterService";
import { recalculation } from "../rules";

export enum ParametersType {
    SET = "parameters/set",
    SET_STATUS = "parameters/status",
}

export interface IParameters {
    currentBalance: number;
    setAside: number;
    startDate: string;
    endDate: string;
}

interface SetParametersAction {
    type: ParametersType.SET;
    parameters: Partial<IParameters>
}
export function setParametersAndRecalculate(parameters: Partial<IParameters>) {
    return async (dispatch: any) => {
        const newParameters = await ParameterService.setParameters(parameters);
        dispatch(setParameters(newParameters));
        dispatch(recalculation() as any);
    }
}

export function setParameters(parameters: Partial<IParameters>): SetParametersAction {
    return {
        type: ParametersType.SET,
        parameters,
    };
}


export enum RequestStatus {
    STABLE = "STABLE",
    LOADING = "LOADING",
    ERROR = "ERROR",
}
interface SetParametersStatusAction {
    type: ParametersType.SET_STATUS;
    status: RequestStatus;
}
export function setParametersStatus(status: RequestStatus): SetParametersStatusAction {
    return {
        type: ParametersType.SET_STATUS,
        status
    }
}

// Aggregate
export type ParametersAction =
    | SetParametersAction
    | SetParametersStatusAction;


export function fetchParameters() {
    return (dispatch: any) => {
        dispatch(setParametersStatus(RequestStatus.LOADING));
        ParameterService.fetchParameters()
            .then(parameters => {
                dispatch(setParameters(parameters));
                dispatch(setParametersStatus(RequestStatus.STABLE));
                dispatch(recalculation() as any);
            })
            .catch(() => {
                dispatch(setParametersStatus(RequestStatus.ERROR));
            });
    }
}